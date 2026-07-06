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

### 4. Email Delivery with Resend (Phase 11)
- **[NEW] Email Template [InvitationEmail.tsx](file:///D:/repos/ojt-tracker/src/emails/InvitationEmail.tsx):**
  - Designed a premium, responsive email template using React Email components containing the Nexus logo, organization details, role, inviter name, secure accept buttons, and expiration text.
- **[NEW] Email Service [email.ts](file:///D:/repos/ojt-tracker/src/lib/services/email.ts):**
  - Created a modular wrapper service for Resend API.
  - Implemented automatic developer logging fallback so that the application operates locally without crashing even if the API key is not configured.
- **[MODIFY] API Route `/api/invitations` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/route.ts):**
  - Integrated `sendInvitationEmail` into the invitation creation process.
  - Returns a warning message in the response if email sending fails, keeping the DB record valid.
- **[MODIFY] API Route `/api/invitations/[id]` in [route.ts](file:///D:/repos/ojt-tracker/src/app/api/invitations/[id]/route.ts):**
  - Integrated `sendInvitationEmail` into the resending process, generating new tokens and renewing expirations.
- **[MODIFY] Admin UI Dashboard [UsersClient.tsx](file:///D:/repos/ojt-tracker/src/app/dashboard/admin/users/UsersClient.tsx):**
  - Updated action handlers to show alert warning messages to the administrator if the email delivery fails but the invitation is created successfully.


---

## 🚦 Verification Results

1. **TypeScript Type Safety:**
   - Ran `npx tsc --noEmit` locally. The check completed successfully with zero compiler errors across the workspace.
2. **Database Schema Sanity:**
   - Database tables, constraints, partial indexes, and RLS policies are prepared and match standard PostgreSQL/Supabase configuration schemas.
