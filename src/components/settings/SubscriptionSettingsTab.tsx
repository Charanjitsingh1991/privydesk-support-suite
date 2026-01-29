import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Check,
  Download,
  Zap,
  Users,
  Mail,
  HardDrive,
  Ticket,
  ArrowUpRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface UsageMeter {
  label: string;
  current: number;
  limit: number;
  icon: React.ElementType;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    priceMonthly: 0,
    priceAnnual: 0,
    features: ['3 team members', '100 tickets/month', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Starter',
    slug: 'starter',
    priceMonthly: 29,
    priceAnnual: 290,
    features: ['10 team members', '500 tickets/month', 'Advanced analytics', 'Priority support'],
  },
  {
    name: 'Pro',
    slug: 'pro',
    priceMonthly: 79,
    priceAnnual: 790,
    features: [
      '50 team members',
      '2000 tickets/month',
      'Custom branding',
      'API access',
      '24/7 support',
    ],
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    priceMonthly: 199,
    priceAnnual: 1990,
    features: [
      'Unlimited team members',
      'Unlimited tickets',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
];

export function SubscriptionSettingsTab() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const currentPlan = 'pro'; // This would come from settings

  const usageMeters: UsageMeter[] = [
    { label: 'Tickets this month', current: 150, limit: 2000, icon: Ticket },
    { label: 'Emails sent', current: 800, limit: 5000, icon: Mail },
    { label: 'Storage used', current: 12, limit: 25, icon: HardDrive },
    { label: 'Team members', current: 8, limit: 50, icon: Users },
  ];

  const invoices: Invoice[] = [
    { id: 'INV-001', date: '2024-01-01', amount: 79, status: 'paid' },
    { id: 'INV-002', date: '2023-12-01', amount: 79, status: 'paid' },
    { id: 'INV-003', date: '2023-11-01', amount: 79, status: 'paid' },
  ];

  const getUsageColor = (current: number, limit: number) => {
    const percent = (current / limit) * 100;
    if (percent >= 90) return 'bg-destructive';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <Badge>Current</Badge>
              </div>
              <p className="text-muted-foreground">
                $79/month • Next billing date: February 1, 2024
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                Cancel Subscription
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Label>Billing Cycle:</Label>
            <div className="flex items-center gap-2">
              <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === 'annual'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
              />
              <span className={billingCycle === 'annual' ? 'font-medium' : 'text-muted-foreground'}>
                Annual
              </span>
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Usage
          </CardTitle>
          <CardDescription>
            Track your resource usage this billing period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {usageMeters.map((meter) => {
              const percent = (meter.current / meter.limit) * 100;
              const Icon = meter.icon;
              return (
                <div key={meter.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span>{meter.label}</span>
                    </div>
                    <span className="font-medium">
                      {meter.current.toLocaleString()} / {meter.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className="h-2"
                    // Custom color based on usage
                  />
                  {percent >= 90 && (
                    <p className="text-xs text-destructive">
                      You're approaching your limit. Consider upgrading.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <div
                key={plan.slug}
                className={`p-4 border rounded-lg ${
                  plan.slug === currentPlan ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {plan.slug === currentPlan && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.slug !== currentPlan && (
                  <Button
                    variant={
                      PLANS.findIndex((p) => p.slug === plan.slug) >
                      PLANS.findIndex((p) => p.slug === currentPlan)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="w-full mt-4"
                  >
                    {PLANS.findIndex((p) => p.slug === plan.slug) >
                    PLANS.findIndex((p) => p.slug === currentPlan) ? (
                      <>
                        Upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      'Downgrade'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={invoice.status === 'paid' ? 'secondary' : 'destructive'}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline">Update Payment Method</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
