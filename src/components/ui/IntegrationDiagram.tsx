/**
 * Integration Diagram Component
 * Animated diagram showing connections with glowing dots traveling on dotted lines
 * Inspired by Aplio theme
 */

import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Mail, MessageSquare, Slack } from 'lucide-react';

interface IntegrationNode {
  icon: React.ElementType;
  position: { x: number; y: number };
  color: string;
}

const integrations: IntegrationNode[] = [
  { icon: Twitter, position: { x: 10, y: 20 }, color: '#1DA1F2' },
  { icon: Github, position: { x: 10, y: 50 }, color: '#ffffff' },
  { icon: Slack, position: { x: 10, y: 80 }, color: '#E01E5A' },
  { icon: Mail, position: { x: 90, y: 20 }, color: '#EA4335' },
  { icon: MessageSquare, position: { x: 90, y: 50 }, color: '#00D9FF' },
  { icon: Linkedin, position: { x: 90, y: 80 }, color: '#0A66C2' },
];

export function IntegrationDiagram() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      {/* Central Hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-32 h-32 rounded-full bg-black border border-white/10 flex items-center justify-center">
          <span className="text-accent-lime text-2xl font-bold">PRIVYDESK</span>
        </div>
      </div>

      {/* Integration Nodes */}
      {integrations.map((integration, index) => {
        const Icon = integration.icon;
        const isLeft = integration.position.x < 50;
        
        return (
          <div key={index}>
            {/* Node Circle */}
            <div
              className="absolute w-20 h-20 rounded-full bg-black border border-white/10 flex items-center justify-center"
              style={{
                left: `${integration.position.x}%`,
                top: `${integration.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Icon className="w-8 h-8" style={{ color: integration.color }} />
            </div>

            {/* Dotted Connection Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <motion.path
                d={`M ${integration.position.x}% ${integration.position.y}% Q ${isLeft ? 30 : 70}% ${integration.position.y}%, 50% 50%`}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="4 4"
                fill="none"
              />
            </svg>

            {/* Animated Glowing Dot */}
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-accent-lime shadow-glow-primary"
              style={{
                filter: 'blur(2px)',
              }}
              animate={{
                x: [integration.position.x + '%', '50%'],
                y: [integration.position.y + '%', '50%'],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: 'linear',
                delay: index * 0.3,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Simpler version with just the visual effect
export function SimpleIntegrationFlow() {
  return (
    <div className="relative w-full max-w-4xl mx-auto h-64 flex items-center justify-center">
      {/* Left Node */}
      <div className="absolute left-0 w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center">
        <Twitter className="w-6 h-6 text-[#1DA1F2]" />
      </div>

      {/* Center Hub */}
      <div className="absolute left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center">
        <span className="text-accent-lime font-bold">HUB</span>
      </div>

      {/* Right Node */}
      <div className="absolute right-0 w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center">
        <Slack className="w-6 h-6 text-[#E01E5A]" />
      </div>

      {/* Left Connection Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line
          x1="8%"
          y1="50%"
          x2="45%"
          y2="50%"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Right Connection Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line
          x1="55%"
          y1="50%"
          x2="92%"
          y2="50%"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Animated Glowing Dots - Left */}
      <motion.div
        className="absolute top-1/2 w-3 h-3 rounded-full bg-accent-lime"
        style={{
          boxShadow: '0 0 20px rgba(163, 230, 53, 0.8), 0 0 40px rgba(163, 230, 53, 0.4)',
        }}
        animate={{
          left: ['8%', '45%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Animated Glowing Dots - Right */}
      <motion.div
        className="absolute top-1/2 w-3 h-3 rounded-full bg-accent-lime"
        style={{
          boxShadow: '0 0 20px rgba(163, 230, 53, 0.8), 0 0 40px rgba(163, 230, 53, 0.4)',
        }}
        animate={{
          left: ['55%', '92%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          delay: 1,
        }}
      />
    </div>
  );
}
