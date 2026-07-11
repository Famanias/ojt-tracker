Fix Password Recovery Redirect Flow (Supabase PKCE)
Problem

The password recovery flow has the same issue as the Google OAuth flow previously had.

Current Flow
User clicks Forgot Password.
User submits their email address.
Supabase sends a password recovery email.
The email contains a link similar to:
https://<project>.supabase.co/auth/v1/verify?token=<pkce_token>&type=recovery&redirect_to=https://nexxus.lol
The user clicks Reset Password.
Supabase verifies the recovery token.
The user is redirected to:
https://www.nexxus.lol/?code=<authorization_code>

instead of the password reset page.

The browser remains on the landing page with the authorization code in the URL, and the password reset flow never continues.

Expected Flow

The recovery flow should complete automatically.

User
    ↓
Forgot Password
    ↓
Supabase sends recovery email
    ↓
User clicks recovery link
    ↓
Supabase verifies recovery token
    ↓
OAuth/PKCE callback exchanges the authorization code
    ↓
Recovery session established
    ↓
Redirect to
/auth/reset-password
    ↓
User enters a new password
    ↓
Password updated successfully
    ↓
Redirect to Login

The user should never remain on:

/?code=<authorization_code>
Investigation Tasks

Perform a complete investigation before implementing any fixes.

Verify:

whether the password recovery email is using the correct redirect_to URL
whether the recovery link should point to /auth/callback instead of the landing page
whether the existing PKCE callback exchanges the authorization code correctly
whether the callback distinguishes between Google OAuth and password recovery flows
whether the callback redirects all successful recovery sessions to /auth/reset-password
whether session cookies are written before the redirect occurs
whether middleware correctly recognizes the recovery session
whether any redirects send users back to the landing page after the session is established

Compare the password recovery flow with the already-fixed Google OAuth flow and reuse the same authentication architecture wherever possible.

Implementation Requirements
Reuse the existing PKCE callback route instead of creating a separate recovery callback unless absolutely necessary.
Do not duplicate authentication logic.
Ensure the authorization code is exchanged exactly once.
Preserve all session cookies during redirects.
Ensure password recovery and Google OAuth share the same callback infrastructure where appropriate.
Redirect authenticated recovery sessions directly to /auth/reset-password.
Remove the authorization code from the browser URL after the session has been established.
Success Criteria

The implementation is successful when:

A password recovery email is sent successfully.
Clicking the recovery link immediately establishes a valid recovery session.
The user is redirected directly to /auth/reset-password.
The authorization code is exchanged automatically and does not remain in the URL.
The user can set a new password without additional authentication steps.
Existing Google OAuth functionality continues to work without regressions.
The callback route remains reusable for all PKCE authentication flows (Google OAuth, password recovery, and future providers).

This version encourages the AI to diagnose first and implement second, while emphasizing reuse of your existing OAuth callback rather than introducing separate, potentially inconsistent authentication flows.