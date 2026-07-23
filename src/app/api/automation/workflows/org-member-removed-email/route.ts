// ============================================================
// Automation Workflow — Org Member Removed Email
// ============================================================
// Triggered by n8n when an organization.member_removed event is received.
// Sends a notification email via Resend to the removed member.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import OrgMemberRemovedEmail from '@/emails/OrgMemberRemovedEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { OrgMemberRemovedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<OrgMemberRemovedPayload>(request, ['memberEmail', 'orgName']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { memberName, memberEmail, orgName, reason } = automationOrResponse.payload;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('OrgMemberRemovedWorkflow', 'Resend API key not configured — skipping email');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Resend API key not configured',
      });
    }

    const resend = new Resend(resendApiKey);
    const emailFrom = process.env.EMAIL_FROM || 'Nexus <notifications@nexxus.lol>';

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: memberEmail,
      subject: `Organization Membership Update — ${orgName}`,
      react: React.createElement(OrgMemberRemovedEmail, {
        memberName,
        memberEmail,
        orgName,
        reason,
      }),
    });

    if (error) {
      automationLogger.error('OrgMemberRemovedWorkflow', `Failed to send org member removed email: ${error.message}`, { memberEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('OrgMemberRemovedWorkflow', `Org member removed email sent to ${memberEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('OrgMemberRemovedWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
