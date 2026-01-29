import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, MessageSquare, Mail, Bot, Shield, BarChart3, Zap, Users, Globe } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function Services() {
  const services = [
    {
      icon: Ticket,
      title: "Ticket Management",
      description: "Comprehensive ticket system with priority levels, status tracking, and SLA management.",
      features: ["Multi-channel support", "Auto-assignment", "Custom workflows", "File attachments"]
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Real-time chat widget for your website with instant customer engagement.",
      features: ["Real-time messaging", "Chat routing", "Canned responses", "Chat history"]
    },
    {
      icon: Mail,
      title: "Email Integration",
      description: "Seamlessly integrate your email with automatic ticket creation and tracking.",
      features: ["IMAP/SMTP support", "Email to ticket", "Thread tracking", "Bulk import"]
    },
    {
      icon: Bot,
      title: "AI-Powered Insights",
      description: "Leverage AI for ticket categorization, sentiment analysis, and smart suggestions.",
      features: ["Auto-categorization", "Sentiment analysis", "Smart responses", "Tag extraction"]
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access and audit logs.",
      features: ["2FA authentication", "IP blocking", "Audit logs", "Data encryption"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Detailed insights into your support performance with customizable reports.",
      features: ["Real-time dashboards", "Custom reports", "Performance metrics", "Export data"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Empower your team with collaborative tools and seamless communication.",
      features: ["Internal notes", "Team assignments", "Mentions", "Activity tracking"]
    },
    {
      icon: Globe,
      title: "Multi-Tenant Support",
      description: "Manage multiple organizations from a single platform with complete isolation.",
      features: ["Organization management", "Custom branding", "Separate databases", "White-label options"]
    },
    {
      icon: Zap,
      title: "Integrations",
      description: "Connect with your favorite tools through our API and webhooks.",
      features: ["REST API", "Webhooks", "Third-party apps", "Custom integrations"]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center">
                <Ticket className="w-6 h-6 text-black" />
              </div>
              <span className="font-bold text-2xl">PRIVYDESK</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1 px-2 py-2 rounded-full bg-white/5 border border-white/10">
              <Link to="/" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Home</Link>
              <Link to="/about" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">About</Link>
              <Link to="/services" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Services</Link>
              <Link to="/pricing" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Pricing</Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Resources</Link>
              <Link to="/contact" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Contact</Link>
            </nav>
            
            <Link to="/auth/signup">
              <button className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors flex items-center">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Our <span className="text-accent-lime">Services</span>
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Everything you need to deliver exceptional customer support
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-8 hover:scale-105 transition-transform"
              >
                <service.icon className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-white/60 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-white/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-lime mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="premium-card p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Support?</h2>
            <p className="text-xl text-white/60 mb-8">
              Start your free trial today and experience the difference
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth/signup">
                <button className="px-8 py-4 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors inline-flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-8 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                  Contact Sales
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
