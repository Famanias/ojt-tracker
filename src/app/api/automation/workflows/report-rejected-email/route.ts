// ============================================================
// Automation Workflow — Report Rejected Email
// ============================================================
// Triggered by n8n when a report.rejected event is received.
// Sends a rejection/revision request email via Resend to the student.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import ReportRejectedEmail from '@/emails/ReportRejectedEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { ReportRejectedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<ReportRejectedPayload>(request, ['title', 'studentEmail']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { title, studentName, studentEmail, rejectedByName, reason } = automationOrResponse.payload;

    if (!studentEmail) {
      return NextResponse.json({ success: false, error: 'studentEmail is required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('ReportRejectedWorkflow', 'Resend API key not configured — skipping email');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Resend API key not configured',
      });
    }

    const resend = new Resend(resendApiKey);
    const emailFrom = process.env.EMAIL_FROM || 'Nexus <notifications@nexxus.lol>';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexxus.lol';

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: studentEmail,
      subject: `Revision Requested: ${title}`,
      react: React.createElement(ReportRejectedEmail, {
        title,
        studentName: studentName || 'Student',
        studentEmail,
        rejectedByName: rejectedByName || 'Supervisor',
        reason,
        reportsUrl: `${siteUrl}/dashboard/reports`,
      }),
    });

    if (error) {
      automationLogger.error('ReportRejectedWorkflow', `Failed to send report rejected email: ${error.message}`, { studentEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('ReportRejectedWorkflow', `Report rejected email sent to ${studentEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('ReportRejectedWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
