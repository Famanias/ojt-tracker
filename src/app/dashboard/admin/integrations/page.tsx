import React from 'react';
import { createClient } from '@/lib/supabase/server';
import IntegrationsClient from './IntegrationsClient';
import RequireOrganization from '@/components/shared/RequireOrganization';
import { getOrgIntegrations } from '@/actions/integrations';
import { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminIntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data as Profile;
  }

  const { data: initialIntegrations } = await getOrgIntegrations();

  return (
    <RequireOrganization featureName="Integrations" serverProfile={profile}>
      <IntegrationsClient initialIntegrations={initialIntegrations ?? []} />
    </RequireOrganization>
  );
}
