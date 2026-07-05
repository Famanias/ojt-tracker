Implementation Plan: Replace "Add User" with Email Invitation System
Feature Overview

Replace the current "Add User" functionality with an Invitation System.

Instead of administrators directly creating users by entering an email, administrators will send an invitation email. The invited user can then create or link their account and automatically join the organization upon accepting the invitation.

This introduces two supported methods for joining an organization:

Join via Invite Code (existing)
Join via Email Invitation (new)

The invitation system should integrate cleanly with the existing Supabase authentication architecture and organization management flow.

Objectives
Remove direct user creation from the Admin panel.
Allow admins to invite users via email (as either OJT, Supervisor or Administrator).
Automatically associate invited users with the correct organization after accepting the invitation.
Prevent duplicate invitations.
Support invitations for both existing and new users.
Maintain Row-Level Security (RLS) and organization isolation.

Phase 1 — Analyze Existing User Management
Goal

Understand how users are currently added to an organization.

Review
Current "Add User" modal/page
User Management components
Organization membership logic
Profile creation flow
Existing Invite Code implementation
Current Supabase Auth flow
Existing database schema
Deliverables
Document current user creation flow
Identify reusable organization assignment logic
Identify reusable validation logic

Phase 2 — Database Design
Goal

Introduce an invitation system.

Create Invitations Table

Example fields:

Field	Description
id	UUID
organization_id	Organization
email	Invited email
role	Assigned role
invited_by	Admin user ID
token	Secure unique token
status	pending / accepted / expired / revoked
expires_at	Expiration timestamp
accepted_at	Timestamp
created_at	Timestamp


Requirements
One pending invitation per email per organization
Unique invitation token
Expiration support
Invitation status tracking
RLS Policies

Ensure:

Admins can create invitations
Admins can view invitations within their organization
Admins can revoke invitations
Invited users can only consume their own invitation
Organizations remain isolated


Phase 3 — Invitation Service Layer
Goal

Create reusable invitation logic.

New Service Functions

Example:

createInvitation()

getInvitation()

validateInvitation()

acceptInvitation()

revokeInvitation()

resendInvitation()

listInvitations()

Responsibilities include:

Generate secure token
Prevent duplicates
Validate expiration
Validate organization
Update invitation status

Phase 4 — Email Delivery
Goal

Automatically send invitation emails.

Flow

Admin clicks:

Invite User

↓

Create invitation record

↓

Generate secure token

↓

Send email

↓

User receives email

↓

Clicks invitation link

↓

Redirect to signup/login

↓

Joins organization

Email Content

Include:

Organization name
Assigned role
Expiration date
Accept Invitation button
Fallback URL
Invitation URL

Example:

/invite/{token}

or

/accept-invite?token=...
Phase 5 — Invitation Acceptance Flow
Goal

Create invitation onboarding.

Route
/invite/[token]

Responsibilities:

Validate token
Check expiration
Check status
Display organization details
Prompt login/signup
Existing User

If already authenticated:

Validate email

↓

Join organization

↓

Update profile

↓

Mark invitation accepted

↓

Redirect to dashboard
New User
Signup

↓

Email verification (if enabled)

↓

Complete profile

↓

Join organization

↓

Redirect


Phase 6 — Admin User Interface
Replace

Current

Add User

with

Invite User
New Invite Modal

Fields:

Email
Role
Send Invitation

Optional:

Personal message
Validation
Valid email
Existing pending invitation
Existing organization member


Phase 7 — Invitation Management
Add the invited users in the user Management, label the status as "Pending Invite"


Example:

User	Role	Department	Required Hours	Joined	Status	Actions
John Lynard Isip haratayo@gmail.com OJT IT	600h	Jul 02, 2026 Pending Invite Resend/Revoke

if the user is pending invitation, that means the actions column is different: Resend/Revoke instead of Edit/Deactivate

Once the user accepts invitation, the status will become active, and the actions will become Edit/Deactivate just like existing users.

Phase 8 — Signup Integration
Update Authentication Flow

Current:

Signup

↓

Create profile

New:

Signup

↓

Check invitation token

↓

If valid:

Assign organization

Assign role

Accept invitation

↓

Create profile

↓

Dashboard
Existing Login Flow
Login

↓

Invitation detected

↓

Validate email

↓

Join organization

↓

Dashboard

Phase 9 — Security
Requirements
Tokens
Cryptographically secure
Non-guessable
Single use
Expirable
Validation

Verify:

Invitation exists
Token matches
Status == pending
Not expired
Email matches authenticated user
Organization exists
Prevent
Invitation reuse
Cross-organization access
Email mismatch
Duplicate organization membership
Manual token manipulation
Phase 10 — UX Improvements
Admin

Success message

Invitation sent successfully.
Invitee

Friendly invitation page showing:

Organization name
Assigned role
Invited by
Expiration
Error States

Handle:

Invitation expired
Invitation revoked
Already accepted
Invalid token
Wrong email account
Phase 11 — Notifications (DO NOT DO THIS PHASE 11 YET! )

Optional improvements:

Invitation sent confirmation
Invitation accepted notification
Invitation expired notification
Invitation revoked notification

Phase 12 — Testing (DO NOT DO THIS PHASE 12 YET! I WILL TEST YOUR OUTPUT MYSELF!)
Functional Tests
Admin
Send invitation
Duplicate invitation prevention
Revoke invitation
Resend invitation
Invitee
Accept invitation
Signup via invitation
Login via invitation
Expired invitation
Revoked invitation
Invalid token
Already accepted
Security
Token tampering
Wrong authenticated email
Organization isolation
RLS verification
Duplicate membership prevention
User Flow
Admin
│
├── Invite User
│
├── Enter Email + Role
│
├── Invitation Record Created
│
├── Email Sent
│
└──────────────► Invitee

Invitee
│
├── Click Invitation Link
│
├── Validate Token
│
├── Login or Sign Up
│
├── Email Matches Invitation
│
├── Organization Membership Created
│
├── Invitation Marked Accepted
│
└── Redirect to Dashboard



Expected Outcome

After implementation, the User Management module will support a more secure and scalable onboarding workflow:

Invite Code: Users can still join an organization using a valid invite code.
Email Invitation: Administrators can invite users directly by email, with secure, single-use invitation links.
Automatic Organization Assignment: Accepted invitations automatically associate users with the correct organization and role.
Centralized Invitation Management: Administrators can track pending invitations, resend or revoke them, and monitor their status.
Improved Security: Email ownership verification, expiring tokens, single-use invitations, and RLS policies ensure organization boundaries remain protected.
Better User Experience: New and existing users have a seamless onboarding flow without requiring administrators to create accounts on their behalf.