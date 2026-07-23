// ============================================================
// Automation Workflow — Invitation Email
// ============================================================
// Triggered by n8n when a user.invited event is received.
// Sends an invitation email via Resend to the invited user.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import InvitationEmail from '@/emails/InvitationEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { UserInvitedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<UserInvitedPayload>(request, ['email', 'orgName', 'inviteUrl']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { email, role, inviterName, orgName, inviteUrl, expiresAt } = automationOrResponse.payload;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('InvitationWorkflow', 'Resend API key not configured — skipping email');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Resend API key not configured',
      });
    }

    const resend = new Resend(resendApiKey);
    const emailFrom = process.env.EMAIL_FROM || 'Nexus <onboarding@nexxus.lol>';

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `You've been invited to join ${orgName} on Nexus`,
      react: React.createElement(InvitationEmail, {
        orgName,
        role: role || 'OJT',
        inviterName: inviterName || 'Administrator',
        inviteUrl,
        expiresAt: expiresAt || '7 days',
        email,
      }),
    });

    if (error) {
      automationLogger.error('InvitationWorkflow', `Failed to send invitation email: ${error.message}`, { email });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('InvitationWorkflow', `Invitation email sent to ${email}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('InvitationWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
