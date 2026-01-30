/**
 * Professional Workflow Diagram
 * Corporate-style workflow visualization for enterprise clients
 */

import { motion } from 'framer-motion';
import { Mail, Ticket, UserCheck, MessageSquare, CheckCircle, BarChart3, Bell, Zap } from 'lucide-react';

const workflowSteps = [
  {
    icon: Mail,
    title: 'Ticket Creation',
    description: 'Customer submits request via email, chat, or portal',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Zap,
    title: 'AI Analysis',
    description: 'Automatic categorization, priority detection, and routing',
    color: 'from-accent-lime to-green-500',
  },
  {
    icon: UserCheck,
    title: 'Agent Assignment',
    description: 'Smart assignment based on skills, workload, and availability',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'Customer Communication',
    description: 'Real-time updates and multi-channel support',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: CheckCircle,
    title: 'Resolution',
    description: 'Issue resolved with customer satisfaction tracking',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Performance metrics, SLA tracking, and continuous improvement',
    color: 'from-orange-500 to-orange-600',
  },
];

export function ProfessionalWorkflow() {
  return (
    <div className="relative">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workflowSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connection Line */}
            {index < workflowSteps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-y-1/2 z-0" />
            )}

            {/* Step Card */}
            <div className="premium-card p-8 h-full relative z-10 hover:scale-105 transition-transform">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-accent-lime text-black font-bold flex items-center justify-center text-lg shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-white/60 leading-relaxed">{step.description}</p>

              {/* Decorative Element */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-tl-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 premium-card p-8"
      >
        <h3 className="text-3xl font-bold mb-8 text-center text-white">
          Enterprise-Grade Features
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent-lime/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-accent-lime" />
            </div>
            <h4 className="font-semibold mb-2 text-white">AI-Powered</h4>
            <p className="text-sm text-white/60">Intelligent automation and insights</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent-lime/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-accent-lime" />
            </div>
            <h4 className="font-semibold mb-2 text-white">Real-Time</h4>
            <p className="text-sm text-white/60">Instant notifications and updates</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent-lime/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-accent-lime" />
            </div>
            <h4 className="font-semibold mb-2 text-white">Analytics</h4>
            <p className="text-sm text-white/60">Comprehensive reporting and metrics</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-accent-lime/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-accent-lime" />
            </div>
            <h4 className="font-semibold mb-2 text-white">SLA Tracking</h4>
            <p className="text-sm text-white/60">Automated compliance monitoring</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfessionalWorkflow;
