import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's org and verify admin/supervisor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.org_id || (profile.role !== 'admin' && profile.role !== 'supervisor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const statusFilter = searchParams.get('status');
    const eventTypeFilter = searchParams.get('eventType');

    const offset = (page - 1) * limit;

    // Fetch Logs
    let logsQuery = supabase
      .from('automation_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', profile.org_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (statusFilter) logsQuery = logsQuery.eq('status', statusFilter);
    if (eventTypeFilter) logsQuery = logsQuery.eq('event_type', eventTypeFilter);

    const { data: logs, count, error: logsError } = await logsQuery;

    if (logsError) throw logsError;

    // Fetch metrics (last 1000 logs for approximation to avoid heavy DB load)
    const { data: recentLogs } = await supabase
      .from('automation_logs')
      .select('event_type, status, duration_ms, attempt_count, created_at, workflow_name')
      .eq('organization_id', profile.org_id)
      .order('created_at', { ascending: false })
      .limit(1000);

    const metrics = computeMetrics(recentLogs || []);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      metrics,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function computeMetrics(logs: Record<string, unknown>[]) {
  if (!logs.length) {
    return {
      eventsToday: 0,
      successPercent: 0,
      failedPercent: 0,
      avgRuntimeMs: 0,
      totalRetries: 0,
      mostTriggeredEvent: 'N/A',
      slowestWorkflow: 'N/A',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let eventsToday = 0;
  let successCount = 0;
  let failedCount = 0;
  let totalRuntime = 0;
  let runtimeCount = 0;
  let totalRetries = 0;

  const eventCounts: Record<string, number> = {};
  const workflowRuntimes: Record<string, { total: number; count: number }> = {};

  for (const log of logs) {
    const logDate = new Date(String(log.created_at));
    if (logDate >= today) eventsToday++;

    if (log.status === 'success') successCount++;
    if (log.status === 'failed') failedCount++;

    if (log.duration_ms != null && typeof log.duration_ms === 'number') {
      totalRuntime += log.duration_ms;
      runtimeCount++;

      // Track slowest workflows
      const wf = String(log.workflow_name || log.event_type);
      if (!workflowRuntimes[wf]) workflowRuntimes[wf] = { total: 0, count: 0 };
      workflowRuntimes[wf].total += log.duration_ms;
      workflowRuntimes[wf].count++;
    }

    if (log.attempt_count && typeof log.attempt_count === 'number' && log.attempt_count > 1) {
      totalRetries += (log.attempt_count - 1);
    }

    const evType = String(log.event_type);
    eventCounts[evType] = (eventCounts[evType] || 0) + 1;
  }

  const totalProcessed = successCount + failedCount;
  const successPercent = totalProcessed ? Math.round((successCount / totalProcessed) * 100) : 0;
  const failedPercent = totalProcessed ? Math.round((failedCount / totalProcessed) * 100) : 0;
  const avgRuntimeMs = runtimeCount ? Math.round(totalRuntime / runtimeCount) : 0;

  let mostTriggeredEvent = 'N/A';
  let maxCount = 0;
  for (const [evt, c] of Object.entries(eventCounts)) {
    if (c > maxCount) {
      maxCount = c;
      mostTriggeredEvent = evt;
    }
  }

  let slowestWorkflow = 'N/A';
  let maxAvg = 0;
  for (const [wf, stats] of Object.entries(workflowRuntimes)) {
    const avg = stats.total / stats.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      slowestWorkflow = wf;
    }
  }

  return {
    eventsToday,
    successPercent,
    failedPercent,
    avgRuntimeMs,
    totalRetries,
    mostTriggeredEvent,
    slowestWorkflow,
  };
}
