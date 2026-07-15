// ============================================================
// Automation Layer — Database Logger & Dead Letter Queue
// ============================================================
// Handles writing automation execution results to the database.
// Designed to be fire-and-forget so that logging failures
// never block or fail the actual business operation.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { AutomationEvent, AutomationResponse } from './types';
import { getAutomationConfig } from '../config/automation';
import { automationLogger } from './logger';

// We use the service role key to bypass RLS when writing logs,
// because business users shouldn't have direct write access to these tables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export async function logAutomationResult(
  event: AutomationEvent<unknown>,
  response: AutomationResponse,
  error?: string
): Promise<void> {
  const config = getAutomationConfig();
  const logLevel = config.logLevel;

  // Decide what payloads to keep based on the config
  const isError = !response.success || !!error;
  
  let requestPayloadToSave = null;
  let responsePayloadToSave = null;

  if (logLevel === 'full' || (logLevel === 'errors-only' && isError)) {
    requestPayloadToSave = event;
    responsePayloadToSave = response;
  }

  // Fire and forget
  supabaseAdmin
    .from('automation_logs')
    .insert({
      event_id: event.id,
      event_type: event.event,
      organization_id: event.organizationId,
      actor_id: event.actorId,
      status: response.success ? 'success' : (response.retries && response.retries > 0 ? 'retried' : 'failed'),
      attempt_count: (response.retries || 0) + 1,
      duration_ms: response.durationMs,
      request_payload: requestPayloadToSave,
      response_payload: responsePayloadToSave,
      error_message: error || response.error,
    })
    .then(({ error: dbError }) => {
      if (dbError) {
        automationLogger.warn('LoggerDB', `Failed to write to automation_logs: ${dbError.message}`);
      }
    });
}

export async function writeDeadLetter(
  event: AutomationEvent<unknown>,
  error: string,
  retries: number
): Promise<void> {
  const config = getAutomationConfig();

  // Dead letters always store the full payload so they can be replayed
  supabaseAdmin
    .from('automation_dead_letters')
    .insert({
      event_id: event.id,
      event_type: event.event,
      organization_id: event.organizationId,
      actor_id: event.actorId,
      payload: event,
      error_message: error,
      retry_count: retries,
      max_retries: config.maxRetries,
      last_attempt_at: new Date().toISOString(),
      status: 'failed',
    })
    .then(({ error: dbError }) => {
      if (dbError) {
        automationLogger.error('LoggerDB', `Failed to write DEAD LETTER to database: ${dbError.message}`);
      }
    });
}
