import { createClient } from '@/lib/supabase/server';
import UsersClient from './UsersClient';
import RequireOrganization from '@/components/shared/RequireOrganization';
import { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [{ data: users }, { data: profile }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single()
  ]);

  return (
    <RequireOrganization featureName="User Management" serverProfile={profile as Profile}>
      <UsersClient initialUsers={users ?? []} />
    </RequireOrganization>
  );
}
