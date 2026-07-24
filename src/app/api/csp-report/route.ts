import { NextResponse, type NextRequest } from 'next/server';
import { parseCspReportPayload } from '@/lib/security/report';

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || undefined;
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      // Body may be raw text or empty
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { rawBody: text };
      }
    }

    const telemetry = parseCspReportPayload(body, userAgent);

    // Output structured telemetry log to server console
    console.warn('[CSP Violation Telemetry]', JSON.stringify(telemetry));

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (error) {
    console.error('[CSP Violation API Error]', error);
    return NextResponse.json({ status: 'error', message: 'Failed to process report' }, { status: 400 });
  }
}
