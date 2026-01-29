import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, BookOpen, FileText, Code, Video, Download, ExternalLink } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function Resources() {
  const resources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Complete guides and API references",
      link: "/docs",
      external: false
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Integrate PRIVYDESK with your apps",
      link: "/api-reference",
      external: false
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      link: "#",
      external: true
    },
    {
      icon: FileText,
      title: "Blog",
      description: "Latest updates and best practices",
      link: "/blog",
      external: false
    },
    {
      icon: Download,
      title: "Downloads",
      description: "Apps, plugins, and tools",
      link: "#",
      external: true
    },
    {
      icon: BookOpen,
      title: "Help Center",
      description: "FAQs and troubleshooting",
      link: "/support",
      external: false
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
              <Link to="/services" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Services</Link>
              <Link to="/pricing" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Pricing</Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Resources</Link>
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
              <span className="text-accent-lime">Resources</span> & Learning
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Everything you need to get the most out of PRIVYDESK
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={resource.link}
                  className="premium-card p-8 block hover:scale-105 transition-transform group"
                >
                  <resource.icon className="w-12 h-12 text-accent-lime mb-4" />
                  <h3 className="text-2xl font-bold mb-3 flex items-center justify-between">
                    {resource.title}
                    {resource.external && <ExternalLink className="w-5 h-5 text-white/40" />}
                  </h3>
                  <p className="text-white/60">{resource.description}</p>
                  <div className="mt-4 text-accent-lime text-sm font-medium group-hover:translate-x-2 transition-transform inline-flex items-center">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="premium-card p-12"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Quick Links</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/docs" className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors">
                <BookOpen className="w-8 h-8 text-accent-lime mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Documentation</h3>
                <p className="text-sm text-white/60">Complete guides</p>
              </Link>
              <Link to="/api-reference" className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors">
                <Code className="w-8 h-8 text-accent-lime mx-auto mb-3" />
                <h3 className="font-semibold mb-1">API Docs</h3>
                <p className="text-sm text-white/60">Developer reference</p>
              </Link>
              <Link to="/blog" className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors">
                <FileText className="w-8 h-8 text-accent-lime mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Blog</h3>
                <p className="text-sm text-white/60">Latest updates</p>
              </Link>
              <Link to="/support" className="text-center p-6 rounded-lg hover:bg-white/5 transition-colors">
                <BookOpen className="w-8 h-8 text-accent-lime mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Support</h3>
                <p className="text-sm text-white/60">Get help</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
