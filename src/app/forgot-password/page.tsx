import { Suspense } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password — Nexus',
  description: 'Request a password reset link for your Nexus account.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage message="Loading..." />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
