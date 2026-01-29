/**
 * Grid Pattern Component
 * Creates dotted/grid background patterns for fintech aesthetic
 */

import { motion } from 'framer-motion';

interface GridPatternProps {
  variant?: 'dots' | 'grid' | 'lines';
  className?: string;
  animate?: boolean;
}

export function GridPattern({ variant = 'dots', className = '', animate = false }: GridPatternProps) {
  if (variant === 'dots') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(163, 230, 53, 0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    );
  }

  // Lines variant
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(163, 230, 53, 0.1) 49px, rgba(163, 230, 53, 0.1) 50px)',
        }}
        animate={animate ? {
          backgroundPosition: ['0px 0px', '0px 50px'],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Dotted background with fade effect
export function DottedBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Dots pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(163, 230, 53, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Fade overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 10, 10, 0.8) 100%)',
        }}
      />
    </div>
  );
}

// Animated grid lines
export function AnimatedGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163, 230, 53, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163, 230, 53, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
