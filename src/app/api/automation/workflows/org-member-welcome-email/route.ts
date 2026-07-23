// ============================================================
// Automation Workflow — Org Member Welcome Email
// ============================================================
// Triggered by n8n when an organization.member_added event is received.
// Sends a welcome email via Resend to the new organization member.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import OrgMemberWelcomeEmail from '@/emails/OrgMemberWelcomeEmail';
import { automationLogger } from '@/lib/automation/logger';
import { parseAutomationRequest } from '@/lib/automation/workflow-request';
import { OrgMemberAddedPayload } from '@/lib/automation/types';

export async function POST(request: NextRequest) {
  try {
    const automationOrResponse = await parseAutomationRequest<OrgMemberAddedPayload>(request, ['memberEmail', 'orgName']);
    
    if (automationOrResponse instanceof NextResponse) {
      return automationOrResponse;
    }

    const { memberName, memberEmail, orgName, role } = automationOrResponse.payload;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('OrgMemberWelcomeWorkflow', 'Resend API key not configured — skipping email');
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
      to: memberEmail,
      subject: `Welcome to ${orgName} on Nexus!`,
      react: React.createElement(OrgMemberWelcomeEmail, {
        memberName: memberName || 'Member',
        memberEmail,
        orgName,
        role: role || 'Member',
        dashboardUrl: `${siteUrl}/dashboard`,
      }),
    });

    if (error) {
      automationLogger.error('OrgMemberWelcomeWorkflow', `Failed to send org welcome email: ${error.message}`, { memberEmail });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('OrgMemberWelcomeWorkflow', `Org welcome email sent to ${memberEmail}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('OrgMemberWelcomeWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
