/**
 * Workflow Diagram Component - Aplio Style
 * Radial integration diagram with central hub
 */

import { motion } from 'framer-motion';
import { Mail, Ticket, UserCheck, MessageSquare, CheckCircle } from 'lucide-react';

interface IntegrationNode {
  icon: React.ElementType;
  title: string;
  angle: number; // degrees
  color: string;
}

const integrationNodes: IntegrationNode[] = [
  { icon: Mail, title: 'Email Received', angle: 0, color: '#3B82F6' },
  { icon: Ticket, title: 'Ticket Created', angle: 72, color: '#8B5CF6' },
  { icon: UserCheck, title: 'Auto-Assigned', angle: 144, color: '#EC4899' },
  { icon: MessageSquare, title: 'Agent Response', angle: 216, color: '#F59E0B' },
  { icon: CheckCircle, title: 'Resolved', angle: 288, color: '#10B981' },
];

export function WorkflowDiagram() {
  const centerX = 50;
  const centerY = 50;
  const radius = 35; // percentage

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <h3 className="text-white font-semibold text-lg">Start Your Journey</h3>
      </div>

      {/* Central Hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative">
          <div className="absolute inset-3 border border-dotted border-white/15 rounded-full" />
          <span className="text-accent-lime text-xl font-bold relative z-10">privydesk</span>
        </div>
      </div>

      {/* Integration Nodes */}
      {integrationNodes.map((node, index) => {
        const Icon = node.icon;
        
        // Calculate position on circle
        const angleRad = (node.angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angleRad);
        const y = centerY + radius * Math.sin(angleRad);
        
        // Calculate control points for curved path
        const controlDistance = radius * 0.6;
        const controlX = centerX + controlDistance * Math.cos(angleRad);
        const controlY = centerY + controlDistance * Math.sin(angleRad);
        
        return (
          <div key={index}>
            {/* Node Circle */}
            <div
              className="absolute z-20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative group hover:border-white/20 transition-all">
                  <div className="absolute inset-3 border border-dotted border-white/15 rounded-full" />
                  <Icon className="w-10 h-10 text-white/70 relative z-10" style={{ color: node.color }} />
                </div>
                <span className="text-sm text-white/60 whitespace-nowrap">{node.title}</span>
              </div>
            </div>

            {/* Curved Dotted Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <path
                d={`M ${x}% ${y}% Q ${controlX}% ${controlY}%, ${centerX}% ${centerY}%`}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                fill="none"
              />
            </svg>

            {/* Animated Glowing Dot on Path */}
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime pointer-events-none"
              style={{
                boxShadow: '0 0 15px rgba(163, 230, 53, 0.8), 0 0 30px rgba(163, 230, 53, 0.5)',
                zIndex: 15,
                offsetPath: `path('M ${x}% ${y}% Q ${controlX}% ${controlY}%, ${centerX}% ${centerY}%')`,
              } as any}
              animate={{
                offsetDistance: ['0%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.6,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

