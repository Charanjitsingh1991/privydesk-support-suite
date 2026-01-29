import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Users, Target, Award, Zap } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function About() {
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
              <Link to="/about" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">About</Link>
              <Link to="/services" className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors">Services</Link>
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
              About <span className="text-accent-lime">PRIVYDESK</span>
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Building the future of customer support with modern technology and exceptional service
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-white/70 mb-6">
                At PRIVYDESK, we're on a mission to revolutionize customer support by providing businesses with powerful, intuitive tools that make managing customer relationships effortless.
              </p>
              <p className="text-lg text-white/70">
                We believe that exceptional customer support should be accessible to businesses of all sizes, which is why we've built a platform that combines enterprise-grade features with simplicity and affordability.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="premium-card p-6">
                <Target className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-2">10k+</h3>
                <p className="text-white/60">Active Users</p>
              </div>
              <div className="premium-card p-6">
                <Users className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-2">500+</h3>
                <p className="text-white/60">Companies</p>
              </div>
              <div className="premium-card p-6">
                <Award className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-2">99.9%</h3>
                <p className="text-white/60">Uptime</p>
              </div>
              <div className="premium-card p-6">
                <Zap className="w-12 h-12 text-accent-lime mb-4" />
                <h3 className="text-2xl font-bold mb-2">24/7</h3>
                <p className="text-white/60">Support</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-white/60">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Customer First",
                description: "Every decision we make starts with our customers' needs in mind."
              },
              {
                title: "Innovation",
                description: "We constantly push boundaries to deliver cutting-edge solutions."
              },
              {
                title: "Transparency",
                description: "We believe in honest communication and clear pricing."
              },
              {
                title: "Security",
                description: "Your data security is our top priority, always."
              },
              {
                title: "Reliability",
                description: "We build systems you can depend on, 24/7/365."
              },
              {
                title: "Growth",
                description: "We grow when our customers grow. Your success is our success."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="premium-card p-8"
              >
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
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
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-white/60 mb-8">
              Join thousands of businesses using PRIVYDESK
            </p>
            <Link to="/auth/signup">
              <button className="px-8 py-4 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors inline-flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
