import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Check, ArrowRight } from 'lucide-react';

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
        'Email support',
        'Basic analytics',
        'Chat widget',
        '5 GB storage',
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
        'Priority support',
        'Advanced analytics',
        'AI automation',
        '50 GB storage',
        'Custom branding',
        'API access',
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
        'Dedicated support',
        'Custom analytics',
        'Advanced AI features',
        'Unlimited storage',
        'White-label solution',
        'SLA guarantee',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
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

            <div className="flex items-center gap-4">
              <Link to="/login">
                <button className="px-6 py-2.5 text-white hover:text-accent-lime transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <motion.button
                  className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 inline" />
                </motion.button>
              </Link>
            </div>
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
  );
}
