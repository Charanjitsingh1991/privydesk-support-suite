import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, HelpCircle, MessageSquare, Book, Video } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";

export default function Support() {
  const faqs = [
    {
      question: "How do I get started with PrivyDesk?",
      answer: "Sign up for a free trial, create your organization, and invite your team members. Our onboarding wizard will guide you through the setup process.",
    },
    {
      question: "Can I import my existing tickets?",
      answer: "Yes! PrivyDesk supports importing tickets from CSV files and popular platforms like Zendesk, Freshdesk, and Help Scout.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and support invoicing for Enterprise customers.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your subscription at any time from your account settings. No long-term contracts required.",
    },
    {
      question: "Do you offer phone support?",
      answer: "Phone support is available for Professional and Enterprise plans. Starter plan includes email support with 24-hour response time.",
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
              <Link to="/support" className="px-4 py-2 rounded-full text-sm font-medium text-white bg-white/10 transition-colors">Support</Link>
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
            <HelpCircle className="w-16 h-16 text-accent-lime mx-auto mb-6" />
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Help <span className="text-accent-lime">Center</span>
            </h1>
            <p className="text-xl text-white/60">
              Find answers and get support
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Link to="/docs" className="premium-card p-8 hover:scale-105 transition-transform text-center">
              <Book className="w-12 h-12 text-accent-lime mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Documentation</h3>
              <p className="text-white/60">Comprehensive guides and tutorials</p>
            </Link>

            <Link to="/api-reference" className="premium-card p-8 hover:scale-105 transition-transform text-center">
              <MessageSquare className="w-12 h-12 text-accent-lime mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">API Reference</h3>
              <p className="text-white/60">Developer documentation</p>
            </Link>

            <Link to="/blog" className="premium-card p-8 hover:scale-105 transition-transform text-center">
              <Video className="w-12 h-12 text-accent-lime mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Video Tutorials</h3>
              <p className="text-white/60">Learn with step-by-step videos</p>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card p-6"
                >
                  <h3 className="text-xl font-bold mb-3 flex items-start gap-3">
                    <HelpCircle className="w-6 h-6 text-accent-lime flex-shrink-0 mt-1" />
                    {faq.question}
                  </h3>
                  <p className="text-white/60 pl-9">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 premium-card p-8 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-white/60 mb-6">
              Our support team is available 24/7 to assist you
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
