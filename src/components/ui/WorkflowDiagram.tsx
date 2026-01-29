/**
 * Workflow Diagram Component
 * Shows PRIVYDESK ticket lifecycle with animated data flow
 */

import { motion } from 'framer-motion';
import { Mail, Ticket, UserCheck, MessageSquare, CheckCircle, BarChart3 } from 'lucide-react';

interface WorkflowStep {
  icon: React.ElementType;
  title: string;
  position: { x: number; y: number };
}

const workflowSteps: WorkflowStep[] = [
  { icon: Mail, title: 'Email Received', position: { x: 5, y: 50 } },
  { icon: Ticket, title: 'Ticket Created', position: { x: 25, y: 50 } },
  { icon: UserCheck, title: 'Auto-Assigned', position: { x: 45, y: 50 } },
  { icon: MessageSquare, title: 'Agent Response', position: { x: 65, y: 50 } },
  { icon: CheckCircle, title: 'Resolved', position: { x: 85, y: 50 } },
];

export function WorkflowDiagram() {
  return (
    <div className="relative w-full h-64 flex items-center">
      {/* Workflow Steps */}
      {workflowSteps.map((step, index) => {
        const Icon = step.icon;
        const nextStep = workflowSteps[index + 1];
        
        return (
          <div key={index}>
            {/* Step Node */}
            <div
              className="absolute"
              style={{
                left: `${step.position.x}%`,
                top: `${step.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative">
                  {/* Dotted inner border */}
                  <div className="absolute inset-2 border border-dotted border-white/20 rounded-full" />
                  <Icon className="w-7 h-7 text-white/70 relative z-10" />
                </div>
                <span className="text-sm text-white/60 whitespace-nowrap">{step.title}</span>
              </div>
            </div>

            {/* Connection Line to Next Step */}
            {nextStep && (
              <>
                {/* Dotted Line */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 0 }}
                >
                  <line
                    x1={`${step.position.x}%`}
                    y1={`${step.position.y}%`}
                    x2={`${nextStep.position.x}%`}
                    y2={`${nextStep.position.y}%`}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                </svg>

                {/* Animated Glowing Dot */}
                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-accent-lime"
                  style={{
                    top: `${step.position.y}%`,
                    boxShadow: '0 0 20px rgba(163, 230, 53, 0.8), 0 0 40px rgba(163, 230, 53, 0.4)',
                    zIndex: 10,
                  }}
                  animate={{
                    left: [`${step.position.x}%`, `${nextStep.position.x}%`],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: index * 0.4,
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Vertical workflow for mobile
export function VerticalWorkflowDiagram() {
  const verticalSteps: WorkflowStep[] = [
    { icon: Mail, title: 'Email Received', position: { x: 50, y: 10 } },
    { icon: Ticket, title: 'Ticket Created', position: { x: 50, y: 30 } },
    { icon: UserCheck, title: 'Auto-Assigned', position: { x: 50, y: 50 } },
    { icon: MessageSquare, title: 'Agent Response', position: { x: 50, y: 70 } },
    { icon: CheckCircle, title: 'Resolved', position: { x: 50, y: 90 } },
  ];

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {verticalSteps.map((step, index) => {
        const Icon = step.icon;
        const nextStep = verticalSteps[index + 1];
        
        return (
          <div key={index}>
            {/* Step Node */}
            <div
              className="absolute"
              style={{
                left: `${step.position.x}%`,
                top: `${step.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-2 border border-dotted border-white/20 rounded-full" />
                  <Icon className="w-7 h-7 text-white/70 relative z-10" />
                </div>
                <span className="text-sm text-white/60">{step.title}</span>
              </div>
            </div>

            {/* Connection Line */}
            {nextStep && (
              <>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1={`${step.position.x}%`}
                    y1={`${step.position.y}%`}
                    x2={`${nextStep.position.x}%`}
                    y2={`${nextStep.position.y}%`}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                </svg>

                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-accent-lime"
                  style={{
                    left: `${step.position.x}%`,
                    boxShadow: '0 0 20px rgba(163, 230, 53, 0.8), 0 0 40px rgba(163, 230, 53, 0.4)',
                  }}
                  animate={{
                    top: [`${step.position.y}%`, `${nextStep.position.y}%`],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: index * 0.4,
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
