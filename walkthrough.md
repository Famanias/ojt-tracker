# Walkthrough — Fix Password Recovery Redirect Flow

We have resolved the issue where password recovery emails redirected users to the landing page with the authorization code left in the URL (e.g. `https://www.nexxus.lol/?code=<auth_code>`) instead of routing them to the password reset form.

## Root Cause
When the user clicked the reset password link, if the redirect URL wasn't matched exactly (e.g. because of dynamic query params or `www.` prefix mismatches), Supabase defaulted to the Site URL (which is `/` / root) and appended the `code` parameter. Since the landing page `/` is static and does not perform code exchange, the user remained stuck on the landing page.

## Changes Made

### 1. Middleware Safety Intercept
- [src/proxy.ts](file:///d:/repos/ojt-tracker/src/proxy.ts): Added a request intercept at the entry point of the middleware. If any request carrying a query parameter named `code` lands on a public route (such as `/`, `/login`, or `/register`), the middleware automatically redirects the request to `/auth/callback` while preserving all search parameters. This acts as a robust safety net for all PKCE code flows.

### 2. Password Recovery Identification in Callback
- [src/app/auth/callback/route.ts](file:///d:/repos/ojt-tracker/src/app/auth/callback/route.ts): Modified the shared callback route handler. After exchanging the authorization code for a session, the route decodes the JWT access token payload to check the `amr` (Authentication Methods Reference) claim. If the payload contains the `recovery` method (meaning the session was established via a password recovery email), it overrides the destination and redirects the user directly to `/auth/reset-password`.

---

## Verification Results

### Build Verification
- Proactively ran `npm run build` to verify there are no compilation or TypeScript errors.
- Output: The Next.js application built successfully with compilation and static page generation completing with zero errors.
