import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Check, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { SEOHead } from '@/components/SEO/SEOHead';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 5 team members',
        '1,000 tickets/month',
        'Email ticketing system',
        'Basic live chat widget',
        'Email support (24h response)',
        'Basic analytics dashboard',
        '5 GB file storage',
        'Knowledge base (up to 50 articles)',
        'Mobile app access',
        'Ticket automation (basic rules)',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'For growing teams with advanced needs',
      features: [
        'Up to 20 team members',
        '10,000 tickets/month',
        'Multi-channel support (Email, Chat, Social)',
        'Advanced live chat with co-browsing',
        'Priority support (4h response)',
        'Advanced analytics & reporting',
        'AI-powered ticket routing',
        'AI response suggestions',
        '50 GB file storage',
        'Custom branding & white-label',
        'API access & webhooks',
        'Knowledge base (unlimited articles)',
        'Custom ticket fields',
        'SLA management',
        'Team performance tracking',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with custom requirements',
      features: [
        'Unlimited team members',
        'Unlimited tickets',
        'All Professional features',
        'Dedicated account manager',
        'Dedicated support (1h response)',
        'Custom AI model training',
        'Advanced AI automation',
        'Unlimited file storage',
        'Complete white-label solution',
        '99.9% uptime SLA guarantee',
        'Custom integrations',
        'SSO & advanced security',
        'Multi-tenant architecture',
        'Custom workflows',
        'Priority feature requests',
        'On-premise deployment option',
        'Dedicated infrastructure',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <>
      <SEOHead
        title="Pricing Plans - Affordable Customer Support Software | PrivyDesk"
        description="Transparent pricing for PrivyDesk. Start free with Starter plan at $29/month. Professional at $79/month. Enterprise from $199/month. No per-agent fees."
        keywords={[
          'helpdesk pricing',
          'customer support software pricing',
          'affordable helpdesk',
          'ticketing system cost',
          'support software plans',
          'no per-agent pricing',
          'helpdesk software cost',
        ]}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Header */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-white/5"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Ticket className="w-6 h-6 text-black" />
                </motion.div>
                <span className="text-2xl font-bold text-white">PrivyDesk</span>
              </Link>
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Ticket className="w-6 h-6 text-black" />
              </motion.div>
              <span className="text-2xl font-bold text-white">PrivyDesk</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 border border-white/10">
              <Link to="/" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Home</Link>
              <Link to="/about" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">About</Link>
              <Link to="/services" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Services</Link>
              <Link to="/pricing" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Pricing</Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Resources</Link>
              <Link to="/contact" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Contact</Link>
            </nav>

            <Link to="/auth/signup">
              <motion.button
                className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Simple, Transparent <span className="text-accent-lime">Pricing</span>
            </h1>
            <p className="text-xl text-white/60">
              Choose the perfect plan for your team. All plans include a 14-day free trial.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl border ${
                  plan.popular
                    ? 'border-accent-lime/50 bg-white/5'
                    : 'border-white/10 bg-white/[0.02]'
                } p-8 backdrop-blur-sm`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-accent-lime text-black text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-white/60">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent-lime flex-shrink-0 mt-0.5" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <button
                    className={`w-full py-3 rounded-full font-medium transition-colors ${
                      plan.popular
                        ? 'bg-accent-lime text-black hover:bg-accent-lime/90'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            className="max-w-3xl mx-auto mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Have questions?</h2>
            <p className="text-white/60 mb-8">
              Our team is here to help. Contact us for custom enterprise solutions.
            </p>
            <Link to="/contact">
              <button className="px-8 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                Contact Sales
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
      </div>
    </>
  );
}
