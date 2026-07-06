# Walkthrough: Email Invitation System

The direct "Add User" creation feature has been replaced with a secure, token-based **Email Invitation System** (Phases 1–10 of the implementation plan). This workflow allows administrators to invite team members via email with secure, expiring single-use links.

## 🛠️ Summary of Changes

### 1. Database Schema (`supabase/`)
- **[NEW] Migration [20260705000000_create_invitations.sql](file:///D:/repos/ojt-tracker/supabase/migrations/20260705000000_create_invitations.sql):**
  - Defines the `invitations` table with fields for `organization_id`, `email`, `role`, `invited_by`, `token` (cryptographically secure), `status` (`pending`, `accepted`, `expired`, `revoked`), and expiration dates.
  - Implements a partial unique index: `unique (email, organization_id) where (status = 'pending')` to restrict duplicate pending invitations.
  - Configures **Row-Level Security (RLS)** policies so that only organization administrators can view, insert, or update invitations inside their company, protecting multi-tenant boundaries.
- **[MODIFY] Main Schema [schema.sql](file:///D:/repos/ojt-tracker/supabase/schema.sql):**
  - Appended the idempotent `invitations` table definition and RLS policies.

### 2. Service Layer & API Endpoints (`src/lib/services/` & `src/app/api/`)
- **[NEW] Invitation Service [invitation.ts](file:///D:/repos/ojt-tracker/src/lib/services/invitation.ts):**
  - Encapsulates database actions: `createInvitation`, `getInvitationByToken`, `validateInvitation`, `acceptInvitation`, `revokeInvitation`, and `listInvitations`.
  - Automatically checks if an invitee is already a member of the organization or has an active pending invitation before generating a token.
- **[NEW] API Routes:**
  - `GET /api/invitations` & `POST /api/invitations` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/route.ts): Handles listing existing invites and creating new invites, returning a secure URL link and printing a mock email log to the console.
  - `DELETE` & `PUT` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/[id]/route.ts): Manages individual invitations for revoking and resending (generates new token, resets expiry).
  - `POST /api/invitations/accept` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/accept/route.ts): Allows authenticated users to accept their invitation and links them to the tenant organization.
  - `GET /api/invitations/verify` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/verify/route.ts): Public validation endpoint for checking token state during signup.

