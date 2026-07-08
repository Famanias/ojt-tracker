import { Profile } from '@/types';

export function isOrganizationMember(profile: Profile | null | undefined): boolean {
  return !!profile?.org_id;
}

export function isPersonalMode(profile: Profile | null | undefined): boolean {
  return !profile?.org_id;
}

export function canAccessOrganizationFeatures(profile: Profile | null | undefined): boolean {
  return !!profile?.org_id;
}
