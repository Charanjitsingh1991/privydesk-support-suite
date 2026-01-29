import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/60 mb-12">Last updated: January 30, 2026</p>

          <div className="space-y-8 text-white/70">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using PRIVYDESK, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p>PRIVYDESK provides a cloud-based customer support platform including ticket management, live chat, email integration, and related services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <p className="mb-4">You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of unauthorized access</li>
                <li>Providing accurate and complete information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Use the service for illegal purposes</li>
                <li>Harass or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Payment Terms</h2>
              <p>Subscription fees are billed in advance. You authorize us to charge your payment method for all fees. Refunds are subject to our Refund Policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p>All content, features, and functionality are owned by PRIVYDESK and protected by copyright, trademark, and other laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data and Privacy</h2>
              <p>Your use of the service is also governed by our Privacy Policy. We take data security seriously and implement industry-standard measures.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Service Availability</h2>
              <p>We strive for 99.9% uptime but do not guarantee uninterrupted access. We may perform maintenance with reasonable notice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
              <p>We may suspend or terminate your access for violations of these terms. You may cancel your account at any time through your account settings.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Limitation of Liability</h2>
              <p>PRIVYDESK shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
              <p>For questions about these terms, contact us at legal@privydesk.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
