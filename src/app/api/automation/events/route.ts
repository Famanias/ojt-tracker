// ============================================================
// Automation Events API Route
// ============================================================
// Lightweight endpoint for client-side components to emit
// domain events after successful operations.
// This allows client components (ClockButton, KanbanBoard, etc.)
// to trigger server-side automation without refactoring them
// into server actions.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emitEvent } from '@/lib/automation';
import { isRegisteredEvent } from '@/lib/automation/registry';
import { automationLogger } from '@/lib/automation/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import type { AutomationEventName } from '@/lib/automation';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the caller
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limit: 100 requests / 60-second sliding window per user
    const rateLimit = await checkRateLimit(`events:${user.id}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 60) },
        }
      );
    }

    // 3. Get caller's profile for org context
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    const body = await request.json();
    const { event, payload } = body;

    // 4. Validate event name
    if (!event || !isRegisteredEvent(event)) {
      return NextResponse.json(
        { error: `Invalid or unknown event: ${event}` },
        { status: 400 }
      );
    }

    // 5. Emit the event (fire-and-forget — don't wait for n8n response)
    emitEvent(
      event as AutomationEventName,
      user.id,
      payload ?? {},
      profile?.org_id ?? null
    );

    automationLogger.info('EventsAPI', `Client event emitted: ${event}`, {
      actorId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('EventsAPI', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
