import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password — Nexus',
  description: 'Reset your password for your Nexus account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
