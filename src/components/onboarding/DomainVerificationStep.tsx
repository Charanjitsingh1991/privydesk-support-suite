import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Globe, ArrowLeft, Copy, CheckCircle, XCircle, Loader2, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingData } from '@/hooks/useOnboardingState';

const domainSchema = z.object({
  customDomain: z.string()
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid domain (e.g., support.company.com)',
    }),
});

interface DomainVerificationStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DomainVerificationStep({ data, onUpdate, onNext, onPrev }: DomainVerificationStepProps) {
  const [verificationMethod, setVerificationMethod] = useState<'dns' | 'file'>('dns');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [verificationToken, setVerificationToken] = useState(data.domainVerificationToken || '');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      customDomain: data.customDomain,
    },
  });

  // Generate verification token
  useEffect(() => {
    if (!verificationToken) {
      const token = `privydesk-verify-${crypto.randomUUID().slice(0, 12)}`;
      setVerificationToken(token);
      onUpdate({ domainVerificationToken: token });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied to clipboard',
      description: 'The value has been copied to your clipboard',
    });
  };

  const verifyDomain = async () => {
    const domain = form.getValues('customDomain');
    if (!domain) return;

    setIsVerifying(true);
    setVerificationStatus('checking');

    try {
      const { data: funcData, error } = await supabase.functions.invoke('verify-domain', {
        body: {
          domain,
          method: verificationMethod,
          token: verificationToken,
        },
      });

      if (error) throw error;

      if (funcData.verified) {
        setVerificationStatus('verified');
        onUpdate({
          domainVerified: true,
          domainVerificationMethod: verificationMethod,
          customDomain: domain,
        });
        toast({
          title: 'Domain verified!',
          description: `${domain} has been verified successfully`,
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: 'Verification failed',
          description: funcData.error || 'Could not verify your domain. Please check the setup and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
      setVerificationStatus('failed');
      toast({
        title: 'Verification error',
        description: error.message || 'An error occurred during verification',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    onUpdate({ skipDomain: true });
    onNext();
  };

  const handleContinue = () => {
    if (data.domainVerified || data.skipDomain) {
      onNext();
    } else {
      const domain = form.getValues('customDomain');
      if (domain) {
        verifyDomain();
      } else {
        handleSkip();
      }
    }
  };

  const downloadVerificationFile = () => {
    const content = verificationToken;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privydesk-verification.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dnsRecordValue = verificationToken;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Set up your custom domain</CardTitle>
        <CardDescription>
          Connect your own domain for a branded experience (optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="customDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Domain</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="support.yourcompany.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          onUpdate({ customDomain: e.target.value });
                          setVerificationStatus('idle');
                        }}
                      />
                      {data.domainVerified && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the subdomain you want to use for your help desk
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('customDomain') && !data.domainVerified && (
              <div className="space-y-4">
                <Tabs value={verificationMethod} onValueChange={(v) => setVerificationMethod(v as 'dns' | 'file')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dns">DNS Record</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dns" className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Add this TXT record to your DNS</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type</span>
                          <p className="font-mono">TXT</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Name</span>
                          <p className="font-mono">_privydesk-verify</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value</span>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs truncate">{dnsRecordValue}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(dnsRecordValue)}
                            >
                              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        DNS changes may take up to 48 hours to propagate, but usually happen within minutes.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="file" className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Upload verification file</h4>
                      <p className="text-sm text-muted-foreground">
                        Download the verification file and upload it to the root of your domain.
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded text-sm">
                          https://{form.watch('customDomain')}/privydesk-verification.html
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadVerificationFile}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verificationStatus === 'checking' && (
                      <Badge variant="secondary">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Checking...
                      </Badge>
                    )}
                    {verificationStatus === 'verified' && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {verificationStatus === 'failed' && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Not verified
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={verifyDomain}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Verify Domain
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onPrev}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="ml-auto"
              >
                Skip for now
              </Button>
              <Button type="button" onClick={handleContinue}>
                {data.domainVerified ? 'Continue' : 'Continue'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
