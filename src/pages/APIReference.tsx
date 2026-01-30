import { motion } from "framer-motion";
import { Code, Key, Zap, Shield } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function APIReference() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/tickets",
      description: "List all tickets",
      color: "text-blue-400",
    },
    {
      method: "POST",
      path: "/api/v1/tickets",
      description: "Create a new ticket",
      color: "text-green-400",
    },
    {
      method: "GET",
      path: "/api/v1/tickets/:id",
      description: "Get ticket details",
      color: "text-blue-400",
    },
    {
      method: "PATCH",
      path: "/api/v1/tickets/:id",
      description: "Update a ticket",
      color: "text-yellow-400",
    },
    {
      method: "DELETE",
      path: "/api/v1/tickets/:id",
      description: "Delete a ticket",
      color: "text-red-400",
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
            <Code className="w-16 h-16 text-accent-lime mx-auto mb-6" />
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              API <span className="text-accent-lime">Reference</span>
            </h1>
            <p className="text-xl text-white/60">
              RESTful API for seamless integrations
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            <div className="premium-card p-8">
              <Key className="w-12 h-12 text-accent-lime mb-4" />
              <h3 className="text-2xl font-bold mb-3">Authentication</h3>
              <p className="text-white/60 mb-4">
                Use API keys for secure authentication
              </p>
              <code className="text-sm bg-white/5 p-3 rounded block">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>

            <div className="premium-card p-8">
              <Zap className="w-12 h-12 text-accent-lime mb-4" />
              <h3 className="text-2xl font-bold mb-3">Rate Limits</h3>
              <p className="text-white/60 mb-4">
                Generous rate limits for all plans
              </p>
              <ul className="text-sm space-y-2">
                <li>Starter: 1,000 req/hour</li>
                <li>Pro: 10,000 req/hour</li>
                <li>Enterprise: Unlimited</li>
              </ul>
            </div>

            <div className="premium-card p-8">
              <Shield className="w-12 h-12 text-accent-lime mb-4" />
              <h3 className="text-2xl font-bold mb-3">Security</h3>
              <p className="text-white/60 mb-4">
                Enterprise-grade security
              </p>
              <ul className="text-sm space-y-2">
                <li>TLS 1.3 encryption</li>
                <li>IP whitelisting</li>
                <li>Audit logging</li>
              </ul>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Endpoints</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card p-6 hover:border-accent-lime/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`font-mono font-bold ${endpoint.color}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-white/80">{endpoint.path}</code>
                  </div>
                  <p className="text-white/60 text-sm">{endpoint.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 premium-card p-8">
              <h3 className="text-2xl font-bold mb-4">Example Request</h3>
              <pre className="bg-black/50 p-6 rounded-lg overflow-x-auto">
                <code className="text-sm text-accent-lime">
{`curl -X GET "https://api.privydesk.com/v1/tickets" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </code>
              </pre>
            </div>

            <div className="mt-8 premium-card p-8">
              <h3 className="text-2xl font-bold mb-4">Example Response</h3>
              <pre className="bg-black/50 p-6 rounded-lg overflow-x-auto">
                <code className="text-sm text-white/80">
{`{
  "data": [
    {
      "id": "ticket_123",
      "subject": "Need help with setup",
      "status": "open",
      "priority": "high",
      "created_at": "2026-01-31T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 25
  }
}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
