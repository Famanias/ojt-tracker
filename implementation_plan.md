Phase 11 — Email Delivery with Resend
Goal

Replace the current mock email implementation with a production-ready email delivery system using Resend. When an administrator invites a user, Nexus should automatically send a professionally designed invitation email containing a secure, single-use invitation link. The system should also support resending invitations and handle email delivery failures gracefully.

Objectives
Integrate Resend as the email delivery provider.
Replace console-based mock emails with actual email sending.
Deliver branded HTML invitation emails.
Support invitation resending.
Handle email delivery failures without affecting invitation creation.
Securely manage API keys using environment variables.
Keep email sending abstracted behind a reusable service.
Phase 11.1 — Configure Resend
Goal

Set up Resend for the Nexus application.

Tasks
Create a Resend account.
Verify the sending domain (or use the testing domain during development).
Generate a Resend API Key.
Store the API key securely in environment variables.

Example:

RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://nexus.example.com
EMAIL_FROM=Nexus <noreply@nexus.example.com>
Deliverables
Working Resend account.
Verified sender identity.
Environment variables configured for development and production.
Phase 11.2 — Install Dependencies
Goal

Install the required packages for email delivery.

Tasks

Install:

resend
@react-email/components
react-email (optional for previewing templates)
Deliverables
Email dependencies added to the project.
Build compiles successfully.
Phase 11.3 — Create Email Service
Goal

Abstract all email functionality into a dedicated service layer.

New Service
src/lib/services/email.ts
Responsibilities
Initialize the Resend client.
Send invitation emails.
Send reminder emails (future).
Send notification emails (future).
Centralize email error handling.
Example Functions
sendInvitationEmail()

sendInvitationReminder()

sendInvitationAcceptedNotification()

sendInvitationExpiredNotification()
Design Principles
API routes should never communicate with Resend directly.
All email operations should pass through the email service.
Future notification types can reuse the same service.
Phase 11.4 — Create Email Templates
Goal

Build reusable, branded email templates using React Email.

Directory Structure
src/emails/

InvitationEmail.tsx

InvitationReminder.tsx

InvitationAccepted.tsx
Invitation Email

The email should include:

Nexus logo
Organization name
Inviter's name
Assigned role
Invitation expiration date
Accept Invitation button
Fallback invitation URL
Support contact information
Security notice indicating that the invitation is intended only for the recipient
Styling

Maintain the Nexus design language:

Clean layout
Responsive design
Mobile-friendly
Accessible typography
Brand colors
Professional appearance
Phase 11.5 — Integrate Email Sending into Invitation Creation
Goal

Automatically send an email whenever an invitation is created.

Current Flow
Admin

↓

Create Invitation

↓

Return Invite URL
New Flow
Admin

↓

Create Invitation Record

↓

Generate Secure Token

↓

Generate Invitation URL

↓

Send Email via Resend

↓

Return Success Response
Requirements
Email sending occurs only after the invitation record has been successfully created.
Invitation creation should remain independent from email delivery.
If email delivery fails, the invitation should still exist and be recoverable.
Phase 11.6 — Implement Resend Invitation
Goal

Replace the existing mock email implementation.

Existing Behavior
Create invitation

↓

console.log(invitationLink)
New Behavior
Create invitation

↓

sendInvitationEmail()

↓

Email delivered to recipient

The email service should receive:

Recipient email
Organization name
Assigned role
Inviter name
Invitation URL
Expiration date
Phase 11.7 — Handle Email Delivery Errors
Goal

Ensure failed email delivery does not compromise invitation integrity.

Error Scenarios
Invalid API key
Network timeout
Resend service unavailable
Invalid recipient email
Domain verification issues
System Behavior

If email delivery fails:

Keep the invitation in Pending status.
Log the failure.
Return an informative response to the administrator.
Allow the invitation to be resent later.

Example administrator message:

Invitation created successfully, but the email could not be delivered. Please try resending the invitation.

Phase 11.8 — Implement Resend Invitation Action
Goal

Allow administrators to resend pending invitations.

Flow
Admin

↓

Click Resend

↓

Generate New Token

↓

Update Expiration

↓

Send Email Again

↓

Success Message
Requirements
Previous invitation link becomes invalid.
Generate a fresh secure token.
Reset expiration date.
Prevent resending accepted, revoked, or expired invitations unless explicitly renewed.
Phase 11.9 — Improve Administrator Feedback
Goal

Provide clear feedback regarding email delivery.

Successful Delivery

Display:

Invitation sent successfully.

Delivery Failure

Display:

Invitation created, but email delivery failed.

Resend Success

Display:

Invitation resent successfully.

Loading States

During email delivery:

Disable the submit button.
Display progress indicator.
Prevent duplicate submissions.
Phase 11.10 — Logging and Monitoring
Goal

Provide visibility into email delivery for debugging and maintenance.

Log Events
Invitation created
Email successfully sent
Email failed
Invitation resent
Resend failure
Recommended Logged Data
Invitation ID
Recipient email
Organization ID
Administrator ID
Timestamp
Delivery status
Resend message ID (if available)
Future Enhancement

Persist email delivery metadata in a dedicated audit log or notification history table for troubleshooting and reporting.

Phase 11.11 — Security Considerations
Requirements
Never expose the Resend API key to the client.
Send emails exclusively from server-side code.
Do not embed sensitive information in email URLs beyond the invitation token.
Ensure invitation links remain single-use and expire after the configured duration.
Validate invitation ownership before allowing acceptance.
Use HTTPS for all generated invitation URLs.
Phase 11.12 — Testing
Functional Tests
Invitation Creation
Email is delivered after invitation creation.
Email contains the correct invitation link.
Email contains the correct organization and role.
Invitation Acceptance
Accept Invitation button opens the correct page.
Invitation token is valid.
User joins the correct organization.
Resend
New email contains a new token.
Previous token is invalid.
Expiration date is refreshed.
Failure Testing
Invalid API key.
Network interruption.
Unverified sender domain.
Invalid recipient email.
Resend API outage.
User Experience
Responsive email layout.
Email renders correctly in Gmail, Outlook, Apple Mail, and major mobile email clients.
Dark mode compatibility (where supported).
Expected Outcome

After this phase is complete, Nexus will use Resend to deliver real invitation emails instead of logging invitation links to the console. Administrators will be able to invite users through professionally branded emails, resend pending invitations when needed, and receive clear feedback on delivery status. The email delivery system will be modular, secure, and reusable, providing a foundation for future transactional emails such as password resets, attendance summaries, task notifications, and system announcements.