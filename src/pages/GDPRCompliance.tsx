import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight, Shield, Download, Trash2, Eye, Lock } from "lucide-react";

export default function GDPRCompliance() {
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
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12 text-accent-lime" />
            <h1 className="text-5xl font-bold">GDPR Compliance</h1>
          </div>
          <p className="text-white/60 mb-12">General Data Protection Regulation Compliance Statement</p>

          <div className="space-y-8 text-white/80">
            <section className="premium-card p-8 bg-accent-lime/5 border border-accent-lime/20">
              <h2 className="text-2xl font-bold mb-4 text-white">Our Commitment to GDPR</h2>
              <p className="mb-4">
                PrivyDesk is fully committed to compliance with the General Data Protection Regulation (GDPR) and respects the privacy rights of all individuals in the European Economic Area (EEA) and beyond.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Your Data Rights</h2>
              <p className="mb-6">Under GDPR, you have the following rights regarding your personal data:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="premium-card p-6">
                  <div className="flex items-start gap-4">
                    <Eye className="w-8 h-8 text-accent-lime flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-2 text-white">Right to Access</h3>
                      <p className="text-sm">Request a copy of all personal data we hold about you</p>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6">
                  <div className="flex items-start gap-4">
                    <Download className="w-8 h-8 text-accent-lime flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-2 text-white">Right to Portability</h3>
                      <p className="text-sm">Export your data in a machine-readable format</p>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6">
                  <div className="flex items-start gap-4">
                    <Trash2 className="w-8 h-8 text-accent-lime flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-2 text-white">Right to Erasure</h3>
                      <p className="text-sm">Request deletion of your personal data ("right to be forgotten")</p>
                    </div>
                  </div>
                </div>

                <div className="premium-card p-6">
                  <div className="flex items-start gap-4">
                    <Lock className="w-8 h-8 text-accent-lime flex-shrink-0" />
                    <div>
                      <h3 className="font-bold mb-2 text-white">Right to Restriction</h3>
                      <p className="text-sm">Limit how we use your personal data</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">How We Process Your Data</h2>
              <div className="space-y-4">
                <div className="premium-card p-6">
                  <h3 className="text-lg font-bold mb-2 text-white">Lawful Basis</h3>
                  <p>We process personal data based on:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Consent - You have given clear consent</li>
                    <li>Contract - Processing is necessary for a contract with you</li>
                    <li>Legal obligation - Processing is necessary to comply with the law</li>
                    <li>Legitimate interests - Processing is necessary for our legitimate interests</li>
                  </ul>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-lg font-bold mb-2 text-white">Data We Collect</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Account information (name, email, company)</li>
                    <li>Usage data (feature usage, login times)</li>
                    <li>Support tickets and communications</li>
                    <li>Payment information (processed by Stripe)</li>
                    <li>Technical data (IP address, browser type)</li>
                  </ul>
                </div>

                <div className="premium-card p-6">
                  <h3 className="text-lg font-bold mb-2 text-white">Data Retention</h3>
                  <p>We retain personal data for:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Active accounts: Duration of subscription + 30 days</li>
                    <li>Cancelled accounts: 90 days for recovery</li>
                    <li>Financial records: 7 years (legal requirement)</li>
                    <li>Support tickets: 2 years</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Data Security Measures</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="premium-card p-4">
                  <h4 className="font-semibold mb-2 text-white">✓ Encryption</h4>
                  <p className="text-sm">AES-256 encryption at rest, TLS 1.3 in transit</p>
                </div>
                <div className="premium-card p-4">
                  <h4 className="font-semibold mb-2 text-white">✓ Access Controls</h4>
                  <p className="text-sm">Role-based access with multi-factor authentication</p>
                </div>
                <div className="premium-card p-4">
                  <h4 className="font-semibold mb-2 text-white">✓ Regular Audits</h4>
                  <p className="text-sm">Quarterly security assessments and penetration testing</p>
                </div>
                <div className="premium-card p-4">
                  <h4 className="font-semibold mb-2 text-white">✓ Data Backups</h4>
                  <p className="text-sm">Daily encrypted backups with 30-day retention</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">International Data Transfers</h2>
              <p className="mb-4">
                Your data is primarily stored in EU data centers. When data is transferred outside the EEA, we ensure:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs) are in place</li>
                <li>Adequate protection measures are implemented</li>
                <li>Recipients comply with GDPR requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Data Protection Officer</h2>
              <div className="premium-card p-6">
                <p className="mb-4">For GDPR-related inquiries, contact our Data Protection Officer:</p>
                <p className="font-semibold">Email: <a href="mailto:dpo@privydesk.com" className="text-accent-lime hover:underline">dpo@privydesk.com</a></p>
                <p className="text-sm text-white/60 mt-2">We will respond to all requests within 30 days as required by GDPR.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Exercise Your Rights</h2>
              <p className="mb-4">To exercise any of your GDPR rights:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your PrivyDesk account</li>
                <li>Navigate to Settings → Privacy & Data</li>
                <li>Select the appropriate action (Export, Delete, etc.)</li>
                <li>Or email us at <a href="mailto:privacy@privydesk.com" className="text-accent-lime hover:underline">privacy@privydesk.com</a></li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Supervisory Authority</h2>
              <p>
                If you believe we have not adequately addressed your GDPR concerns, you have the right to lodge a complaint with your local supervisory authority.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
