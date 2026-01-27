import { useState, useEffect, useCallback } from 'react';

export interface OnboardingData {
  // Step 1: Company Info
  organizationName: string;
  slug: string;
  industry: string;
  companySize: string;
  timezone: string;
  
  // Step 2: Email Verification
  email: string;
  emailVerified: boolean;
  
  // Step 3: Domain Setup
  customDomain: string;
  domainVerified: boolean;
  domainVerificationMethod: 'dns' | 'file' | null;
  domainVerificationToken: string;
  skipDomain: boolean;
  
  // Step 4: Branding
  primaryColor: string;
  logoUrl: string | null;
  companyAddress: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  footerText: string;
  
  // Step 5: Plan Selection
  selectedPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  
  // Step 6: Email Config
  emailConfigType: 'default' | 'resend' | 'smtp';
  resendApiKey: string;
  smtpConfig: {
    host: string;
    port: string;
    username: string;
    password: string;
    useTls: boolean;
  };
}

const STORAGE_KEY = 'privydesk_onboarding_data';

const defaultData: OnboardingData = {
  organizationName: '',
  slug: '',
  industry: '',
  companySize: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  email: '',
  emailVerified: false,
  customDomain: '',
  domainVerified: false,
  domainVerificationMethod: null,
  domainVerificationToken: '',
  skipDomain: false,
  primaryColor: '#6366f1',
  logoUrl: null,
  companyAddress: '',
  socialLinks: {},
  footerText: '',
  selectedPlan: 'free',
  billingCycle: 'monthly',
  emailConfigType: 'default',
  resendApiKey: '',
  smtpConfig: {
    host: '',
    port: '587',
    username: '',
    password: '',
    useTls: true,
  },
};

export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData({ ...defaultData, ...parsed.data });
        setCurrentStep(parsed.currentStep || 1);
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever data changes
  const saveState = useCallback((newData: OnboardingData, step: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: newData,
        currentStep: step,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      saveState(newData, currentStep);
      return newData;
    });
  }, [currentStep, saveState]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      const newStep = Math.min(prev + 1, 6);
      saveState(data, newStep);
      return newStep;
    });
  }, [data, saveState]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
      const newStep = Math.max(prev - 1, 1);
      saveState(data, newStep);
      return newStep;
    });
  }, [data, saveState]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
      saveState(data, step);
    }
  }, [data, saveState]);

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
    setCurrentStep(1);
  }, []);

  return {
    data,
    currentStep,
    isLoading,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    clearState,
  };
}
