import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Code, Key, Webhook, Gauge } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function APIIntegration() {
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
              <Code className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">API Integration</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Integrate PrivyDesk with your applications using our powerful REST API.
            </p>

            <div className="premium-card p-8 mb-8 bg-gradient-to-br from-accent-lime/10 to-transparent border-accent-lime/20">
              <h2 className="text-2xl font-bold mb-4">Full API Documentation Available</h2>
              <p className="text-white/80 mb-6">
                For complete API documentation including authentication, endpoints, webhooks, and rate limits, please visit our dedicated API Reference page.
              </p>
              <Link to="/api-reference">
                <button className="px-6 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                  View API Reference
                </button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="premium-card p-6">
                <Key className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">API Authentication</h3>
                <p className="text-white/60 mb-4">Secure your API requests with API keys and OAuth 2.0</p>
                <Link to="/api-reference#authentication" className="text-accent-lime hover:underline text-sm">
                  Learn more →
                </Link>
              </div>

              <div className="premium-card p-6">
                <Code className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">REST Endpoints</h3>
                <p className="text-white/60 mb-4">Access tickets, users, and organizations via RESTful API</p>
                <Link to="/api-reference#endpoints" className="text-accent-lime hover:underline text-sm">
                  Learn more →
                </Link>
              </div>

              <div className="premium-card p-6">
                <Webhook className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Webhooks</h3>
                <p className="text-white/60 mb-4">Receive real-time notifications for ticket events</p>
                <Link to="/api-reference#webhooks" className="text-accent-lime hover:underline text-sm">
                  Learn more →
                </Link>
              </div>

              <div className="premium-card p-6">
                <Gauge className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Rate Limits</h3>
                <p className="text-white/60 mb-4">Understand API rate limits and best practices</p>
                <Link to="/api-reference#rate-limits" className="text-accent-lime hover:underline text-sm">
                  Learn more →
                </Link>
              </div>
            </div>

            <div className="premium-card p-8">
              <h2 className="text-2xl font-bold mb-4">Quick Start Example</h2>
              <p className="text-white/80 mb-4">Create a ticket using our API:</p>
              <pre className="bg-black/50 p-6 rounded-lg overflow-x-auto text-sm">
                <code className="text-accent-lime">{`curl -X POST https://api.privydesk.com/v1/tickets \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "subject": "Customer inquiry",
    "description": "Need help with billing",
    "customer_email": "customer@example.com",
    "priority": "medium"
  }'`}</code>
              </pre>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/60 mb-6">Ready to start building?</p>
              <div className="flex gap-4 justify-center">
                <Link to="/api-reference">
                  <button className="px-6 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                    View Full API Docs
                  </button>
                </Link>
                <Link to="/contact">
                  <button className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
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
