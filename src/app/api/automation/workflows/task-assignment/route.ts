// ============================================================
// Automation Workflow — Task Assignment Email
// ============================================================
// Triggered by n8n when a task.assigned event is received.
// Sends an email via Resend to the assigned user.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import TaskAssignedEmail from '@/emails/TaskAssignedEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { TaskAssignedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<TaskAssignedPayload>(request, [
      'assigneeEmail', 'assigneeName', 'title'
    ]);
    
    // If it returned a NextResponse, it means validation failed
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { assigneeEmail, assigneeName, title, assignedByName } = automationOrResponse.payload;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('TaskAssignmentWorkflow', 'Resend API key not configured — skipping email');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Resend API key not configured',
      });
    }

    const resend = new Resend(resendApiKey);
    const emailFrom = process.env.EMAIL_FROM || 'Nexus <onboarding@nexxus.lol>';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexxus.lol';

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: assigneeEmail,
      subject: `New Task Assigned: ${title}`,
      react: React.createElement(TaskAssignedEmail, {
        assigneeName: assigneeName || 'OJT',
        taskTitle: title,
        assignedByName: assignedByName || 'Your Supervisor',
        taskUrl: `${siteUrl}/kanban`,
      }),
    });

    if (error) {
      automationLogger.error('TaskAssignmentWorkflow', `Failed to send task assignment email: ${error.message}`, { email: assigneeEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('TaskAssignmentWorkflow', `Task assignment email sent to ${assigneeEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('TaskAssignmentWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
