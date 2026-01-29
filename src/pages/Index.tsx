/**
 * PRIVYDESK Homepage - Dark Fintech Design
 * Inspired by Aplio theme - dark mode with lime green accents
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard, StatCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { GridPattern, DottedBackground, AnimatedGrid } from '@/components/ui/GridPattern';
import {
  Ticket,
  Shield,
  Zap,
  Users,
  BarChart3,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
  Lock,
  Headphones,
  Code,
  Smartphone,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Target,
  Layers,
  Activity,
} from 'lucide-react';
import { staggerContainerVariants, staggerItemVariants, fadeInUpVariants } from '@/utils/animations';
import { useInView } from '@/utils/scroll-animations';
import { useRef } from 'react';

const features = [
  {
    icon: Ticket,
    title: 'AI-Powered Ticketing',
    description: 'Intelligent ticket categorization, priority detection, and automated routing with OpenAI integration.',
    gradient: 'from-accent-lime to-accent-lime',
    iconBg: 'bg-accent-lime/10',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Live Chat',
    description: 'Instant communication with customers through embedded chat widgets with typing indicators.',
    gradient: 'from-accent-cyan to-accent-cyan',
    iconBg: 'bg-accent-cyan/10',
  },
  {
    icon: Users,
    title: 'Multi-Tenant Architecture',
    description: 'Isolated workspaces for each organization with custom branding and domain support.',
    gradient: 'from-accent-purple to-accent-purple',
    iconBg: 'bg-accent-purple/10',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time dashboards, performance metrics, and detailed reports to optimize your support.',
    gradient: 'from-accent-lime to-accent-lime',
    iconBg: 'bg-accent-lime/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Row-level security, 2FA, encryption at rest, and comprehensive audit logs.',
    gradient: 'from-error to-error',
    iconBg: 'bg-error/10',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Supabase and React with edge functions for sub-100ms response times.',
    gradient: 'from-warning to-warning',
    iconBg: 'bg-warning/10',
  },
  {
    icon: Mail,
    title: 'Email Integration',
    description: 'Import and manage emails directly in your helpdesk with IMAP/SMTP support.',
    gradient: 'from-accent-cyan to-accent-cyan',
    iconBg: 'bg-accent-cyan/10',
  },
  {
    icon: Code,
    title: 'Developer API',
    description: 'RESTful API with comprehensive documentation for custom integrations.',
    gradient: 'from-accent-pink to-accent-pink',
    iconBg: 'bg-accent-pink/10',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Beautiful PWA that works seamlessly on desktop, tablet, and mobile devices.',
    gradient: 'from-accent-purple to-accent-purple',
    iconBg: 'bg-accent-purple/10',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'Forever Free',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      '100 tickets per month',
      'Email support',
      '1GB file storage',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$79',
    period: 'per month',
    description: 'For growing businesses with advanced needs',
    features: [
      'Up to 50 team members',
      '2,000 tickets per month',
      '24/7 priority support',
      '25GB file storage',
      'Advanced analytics',
      'Custom domain',
      'API access',
      'Live chat widget',
      'Email integration',
    ],
    cta: 'Start 14-Day Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: 'per month',
    description: 'For large organizations requiring scale',
    features: [
      'Unlimited team members',
      'Unlimited tickets',
      'Dedicated support manager',
      'Unlimited storage',
      'Custom integrations',
      'SLA guarantee (99.9%)',
      'Advanced security',
      'White-label option',
      'Priority feature requests',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Head of Support, TechCorp',
    avatar: '👩‍💼',
    content: 'PRIVYDESK transformed our support operations. Response times dropped by 60% and customer satisfaction is at an all-time high.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CEO, StartupXYZ',
    avatar: '👨‍💻',
    content: 'The AI-powered ticketing is a game-changer. It automatically categorizes and routes tickets, saving us hours every day.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Customer Success Manager',
    avatar: '👩‍🎓',
    content: 'Best helpdesk we\'ve used. The real-time chat and analytics give us everything we need to deliver exceptional support.',
    rating: 5,
  },
];

const stats = [
  { value: '10K+', label: 'Active Users', icon: Users },
  { value: '99.9%', label: 'Uptime SLA', icon: TrendingUp },
  { value: '<100ms', label: 'Response Time', icon: Clock },
  { value: '50+', label: 'Countries', icon: Globe },
];

export default function Index() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  const featuresInView = useInView(featuresRef, { threshold: 0.1 });
  const pricingInView = useInView(pricingRef, { threshold: 0.1 });
  const testimonialsInView = useInView(testimonialsRef, { threshold: 0.1 });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Glass Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-glass-base border-b border-glass-border"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-glass-lg bg-gradient-to-br from-gradient-primary-start to-gradient-primary-end flex items-center justify-center shadow-glow-primary"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Ticket className="w-6 h-6 text-white" />
              </motion.div>
              <span className="font-bold text-2xl gradient-text">PRIVYDESK</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <motion.button
                  className="px-6 py-2.5 rounded-glass text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
              <Link to="/signup">
                <GradientButton variant="primary" size="md">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Dark Fintech */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Grid Pattern Background */}
        <DottedBackground />
        
        {/* Floating elements for depth - Dark Fintech */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(163, 230, 53, 0.15) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)' }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-lime/10 border border-accent-lime/20 backdrop-blur-glass mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-accent-lime" />
              <span className="text-sm font-medium text-white">AI-Powered Multi-Tenant SaaS Helpdesk</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Customer Support That{' '}
              <span className="gradient-text text-glow">Scales With You</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="text-xl lg:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Transform your customer support with AI-powered ticketing, real-time chat, and enterprise-grade security.
              Built for teams that demand excellence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/signup">
                <GradientButton variant="primary" size="lg">
                  <Zap className="mr-2 w-5 h-5" />
                  Start Free Trial
                </GradientButton>
              </Link>
              <Link to="/login">
                <GradientButton variant="ghost" size="lg">
                  View Live Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </GradientButton>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/50 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <AnimatedGrid className="opacity-30" />
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <StatCard hover3D glowOnHover className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gradient-primary-start to-gradient-primary-end flex items-center justify-center shadow-glow-primary">
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-white/60">{stat.label}</div>
                </StatCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 relative">
        <GridPattern variant="dots" className="opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Powerful features designed to help your team deliver exceptional customer experiences
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainerVariants}
            initial="initial"
            animate={featuresInView ? "animate" : "initial"}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <GlassCard hover3D glowOnHover className="h-full">
                  <div className={`w-14 h-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 border border-white/5`}>
                    <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-24 relative">
        <DottedBackground className="opacity-30" />
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 gradient-text">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-white/70">
              Choose the perfect plan for your team. No hidden fees.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto"
            variants={staggerContainerVariants}
            initial="initial"
            animate={pricingInView ? "animate" : "initial"}
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={staggerItemVariants}
                className={plan.popular ? 'lg:scale-105' : ''}
              >
                <GlassCard
                  variant={plan.popular ? 'gradient-border' : 'default'}
                  className="h-full relative"
                  hover3D={plan.popular}
                  glowOnHover={plan.popular}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end text-white text-sm font-semibold shadow-glow-primary">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-white/50">{plan.period}</span>
                    </div>
                    <p className="text-white/70">{plan.description}</p>
                  </div>

                  <Link to="/signup" className="block mb-6">
                    <GradientButton
                      variant={plan.popular ? 'primary' : 'ghost'}
                      size="lg"
                      fullWidth
                    >
                      {plan.cta}
                    </GradientButton>
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-24 relative">
        <AnimatedGrid className="opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 gradient-text">
              Loved by Support Teams Worldwide
            </h2>
            <p className="text-xl text-white/70">
              See what our customers have to say about PRIVYDESK
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto"
            variants={staggerContainerVariants}
            initial="initial"
            animate={testimonialsInView ? "animate" : "initial"}
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <GlassCard hover3D className="h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gradient-primary-start to-gradient-primary-end flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/50">{testimonial.role}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative">
        <DottedBackground />
        <div className="container mx-auto px-4">
          <GlassCard variant="gradient-border" className="max-w-4xl mx-auto text-center" padding="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
                Ready to Transform Your Support?
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using PRIVYDESK to deliver exceptional customer experiences.
                Start your free 14-day trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <GradientButton variant="primary" size="lg">
                    <Sparkles className="mr-2 w-5 h-5" />
                    Start Free Trial
                  </GradientButton>
                </Link>
                <Link to="/login">
                  <GradientButton variant="secondary" size="lg">
                    <Headphones className="mr-2 w-5 h-5" />
                    Talk to Sales
                  </GradientButton>
                </Link>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-16 border-t border-glass-border backdrop-blur-glass bg-glass-base/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-glass bg-gradient-to-br from-gradient-primary-start to-gradient-primary-end flex items-center justify-center shadow-glow-primary">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl gradient-text">PRIVYDESK</span>
              </div>
              <p className="text-white/60 mb-4">
                AI-powered helpdesk platform for modern support teams.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-glass-base border border-glass-border flex items-center justify-center hover:bg-glass-hover hover:border-accent-lime/30 transition-colors">
                  <Twitter className="w-5 h-5 text-white/60 hover:text-accent-lime transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-glass-base border border-glass-border flex items-center justify-center hover:bg-glass-hover hover:border-accent-lime/30 transition-colors">
                  <Github className="w-5 h-5 text-white/60 hover:text-accent-lime transition-colors" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-glass-base border border-glass-border flex items-center justify-center hover:bg-glass-hover hover:border-accent-lime/30 transition-colors">
                  <Linkedin className="w-5 h-5 text-white/60 hover:text-accent-lime transition-colors" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent-lime transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">API</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent-lime transition-colors">About</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-accent-lime transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-accent-lime transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-glass-border text-center text-white/50">
            <p>© 2024 PRIVYDESK. All rights reserved. Built with ❤️ for support teams worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
