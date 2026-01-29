import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingData } from '@/hooks/useOnboardingState';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

interface EmailVerificationStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function EmailVerificationStep({ data, onUpdate, onNext, onPrev }: EmailVerificationStepProps) {
  const [step, setStep] = useState<'email' | 'otp'>(data.email ? 'otp' : 'email');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: data.email,
    },
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCountdown]);

  const sendOtp = async (email: string) => {
    setIsLoading(true);
    try {
      const { data: funcData, error } = await supabase.functions.invoke('send-otp', {
        body: { email, type: 'onboarding' },
      });

      if (error) throw error;

      if (!funcData.success) {
        throw new Error(funcData.error || 'Failed to send OTP');
      }

      toast({
        title: 'Verification code sent',
        description: `We've sent a 6-digit code to ${email}`,
      });

      onUpdate({ email });
      setStep('otp');
      setResendDisabled(true);
      setResendCountdown(60);
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Failed to send code',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    try {
      const { data: funcData, error } = await supabase.functions.invoke('verify-otp', {
        body: { email: data.email, code: otp, type: 'onboarding' },
      });

      if (error) throw error;

      if (!funcData.success) {
        throw new Error(funcData.error || 'Invalid or expired code');
      }

      toast({
        title: 'Email verified!',
        description: 'Your email has been verified successfully',
      });

      onUpdate({ emailVerified: true });
      onNext();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid or expired code',
        variant: 'destructive',
      });
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    await sendOtp(values.email);
  };

  const handleResend = () => {
    if (resendDisabled || !data.email) return;
    sendOtp(data.email);
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
  };

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  if (data.emailVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Verified</h3>
            <p className="text-muted-foreground mb-4">{data.email}</p>
            <Button onClick={onNext}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          {step === 'email' ? 'Verify your email' : 'Enter verification code'}
        </CardTitle>
        <CardDescription>
          {step === 'email'
            ? "We'll send you a verification code to confirm your email"
            : `We've sent a 6-digit code to ${data.email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be your admin email for PRIVYDESK
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onPrev}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </div>
            )}

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendDisabled}
                className="text-sm"
              >
                {resendDisabled
                  ? `Resend code in ${resendCountdown}s`
                  : "Didn't receive the code? Resend"}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBackToEmail}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Email
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
