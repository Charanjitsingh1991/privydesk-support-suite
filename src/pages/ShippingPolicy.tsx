import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-black/80 border-b border-white/5" initial={{ y: -100 }} animate={{ y: 0 }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-lime flex items-center justify-center">
                <Ticket className="w-6 h-6 text-black" />
              </div>
              <span className="font-bold text-2xl">PRIVYDESK</span>
            </Link>
            <Link to="/auth/signup">
              <button className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors flex items-center">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-4">Shipping & Delivery Policy</h1>
          <p className="text-white/60 mb-12">Last updated: January 31, 2026</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Digital Service Delivery</h2>
              <p className="mb-4">
                PrivyDesk is a cloud-based Software-as-a-Service (SaaS) platform. As a digital service, there is no physical shipping involved. All services are delivered electronically and instantly upon subscription activation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Service Activation</h2>
              <p className="mb-4">Upon successful payment and account creation:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account is activated immediately</li>
                <li>Access credentials are sent to your registered email within minutes</li>
                <li>You can start using the platform right away</li>
                <li>No waiting period or shipping delays</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Access & Availability</h2>
              <p className="mb-4">
                PrivyDesk is accessible 24/7 from anywhere in the world with an internet connection. Our platform is hosted on reliable cloud infrastructure with 99.9% uptime guarantee.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Data Migration Services</h2>
              <p className="mb-4">
                For Enterprise customers who require data migration from existing systems:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Migration timeline is discussed during onboarding</li>
                <li>Typical migration takes 1-5 business days depending on data volume</li>
                <li>Dedicated migration specialist assigned to your account</li>
                <li>Zero downtime migration process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Support & Onboarding</h2>
              <p className="mb-4">All plans include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Starter:</strong> Email support with 24-hour response time</li>
                <li><strong>Professional:</strong> Priority support with 4-hour response time</li>
                <li><strong>Enterprise:</strong> Dedicated account manager with 1-hour response time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">International Access</h2>
              <p className="mb-4">
                PrivyDesk is available globally. There are no geographical restrictions or additional fees for international access. All features are available worldwide.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
              <p>
                If you have questions about service delivery or access, please contact us at{' '}
                <a href="mailto:support@privydesk.com" className="text-accent-lime hover:underline">
                  support@privydesk.com
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
