/**
 * PRIVYDESK Homepage - Dark Fintech Design
 * Inspired by Aplio theme - dark mode with lime green accents
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard, StatCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { GridPattern, DottedBackground, AnimatedGrid } from '@/components/ui/GridPattern';
import { WorkflowDiagram } from '@/components/ui/WorkflowDiagram';
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
      {/* Premium Glass Header with Pill Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Ticket className="w-6 h-6 text-black" />
              </motion.div>
              <span className="font-bold text-2xl text-white">PRIVYDESK</span>
            </Link>
            
            {/* Pill-Shaped Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 border border-white/10">
              <Link to="/" className="px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors">
                Home
              </Link>
              <Link to="/about" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                About
              </Link>
              <Link to="/services" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Services
              </Link>
              <Link to="/pricing" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Pricing
              </Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Resources
              </Link>
              <Link to="/contact" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Contact
              </Link>
            </nav>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Link to="/auth/login" className="hidden lg:block">
                <motion.button
                  className="px-6 py-2.5 rounded-full text-white/70 hover:text-white transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
              <Link to="/auth/signup">
                <motion.button
                  className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Premium Fintech */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 overflow-hidden">
        {/* Subtle Grid Background */}
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-glass mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-white/70" />
              <span className="text-base font-semibold text-white/90 tracking-wide">AI-Powered Multi-Tenant SaaS Helpdesk</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-hero font-bold mb-8 leading-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Make your{' '}
              <span className="gradient-text text-glow">Finance</span>
              <br />
              more efficient.
            </motion.h1>

            {/* Subheading */}
            <motion.p
              className="text-xl lg:text-2xl text-white/60 mb-14 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              An easy way to manage your support tickets with AI-powered automation,
              real-time analytics, and enterprise-grade security.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/signup">
                <button className="premium-button bg-white text-black font-semibold hover:shadow-glow-primary hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 inline" />
                </button>
              </Link>
              <Link to="/login">
                <button className="premium-button bg-transparent text-white border border-white/20 hover:border-white/40 hover:shadow-glow-primary">
                  View Live Demo
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-10 text-white/40 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white/50" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white/50" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-white/50" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 relative">
        <AnimatedGrid className="opacity-20" />
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <div className="premium-card p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="icon-badge bg-white/5 border border-white/10">
                      <stat.icon className="w-8 h-8 text-white/70" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-white mb-3">{stat.value}</div>
                  <div className="text-white/50 text-lg">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 relative">
        <GridPattern variant="dots" className="opacity-10" />
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-section-title font-bold mb-6 gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
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
                <div className="premium-card p-8 h-full">
                  <div className="icon-badge bg-white/5 border border-white/10 mb-6">
                    <feature.icon className="w-8 h-8 text-white/70" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed text-lg">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-32 relative">
        <DottedBackground className="opacity-20" />
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-section-title font-bold mb-6 gradient-text">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-white/50">
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
              <motion.div key={index} variants={staggerItemVariants}>
                <div className={`premium-card p-10 relative h-full ${plan.popular ? 'border-white/10' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-white text-black text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-white mb-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-6xl font-bold gradient-text">{plan.price}</span>
                      <span className="text-white/40 text-lg">{plan.period}</span>
                    </div>
                    <p className="text-white/60 text-lg">{plan.description}</p>
                  </div>

                  <Link to="/signup" className="block mb-8">
                    <button className={`premium-button w-full ${plan.popular ? 'bg-white text-black font-semibold hover:shadow-glow-primary' : 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:shadow-glow-primary'}`}>
                      {plan.cta}
                    </button>
                  </Link>

                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-white/50 flex-shrink-0 mt-1" />
                        <span className="text-white/70 text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 relative">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-section-title font-bold mb-6 text-white">
              How It Works
            </h2>
            <p className="text-xl text-white/50">
              Automated ticket workflow from creation to resolution
            </p>
          </motion.div>

          <WorkflowDiagram />
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-32 relative">
        <AnimatedGrid className="opacity-10" />
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-section-title font-bold mb-6 gradient-text">
              Loved by Support Teams Worldwide
            </h2>
            <p className="text-xl text-white/50">
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
                <div className="premium-card p-8 h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-white/70 text-white/70" />
                    ))}
                  </div>
                  <p className="text-white/70 mb-8 leading-relaxed text-lg italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">{testimonial.name}</div>
                      <div className="text-white/40">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative">
        <DottedBackground className="opacity-20" />
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="premium-card p-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-section-title font-bold mb-8 gradient-text">
                Ready to Transform Your Support?
              </h2>
              <p className="text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of teams already using PRIVYDESK to deliver exceptional customer experiences.
                Start your free 14-day trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/signup">
                  <button className="premium-button bg-white text-black font-semibold hover:shadow-glow-primary hover:scale-105">
                    <Sparkles className="mr-2 w-5 h-5 inline" />
                    Start Free Trial
                  </button>
                </Link>
                <Link to="/login">
                  <button className="premium-button bg-transparent text-white border border-white/20 hover:border-white/40 hover:shadow-glow-primary">
                    Talk to Sales
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 border-t border-white/5">
        <DottedBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-lime flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-bold text-xl">PRIVYDESK</h3>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Modern helpdesk solution for businesses of all sizes. Deliver exceptional customer support with powerful, intuitive tools.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>&copy; 2024 PRIVYDESK. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/refund-policy" className="hover:text-white transition-colors">Refunds</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
