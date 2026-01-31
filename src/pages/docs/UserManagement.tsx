import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, UserPlus, Shield, Settings as SettingsIcon } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function UserManagement() {
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
              <Users className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">User Management</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Learn how to manage your team members, assign roles, and configure permissions in PrivyDesk.
            </p>

            {/* Adding Team Members */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-accent-lime" />
                Adding Team Members
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Invite via Email</h3>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Navigate to <strong>Settings → Team</strong></li>
                    <li>Click the <strong>"Invite Team Member"</strong> button</li>
                    <li>Enter the team member's email address</li>
                    <li>Select their role (Super Admin, Org Admin, Agent, or Viewer)</li>
                    <li>Click <strong>"Send Invitation"</strong></li>
                  </ol>
                  <p className="text-white/60 text-sm mt-3">
                    The team member will receive an email with a magic link to join your organization.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Bulk Invitations</h3>
                  <p className="text-white/80 mb-3">For Professional and Enterprise plans, you can invite multiple team members at once:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Click <strong>"Bulk Invite"</strong> in the Team settings</li>
                    <li>Upload a CSV file with columns: email, role, department (optional)</li>
                    <li>Review the preview of invitations</li>
                    <li>Click <strong>"Send All Invitations"</strong></li>
                  </ol>
                </div>

                <div className="bg-accent-lime/10 border border-accent-lime/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong className="text-accent-lime">Team Limits:</strong> Starter (5 members), Professional (20 members), Enterprise (unlimited). You can add more members as paid add-ons.
                  </p>
                </div>
              </div>
            </div>

            {/* Roles & Permissions */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Shield className="w-8 h-8 text-accent-lime" />
                Roles & Permissions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Super Admin</h3>
                  <p className="text-white/80 mb-3">Full system access with all privileges:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Manage all users and their roles</li>
                    <li>Configure organization settings</li>
                    <li>Access billing and subscription management</li>
                    <li>View all tickets and conversations</li>
                    <li>Manage integrations and API keys</li>
                    <li>Access audit logs and security settings</li>
                    <li>Delete organization (with confirmation)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Organization Admin</h3>
                  <p className="text-white/80 mb-3">Administrative access without billing control:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Invite and manage team members (except Super Admins)</li>
                    <li>Configure workspace settings</li>
                    <li>View all tickets and assign them</li>
                    <li>Manage ticket categories and tags</li>
                    <li>Configure automation rules and workflows</li>
                    <li>Access analytics and reports</li>
                    <li>Cannot access billing or delete organization</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Agent</h3>
                  <p className="text-white/80 mb-3">Standard support team member:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>View and respond to assigned tickets</li>
                    <li>Create new tickets on behalf of customers</li>
                    <li>Access knowledge base articles</li>
                    <li>Use canned responses and templates</li>
                    <li>View basic analytics for their own performance</li>
                    <li>Cannot manage users or organization settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Viewer</h3>
                  <p className="text-white/80 mb-3">Read-only access for stakeholders:</p>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>View tickets and conversations (read-only)</li>
                    <li>Access analytics dashboards</li>
                    <li>Export reports</li>
                    <li>Cannot respond to tickets or modify settings</li>
                    <li>Ideal for managers and executives</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm">
                    <strong className="text-blue-400">Best Practice:</strong> Follow the principle of least privilege - assign the minimum role needed for each team member's responsibilities.
                  </p>
                </div>
              </div>
            </div>

            {/* User Settings */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-accent-lime" />
                User Settings
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Managing Individual Users</h3>
                  <p className="text-white/80 mb-3">To modify a team member's settings:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Go to <strong>Settings → Team</strong></li>
                    <li>Click on the team member's name</li>
                    <li>Available actions:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>Change role</li>
                        <li>Update department or team assignment</li>
                        <li>Set working hours and availability</li>
                        <li>Configure notification preferences</li>
                        <li>Suspend or deactivate account</li>
                        <li>Remove from organization</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">User Status</h3>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li><strong>Active:</strong> User can log in and perform their role's actions</li>
                    <li><strong>Suspended:</strong> Temporarily blocked from logging in (preserves data)</li>
                    <li><strong>Deactivated:</strong> Permanently removed from active users (can be reactivated)</li>
                    <li><strong>Pending:</strong> Invitation sent but not yet accepted</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Departments & Teams</h3>
                  <p className="text-white/80 mb-3">Organize users into departments for better ticket routing:</p>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Go to <strong>Settings → Departments</strong></li>
                    <li>Click <strong>"Create Department"</strong></li>
                    <li>Enter department name (e.g., "Technical Support", "Billing", "Sales")</li>
                    <li>Assign team members to the department</li>
                    <li>Set up automatic routing rules based on ticket category</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* SSO Setup */}
            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4">SSO Setup (Enterprise)</h2>
              <div className="space-y-6">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm">
                    <strong className="text-purple-400">Enterprise Feature:</strong> Single Sign-On (SSO) is available on Enterprise plans only.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Supported SSO Providers</h3>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Google Workspace (OAuth 2.0)</li>
                    <li>Microsoft Azure AD (SAML 2.0)</li>
                    <li>Okta (SAML 2.0)</li>
                    <li>OneLogin (SAML 2.0)</li>
                    <li>Custom SAML 2.0 providers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Setting Up SSO</h3>
                  <ol className="list-decimal list-inside space-y-2 text-white/80">
                    <li>Go to <strong>Settings → Security → SSO</strong></li>
                    <li>Select your identity provider</li>
                    <li>Enter the required configuration:
                      <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                        <li>SSO URL / Login URL</li>
                        <li>Entity ID / Issuer</li>
                        <li>X.509 Certificate</li>
                      </ul>
                    </li>
                    <li>Configure attribute mapping (email, name, role)</li>
                    <li>Test the SSO connection</li>
                    <li>Enable SSO for your organization</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">SSO Best Practices</h3>
                  <ul className="list-disc list-inside space-y-2 text-white/80">
                    <li>Always test SSO with a test account before enabling for all users</li>
                    <li>Keep a Super Admin account with password login as backup</li>
                    <li>Configure automatic user provisioning to sync with your directory</li>
                    <li>Set up SCIM for automatic user deprovisioning when employees leave</li>
                    <li>Monitor SSO login attempts in audit logs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="premium-card p-8 bg-gradient-to-br from-accent-lime/10 to-transparent border-accent-lime/20">
              <h2 className="text-3xl font-bold mb-4">Next Steps</h2>
              <p className="text-white/80 mb-6">
                Now that you understand user management, explore these related topics:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/docs/ticket-management" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">Ticket Management</h3>
                  <p className="text-sm text-white/60">Learn how to manage and route tickets</p>
                </Link>
                <Link to="/docs/configuration" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">Configuration</h3>
                  <p className="text-sm text-white/60">Customize your workspace settings</p>
                </Link>
                <Link to="/docs/analytics" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">Analytics & Reporting</h3>
                  <p className="text-sm text-white/60">Track team performance metrics</p>
                </Link>
                <Link to="/api-reference" className="premium-card p-4 hover:border-accent-lime/50 transition-colors">
                  <h3 className="font-semibold mb-2">API Reference</h3>
                  <p className="text-sm text-white/60">Automate user management via API</p>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
              <p className="text-white/60 mb-6">
                Our support team is here to help you manage your team
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
  );
}
