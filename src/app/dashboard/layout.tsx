'use client';

import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <LoadingSpinner fullPage message="Loading your workspace..." />;
  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
