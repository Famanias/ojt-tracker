// ============================================================
// Automation Workflow — Attendance Reminder
// ============================================================
// Triggered by n8n on a cron schedule (weekday 8:15 AM).
// Finds all OJTs without a clock-in for today and sends
// reminder emails.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Resend } from 'resend';
import React from 'react';
import AttendanceReminderEmail from '@/emails/AttendanceReminderEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { format } from 'date-fns';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createSupabaseAdmin(url, key);
}

export async function POST(request: NextRequest) {
  const automationOrResponse = await parseAutomationRequest(request);
  if (automationOrResponse instanceof NextResponse) {
    return automationOrResponse;
  }

  try {
    const supabaseAdmin = getAdminClient();
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayFormatted = format(new Date(), 'EEEE, MMMM dd, yyyy');

    // 1. Get all active OJTs (with org_id — skip personal mode users)
    const { data: ojts, error: ojtsError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, org_id')
      .eq('role', 'ojt')
      .eq('is_active', true)
      .not('org_id', 'is', null);

    if (ojtsError) {
      automationLogger.error('AttendanceReminder', `Failed to fetch OJTs: ${ojtsError.message}`);
      return NextResponse.json({ error: ojtsError.message }, { status: 500 });
    }

    if (!ojts || ojts.length === 0) {
      automationLogger.info('AttendanceReminder', 'No active OJTs found');
      return NextResponse.json({ success: true, reminders_sent: 0 });
    }

    // 2. Get today's attendance records
    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('user_id')
      .eq('date', today);

    const clockedInUserIds = new Set((attendance ?? []).map((a) => a.user_id));

    // 3. Find OJTs without clock-in today
    const needsReminder = ojts.filter((ojt) => !clockedInUserIds.has(ojt.id));

    if (needsReminder.length === 0) {
      automationLogger.info('AttendanceReminder', 'All OJTs have clocked in today');
      return NextResponse.json({ success: true, reminders_sent: 0 });
    }

    // 4. Send reminder emails
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('AttendanceReminder', 'Resend API key not configured — skipping emails');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Resend API key not configured',
        would_send_to: needsReminder.length,
      });
    }

    const resend = new Resend(resendApiKey);
    const emailFrom = process.env.EMAIL_FROM || 'Nexus <onboarding@nexxus.lol>';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexxus.lol';

    let sent = 0;
    let failed = 0;

    for (const ojt of needsReminder) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: emailFrom,
          to: ojt.email,
          subject: `Reminder: Clock in for ${todayFormatted}`,
          react: React.createElement(AttendanceReminderEmail, {
            fullName: ojt.full_name,
            email: ojt.email,
            date: todayFormatted,
            dashboardUrl: `${siteUrl}/dashboard/attendance`,
          }),
        });

        if (emailError) {
          automationLogger.error('AttendanceReminder', `Failed to send to ${ojt.email}: ${emailError.message}`);
          failed++;
        } else {
          sent++;
        }
      } catch (err) {
        automationLogger.error('AttendanceReminder', `Exception sending to ${ojt.email}: ${err}`);
        failed++;
      }
    }

    automationLogger.info('AttendanceReminder', `Reminders sent: ${sent}, failed: ${failed}`, {
      total_ojts: ojts.length,
      needs_reminder: needsReminder.length,
    });

    return NextResponse.json({
      success: true,
      reminders_sent: sent,
      reminders_failed: failed,
      total_ojts: ojts.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('AttendanceReminder', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
