import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Workflow, Zap, Clock } from "lucide-react";
import { GridPattern } from "@/components/ui/GridPattern";
import { Header } from "@/components/layout/Header";

export default function TicketManagement() {
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
              <MessageSquare className="w-12 h-12 text-accent-lime" />
              <h1 className="text-5xl font-bold">Ticket Management</h1>
            </div>

            <p className="text-xl text-white/60 mb-12">
              Master the art of creating, organizing, and resolving customer support tickets efficiently.
            </p>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4">Creating Tickets</h2>
              <p className="text-white/80 mb-4">Learn how to create and manage support tickets for your customers.</p>
              <div className="bg-accent-lime/10 border border-accent-lime/20 rounded-lg p-4">
                <p className="text-sm text-white/80">
                  This section is under development. Please refer to our <Link to="/support" className="text-accent-lime hover:underline">Help Center</Link> for immediate assistance.
                </p>
              </div>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Workflow className="w-8 h-8 text-accent-lime" />
                Ticket Workflows
              </h2>
              <p className="text-white/80">Automate your ticket management with custom workflows.</p>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Zap className="w-8 h-8 text-accent-lime" />
                Automation Rules
              </h2>
              <p className="text-white/80">Set up intelligent automation to save time and improve efficiency.</p>
            </div>

            <div className="premium-card p-8 mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-accent-lime" />
                SLA Policies
              </h2>
              <p className="text-white/80">Define and track Service Level Agreements to meet customer expectations.</p>
            </div>

            <div className="mt-12 text-center">
              <Link to="/contact">
                <button className="px-6 py-3 rounded-full bg-accent-lime text-black font-medium hover:bg-accent-lime/90 transition-colors">
                  Contact Support
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
