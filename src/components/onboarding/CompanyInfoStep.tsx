import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OnboardingData } from '@/hooks/useOnboardingState';

const formSchema = z.object({
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  slug: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  timezone: z.string().min(1, 'Please select a timezone'),
});

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Legal',
  'Media & Entertainment',
  'Non-profit',
  'Government',
  'Other',
];

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

interface CompanyInfoStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export function CompanyInfoStep({ data, onUpdate, onNext }: CompanyInfoStepProps) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: data.organizationName,
      slug: data.slug,
      industry: data.industry,
      companySize: data.companySize,
      timezone: data.timezone,
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const checkSlugAvailability = async (slug: string) => {
    if (slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    
    const { data: existing, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error checking slug:', error);
      setSlugStatus('idle');
      return;
    }

    setSlugStatus(existing ? 'taken' : 'available');
  };

  const handleNameChange = (name: string) => {
    form.setValue('organizationName', name);
    onUpdate({ organizationName: name });
    
    // Auto-generate slug if user hasn't manually edited it
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(data.organizationName)) {
      const newSlug = generateSlug(name);
      form.setValue('slug', newSlug);
      onUpdate({ slug: newSlug });
      
      // Check availability with debounce
      if (slugCheckTimeout) clearTimeout(slugCheckTimeout);
      const timeout = setTimeout(() => checkSlugAvailability(newSlug), 500);
      setSlugCheckTimeout(timeout);
    }
  };

  const handleSlugChange = (slug: string) => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', cleanSlug);
    onUpdate({ slug: cleanSlug });
    
    if (slugCheckTimeout) clearTimeout(slugCheckTimeout);
    const timeout = setTimeout(() => checkSlugAvailability(cleanSlug), 500);
    setSlugCheckTimeout(timeout);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (slugStatus === 'taken') {
      form.setError('slug', { message: 'This subdomain is already taken' });
      return;
    }
    
    onUpdate(values);
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Tell us about your company</CardTitle>
        <CardDescription>
          Let's set up your organization in PRIVYDESK
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corporation"
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="acme"
                          {...field}
                          onChange={(e) => handleSlugChange(e.target.value)}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {slugStatus === 'checking' && (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                          {slugStatus === 'available' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {slugStatus === 'taken' && (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground">.privydesk.com</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This will be your unique URL for accessing PRIVYDESK
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ industry: value });
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        onUpdate({ companySize: value });
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onUpdate({ timezone: value });
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
