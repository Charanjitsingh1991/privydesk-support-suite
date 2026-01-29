import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Ticket,
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: Ticket,
    title: 'Smart Ticketing',
    description: 'Organize and prioritize support requests with intelligent categorization.',
  },
  {
    icon: Users,
    title: 'Multi-Tenant',
    description: 'Isolated workspaces for each organization with custom branding.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Instant communication between agents and customers.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track performance metrics and optimize your support workflow.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Row-level security and encryption to protect sensitive data.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Built for speed with 99.9% uptime guarantee.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for small teams getting started',
    features: ['Up to 5 users', '100 tickets/month', 'Email support', '1GB storage'],
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For growing businesses with advanced needs',
    features: ['Up to 50 users', '2000 tickets/month', '24/7 support', '25GB storage', 'Custom domain', 'API access'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    description: 'For large organizations requiring scale',
    features: ['Unlimited users', 'Unlimited tickets', 'Dedicated support', 'Unlimited storage', 'SLA guarantee', 'Custom integrations'],
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">PRIVYDESK</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-slide-up">
              <Zap className="w-4 h-4" />
              Multi-tenant SaaS Helpdesk
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
              Customer support that{' '}
              <span className="gradient-text">scales with you</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 animate-slide-up">
              PRIVYDESK is a powerful multi-tenant helpdesk solution that helps teams deliver
              exceptional customer support with enterprise-grade security and reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button size="lg" asChild className="gap-2">
                <Link to="/signup">
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology to provide a seamless support experience for your team and customers.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Upgrade or downgrade at any time.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                  <Button className="w-full mb-6" variant={plan.popular ? 'default' : 'outline'} asChild>
                    <Link to="/signup">Get started</Link>
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-sidebar">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-sidebar-foreground mb-4">
              Ready to transform your support?
            </h2>
            <p className="text-sidebar-foreground/70 mb-8">
              Join thousands of teams already using PRIVYDESK to deliver exceptional customer experiences.
            </p>
            <Button size="lg" asChild>
              <Link to="/signup">
                Start your free trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Ticket className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">PRIVYDESK</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PRIVYDESK. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
