import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createInvitation, listInvitations } from '@/lib/services/invitation';

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

export async function GET() {
  try {
    const supabase = await createClient();
    const admin = await getCallerAdmin(supabase);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: admin access required.' }, { status: 403 });
    }

    const supabaseAdmin = getAdminClient();
    const invitations = await listInvitations(supabaseAdmin, admin.org_id);
    return NextResponse.json(invitations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = await getCallerAdmin(supabase);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Get organization name to show in the mock email
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', admin.org_id)
      .single();

    const orgName = org?.name || 'Nexus Organization';

    // 2. Create the invitation
    const invitation = await createInvitation(supabaseAdmin, {
      orgId: admin.org_id,
      email,
      role,
      invitedBy: admin.id,
    });

    // 3. Mock email delivery
    const origin = request.nextUrl.origin;
    const inviteUrl = `${origin}/invite/${invitation.token}`;
    console.log('\n============================================================');
    console.log('[MOCK EMAIL DELIVERY]');
    console.log(`To: ${email}`);
    console.log(`Subject: Invitation to join ${orgName}`);
    console.log(`Role: ${role.toUpperCase()}`);
    console.log(`Accept Invitation Link: ${inviteUrl}`);
    console.log(`Expires At: ${new Date(invitation.expires_at).toLocaleString()}`);
    console.log('============================================================\n');

    return NextResponse.json({ success: true, invitation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
