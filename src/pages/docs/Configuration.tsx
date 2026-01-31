import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Mail, MessageCircle, Globe, Palette } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function Configuration() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <GridPattern variant="grid" className="opacity-100" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/docs" className="inline-flex items-center gap-2 text-accent-lime hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Documentation
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <Settings className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">Configuration</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Customize your PrivyDesk workspace to match your brand and workflow.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="premium-card p-6">
                <Mail className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Email Setup</h3>
                <p className="text-white/60 mb-4">Configure email forwarding and custom email addresses</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Custom support email (support@yourdomain.com)</li>
                  <li>• Email forwarding rules</li>
                  <li>• Email templates and signatures</li>
                  <li>• SMTP configuration</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <MessageCircle className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Chat Widget</h3>
                <p className="text-white/60 mb-4">Embed live chat on your website</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Customize widget appearance</li>
                  <li>• Set welcome messages</li>
                  <li>• Configure availability hours</li>
                  <li>• Add pre-chat forms</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <Globe className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Custom Domains</h3>
                <p className="text-white/60 mb-4">Use your own domain for help center (Pro/Enterprise)</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Custom help center domain</li>
                  <li>• SSL certificate setup</li>
                  <li>• DNS configuration</li>
                  <li>• Domain verification</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <Palette className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Branding</h3>
                <p className="text-white/60 mb-4">Match PrivyDesk to your brand identity (Pro/Enterprise)</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Upload your logo</li>
                  <li>• Customize colors and themes</li>
                  <li>• White-label options</li>
                  <li>• Custom CSS (Enterprise)</li>
                </ul>
              </div>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">General Settings</h2>
              <div className="space-y-4 text-white/80">
                <div>
                  <h3 className="font-semibold mb-2">Organization Details</h3>
                  <p className="text-sm text-white/60">Company name, industry, size, and contact information</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Time Zone & Localization</h3>
                  <p className="text-sm text-white/60">Set your time zone, date format, and language preferences</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-sm text-white/60">Define when your support team is available</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Notification Settings</h3>
                  <p className="text-sm text-white/60">Control email, in-app, and push notifications</p>
                </div>
              </div>
            </div>

            <div className="bg-accent-lime/10 border border-accent-lime/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-3">💡 Configuration Tips</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Start with email setup to ensure you receive all customer inquiries</li>
                <li>• Customize the chat widget to match your website's design</li>
                <li>• Set up business hours to manage customer expectations</li>
                <li>• Use custom domains for a professional help center experience</li>
              </ul>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/60 mb-6">Need help with configuration?</p>
              <div className="flex gap-4 justify-center">
                <Link to="/support">
                  <button className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    Visit Help Center
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="px-6 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                    Contact Support
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
