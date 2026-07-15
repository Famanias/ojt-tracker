// ============================================================
// Automation Layer — Gateway Client
// ============================================================
// The single entry point for all automation communication.
// Business modules call `emitEvent()` — they never know about
// n8n webhook URLs, API keys, or retry logic.
// ============================================================

import type {
  AutomationEvent,
  AutomationEventName,
  AutomationResponse,
} from './types';
import { createEvent } from './events';
import { isRegisteredEvent } from './registry';
import { withRetry } from './retry';
import { automationLogger } from './logger';
import { logAutomationResult, writeDeadLetter } from './logger-db';
import { getAutomationConfig, isAutomationConfigured } from '../config/automation';

/**
 * Emit a domain event through the Automation Gateway.
 *
 * This is the ONLY function that business logic should call.
 * It creates the event envelope, validates it, and sends it
 * to n8n through the centralized webhook endpoint.
 *
 * This function is fire-and-forget by default: it never throws
 * and never blocks the caller. Automation failures should not
 * break business logic.
 */
export async function emitEvent<T = Record<string, unknown>>(
  eventName: AutomationEventName,
  actorId: string,
  payload: T,
  organizationId?: string | null
): Promise<AutomationResponse> {
  const config = getAutomationConfig();

  // If automation is disabled, log and return early
  if (!config.enabled) {
    automationLogger.gateway('disabled', eventName, { reason: 'AUTOMATION_ENABLED is not true' });
    return { success: true, statusCode: 200 };
  }

  // If n8n is not configured, log and return early
  if (!isAutomationConfigured(config)) {
    automationLogger.gateway('disabled', eventName, { reason: 'n8n URL or API key not configured' });
    return { success: true, statusCode: 200 };
  }

  // Validate event name
  if (!isRegisteredEvent(eventName)) {
    automationLogger.error('Client', `Unknown event: ${eventName}`);
    return { success: false, error: `Unknown event: ${eventName}` };
  }

  // Create the event envelope
  const event = createEvent(eventName, actorId, payload, organizationId);

  // Log the emission
  automationLogger.event(eventName, event.id, {
    actorId,
    organizationId: organizationId ?? null,
  });

  // Send to n8n through the gateway
  return sendToGateway(event, config);
}

/**
 * Sends an event to n8n via the centralized webhook endpoint.
 * Handles timeouts, retries, and error logging.
 */
async function sendToGateway(
  event: AutomationEvent<unknown>,
  config: ReturnType<typeof getAutomationConfig>
): Promise<AutomationResponse> {
  const startTime = Date.now();
  const webhookUrl = `${config.n8nUrl.replace(/\/$/, '')}/webhook/events`;

  automationLogger.gateway('request', event.event, {
    eventId: event.id,
    url: webhookUrl,
  });

  try {
    const { result: response, retries } = await withRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

        try {
          const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Automation-Key': config.n8nApiKey,
              'X-Event-Name': event.event,
              'X-Event-Id': event.id,
            },
            body: JSON.stringify(event),
            signal: controller.signal,
          });

          if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }

          return res;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      event.event,
      { maxRetries: config.maxRetries }
    );

    const durationMs = Date.now() - startTime;

    automationLogger.gateway('response', event.event, {
      eventId: event.id,
      statusCode: response.status,
      durationMs,
      retries,
    });

    const result = {
      success: true,
      statusCode: response.status,
      retries,
      durationMs,
    };

    logAutomationResult(event, result);
    return result;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Check for abort/timeout
    const isTimeout = err instanceof Error && err.name === 'AbortError';

    if (isTimeout) {
      automationLogger.gateway('timeout', event.event, {
        eventId: event.id,
        timeoutMs: config.timeoutMs,
        durationMs,
      });
    } else {
      automationLogger.gateway('error', event.event, {
        eventId: event.id,
        error: errorMessage,
        durationMs,
      });
    }

    const result = {
      success: false,
      error: isTimeout ? `Timeout after ${config.timeoutMs}ms` : errorMessage,
      durationMs,
    };

    logAutomationResult(event, result, result.error);

    // Dead letter queue for complete failures
    writeDeadLetter(event, result.error, config.maxRetries);

    // Automation failures should not break business logic
    return result;
  }
}
