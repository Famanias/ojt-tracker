// ============================================================
// Automation Workflow — Task Removed Email
// ============================================================
// Triggered by n8n when a task.deleted event is received.
// Sends a task removal notification email via Resend.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import TaskRemovedEmail from '@/emails/TaskRemovedEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { TaskDeletedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<TaskDeletedPayload>(request, ['taskId']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { title, deletedBy, userEmail } = automationOrResponse.payload;

    if (!userEmail) {
      automationLogger.info('TaskRemovedWorkflow', 'No userEmail provided in payload — skipping email');
      return NextResponse.json({ success: true, skipped: true, reason: 'No userEmail provided' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('TaskRemovedWorkflow', 'Resend API key not configured — skipping email');
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
      to: userEmail,
      subject: `Task Removed: ${title || 'Task'}`,
      react: React.createElement(TaskRemovedEmail, {
        title: title || 'Task',
        deletedByName: deletedBy || 'A team member',
        userEmail,
        kanbanUrl: `${siteUrl}/dashboard/kanban`,
      }),
    });

    if (error) {
      automationLogger.error('TaskRemovedWorkflow', `Failed to send task removed email: ${error.message}`, { userEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('TaskRemovedWorkflow', `Task removed email sent to ${userEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('TaskRemovedWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
