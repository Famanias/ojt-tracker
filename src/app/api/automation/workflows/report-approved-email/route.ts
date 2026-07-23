// ============================================================
// Automation Workflow — Report Approved Email
// ============================================================
// Triggered by n8n when a report.approved event is received.
// Sends an approval email via Resend to the student.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import ReportApprovedEmail from '@/emails/ReportApprovedEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { ReportApprovedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<ReportApprovedPayload>(request, ['title', 'studentEmail']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { title, studentName, studentEmail, approvedByName, feedback } = automationOrResponse.payload;

    if (!studentEmail) {
      return NextResponse.json({ success: false, error: 'studentEmail is required' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('ReportApprovedWorkflow', 'Resend API key not configured — skipping email');
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
      subject: `Report Approved: ${title}`,
      react: React.createElement(ReportApprovedEmail, {
        title,
        studentName: studentName || 'Student',
        studentEmail,
        approvedByName: approvedByName || 'Supervisor',
        feedback,
        reportsUrl: `${siteUrl}/dashboard/reports`,
      }),
    });

    if (error) {
      automationLogger.error('ReportApprovedWorkflow', `Failed to send report approved email: ${error.message}`, { studentEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('ReportApprovedWorkflow', `Report approved email sent to ${studentEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('ReportApprovedWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
