import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function Signup() {
  return (
    <AuthLayout title="Create an account" subtitle="Get started with PRIVYDESK today">
      <SignupForm />
    </AuthLayout>
  );
}
