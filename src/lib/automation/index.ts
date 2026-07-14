// ============================================================
// Automation Layer — Public API
// ============================================================
// This barrel file exports everything business modules need.
// Import from '@/lib/automation' to use the automation layer.
// ============================================================

// The main function business code should use
export { emitEvent } from './client';

// Event factory (for advanced use cases)
export { createEvent } from './events';

// Registry utilities
export { isRegisteredEvent, getEventRegistration, getAllRegisteredEvents, getEventsByDomain } from './registry';

// Logger (for other modules that need structured logging)
export { automationLogger } from './logger';

// Retry utility (reusable)
export { withRetry } from './retry';
export type { RetryOptions } from './retry';

// All types
export type {
  AutomationEventName,
  AutomationEvent,
  AutomationResponse,
  AutomationGatewayConfig,
  UserCreatedPayload,
  UserInvitedPayload,
  UserDeletedPayload,
  AttendanceClockedInPayload,
  AttendanceClockedOutPayload,
  AttendanceUpdatedPayload,
  TaskCreatedPayload,
  TaskAssignedPayload,
  TaskCompletedPayload,
  TaskDeletedPayload,
  ReportGeneratedPayload,
  OrganizationCreatedPayload,
} from './types';
