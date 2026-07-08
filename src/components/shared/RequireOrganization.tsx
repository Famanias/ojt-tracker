'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import OrgRequiredPlaceholder from './OrgRequiredPlaceholder';
import { CircularProgress, Box } from '@mui/material';
import { Profile } from '@/types';

interface Props {
  featureName: string;
  serverProfile?: Profile | null;
  children: React.ReactNode;
}

export default function RequireOrganization({ featureName, serverProfile, children }: Props) {
  const { profile: clientProfile, loading } = useAuth();
  const profile = clientProfile ?? serverProfile;

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile?.org_id) {
    return <OrgRequiredPlaceholder featureName={featureName} />;
  }

  return <>{children}</>;
}
