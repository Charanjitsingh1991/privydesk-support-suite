import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { OnboardingData } from '@/hooks/useOnboardingState';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: {
    max_users: number;
    max_tickets_monthly: number;
    max_storage_gb: number;
    max_emails_monthly: number;
  };
}

const defaultPlans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    slug: 'free',
    price_monthly: 0,
    price_annual: 0,
    features: [
      'Up to 3 team members',
      '100 tickets/month',
      'Basic email support',
      'Community forum access',
    ],
    limits: {
      max_users: 3,
      max_tickets_monthly: 100,
      max_storage_gb: 1,
      max_emails_monthly: 500,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    price_monthly: 29,
    price_annual: 278,
    features: [
      'Up to 10 team members',
      '500 tickets/month',
      'Email configuration',
      'Priority support',
      'Basic analytics',
    ],
    limits: {
      max_users: 10,
      max_tickets_monthly: 500,
      max_storage_gb: 5,
      max_emails_monthly: 2000,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    price_monthly: 79,
    price_annual: 758,
    features: [
      'Up to 50 team members',
      'Unlimited tickets',
      'Custom domain',
      'Advanced analytics',
      'API access',
      'Custom integrations',
    ],
    limits: {
      max_users: 50,
      max_tickets_monthly: -1,
      max_storage_gb: 25,
      max_emails_monthly: 10000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price_monthly: 199,
    price_annual: 1910,
    features: [
      'Unlimited team members',
      'Unlimited tickets',
      'Custom domain',
      'White-label branding',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
    limits: {
      max_users: -1,
      max_tickets_monthly: -1,
      max_storage_gb: 100,
      max_emails_monthly: -1,
    },
  },
];

interface PlanSelectionStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PlanSelectionStep({ data, onUpdate, onNext, onPrev }: PlanSelectionStepProps) {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: dbPlans, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;

        if (dbPlans && dbPlans.length > 0) {
          setPlans(dbPlans.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price_monthly: Number(p.price_monthly) || 0,
            price_annual: Number(p.price_annual) || 0,
            features: Array.isArray(p.features) ? p.features as string[] : [],
            limits: (p.limits as Plan['limits']) || {
              max_users: 5,
              max_tickets_monthly: 100,
              max_storage_gb: 1,
              max_emails_monthly: 500,
            },
          })));
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const isAnnual = data.billingCycle === 'annual';

  const getPrice = (plan: Plan) => {
    if (plan.price_monthly === 0) return 0;
    return isAnnual ? Math.round(plan.price_annual / 12) : plan.price_monthly;
  };

  const getAnnualSavings = (plan: Plan) => {
    if (plan.price_monthly === 0) return 0;
    return Math.round(((plan.price_monthly * 12 - plan.price_annual) / (plan.price_monthly * 12)) * 100);
  };

  const selectPlan = (planSlug: 'free' | 'starter' | 'pro' | 'enterprise') => {
    onUpdate({ selectedPlan: planSlug });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose your plan</CardTitle>
        <CardDescription>
          Start free, upgrade when you need more
        </CardDescription>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={(checked) => onUpdate({ billingCycle: checked ? 'annual' : 'monthly' })}
          />
          <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2">
              Save up to 20%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isSelected = data.selectedPlan === plan.slug;
            const isRecommended = plan.slug === 'pro';
            const price = getPrice(plan);
            const savings = getAnnualSavings(plan);

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${isRecommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onClick={() => selectPlan(plan.slug as 'free' | 'starter' | 'pro' | 'enterprise')}
              >
                {isRecommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        ${price}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Save {savings}% with annual billing
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPlan(plan.slug as 'free' | 'starter' | 'pro' | 'enterprise');
                    }}
                  >
                    {isSelected ? 'Selected' : plan.price_monthly === 0 ? 'Get Started' : 'Start Free Trial'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {data.selectedPlan === 'free'
            ? 'No credit card required'
            : '14-day free trial • No credit card required'}
        </p>

        <div className="flex gap-3 pt-8">
          <Button type="button" variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            className="ml-auto"
            onClick={onNext}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
