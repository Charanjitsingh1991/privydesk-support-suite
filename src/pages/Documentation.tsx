import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, BookOpen, Code, Zap, Users, Settings, BarChart3 } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function Documentation() {
  const sections = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Quick start guide and initial setup",
      articles: ["Installation", "First Steps", "Basic Configuration", "Account Setup"],
    },
    {
      icon: Users,
      title: "User Management",
      description: "Managing teams and permissions",
      articles: ["Adding Team Members", "Roles & Permissions", "User Settings", "SSO Setup"],
    },
    {
      icon: Ticket,
      title: "Ticket Management",
      description: "Creating and managing support tickets",
      articles: ["Creating Tickets", "Ticket Workflows", "Automation Rules", "SLA Policies"],
    },
    {
      icon: Code,
      title: "API Integration",
      description: "Integrate PrivyDesk with your apps",
      articles: ["API Authentication", "REST Endpoints", "Webhooks", "Rate Limits"],
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Customize your workspace",
      articles: ["Email Setup", "Chat Widget", "Custom Domains", "Branding"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Track performance and metrics",
      articles: ["Dashboard Overview", "Custom Reports", "Export Data", "Insights"],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
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
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Resources</Link>
              <Link to="/docs" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Docs</Link>
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

      <section className="relative pt-32 pb-20 overflow-hidden">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <BookOpen className="w-16 h-16 text-accent-lime mx-auto mb-6" />
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="text-accent-lime">Documentation</span>
            </h1>
            <p className="text-xl text-white/60">
              Everything you need to know about PrivyDesk
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-8 hover:scale-105 transition-transform"
              >
                <section.icon className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-3">{section.title}</h3>
                <p className="text-white/60 mb-6">{section.description}</p>
                <ul className="space-y-2">
                  {section.articles.map((article, i) => (
                    <li key={i}>
                      <Link
                        to={`/docs/${section.title.toLowerCase().replace(/\s+/g, '-')}/${article.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-white/80 hover:text-accent-lime transition-colors flex items-center gap-2"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 premium-card p-8 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-white/60 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <button className="px-8 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                Contact Support
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
