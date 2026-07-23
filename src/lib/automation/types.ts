// ============================================================
// Automation Layer — Type Definitions
// ============================================================

/**
 * All domain event names the application can emit.
 * Organized by domain: user, attendance, task, report, organization.
 */
export type AutomationEventName =
  // Authentication / User
  | 'user.created'
  | 'user.invited'
  | 'user.deleted'
  // Attendance
  | 'attendance.clocked_in'
  | 'attendance.clocked_out'
  | 'attendance.checked_in'
  | 'attendance.checked_out'
  | 'attendance.late'
  | 'attendance.absent'
  | 'attendance.updated'
  // Kanban / Tasks
  | 'task.created'
  | 'task.assigned'
  | 'task.completed'
  | 'task.deleted'
  // Reports
  | 'report.submitted'
  | 'report.approved'
  | 'report.rejected'
  | 'report.generated'
  // Organization
  | 'organization.created'
  | 'organization.member_added'
  | 'organization.member_removed'
  | 'organization.updated';

/**
 * Base envelope that wraps every automation event.
 * Every event has a unique id, event name, timestamp,
 * optional organization context, the actor who caused it,
 * and domain-specific payload.
 */
export interface AutomationEvent<T = Record<string, unknown>> {
  /** Unique event ID (UUID v4) */
  id: string;
  /** The domain event name */
  event: AutomationEventName;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Organization ID (null for personal mode) */
  organizationId: string | null;
  /** User ID of the actor who triggered the event */
  actorId: string;
  /** Domain-specific payload */
  payload: T;
}

// ---- Event Payload Types ----

export interface UserCreatedPayload {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  orgName?: string;
}

export interface UserInvitedPayload {
  invitationId: string;
  email: string;
  role: string;
  inviterName: string;
  orgName: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface UserDeletedPayload {
  userId: string;
  email?: string;
}

export interface AttendanceClockedInPayload {
  attendanceId?: string;
  userId: string;
  fullName?: string;
  email?: string;
  clockIn: string;
  date: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AttendanceClockedOutPayload {
  attendanceId: string;
  userId: string;
  fullName?: string;
  email?: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  date: string;
}

export interface AttendanceLatePayload {
  attendanceId?: string;
  studentId: string;
  studentName: string;
  email?: string;
  time: string;
}

export interface AttendanceAbsentPayload {
  studentId: string;
  studentName: string;
  email?: string;
  date: string;
}

export interface AttendanceUpdatedPayload {
  attendanceId: string;
  userId: string;
  changes: Record<string, unknown>;
}

export interface TaskCreatedPayload {
  taskId: string;
  title: string;
  description?: string;
  columnId: string;
  priority: string;
  creatorId: string;
  creatorName?: string;
  assigneeIds?: string[];
}

export interface TaskAssignedPayload {
  taskId: string;
  title: string;
  assigneeId: string;
  assigneeName?: string;
  assigneeEmail?: string;
  assignedBy: string;
  assignedByName?: string;
}

export interface TaskCompletedPayload {
  taskId: string;
  title: string;
  completedBy: string;
  completedByName?: string;
  creatorEmail?: string;
  creatorName?: string;
}

export interface TaskDeletedPayload {
  taskId: string;
  title?: string;
  deletedBy?: string;
  userEmail?: string;
}

export interface ReportSubmittedPayload {
  reportId: string;
  title: string;
  studentName: string;
  submittedAt: string;
}

export interface ReportApprovedPayload {
  reportId: string;
  title: string;
  studentName?: string;
  studentEmail?: string;
  approvedBy: string;
  approvedByName?: string;
  feedback?: string;
}

export interface ReportRejectedPayload {
  reportId: string;
  title: string;
  studentName?: string;
  studentEmail?: string;
  rejectedBy: string;
  rejectedByName?: string;
  reason?: string;
}

export interface ReportGeneratedPayload {
  reportType: string;
  generatedBy: string;
  dateFrom?: string;
  dateTo?: string;
  recordCount?: number;
}

export interface OrganizationCreatedPayload {
  orgId: string;
  orgName: string;
  createdBy: string;
  creatorName?: string;
}

export interface OrgMemberAddedPayload {
  orgId: string;
  orgName: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: string;
}

export interface OrgMemberRemovedPayload {
  orgId: string;
  orgName: string;
  memberId: string;
  memberName?: string;
  memberEmail: string;
  removedBy?: string;
  reason?: string;
}

export interface OrgUpdatedPayload {
  orgId: string;
  orgName: string;
  updatedBy: string;
  changes?: Record<string, unknown>;
}

// ---- Gateway Types ----

export interface AutomationGatewayConfig {
  /** n8n webhook base URL */
  n8nUrl: string;
  /** API key for authenticating with n8n */
  n8nApiKey: string;
  /** Whether automation is enabled */
  enabled: boolean;
  /** Request timeout in milliseconds */
  timeoutMs: number;
  /** Number of retry attempts for failed requests */
  maxRetries: number;
  /** Configures what gets saved to automation_logs */
  logLevel: 'full' | 'minimal' | 'errors-only';
}

export interface AutomationResponse {
  success: boolean;
  statusCode?: number;
  data?: unknown;
  error?: string;
  retries?: number;
  durationMs?: number;
}
