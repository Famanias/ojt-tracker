// ============================================================
// Automation Layer — Event Registry
// ============================================================

import type { AutomationEventName } from './types';

interface EventRegistration {
  name: AutomationEventName;
  description: string;
  domain: string;
  version: number;
}

/**
 * Registry of all known automation events.
 * Provides metadata for documentation, validation, and routing.
 */
const EVENT_REGISTRY: EventRegistration[] = [
  // User domain
  { name: 'user.created', description: 'A new user account was created', domain: 'user', version: 1 },
  { name: 'user.invited', description: 'A user was invited to an organization', domain: 'user', version: 1 },
  { name: 'user.deleted', description: 'A user account was deleted', domain: 'user', version: 1 },

  // Attendance domain
  { name: 'attendance.clocked_in', description: 'A user clocked in', domain: 'attendance', version: 1 },
  { name: 'attendance.clocked_out', description: 'A user clocked out', domain: 'attendance', version: 1 },
  { name: 'attendance.updated', description: 'An attendance record was updated', domain: 'attendance', version: 1 },

  // Task domain
  { name: 'task.created', description: 'A new task was created', domain: 'task', version: 1 },
  { name: 'task.assigned', description: 'A task was assigned to a user', domain: 'task', version: 1 },
  { name: 'task.completed', description: 'A task was marked as complete', domain: 'task', version: 1 },
  { name: 'task.deleted', description: 'A task was deleted', domain: 'task', version: 1 },

  // Report domain
  { name: 'report.generated', description: 'A report was generated', domain: 'report', version: 1 },

  // Organization domain
  { name: 'organization.created', description: 'A new organization was created', domain: 'organization', version: 1 },
];

/**
 * Check if an event name is registered.
 */
export function isRegisteredEvent(name: string): name is AutomationEventName {
  return EVENT_REGISTRY.some((e) => e.name === name);
}

/**
 * Get registration metadata for an event.
 */
export function getEventRegistration(name: AutomationEventName): EventRegistration | undefined {
  return EVENT_REGISTRY.find((e) => e.name === name);
}

/**
 * Get all registered events.
 */
export function getAllRegisteredEvents(): readonly EventRegistration[] {
  return EVENT_REGISTRY;
}

/**
 * Get all registered events for a specific domain.
 */
export function getEventsByDomain(domain: string): EventRegistration[] {
  return EVENT_REGISTRY.filter((e) => e.domain === domain);
}
