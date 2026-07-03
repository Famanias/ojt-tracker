import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullPage message="Loading Registration..." />}>
      <RegisterForm />
    </Suspense>
  );
}
