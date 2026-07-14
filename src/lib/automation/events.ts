// ============================================================
// Automation Layer — Event Factory
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  AutomationEvent,
  AutomationEventName,
} from './types';

/**
 * Creates a properly structured automation event envelope.
 * All events should be created through this factory function.
 */
export function createEvent<T = Record<string, unknown>>(
  event: AutomationEventName,
  actorId: string,
  payload: T,
  organizationId?: string | null
): AutomationEvent<T> {
  return {
    id: uuidv4(),
    event,
    timestamp: new Date().toISOString(),
    organizationId: organizationId ?? null,
    actorId,
    payload,
  };
}
