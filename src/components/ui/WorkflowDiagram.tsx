/**
 * Workflow Diagram Component - Exact Aplio Replication
 * Grid layout with merging paths and smooth dot animations
 */

import { motion } from 'framer-motion';
import { Mail, Ticket, UserCheck, MessageSquare, CheckCircle, Archive } from 'lucide-react';

interface Node {
  id: string;
  icon: React.ElementType;
  title: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
}

const nodes: Node[] = [
  { id: 'email', icon: Mail, title: 'Email Received', x: 12, y: 15, color: '#3B82F6' },
  { id: 'chat', icon: MessageSquare, title: 'Live Chat', x: 88, y: 15, color: '#EC4899' },
  { id: 'ticket', icon: Ticket, title: 'Ticket Created', x: 12, y: 50, color: '#FFFC00' },
  { id: 'resolved', icon: CheckCircle, title: 'Resolved', x: 88, y: 50, color: '#10B981' },
  { id: 'archive', icon: Archive, title: 'Email Archive', x: 12, y: 85, color: '#8B5CF6' },
  { id: 'assigned', icon: UserCheck, title: 'Auto-Assigned', x: 88, y: 85, color: '#F59E0B' },
];

export function WorkflowDiagram() {
  // Path Definitions for SVG (Visual) and Animation (offset-path)
  
  // Left Side
  const pathTopLeft = "M 12 15 L 30 15 Q 35 15 35 20 L 35 45 Q 35 50 40 50 L 50 50";
  const pathMidLeft = "M 12 50 L 50 50";
  const pathBotLeft = "M 12 85 L 30 85 Q 35 85 35 80 L 35 55 Q 35 50 40 50 L 50 50";

  // Right Side
  const pathTopRight = "M 88 15 L 70 15 Q 65 15 65 20 L 65 45 Q 65 50 60 50 L 50 50";
  const pathMidRight = "M 88 50 L 50 50";
  const pathBotRight = "M 88 85 L 70 85 Q 65 85 65 80 L 65 55 Q 65 50 60 50 L 50 50";

  const allPaths = [
    pathTopLeft, pathMidLeft, pathBotLeft,
    pathTopRight, pathMidRight, pathBotRight
  ];

  return (
    <div className="relative w-full h-[450px]">
      {/* Title Button */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
        <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <h3 className="text-white font-medium text-sm">Start Your Journey</h3>
        </div>
      </div>

      {/* SVG for Static Dotted Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
        {allPaths.map((d, index) => (
          <path
            key={index}
            d={d}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            fill="none"
          />
        ))}
      </svg>

      {/* Central Hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center relative shadow-2xl">
          <div className="absolute inset-2.5 border border-dotted border-white/10 rounded-full" />
          <span className="text-accent-lime text-lg font-bold relative z-10">privydesk</span>
        </div>
      </div>

      {/* Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        
        return (
          <div key={node.id}>
            {/* Node Circle */}
            <div
              className="absolute z-20"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center relative hover:border-white/10 transition-all shadow-lg group">
                <div className="absolute inset-2 border border-dotted border-white/5 rounded-full" />
                <Icon className="w-8 h-8 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity" style={{ color: node.color }} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Animated Glowing Dots traveling along paths */}
      {allPaths.map((pathStr, index) => (
        <motion.div
          key={`dot-${index}`}
          className="absolute w-2.5 h-2.5 rounded-full bg-accent-lime"
          style={{
            offsetPath: `path('${pathStr}')`,
            boxShadow: '0 0 15px rgba(163, 230, 53, 1), 0 0 25px rgba(163, 230, 53, 0.8)',
            zIndex: 15,
          } as any}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 1, 1, 0], // Fade in/out at ends
          }}
          transition={{
            duration: 3 + Math.random(), // Slight variation
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.5,
          }}
        />
      ))}
    </div>
  );
}

