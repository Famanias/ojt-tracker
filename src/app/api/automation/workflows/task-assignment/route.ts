// ============================================================
// Automation Workflow — Task Assignment Notification
// ============================================================
// Triggered by n8n when a task.assigned event is received.
// Sends a notification email to the assignee.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import TaskAssignmentEmail from '@/emails/TaskAssignmentEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { TaskAssignedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<TaskAssignedPayload>(request, ['assigneeEmail', 'title']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { assigneeEmail, assigneeName, title: taskTitle, assignedByName } = automationOrResponse.payload;
    
    if (!assigneeEmail) {
      return NextResponse.json({ error: 'Missing assigneeEmail in payload' }, { status: 400 });
    }

    // Note: The original implementation looked for 'priority' and 'dueDate', but TaskAssignedPayload doesn't have them in types.ts.
    // If they aren't provided by the event, they will fallback to undefined in the email template.
    const priority = 'medium';
    const dueDate = undefined;



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
      subject: `New task assigned: ${taskTitle}`,
      react: React.createElement(TaskAssignmentEmail, {
        assigneeName: assigneeName || 'OJT Member',
        assigneeEmail,
        taskTitle,
        assignedByName: assignedByName || 'Your Supervisor',
        priority: priority || 'medium',
        dueDate,
        dashboardUrl: `${siteUrl}/dashboard/kanban`,
      }),
    });

    if (error) {
      automationLogger.error('TaskAssignmentWorkflow', `Failed to send task notification: ${error.message}`, { assigneeEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('TaskAssignmentWorkflow', `Task notification sent to ${assigneeEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('TaskAssignmentWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
