'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function DashboardIndex() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      router.replace(`/dashboard/${profile.role}`);
    }
  }, [profile, loading, router]);

  return <LoadingSpinner fullPage message="Redirecting to your dashboard..." />;
}
