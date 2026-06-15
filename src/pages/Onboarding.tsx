import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { CompanyInfoStep } from '@/components/onboarding/CompanyInfoStep';
import { EmailVerificationStep } from '@/components/onboarding/EmailVerificationStep';
import { DomainVerificationStep } from '@/components/onboarding/DomainVerificationStep';
import { BrandingStep } from '@/components/onboarding/BrandingStep';
import { PlanSelectionStep } from '@/components/onboarding/PlanSelectionStep';
import { EmailConfigStep } from '@/components/onboarding/EmailConfigStep';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Company', description: 'Organization info' },
  { id: 2, title: 'Email', description: 'Verify email' },
  { id: 3, title: 'Domain', description: 'Custom domain' },
  { id: 4, title: 'Branding', description: 'Customize look' },
  { id: 5, title: 'Plan', description: 'Choose plan' },
  { id: 6, title: 'Email Setup', description: 'Configure email' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, currentStep, isLoading, updateData, nextStep, prevStep, goToStep, clearState } = useOnboardingState();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to complete onboarding');
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          slug: data.slug,
          industry: data.industry,
          company_size: data.companySize,
          timezone: data.timezone,
          custom_domain: data.customDomain || null,
          domain_verified: data.domainVerified,
          domain_verification_token: data.domainVerificationToken || null,
          domain_verification_method: data.domainVerificationMethod,
          primary_color: data.primaryColor,
          logo_url: data.logoUrl,
          plan: data.selectedPlan,
          branding: {
            social_links: data.socialLinks,
            footer_text: data.footerText,
            company_address: data.companyAddress,
          },
          email_config: data.emailConfigType === 'default' ? {} : {
            type: data.emailConfigType,
            ...(data.emailConfigType === 'resend' && { resend_api_key: data.resendApiKey }),
            ...(data.emailConfigType === 'smtp' && { smtp: data.smtpConfig }),
          },
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Update user profile with organization
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          role: 'admin',
          email_verified: data.emailVerified,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create subscription usage record
      const { error: usageError } = await supabase
        .from('subscription_usage')
        .insert({
          organization_id: org.id,
          tickets_used_this_month: 0,
          emails_sent_this_month: 0,
          storage_used_mb: 0,
        });

      if (usageError) {
        console.error('Error creating usage record:', usageError);
        // Not critical, continue
      }

      // Send welcome email
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: data.email,
            name: user.user_metadata?.full_name || data.email.split('@')[0],
            organizationName: data.organizationName,
          },
        });
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Not critical, continue
      }

      // Clear onboarding state
      clearState();

      toast({
        title: 'Welcome to PRIVYDESK!',
        description: 'Your organization has been set up successfully',
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Setup failed',
        description: error.message || 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Set up your workspace</h1>
          <p className="text-muted-foreground mt-2">
            Complete these steps to get started with PRIVYDESK
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) goToStep(step);
            }}
          />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <CompanyInfoStep
              data={data}
              onUpdate={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <EmailVerificationStep
              data={data}
              onUpdate={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 3 && (
            <DomainVerificationStep
              data={data}
              onUpdate={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 4 && (
            <BrandingStep
              data={data}
              onUpdate={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 5 && (
            <PlanSelectionStep
              data={data}
              onUpdate={updateData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {currentStep === 6 && (
            <EmailConfigStep
              data={data}
              onUpdate={updateData}
              onComplete={handleComplete}
              onPrev={prevStep}
            />
          )}
        </div>

        {/* Loading Overlay */}
        {isCompleting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium">Setting up your workspace...</p>
              <p className="text-muted-foreground">This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
