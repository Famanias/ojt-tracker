Optional Organization Membership & Leaving Organizations (Revised)

This implementation enables Personal Mode, allowing users to register, sign in, and use personal features without belonging to an organization. Organization membership becomes optional and is only required when accessing organization-specific functionality.

The implementation avoids introducing additional user state by relying solely on the existing nullable profiles.org_id. If org_id is NULL, the application treats the user as operating in Personal Mode.

Design Principles
Personal Mode

A user with profiles.org_id = NULL is considered to be in Personal Mode.

Personal Mode allows:

Authentication
Dashboard access
Personal attendance (clock in/out)
Profile management
Personal statistics
Any future personal-only features

Organization membership is only required for organization-specific functionality.

Organization Mode

A user with a valid profiles.org_id has access to organization features such as:

Kanban
Reports
User Management
Site Settings
Organization Members
Organization Analytics
Future organization-specific modules
User Review Required

[!IMPORTANT]
This project already uses proxy.ts instead of middleware.ts. Do not create, modify, or reintroduce middleware.ts. All request interception and route protection must continue to use the existing proxy.ts implementation to maintain a single source of truth for authentication.

[!IMPORTANT]
The current database schema already supports nullable org_id values in profiles and attendance, so no database migrations are required.

This implementation intentionally does not introduce any additional onboarding state (such as user_metadata.onboarding_skipped). The single source of truth is profiles.org_id.

If org_id is NULL, the user is simply operating in Personal Mode.

Proposed Changes
Component: Authentication & Navigation
[MODIFY] dashboard/layout.tsx

Revise the dashboard authentication flow so that any authenticated user can access the dashboard.

The dashboard should no longer require organization membership.

Responsibilities:

Verify authentication
Load user profile
Do not redirect because org_id is NULL

[IMPORTANT]

Do not introduce or modify middleware.ts.

This project already uses proxy.ts for request interception and authentication routing. All authentication and route protection changes should be implemented within the existing proxy.ts architecture. Do not create a new middleware.ts, migrate logic to middleware.ts, or split authentication logic between the two files.

[MODIFY] proxy.ts

Audit the existing route protection logic and remove any checks that assume organization membership is mandatory.

The proxy should only be responsible for:

Verifying authentication
Protecting authenticated routes
Redirecting unauthenticated users to the login page
Preserving existing authentication behavior

The proxy must not redirect authenticated users simply because profile.org_id is NULL.

[MODIFY] auth/callback/route.ts

Simplify the post-login flow.

Authenticated users should always proceed to the dashboard regardless of organization membership.

Component: Organization Permission Wrapper
[NEW] RequireOrganization.tsx

Create a reusable wrapper component responsible for enforcing organization membership.

Responsibilities:

Detect whether profile.org_id exists
Render children if the user belongs to an organization
Otherwise display the reusable OrgRequiredPlaceholder

Example usage:

<RequireOrganization>
    <KanbanBoard />
</RequireOrganization>

This centralizes organization access control and prevents duplicated checks throughout the application.

Component: Organization Placeholder
[NEW] OrgRequiredPlaceholder.tsx

Create a reusable placeholder page displayed whenever a Personal Mode user attempts to access an organization-only feature.

The component should include:

Friendly explanation
"Create Organization"
"Join Organization"
Link back to Dashboard

The placeholder should be reusable across all organization pages.

Component: Organization Pages

Wrap organization-only pages using RequireOrganization.

[MODIFY] KanbanBoard.tsx

Wrap Kanban content with RequireOrganization.

[MODIFY] ReportsClient.tsx

Wrap reports with RequireOrganization.

[MODIFY] UsersClient.tsx

Wrap user management with RequireOrganization.

[MODIFY] SettingsClient.tsx

Wrap organization settings with RequireOrganization.

[MODIFY] Future organization pages

Any future organization-only feature should use the same wrapper rather than implementing its own permission logic.

Component: Dashboard Experience
[MODIFY]
OJTClient.tsx
AdminDashboardClient.tsx
SupervisorClient.tsx

When org_id is NULL, display a friendly Personal Mode banner explaining:

You're currently using the application in Personal Mode.

Provide quick actions:

Create Organization
Join Organization

Do not block dashboard usage.

Component: Attendance
[MODIFY] ClockButton.tsx

Support Personal Attendance Mode.

When org_id is NULL:

Skip organization site lookup
Skip organization GPS radius validation
Record attendance normally
Clearly label attendance as Personal Mode if appropriate

When the user belongs to an organization, preserve the existing GPS validation behavior.

Component: Leaving Organizations
[NEW] /api/organizations/leave

Create a secure API endpoint for leaving an organization.

Responsibilities:

Verify authentication
Verify current organization membership
Remove organization relationship
Clear organization-specific cached state if applicable
Return updated profile

The endpoint should not simply update org_id.

It should enforce organization rules.

Leaving Rules

Define explicit behavior.

Members

May leave freely.

Supervisors

May leave.
Any organization-specific assignments should be handled gracefully.

Administrators

May leave only if another administrator remains.

Last Administrator

Cannot leave until ownership/admin privileges are transferred.

This prevents orphaned organizations.

[MODIFY] Sidebar.tsx

When the user belongs to an organization:

Display:

Leave Organization

After confirmation:

Call /api/organizations/leave
Return the user to the Dashboard
Display Personal Mode banner

Do not force onboarding again.

Component: Onboarding
[MODIFY] OnboardingClient.tsx

Simplify onboarding.

Users should have three choices:

Create Organization
Join Organization
Continue in Personal Mode

Choosing Personal Mode simply navigates to the Dashboard.

No metadata or onboarding flags need to be stored.

If a user already belongs to an organization, redirect directly to the dashboard.

Component: Permission Utilities
[NEW] organization.ts

Create reusable helper utilities such as:

isOrganizationMember(profile)

isPersonalMode(profile)

canAccessOrganizationFeatures(profile)

Future development should use these helpers instead of repeatedly checking:

profile.org_id === null

This keeps permission logic centralized and easier to maintain.

Verification Plan
Automated Verification
npm run lint

npm run build
Manual Verification
1. New User Flow
Register a new account.
Choose Continue in Personal Mode.
Verify access to the dashboard.
Verify attendance works.
Verify Personal Mode banner is shown.
2. Organization Feature Protection

Visit:

Kanban
Reports
User Management
Site Settings

Verify each displays the reusable Organization Required placeholder.

3. Join or Create Organization

Create or join an organization.

Verify:

Personal Mode banner disappears.
Organization pages become accessible.
GPS attendance enforcement resumes.
4. Leave Organization

Leave the organization.

Verify:

profiles.org_id becomes NULL.
Dashboard remains accessible.
Personal Mode banner appears.
Organization pages become inaccessible.
Attendance continues in Personal Mode.
5. Administrator Rules

Verify:

Non-admins can leave normally.
Admins with other admins can leave.
The last remaining administrator cannot leave until another administrator exists.
6. Middleware & Authentication

Verify:

Authenticated users without an organization are never redirected away from the dashboard.
Organization restrictions are enforced only by RequireOrganization, not by global authentication logic.