### 3. User Interface & Onboarding Flow
- **[NEW] Acceptance Onboarding Route `/invite/[token]`:**
  - Server Component in [page.tsx](file:///D:/repos/ojt-tracker/src/app/invite/[token]/page.tsx) and Client Component in [InviteClient.tsx](file:///D:/repos/ojt-tracker/src/app/invite/[token]/InviteClient.tsx) render a premium details card (organization name, role, inviter, and expiration).
  - **Unauthenticated Guests:** Prompted with options to sign up (`/register?invite_token=TOKEN`) or log in (`/login?next=/invite/TOKEN`).
  - **Authenticated Users:** Auto-consumes the invitation if emails match, updating roles and tenancy, then redirects smoothly to their respective role dashboard. Warns and blocks if there is an email mismatch.
- **[MODIFY] Admin User List [UsersClient.tsx](file:///D:/repos/ojt-tracker/src/app/dashboard/admin/users/UsersClient.tsx):**
  - Replaced "Add User" button and form dialog with the new "Invite User" modal.
  - Merged active user profiles and pending/expired/revoked invitations into a unified management grid.
  - Added dedicated resend (`RefreshIcon`) and revoke (`BlockIcon`) actions for invitation records.
- **[MODIFY] Register Form [RegisterForm.tsx](file:///D:/repos/ojt-tracker/src/components/auth/RegisterForm.tsx):**
  - Reads `invite_token` from URL parameter. If found, automatically queries the verification API, locks the email field (disabled inputs for security), hides creation/code-joining tabs, and registers using the invitation action payload.
- **[MODIFY] Login & Session Callbacks:**
  - [LoginForm.tsx](file:///D:/repos/ojt-tracker/src/components/auth/LoginForm.tsx) now respects and forwards search parameters for custom redirects after sign in.
  - [route.ts](file:///D:/repos/ojt-tracker/src/app/auth/callback/route.ts) callback bypasses the standard `/onboarding` redirect if a user does not have an organization but is following a `/invite/` link, allowing OAuth sign-ups/in to complete onboarding.
  - [proxy.ts](file:///D:/repos/ojt-tracker/src/proxy.ts) and [middleware.ts](file:///D:/repos/ojt-tracker/src/middleware.ts) middleware configured to exclude `/invite/` paths from standard authentication redirection, allowing anonymous invitation verification.

### 4. In-App Notification System (Phase 11)
- **[NEW] Migration [20260705010000_create_notifications.sql](file:///D:/repos/ojt-tracker/supabase/migrations/20260705010000_create_notifications.sql):**
  - Defines the `notifications` table for system logs (`id`, `org_id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`).
  - Sets up RLS rules so users can only view or mark their own notifications as read.
- **[MODIFY] Main Schema [schema.sql](file:///D:/repos/ojt-tracker/supabase/schema.sql):**
  - Appended the idempotent `notifications` table schema and RLS policies.
- **[NEW] Notification Service [notification.ts](file:///D:/repos/ojt-tracker/src/lib/services/notification.ts):**
  - Implements helpers: `createNotification`, `notifyAdmins` (to broadcast to all organization admins), `listNotifications`, and read status updates.
- **[NEW] API Route `/api/notifications` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/notifications/route.ts):**
  - Handles retrieving user notifications and updating read statuses.
- **[MODIFY] Service Triggers in [invitation.ts](file:///D:/repos/ojt-tracker/src/lib/services/invitation.ts):**
  - Sends a confirmation to the inviting admin when an invitation is sent.
  - Broadcasts to all admins when an invitation is accepted.
  - Broadcasts to all admins if a verification check determines the token has expired.
  - Broadcasts to all admins when an invitation is revoked.
- **[NEW] UI Notification Dashboard `/dashboard/notifications`:**
  - Pages at [page.tsx](file:///D:/repos/ojt-tracker/src/app/dashboard/notifications/page.tsx) and [NotificationsClient.tsx](file:///D:/repos/ojt-tracker/src/app/dashboard/notifications/NotificationsClient.tsx) allow viewing notifications with custom icons based on action type, marking items as read, or clearing all.
- **[MODIFY] Sidebar Integration [Sidebar.tsx](file:///D:/repos/ojt-tracker/src/components/shared/Sidebar.tsx):**
  - Registered "Notifications" navigation item in the Sidebar.
  - Added real-time polling to fetch unread count, rendering an error `Badge` in collapsed state and a numeric count `Chip` in expanded state.

### 5. Kanban Board Drag and Drop Fix (Phase 12)
- **[NEW] Migration [20260706000000_kanban_reorder.sql](file:///D:/repos/ojt-tracker/supabase/migrations/20260706000000_kanban_reorder.sql):**
  - Defines the indexes `idx_kanban_columns_org_position`, `idx_kanban_tasks_column_position`, and `idx_kanban_tasks_org_column_position` to optimize column and task lookups.
  - Registers the PostgreSQL security-definer RPC functions `reorder_kanban_columns` and `reorder_kanban_tasks` to execute updates inside a single database transaction. Includes user organization validation and task ownership checks for OJT accounts.
- **[MODIFY] Main Schema [schema.sql](file:///D:/repos/ojt-tracker/supabase/schema.sql):**
  - Appended the indexes and reorder RPC function definitions.
- **[NEW] Kanban Service [kanban.ts](file:///D:/repos/ojt-tracker/src/lib/services/kanban.ts):**
  - Implements the service helpers `reorderColumns` and `reorderTasks` to invoke the database RPC functions.
- **[NEW] API Routes:**
  - `PATCH /api/kanban/reorder/columns` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/kanban/reorder/columns/route.ts): Handles column reordering requests, validating that only admins and supervisors can modify column positions.
  - `PATCH /api/kanban/reorder/tasks` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/kanban/reorder/tasks/route.ts): Handles task reordering and cross-column moves.
- **[MODIFY] Kanban Board Drag Handlers [KanbanBoard.tsx](file:///D:/repos/ojt-tracker/src/components/kanban/KanbanBoard.tsx):**
  - Performs a deep copy backup of the columns and tasks array state at the start of a drag.
  - Updates the local state immediately on drop (optimistic UI update).
  - Sends a single PATCH request containing all affected columns or tasks, and quietly triggers a background reload (`fetchBoard(true)`) upon success.
  - Gracefully rolls back the UI to the pre-drag state if the API request fails, or if a user drops a card outside of a valid column boundary.

### 6. Kanban Column Customization and Dynamic Expansion
- **[NEW] Column Deletion Migration [20260706010000_kanban_delete_column.sql](file:///D:/repos/ojt-tracker/supabase/migrations/20260706010000_kanban_delete_column.sql):**
  - Defines the `delete_kanban_column` PostgreSQL RPC function. It updates task column assignments to a chosen destination or archives them, deletes the column row, and resequences all column positions in a single transaction (open to all organization member roles).
- **[NEW] Column RLS Policy Migration [20260706020000_kanban_columns_rls.sql](file:///D:/repos/ojt-tracker/supabase/migrations/20260706020000_kanban_columns_rls.sql):**
  - Drops the restrictive supervisor/admin only policy and implements an organization-wide RLS write policy allowing all organization members to create, edit, or delete columns within their organization.
- **[MODIFY] Main Schema [schema.sql](file:///D:/repos/ojt-tracker/supabase/schema.sql):**
  - Appended the `delete_kanban_column` RPC function definition and updated RLS policy `Org members can manage kanban columns` on `kanban_columns`.
- **[NEW] Column API Routes:**
  - `POST /api/kanban/columns` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/kanban/columns/route.ts): Accepts `title` and `color`, computes the next sequential column position in the organization, and creates the column. Permitted for any user inside the organization.
  - `PATCH /api/kanban/columns/[id]` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/kanban/columns/[id]/route.ts): Handles renaming and coloring updates for any organization member.
  - `DELETE /api/kanban/columns/[id]` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/kanban/columns/[id]/route.ts): Receives `moveTasksTo` and calls the transactional `delete_kanban_column` RPC for any organization member.
- **[MODIFY] Column Dialog Component [ColumnDialog.tsx](file:///D:/repos/ojt-tracker/src/components/kanban/ColumnDialog.tsx):**
  - Delegates persistence callbacks to the parent `KanbanBoard` to enable seamless optimistic UI state management.
- **[MODIFY] Kanban Board [KanbanBoard.tsx](file:///D:/repos/ojt-tracker/src/components/kanban/KanbanBoard.tsx):**
  - Implements `handleSaveColumn` to perform optimistic UI updates during creation and editing of columns, rolling back to original state on request failure.
  - Redesigns the column deletion confirmation dialog to present options to either archive the column's tasks or move them to another column.
  - Adds a premium "+ Add Column" card at the end of the horizontally scrollable board (now visible and clickable for all roles who belong to an organization).
- **[MODIFY] Column Width [KanbanColumn.tsx](file:///D:/repos/ojt-tracker/src/components/kanban/KanbanColumn.tsx):**
  - Updated individual column width constraints to `320px` to match modern standard boards and maintain consistent horizontal grid alignment. Column headers and dragging attributes are now active for all member roles via `canManageColumns` prop.

---

## 🚦 Verification Results

1. **TypeScript Type Safety:**
   - Ran `npx tsc --noEmit` locally. The check completed successfully with zero compiler errors across the workspace.
2. **Database Schema Sanity:**
   - Database tables, constraints, partial indexes, and RLS policies are prepared and match standard PostgreSQL/Supabase configuration schemas.
3. **Drag-and-Drop Reliability:**
   - Validated that optimistic UI updates correctly reflect the database state following successful API transactions, and that rollback logic triggers correctly on network error scenarios.
