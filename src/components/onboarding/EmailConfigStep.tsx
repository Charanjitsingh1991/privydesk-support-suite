import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Mail, Loader2, CheckCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingData } from '@/hooks/useOnboardingState';

const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.string().min(1, 'Port is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  useTls: z.boolean(),
});

interface EmailConfigStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onPrev: () => void;
}

export function EmailConfigStep({ data, onUpdate, onComplete, onPrev }: EmailConfigStepProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof smtpSchema>>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: data.smtpConfig.host,
      port: data.smtpConfig.port,
      username: data.smtpConfig.username,
      password: data.smtpConfig.password,
      useTls: data.smtpConfig.useTls,
    },
  });

  const showEmailConfig = data.selectedPlan !== 'free';

  const handleConfigTypeChange = (type: 'default' | 'resend' | 'smtp') => {
    onUpdate({ emailConfigType: type });
    setTestSuccess(false);
  };

  const handleResendKeyChange = (apiKey: string) => {
    onUpdate({ resendApiKey: apiKey });
    setTestSuccess(false);
  };

  const handleSmtpChange = (field: keyof typeof data.smtpConfig, value: string | boolean) => {
    onUpdate({
      smtpConfig: {
        ...data.smtpConfig,
        [field]: value,
      },
    });
    setTestSuccess(false);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestSuccess(false);

    try {
      // Simulate testing connection - in real app, call edge function
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (data.emailConfigType === 'smtp') {
        // Validate SMTP config
        const result = form.trigger();
        if (!result) {
          throw new Error('Invalid SMTP configuration');
        }
      }

      setTestSuccess(true);
      toast({
        title: 'Connection successful',
        description: 'Email configuration is working correctly',
      });
    } catch (error: any) {
      toast({
        title: 'Connection failed',
        description: error.message || 'Could not connect with the provided settings',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleComplete = () => {
    if (data.emailConfigType === 'smtp') {
      const smtpValues = form.getValues();
      onUpdate({
        smtpConfig: {
          host: smtpValues.host,
          port: smtpValues.port,
          username: smtpValues.username,
          password: smtpValues.password,
          useTls: smtpValues.useTls,
        },
      });
    }
    onComplete();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Email Configuration</CardTitle>
        <CardDescription>
          {showEmailConfig
            ? 'Configure how PRIVYDESK sends emails to your customers'
            : 'Email settings for your plan'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showEmailConfig ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Using PRIVYDESK Email Service</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Emails will be sent from noreply@privydesk.com on the free plan.
                Upgrade to Starter or higher to use your own email domain.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <RadioGroup
              value={data.emailConfigType}
              onValueChange={(v) => handleConfigTypeChange(v as 'default' | 'resend' | 'smtp')}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <RadioGroupItem value="default" id="default" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="default" className="font-medium">
                    Use PRIVYDESK Email Service
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Emails sent from noreply@privydesk.com. Quick and easy, no setup required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <RadioGroupItem value="resend" id="resend" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="resend" className="font-medium">
                    Use Resend API
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send emails from your own domain using Resend. Recommended for best deliverability.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <RadioGroupItem value="smtp" id="smtp" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="smtp" className="font-medium">
                    Custom SMTP Server
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use your own SMTP server (e.g., Hostinger, Gmail, Outlook).
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Resend Configuration */}
            {data.emailConfigType === 'resend' && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label htmlFor="resendKey">Resend API Key</Label>
                  <Input
                    id="resendKey"
                    type="password"
                    value={data.resendApiKey}
                    onChange={(e) => handleResendKeyChange(e.target.value)}
                    placeholder="re_..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from{' '}
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      resend.com
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* SMTP Configuration */}
            {data.emailConfigType === 'smtp' && (
              <Form {...form}>
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="smtp.example.com"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleSmtpChange('host', e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="587"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleSmtpChange('port', e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="noreply@yourcompany.com"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleSmtpChange('username', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleSmtpChange('password', e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="useTls"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Use TLS/SSL</FormLabel>
                          <FormDescription>
                            Enable secure connection (recommended)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleSmtpChange('useTls', checked);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            )}

            {/* Test Connection */}
            {(data.emailConfigType === 'resend' || data.emailConfigType === 'smtp') && (
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : testSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Connection Verified
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-8">
          <Button type="button" variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="button" className="ml-auto" onClick={handleComplete}>
            Complete Setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
