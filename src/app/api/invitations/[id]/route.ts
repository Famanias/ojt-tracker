import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { revokeInvitation } from '@/lib/services/invitation';
import crypto from 'crypto';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createSupabaseAdmin(url, key);
}

async function getCallerAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, org_id, role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin' || !profile.org_id) return null;
  return profile;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await getCallerAdmin(supabase);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: admin access required.' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    await revokeInvitation(supabaseAdmin, id, admin.org_id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await getCallerAdmin(supabase);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: admin access required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.action !== 'resend') {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Fetch invitation and verify organization matches
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('invitations')
      .select('*, organization:organizations(name)')
      .eq('id', id)
      .eq('organization_id', admin.org_id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Cannot resend an already accepted invitation.' }, { status: 400 });
    }

    // 2. Generate new token and expiration
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // 3. Update the invitation record
    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(), // Reset date to resend date
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedInvitation) {
      return NextResponse.json({ error: updateError?.message ?? 'Failed to update invitation.' }, { status: 400 });
    }

    // 4. Mock email delivery
    const orgName = invitation.organization?.name || 'Nexus Organization';
    const origin = request.nextUrl.origin;
    const inviteUrl = `${origin}/invite/${token}`;

    console.log('\n============================================================');
    console.log('[MOCK EMAIL DELIVERY - RESEND]');
    console.log(`To: ${invitation.email}`);
    console.log(`Subject: Resending invitation to join ${orgName}`);
    console.log(`Role: ${invitation.role.toUpperCase()}`);
    console.log(`Accept Invitation Link: ${inviteUrl}`);
    console.log(`Expires At: ${expiresAt.toLocaleString()}`);
    console.log('============================================================\n');

    return NextResponse.json({ success: true, invitation: updatedInvitation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
