import { SupabaseClient } from '@supabase/supabase-js';

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createOrganization(
  supabaseAdmin: SupabaseClient,
  orgName: string,
  userId: string
) {
  const baseSlug = generateSlug(orgName);
  let uniqueSlug = baseSlug;
  let uniqueCode = generateInviteCode();

  // Ensure slug uniqueness
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', uniqueSlug)
      .maybeSingle();
    if (!existing) break;
    uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // Ensure invite code uniqueness
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('invite_code', uniqueCode)
      .maybeSingle();
    if (!existing) break;
    uniqueCode = generateInviteCode();
  }

  // Create organization and set creator
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: orgName.trim(),
      slug: uniqueSlug,
      invite_code: uniqueCode,
      created_by: userId,
    })
    .select()
    .single();

  if (orgError || !org) {
    throw new Error(orgError?.message ?? 'Failed to create organization.');
  }

  // Update profile role and org_id
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      role: 'admin',
      org_id: org.id,
    })
    .eq('id', userId);

  if (profileError) {
    // Attempt cleanup
    await supabaseAdmin.from('organizations').delete().eq('id', org.id);
    throw new Error(profileError.message);
  }

  // Update auth user metadata
  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'admin', org_id: org.id }
  });
  if (authUpdateError) {
    console.error('Failed to update auth user metadata:', authUpdateError);
  }

  // Create default site settings for new org
  const { error: settingsError } = await supabaseAdmin.from('site_settings').insert({
    org_id: org.id,
    site_name: orgName.trim(),
    latitude: 14.5995,
    longitude: 120.9842,
    radius_meters: 150,
    address: '',
  });

  if (settingsError) {
    console.error('Failed to create default site settings:', settingsError);
  }

  // Create default kanban columns for new org
  const { error: columnsError } = await supabaseAdmin.from('kanban_columns').insert([
    { org_id: org.id, title: 'To Do', color: '#ef4444', position: 0 },
    { org_id: org.id, title: 'Doing', color: '#f59e0b', position: 1 },
    { org_id: org.id, title: 'Done', color: '#22c55e', position: 2 },
  ]);

  if (columnsError) {
    console.error('Failed to create default kanban columns:', columnsError);
  }

  return org;
}

export async function joinOrganization(
  supabaseAdmin: SupabaseClient,
  inviteCode: string,
  userId: string
) {
  // Find org by invite code
  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .select('id, name')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single();

  if (orgError || !org) {
    throw new Error('Invalid invite code. Please check and try again.');
  }

  // Update profile role and org_id
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      role: 'ojt',
      org_id: org.id,
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Update auth user metadata
  const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'ojt', org_id: org.id }
  });
  if (authUpdateError) {
    console.error('Failed to update auth user metadata:', authUpdateError);
  }

  return org;
}
