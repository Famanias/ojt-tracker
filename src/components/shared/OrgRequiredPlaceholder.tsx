'use client';

import React from 'react';
import { Box, Typography, Button, Stack, Link } from '@mui/material';
import { Business as OrgIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Props {
  featureName: string;
}

export default function OrgRequiredPlaceholder({ featureName }: Props) {
  const router = useRouter();

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          mb: 3,
        }}
      >
        <OrgIcon sx={{ fontSize: 40 }} />
      </Box>
      
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Organization Required
      </Typography>
      
      <Typography color="text.secondary" sx={{ maxWidth: 460, mb: 4 }}>
        The <strong>{featureName}</strong> is organization-specific. To start using it, please create a new organization or join an existing one using an invite code.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, width: '100%', justifyContent: 'center', maxWidth: 400, mx: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push('/onboarding')}
          sx={{
            py: 1.25,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
          }}
        >
          Set Up Organization
        </Button>
      </Stack>

      <Link
        component="button"
        variant="body2"
        onClick={() => router.push('/dashboard')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          color: 'text.secondary',
          textDecoration: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          '&:hover': { color: 'primary.main' }
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        Back to Dashboard
      </Link>
    </Box>
  );
}
