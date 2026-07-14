// ============================================================
// Automation Workflow — Welcome Email
// ============================================================
// Triggered by n8n when a user.created event is received.
// Sends a welcome email via Resend to the new user.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { automationLogger } from '@/lib/automation/logger';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Automation-Key');
  const expectedKey = process.env.N8N_API_KEY;
  if (!expectedKey) return false;
  return apiKey === expectedKey;
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, fullName, role, orgName } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, fullName' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey || resendApiKey === 'placeholder' || resendApiKey.startsWith('your_')) {
      automationLogger.warn('WelcomeWorkflow', 'Resend API key not configured — skipping email');
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
      to: email,
      subject: `Welcome to Nexus${orgName ? ` — ${orgName}` : ''}!`,
      react: React.createElement(WelcomeEmail, {
        fullName,
        email,
        role: role || 'ojt',
        orgName,
        loginUrl: `${siteUrl}/login`,
      }),
    });

    if (error) {
      automationLogger.error('WelcomeWorkflow', `Failed to send welcome email: ${error.message}`, { email });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    automationLogger.info('WelcomeWorkflow', `Welcome email sent to ${email}`, { messageId: data?.id });
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    automationLogger.error('WelcomeWorkflow', `Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
