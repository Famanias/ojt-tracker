import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    console.error('No profile found for authenticated user in onboarding');
    redirect('/login');
  }

  // If user already belongs to an organization, send them straight to their dashboard
  if (profile.org_id) {
    redirect(`/dashboard/${profile.role}`);
  }

  return <OnboardingClient fullName={profile.full_name || ''} email={profile.email || ''} />;
}
