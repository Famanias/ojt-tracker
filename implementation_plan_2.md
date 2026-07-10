Personal & Organization Kanban (Scope-Based)

This implementation revises the Kanban architecture to support both Personal and Organization boards using the same codebase.

Users without an organization will have their own personal Kanban board. Joining an organization switches the board to the shared organization board while preserving the user's personal board for future use.

The goal is to treat Personal Mode as a first-class Kanban experience, not as an exception.

User Review Required

[!IMPORTANT]

The current implementation assumes every Kanban operation belongs to an organization. Several RLS policies, API routes, and PostgreSQL functions currently reject users whose org_id is NULL.

This implementation will revise those assumptions so every Kanban operation works against either:

Personal Scope (org_id IS NULL, owned by the current user), or
Organization Scope (org_id = current organization).

The existing Kanban components should continue serving both scopes. Avoid creating duplicate "Personal Kanban" components or maintaining separate implementations.

Design Principles
Board Scope

Every Kanban operation should operate against a single board scope.

Determine the scope once:

Organization Scope
profile.org_id exists.
Personal Scope
profile.org_id is NULL.

The remainder of the application should work against the selected scope instead of repeatedly checking org_id.

Shared UI

The Kanban UI should remain nearly identical between both scopes.

Organization membership should add collaborative capabilities, not unlock the Kanban itself.

Only organization-dependent functionality should change.

Proposed Changes
Component: Shared Scope Helper
[NEW] kanbanScope.ts

Create a shared helper responsible for determining the active board.

Example responsibilities:

Determine whether the board is Personal or Organization.
Provide reusable query filters.
Expose permission helpers.

Example helpers:

getKanbanScope(profile)
isPersonalBoard(scope)
isOrganizationBoard(scope)

All API routes and client components should consume this helper instead of repeatedly checking profile.org_id.

Component: Database
[NEW] Migration

Update:

RLS policies
PostgreSQL functions
RPC functions

so every operation supports both board scopes.

Rather than rejecting NULL org_id, the functions should resolve ownership using the active scope.

Review:

kanban_columns
kanban_tasks
task_assignees
task_attachments

Review all existing functions for hidden organization assumptions.

Component: Board Initialization
[MODIFY] kanban/page.tsx

Remove the RequireOrganization wrapper.

When loading the board:

Determine board scope.
Load the appropriate board.

If no columns exist for the current scope:

Automatically create

To Do
In Progress
Done

This initialization should be idempotent so it never creates duplicates.

Component: API Routes

Rather than adding special "Personal Mode" logic everywhere, revise every endpoint to operate on the current board scope.

Review:

columns
tasks
reorder
archive
attachments
comments
assignees
any future Kanban endpoints

Every endpoint should:

Determine scope.
Validate access.
Execute normally.

The business logic should be identical regardless of board type.

Component: Client Components
KanbanBoard

Remove assumptions that users without an organization cannot manage the board.

Permissions should become:

Personal Board

Full control over columns.
Full control over tasks.

Organization Board

Use the existing role-based permissions.

Avoid introducing additional

isPersonalMode

flags throughout the component if the permission model can determine capabilities instead.

TaskModal

Only organization-specific UI should change.

Hide:

Assigned OJTs
Organization member picker

Keep everything else identical.

Do not fork the component.

TaskViewDialog

Reuse the same permission model.

Users should always be able to edit their own Personal Board tasks.

Component: Collaboration Features

Disable only features that require an organization.

Examples:

User assignment
Organization members
Team collaboration
Organization-wide permissions

Everything else should continue functioning normally.

Where a feature is unavailable, provide a concise explanation rather than blocking the board.

Component: Permissions

Refactor permission logic into reusable helpers instead of scattering checks.

Examples:

canManageBoard()
canManageColumns()
canAssignUsers()
canEditTask()

The helper should internally account for the current board scope.

Component: Future Compatibility

The revised architecture should make future features automatically support Personal Boards whenever possible.

New Kanban features should only require organization membership when collaboration is essential.

Avoid introducing new code paths exclusively for Personal Mode.

Verification Plan
Automated
npm run lint
npm run build
Manual
Personal Board

Verify that a user without an organization can:

Open Kanban.
Automatically receive default columns.
Create, edit, reorder, and delete columns.
Create, edit, move, archive, and delete tasks.
Upload attachments.
Refresh without data loss.
Collaboration

Verify that Personal Boards:

Hide member assignment.
Hide organization-specific collaboration controls.
Continue functioning normally otherwise.
Organization Board

Verify that existing organization behavior remains unchanged:

Shared boards.
Role permissions.
User assignment.
Collaboration.
Existing drag-and-drop behavior.
Regression Testing

Verify that switching between Personal and Organization scopes does not corrupt data or mix records between boards.

Confirm that:

Personal board data remains isolated to its owner.
Organization board data remains isolated to its organization.
RLS continues enforcing both ownership models correctly.