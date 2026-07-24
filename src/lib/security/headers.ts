import { NextResponse, type NextRequest } from 'next/server';
import { generateNonce } from './nonce';
import { buildCspDirectives, serializeCsp } from './csp';
import type { SecurityProfile } from './origins';

export function isHtmlRequest(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;

  // Exclude static assets, Next.js internal files, images, and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|otf|ttf)$/i.test(pathname)
  ) {
    return false;
  }

  const accept = request.headers.get('accept') || '';
  // Navigation / Document request check
  return accept.includes('text/html') || accept.includes('*/*') || !accept;
}

export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse
): { response: NextResponse; nonce: string } {
  // Generate cryptographic random nonce for the request
  const nonce = generateNonce();

  // Attach nonce to request headers so downstream Server Components / Layouts can access it
  request.headers.set('x-nonce', nonce);

  // Target response scoping: Apply full CSP headers only to HTML document requests
  if (isHtmlRequest(request)) {
    const profile: SecurityProfile =
      (process.env.NODE_ENV as SecurityProfile) || 'production';
    const mode = process.env.CSP_MODE === 'enforce' ? 'enforce' : 'report-only';
    const reportUri = '/api/csp-report';
    const reportToGroup = 'csp-endpoint';

    const directives = buildCspDirectives({
      nonce,
      profile,
      mode,
      reportUri,
      reportToGroup,
    });

    const cspValue = serializeCsp(directives);

    const cspHeaderName =
      mode === 'enforce'
        ? 'Content-Security-Policy'
        : 'Content-Security-Policy-Report-Only';

    response.headers.set(cspHeaderName, cspValue);

    // Modern Reporting API Report-To header
    const reportToHeaderValue = JSON.stringify({
      group: reportToGroup,
      max_age: 10886400,
      endpoints: [{ url: '/api/csp-report' }],
    });
    response.headers.set('Report-To', reportToHeaderValue);
  }

  // Standard Security Headers applied to all document responses
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  response.headers.set('X-Frame-Options', 'DENY'); // Rationale: Legacy browser fallback alongside frame-ancestors 'none'
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return { response, nonce };
}
