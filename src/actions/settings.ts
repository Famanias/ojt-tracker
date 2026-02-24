'use server';

import { createClient } from '@/lib/supabase/server';

export interface SiteSettingsInput {
  id: string;
  site_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address: string | null;
}

export async function saveSiteSettings(input: SiteSettingsInput): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('site_settings')
    .update({
      site_name: input.site_name,
      latitude: input.latitude,
      longitude: input.longitude,
      radius_meters: input.radius_meters,
      address: input.address,
      updated_by: user?.id,
    })
    .eq('id', input.id);

  if (error) return { error: error.message };
  return {};
}

export async function saveTimezone(id: string, timezone: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If we don't have an id, update the single row without filtering
  let query = supabase
    .from('site_settings')
    .update({ timezone, updated_by: user?.id });

  if (id) {
    query = query.eq('id', id) as typeof query;
  }

  const { error } = await query;

  if (error) return { error: error.message };
  return {};
}
