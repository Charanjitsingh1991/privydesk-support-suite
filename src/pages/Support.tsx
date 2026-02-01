import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HelpCircle, MessageSquare, Book, Video } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function Support() {
  const faqs = [
    {
      question: "How do I create a support ticket?",
      answer: "You can create a ticket by logging into your account, clicking 'New Ticket', and filling out the required information. Alternatively, customers can submit tickets via email or the chat widget.",
    },
    {
      question: "What are your support hours?",
      answer: "Our support team is available 24/7 via email and chat. Phone support is available Monday-Friday, 9 AM - 6 PM EST.",
    },
    {
      question: "How quickly will I get a response?",
      answer: "Response times vary by plan: Starter (24 hours), Professional (4 hours), Enterprise (1 hour). Critical issues are prioritized across all plans.",
    },
    {
      question: "Can I integrate PrivyDesk with other tools?",
      answer: "Yes! PrivyDesk integrates with popular tools like Slack, Microsoft Teams, Salesforce, and more. Professional and Enterprise plans include API access for custom integrations.",
    },
    {
      question: "Do you offer a free plan?",
      answer: "Yes! Our Free plan is completely free forever and includes up to 3 team members, 100 tickets/month, email ticketing, basic live chat, and 1 GB storage. Perfect for trying out PrivyDesk. No credit card required. Upgrade to Starter ($29/month) or higher plans as you grow.",
    },
    {
      question: "How do I upgrade my plan?",
      answer: "You can upgrade your plan anytime from the Settings > Billing section. Changes take effect immediately, and you'll only pay the prorated difference.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers can also pay via wire transfer or invoice.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel anytime from your account settings. Your service will continue until the end of your current billing period. The free Starter plan never expires.",
    },
    {
      question: "How does the AI-powered ticket routing work?",
      answer: "Our AI analyzes ticket content, customer history, and agent expertise to automatically route tickets to the best-suited team member. This feature is available on Professional and Enterprise plans.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade encryption (AES-256), secure data centers, regular security audits, and comply with GDPR, SOC 2, and ISO 27001 standards. All data is encrypted in transit and at rest.",
    },
    {
      question: "Can I import my existing tickets and data?",
      answer: "Yes! We support data migration from popular platforms like Zendesk, Freshdesk, and Help Scout. Our team will assist you with the migration process on Professional and Enterprise plans.",
    },
    {
      question: "What's included in the knowledge base?",
      answer: "The knowledge base allows you to create help articles, FAQs, and documentation for your customers. Starter plan includes up to 50 articles, while Professional and Enterprise plans offer unlimited articles with advanced features like multi-language support.",
    },
    {
      question: "Do you offer custom branding?",
      answer: "Yes! Professional and Enterprise plans include custom branding options like your logo, colors, and custom domain for the help center and chat widget.",
    },
    {
      question: "What are SLA policies?",
      answer: "SLA (Service Level Agreement) policies let you set response and resolution time targets for different ticket priorities. Available on Professional and Enterprise plans, they help ensure your team meets customer expectations.",
    },
    {
      question: "Can I add more team members to my plan?",
      answer: "Yes! Starter includes 5 members, Professional includes 20 members, and Enterprise includes unlimited members. You can add more team members as add-ons if needed.",
    },
    {
      question: "How does billing work for add-ons?",
      answer: "Add-ons (extra storage, team members, API calls) are billed monthly along with your base plan. You can add or remove them anytime, and charges are prorated.",
    },
    {
      question: "Do you offer phone support?",
      answer: "Phone support is available for Professional and Enterprise plans. Starter plan includes email support with 24-hour response time.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

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
