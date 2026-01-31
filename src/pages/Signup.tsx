import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { SEOHead } from '@/components/SEO/SEOHead';

export default function Signup() {
  return (
    <>
      <SEOHead
        title="Sign Up - Create Your PrivyDesk Account"
        description="Create your free PrivyDesk account and start transforming your customer support today."
        noindex={true}
        nofollow={true}
      />
      <AuthLayout title="Create an account" subtitle="Get started with PRIVYDESK today">
      <SignupForm />
      </AuthLayout>
    </>
  );
}
