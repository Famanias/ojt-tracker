// ============================================================
// Internal Automation API Route
// ============================================================
// Centralized webhook endpoint that n8n can call back into.
// Handles authentication, payload validation, and routing.
// This endpoint is for n8n → Next.js communication (callbacks).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { isRegisteredEvent } from '@/lib/automation/registry';
import { automationLogger } from '@/lib/automation/logger';

/**
 * Validates the incoming API key against our stored secret.
 */
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Automation-Key');
  const expectedKey = process.env.N8N_API_KEY;

  if (!expectedKey) {
    automationLogger.warn('API', 'N8N_API_KEY not configured — rejecting request');
    return false;
  }

  return apiKey === expectedKey;
}

/**
 * POST /api/internal/automation
 *
 * Receives events from n8n (callback endpoint).
 * n8n can use this to trigger actions back in the CMS,
 * such as creating notifications or updating records.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Authenticate
  if (!validateApiKey(request)) {
    automationLogger.error('API', 'Unauthorized request — invalid or missing API key');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // 2. Validate event structure
    const { event, id } = body;

    if (!event || !id) {
      automationLogger.error('API', 'Invalid event payload — missing event or id', { body });
      return NextResponse.json(
        { error: 'Invalid event payload: missing "event" or "id"' },
        { status: 400 }
      );
    }

    // 3. Validate event name
    if (!isRegisteredEvent(event)) {
      automationLogger.warn('API', `Unknown event received: ${event}`, { id });
      return NextResponse.json(
        { error: `Unknown event: ${event}` },
        { status: 400 }
      );
    }

    // 4. Log the received event
    automationLogger.info('API', `Event received: ${event}`, {
      eventId: id,
      durationMs: Date.now() - startTime,
    });

    // 5. Acknowledge the event
    // Future phases will add routing logic here to handle
    // n8n callbacks (e.g., update records, send notifications).
    return NextResponse.json({
      success: true,
      received: event,
      eventId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('API', `Request processing error: ${msg}`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/internal/automation
 *
 * Health check endpoint — returns status of the automation layer.
 */
export async function GET() {
  const enabled = process.env.AUTOMATION_ENABLED === 'true';
  const n8nConfigured = !!process.env.N8N_URL && !!process.env.N8N_API_KEY;

  return NextResponse.json({
    status: 'ok',
    automation: {
      enabled,
      n8nConfigured,
      timestamp: new Date().toISOString(),
    },
  });
}
