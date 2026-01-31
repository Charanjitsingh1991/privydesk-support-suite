import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, FileText, Download, Lightbulb } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function Analytics() {
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
              <BarChart3 className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">Analytics & Reporting</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Track performance, measure customer satisfaction, and gain insights into your support operations.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="premium-card p-6">
                <BarChart3 className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Dashboard Overview</h3>
                <p className="text-white/60 mb-4">Real-time metrics at a glance</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Total tickets (open, pending, resolved)</li>
                  <li>• Average response time</li>
                  <li>• Average resolution time</li>
                  <li>• Customer satisfaction (CSAT) score</li>
                  <li>• Agent performance metrics</li>
                  <li>• Ticket volume trends</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <FileText className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Custom Reports</h3>
                <p className="text-white/60 mb-4">Build reports tailored to your needs (Pro/Enterprise)</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Filter by date range, agent, category</li>
                  <li>• Group by custom fields</li>
                  <li>• Schedule automated reports</li>
                  <li>• Share reports with stakeholders</li>
                  <li>• Save report templates</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <Download className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Export Data</h3>
                <p className="text-white/60 mb-4">Download your data in multiple formats</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Export to CSV, Excel, PDF</li>
                  <li>• Bulk export tickets and conversations</li>
                  <li>• Export customer data (GDPR compliant)</li>
                  <li>• API access for custom exports</li>
                </ul>
              </div>

              <div className="premium-card p-6">
                <Lightbulb className="w-10 h-10 text-accent-lime mb-4" />
                <h3 className="text-xl font-bold mb-3">Insights</h3>
                <p className="text-white/60 mb-4">AI-powered recommendations (Pro/Enterprise)</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Identify trending issues</li>
                  <li>• Predict ticket volume spikes</li>
                  <li>• Agent workload optimization</li>
                  <li>• Customer satisfaction predictions</li>
                </ul>
              </div>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Key Metrics Explained</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-accent-lime mb-2">First Response Time (FRT)</h3>
                  <p className="text-sm text-white/60">Average time from ticket creation to first agent response. Lower is better.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-lime mb-2">Average Resolution Time</h3>
                  <p className="text-sm text-white/60">Average time from ticket creation to resolution. Track by priority and category.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-lime mb-2">Customer Satisfaction (CSAT)</h3>
                  <p className="text-sm text-white/60">Percentage of customers rating their experience as positive (4-5 stars).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-lime mb-2">First Contact Resolution (FCR)</h3>
                  <p className="text-sm text-white/60">Percentage of tickets resolved in the first interaction. Higher indicates better efficiency.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-lime mb-2">Net Promoter Score (NPS)</h3>
                  <p className="text-sm text-white/60">Measures customer loyalty on a scale of -100 to +100. Above 50 is excellent.</p>
                </div>
              </div>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Report Types</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Ticket Volume Report</h4>
                  <p className="text-sm text-white/60">Track ticket creation trends over time</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Agent Performance Report</h4>
                  <p className="text-sm text-white/60">Individual agent metrics and comparisons</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Category Analysis Report</h4>
                  <p className="text-sm text-white/60">Breakdown by ticket category and tags</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">SLA Compliance Report</h4>
                  <p className="text-sm text-white/60">Track adherence to service level agreements</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Customer Satisfaction Report</h4>
                  <p className="text-sm text-white/60">CSAT and NPS trends and analysis</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Channel Performance Report</h4>
                  <p className="text-sm text-white/60">Compare email, chat, and social media channels</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-3">📊 Best Practices</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Review your dashboard daily to catch issues early</li>
                <li>• Set up weekly automated reports for stakeholders</li>
                <li>• Track trends over time, not just snapshots</li>
                <li>• Use insights to identify training opportunities</li>
                <li>• Benchmark against industry standards</li>
                <li>• Celebrate wins with your team when metrics improve</li>
              </ul>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/60 mb-6">Ready to dive into your data?</p>
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard/analytics">
                  <button className="px-6 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                    View Analytics Dashboard
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
