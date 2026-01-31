import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { SEOHead } from "@/components/SEO/SEOHead";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function GettingStarted() {
  return (
    <>
      <SEOHead
        title="Getting Started Guide - PrivyDesk Documentation"
        description="Quick start guide for PrivyDesk. Learn how to set up your account, invite team members, and start managing support tickets."
        keywords={['getting started', 'privydesk setup', 'quick start guide', 'helpdesk onboarding', 'setup tutorial']}
      />
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
              <Zap className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">Getting Started</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Welcome to PrivyDesk! This guide will help you set up your account and start managing customer support tickets in minutes.
            </p>

            {/* Installation */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Download className="w-8 h-8 text-accent-lime" />
                Installation
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Step 1: Create Your Account</h3>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Visit <Link to="/auth/signup" className="text-accent-lime hover:underline">privydesk.com/signup</Link></li>
                    <li>Enter your email address</li>
                    <li>Check your inbox for the magic link or OTP code</li>
                    <li>Click the link or enter the code to verify your email</li>
                    <li>You'll be automatically logged in</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Step 2: Complete Onboarding</h3>
                  <p className="text-white/80 mb-3">After logging in, you'll be guided through our onboarding wizard:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Create your organization (company name, industry, size)</li>
                    <li>Set up your workspace preferences</li>
                    <li>Invite team members (optional)</li>
                    <li>Configure basic settings</li>
                  </ul>
                </div>

                <div className="bg-accent-lime/10 border border-accent-lime/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong className="text-accent-lime">Pro Tip:</strong> You can skip onboarding and complete it later from Settings, but we recommend finishing it now for the best experience.
                  </p>
                </div>
              </div>
            </div>

            {/* First Steps */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-accent-lime" />
                First Steps
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">1. Explore the Dashboard</h3>
                  <p className="text-white/80 mb-3">Your dashboard shows:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li><strong>Ticket Overview:</strong> Open, pending, and resolved tickets</li>
                    <li><strong>Recent Activity:</strong> Latest customer interactions</li>
                    <li><strong>Team Performance:</strong> Response times and resolution rates</li>
                    <li><strong>Quick Actions:</strong> Create ticket, invite team, configure settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">2. Create Your First Ticket</h3>
                  <p className="text-white/80 mb-3">Test the system by creating a sample ticket:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Click "New Ticket" button in the top right</li>
                    <li>Fill in customer details (name, email)</li>
                    <li>Enter ticket subject and description</li>
                    <li>Set priority (Low, Medium, High, Urgent)</li>
                    <li>Assign to yourself or a team member</li>
                    <li>Click "Create Ticket"</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">3. Invite Your Team</h3>
                  <p className="text-white/80 mb-3">Add team members to collaborate:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Go to Settings → Team</li>
                    <li>Click "Invite Team Member"</li>
                    <li>Enter their email address</li>
                    <li>Select their role (Admin, Agent, or Viewer)</li>
                    <li>Send invitation</li>
                  </ol>
                  <p className="text-white/60 text-sm mt-3">
                    Team members will receive an email invitation with a magic link to join your organization.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Configuration */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Settings className="w-8 h-8 text-accent-lime" />
                Basic Configuration
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Organization Settings</h3>
                  <p className="text-white/80 mb-3">Customize your workspace:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li><strong>Organization Name:</strong> Your company name</li>
                    <li><strong>Logo:</strong> Upload your brand logo</li>
                    <li><strong>Time Zone:</strong> Set your local time zone</li>
                    <li><strong>Business Hours:</strong> Define when your team is available</li>
                    <li><strong>Language:</strong> Choose your preferred language</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Notification Preferences</h3>
                  <p className="text-white/80 mb-3">Control how you receive updates:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li><strong>Email Notifications:</strong> New tickets, mentions, assignments</li>
                    <li><strong>In-App Notifications:</strong> Real-time alerts</li>
                    <li><strong>Digest Emails:</strong> Daily or weekly summaries</li>
                    <li><strong>Notification Sounds:</strong> Enable/disable audio alerts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Ticket Categories</h3>
                  <p className="text-white/80 mb-3">Organize tickets by category:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Go to Settings → Tickets</li>
                    <li>Click "Add Category"</li>
                    <li>Enter category name (e.g., "Technical Support", "Billing", "Feature Request")</li>
                    <li>Choose a color for easy identification</li>
                    <li>Save changes</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Account Setup */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4">Account Setup</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Profile Information</h3>
                  <p className="text-white/80 mb-3">Complete your profile:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Upload a profile picture</li>
                    <li>Add your full name</li>
                    <li>Set your job title</li>
                    <li>Add contact information</li>
                    <li>Write a brief bio (optional)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Security Settings</h3>
                  <p className="text-white/80 mb-3">Protect your account:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li><strong>Two-Factor Authentication (2FA):</strong> Add an extra layer of security</li>
                    <li><strong>Session Management:</strong> View and revoke active sessions</li>
                    <li><strong>Login History:</strong> Monitor account access</li>
                    <li><strong>API Keys:</strong> Generate keys for integrations (Pro plan)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Billing & Subscription</h3>
                  <p className="text-white/80 mb-3">Manage your plan:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>View current plan and usage</li>
                    <li>Upgrade or downgrade subscription</li>
                    <li>Add payment method</li>
                    <li>View billing history</li>
                    <li>Download invoices</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="premium-card p-8 bg-gradient-to-br from-accent-lime/10 to-transparent border-accent-lime/20">
              <h2 className="text-3xl font-bold mb-4">Next Steps</h2>
              <p className="text-white/80 mb-6">
                Now that you're set up, explore these advanced features:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/docs/user-management" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">User Management</h3>
                  <p className="text-sm text-white/60">Learn how to manage teams and permissions</p>
                </Link>
                <Link to="/docs/ticket-management" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">Ticket Management</h3>
                  <p className="text-sm text-white/60">Master ticket workflows and automation</p>
                </Link>
                <Link to="/docs/api-integration" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">API Integration</h3>
                  <p className="text-sm text-white/60">Connect PrivyDesk with your apps</p>
                </Link>
                <Link to="/docs/analytics" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">Analytics & Reporting</h3>
                  <p className="text-sm text-white/60">Track performance and metrics</p>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-white/60 mb-6">
                Our support team is here to help you get started
              </p>
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
    </>
  );
}
