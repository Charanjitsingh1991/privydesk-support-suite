/**
 * Workflow Diagram Component - Exact Aplio Replication
 * Grid layout with merging paths and smooth dot animations
 */

import { motion } from 'framer-motion';
import { Mail, Ticket, UserCheck, MessageSquare, CheckCircle, Archive, LucideIcon } from 'lucide-react';

interface Node {
  id: string;
  icon: LucideIcon;
  title: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
}

interface IntegrationNodeProps {
  icon: LucideIcon;
  color: string;
}

// Standardized Integration Node Component - All nodes are pixel-identical
function IntegrationNode({ icon: Icon, color }: IntegrationNodeProps) {
  return (
    <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative hover:border-white/20 transition-all shadow-xl group">
      {/* Subtle inner ring */}
      <div className="absolute inset-2 border border-white/5 rounded-full" />
      {/* Icon - centered, 24px × 24px, white color */}
      <Icon className="w-6 h-6 relative z-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

const nodes: Node[] = [
  // Left side - 3 nodes closer to center
  { id: 'email', icon: Mail, title: 'Email', x: 20, y: 20, color: '#3B82F6' },
  { id: 'ticket', icon: Ticket, title: 'Ticket', x: 20, y: 50, color: '#EAB308' },
  { id: 'archive', icon: Archive, title: 'Archive', x: 20, y: 80, color: '#8B5CF6' },
  
  // Right side - 3 nodes closer to center
  { id: 'chat', icon: MessageSquare, title: 'Chat', x: 80, y: 20, color: '#EC4899' },
  { id: 'resolved', icon: CheckCircle, title: 'Resolved', x: 80, y: 50, color: '#10B981' },
  { id: 'assigned', icon: UserCheck, title: 'Assigned', x: 80, y: 80, color: '#F59E0B' },
];

export function WorkflowDiagram() {
  // Rectangular paths with rounded corners - Aplio style (nodes closer to center)
  
  // Left Side - Rectangular paths
  const pathTopLeft = "M 20 20 L 32 20 Q 37 20 37 25 L 37 45 Q 37 50 42 50 L 50 50";
  const pathMidLeft = "M 20 50 L 50 50";
  const pathBotLeft = "M 20 80 L 32 80 Q 37 80 37 75 L 37 55 Q 37 50 42 50 L 50 50";

  // Right Side - Rectangular paths
  const pathTopRight = "M 80 20 L 68 20 Q 63 20 63 25 L 63 45 Q 63 50 58 50 L 50 50";
  const pathMidRight = "M 80 50 L 50 50";
  const pathBotRight = "M 80 80 L 68 80 Q 63 80 63 75 L 63 55 Q 63 50 58 50 L 50 50";

  const allPaths = [
    pathTopLeft, pathMidLeft, pathBotLeft,
    pathTopRight, pathMidRight, pathBotRight
  ];

  return (
    <div className="relative w-full h-[550px]">
      {/* Title Button - Solid Lime Green */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <button className="px-6 py-2.5 rounded-full bg-accent-lime text-black font-medium text-sm hover:bg-accent-lime/90 transition-colors">
          Start Your Journey
        </button>
      </div>

      {/* SVG for Static Dotted Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
        {allPaths.map((d, index) => (
          <path
            key={index}
            d={d}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.2"
            strokeDasharray="0.5 0.5"
            fill="none"
          />
        ))}
      </svg>

      {/* Central Hub with Subtle Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Very subtle green glow behind center */}
        <div className="absolute inset-0 -z-10 scale-150">
          <div className="w-full h-full rounded-full bg-accent-lime/5 blur-3xl" />
        </div>
        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center relative shadow-2xl">
          <div className="absolute inset-2.5 border border-dotted border-white/10 rounded-full" />
          <span className="text-accent-lime text-lg font-bold relative z-10">privydesk</span>
        </div>
      </div>

      {/* Nodes - All use standardized IntegrationNode component */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute z-20"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <IntegrationNode icon={node.icon} color={node.color} />
        </div>
      ))}

      {/* Animated Dots traveling along paths - ALL 6 START TOGETHER FROM CENTER */}
      
      {/* Top-left path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '42%', '37%', '37%', '32%', '20%'],
          top: ['50%', '50%', '47.5%', '35%', '22.5%', '20%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Mid-left path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '20%'],
          top: ['50%', '50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Bottom-left path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '42%', '37%', '37%', '32%', '20%'],
          top: ['50%', '50%', '52.5%', '65%', '77.5%', '80%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Top-right path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '58%', '63%', '63%', '68%', '80%'],
          top: ['50%', '50%', '47.5%', '35%', '22.5%', '20%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Mid-right path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '80%'],
          top: ['50%', '50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Bottom-right path */}
      <motion.div
        className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 15 }}
        animate={{
          left: ['50%', '58%', '63%', '63%', '68%', '80%'],
          top: ['50%', '50%', '52.5%', '65%', '77.5%', '80%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
    </div>
  );
}

