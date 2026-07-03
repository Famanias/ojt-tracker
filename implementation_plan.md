Implementation Plan - Google OAuth Authentication with Supabase

This plan outlines the implementation of Google OAuth authentication using Supabase Auth in the OJT Tracker application. It preserves the existing email/password authentication flow while seamlessly handling OAuth login, automatic profile provisioning, and multi-tenant organization onboarding.

The implementation follows a clear separation of responsibilities:

Supabase Auth authenticates the user.
Database triggers provision the user profile.
OAuth callback restores the authenticated session and routes the user appropriately.
Onboarding flow handles organization creation or joining.
Shared service functions contain all organization business logic to avoid code duplication.
User Review Required

[!IMPORTANT]

1. Update the handle_new_user() Database Trigger

The existing handle_new_user() trigger currently overwrites fields such as role and org_id whenever an OAuth login occurs because Google does not provide those values.

Update the trigger so that it:

Creates a profile only if one does not already exist.
Updates only safe profile fields (full_name, email, avatar_url) on subsequent logins.
Preserves:
role
org_id
organization membership
permissions
Populate avatar_url using either:
avatar_url
picture

Create a proper Supabase SQL migration instead of modifying production SQL manually.

2. Introduce an Onboarding Flow

Because Nexus is multi-tenant, authenticated users must belong to an organization before accessing the dashboard.

Users who authenticate with Google but have no associated organization should be redirected to /onboarding, where they can:

Create an organization
Join an organization using an invite code

Business operations such as organization creation and joining should not occur inside the OAuth callback.

3. Activate Middleware

The current authentication middleware located in src/proxy.ts is not active because Next.js expects middleware.ts.

Create src/middleware.ts that delegates to proxy.ts so that:

sessions restore correctly
cookies refresh automatically
protected routes continue functioning after OAuth login
Proposed Changes
Database
[MODIFY] supabase/schema.sql

Update handle_new_user():

Preserve existing role
Preserve existing org_id
Preserve organization membership
Populate Google avatar
Update only non-sensitive profile fields

Create a proper migration for the trigger update.

The trigger should remain the single source of truth for automatic profile provisioning. The application should not duplicate profile creation logic.

Shared Business Services
[NEW OR REFACTOR]

Extract organization operations into reusable service functions.

Examples include:

createOrganization()
joinOrganization()
initializeOrganization()
generateDefaultKanbanColumns()
generateOrganizationSettings()

Both the normal registration flow and OAuth onboarding should reuse these services.

Avoid duplicating organization creation logic across multiple routes.

Authentication UI
[MODIFY] LoginForm.tsx
Add Continue with Google
Preserve existing email/password flow
Read the next parameter
Pass the intended destination through OAuth
Display OAuth errors returned from the callback
Show loading state while redirecting
[MODIFY] RegisterForm.tsx

Keep the existing registration UI.

If the user begins registration using Google:

Preserve registration intent
Preserve organization creation intent
Preserve invite code

Do not rely on URL query parameters for sensitive or editable data.

Instead, use a temporary authenticated mechanism (such as OAuth state, secure cookies, or another server-controlled mechanism) whenever practical.

Avoid exposing organization names or invite codes directly in browser history.

OAuth Callback
[NEW] src/app/auth/callback/route.ts

The callback should remain lightweight.

Responsibilities:

Exchange authorization code for a Supabase session.
Restore the authenticated user.
Verify the authenticated profile exists.
The database trigger should already have created it.
If the profile is unexpectedly missing, treat it as an error rather than recreating it.
If the profile has no org_id, redirect to /onboarding.
Otherwise:
redirect to the original destination (next)
or the user's dashboard

Handle:

cancelled authentication
expired codes
invalid callbacks
authentication failures

Do not:

create organizations
join organizations
generate Kanban boards
generate settings
assign roles

Those belong to onboarding.

Middleware
[NEW] src/middleware.ts

Delegate to proxy.ts.

Ensure:

session restoration
cookie refresh
protected routes
authenticated redirects

continue working for both email/password and OAuth users.

Dashboard Protection
[MODIFY] dashboard/layout.tsx

Verify:

authenticated session
valid profile
organization membership

If org_id is null:

Redirect to /onboarding.

Onboarding
[NEW] /onboarding

Authenticated users without an organization should be redirected here.

The page allows users to:

Create Organization
Join Organization

All operations should call the shared organization service layer rather than implementing business logic directly inside the page.

[NEW] api/onboarding

The onboarding endpoint should:

Create Organization
Create organization
Assign administrator role
Initialize workspace
Create default settings
Generate default Kanban columns

using the shared services.

Join Organization
Validate invite code
Join organization
Assign OJT role

using the same shared services used by normal registration.

[NEW] OnboardingClient.tsx

Build a polished onboarding experience using the project's design system.

Features:

Create Organization
Join with Invite Code
Invite code validation
Loading states
Error handling
Success feedback
Sign Out button
Security

Follow Supabase OAuth best practices.

Never trust client-supplied identity data.
Use the authenticated Supabase session as the source of truth.
Avoid manually storing OAuth tokens.
Preserve existing RLS policies.
Preserve organization permissions.
Preserve user roles.
Keep authentication provider-agnostic for future providers (GitHub, Microsoft, Apple).
Verification Plan
Automated
Run database migration.
Verify trigger compiles successfully.
Run project build.
Ensure TypeScript passes.
Ensure middleware activates correctly.
Manual
Authentication
New Google user signs in successfully.
Existing Google user signs in successfully.
Existing email/password user continues to work.
Logout works correctly.
Session restoration works correctly.
Organization Flow
Google user without an organization is redirected to onboarding.
Creating an organization initializes the workspace correctly.
Joining an organization via invite code succeeds.
Dashboard becomes accessible immediately afterward.
Existing Users

Verify an existing email/password account can authenticate using the same Google email without:

creating duplicate profiles
losing organization membership
losing roles
resetting permissions

If account linking behavior requires additional configuration, document and implement it according to Supabase's recommended identity-linking approach.

Regression Testing

Verify:

Existing registration flow remains unchanged.
Existing login flow remains unchanged.
Existing RLS policies continue to function.
Existing organization permissions remain intact.
Existing dashboards behave identically for both email/password and Google-authenticated users.