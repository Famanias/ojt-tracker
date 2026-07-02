import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';
import { Organization } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SiteSettingsPage() {
  const supabase = await createClient();
  
  // Fetch current user and their organization
  const { data: { user } } = await supabase.auth.getUser();
  let organization: Organization | null = null;
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();
      
    if (profile?.org_id) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();
      if (orgData) {
        organization = orgData;
      }
    }
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (!settings) {
    return <div>No site settings found. Please contact an administrator.</div>;
  }

  return <SettingsClient initialSettings={settings} serverOrganization={organization} />;
}
