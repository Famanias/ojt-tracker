import { createClient } from '@/lib/supabase/server';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SiteSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single();

  if (!settings) {
    return <div>No site settings found. Please contact an administrator.</div>;
  }

  return <SettingsClient initialSettings={settings} />;
}
