import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { SEOHead } from '@/components/SEO/SEOHead';

export default function Login() {
  return (
    <>
      <SEOHead
        title="Login - PrivyDesk"
        description="Sign in to your PrivyDesk account"
        noindex={true}
        nofollow={true}
      />
      <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
        <LoginForm />
      </AuthLayout>
    </>
  );
}
