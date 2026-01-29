import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ticket, ArrowRight } from "lucide-react";

export default function RefundPolicy() {
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
          <h1 className="text-5xl font-bold mb-4">Refund Policy</h1>
          <p className="text-white/60 mb-12">Last updated: January 30, 2026</p>

          <div className="space-y-8 text-white/70">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">30-Day Money-Back Guarantee</h2>
              <p>We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with PRIVYDESK, you can request a full refund within 30 days of your initial purchase.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Eligibility</h2>
              <p className="mb-4">To be eligible for a refund:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Request must be made within 30 days of initial purchase</li>
                <li>Applies to first-time subscriptions only</li>
                <li>Account must not have violated our Terms of Service</li>
                <li>Refund requests for renewals are evaluated case-by-case</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How to Request a Refund</h2>
              <p className="mb-4">To request a refund:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact our support team at support@privydesk.com</li>
                <li>Include your account email and reason for refund</li>
                <li>We'll process your request within 5-7 business days</li>
                <li>Refunds are issued to the original payment method</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Subscription Cancellations</h2>
              <p>You can cancel your subscription at any time. Upon cancellation:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>You'll retain access until the end of your billing period</li>
                <li>No refunds for partial months</li>
                <li>Your data will be retained for 30 days after cancellation</li>
                <li>You can reactivate within 30 days without data loss</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Non-Refundable Items</h2>
              <p className="mb-4">The following are non-refundable:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Setup fees or custom development work</li>
                <li>Third-party services or add-ons</li>
                <li>Subscription renewals after 30 days</li>
                <li>Accounts terminated for Terms of Service violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Processing Time</h2>
              <p>Refunds are typically processed within 5-7 business days. Depending on your payment provider, it may take an additional 3-5 business days for the refund to appear in your account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Chargebacks</h2>
              <p>If you file a chargeback without first contacting us, your account will be immediately suspended and you may be liable for chargeback fees.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p>We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="mb-4">For refund requests or questions:</p>
              <ul className="space-y-2">
                <li>Email: support@privydesk.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Hours: Monday-Friday, 9am-6pm EST</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
