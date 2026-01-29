/**
 * GlassCard Component
 * Premium glassmorphism card with 3D tilt effect and glow
 */

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover3D?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'gradient-border';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover3D = false,
  glowOnHover = false,
  onClick,
  padding = 'lg',
  variant = 'default',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for smooth movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3D || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 lg:p-8',
  };

  const variantClasses = {
    default: 'bg-glass-base border border-glass-border',
    bordered: 'bg-glass-base border-2 border-glass-border',
    'gradient-border': 'bg-glass-base relative before:absolute before:inset-0 before:rounded-glass before:p-[1px] before:bg-gradient-to-r before:from-gradient-primary-start before:to-gradient-primary-end before:-z-10',
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'rounded-glass backdrop-blur-glass transition-all duration-300',
        variantClasses[variant],
        paddingClasses[padding],
        hover3D && 'transform-gpu perspective-1000',
        glowOnHover && isHovered && 'shadow-glow-primary',
        onClick && 'cursor-pointer',
        className
      )}
      style={hover3D ? {
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      } : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={!hover3D ? {
        scale: 1.02,
        boxShadow: glowOnHover ? '0 0 40px rgba(139, 92, 246, 0.3)' : '0 30px 90px rgba(0, 0, 0, 0.4)',
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Preset variants for common use cases
export const StatCard: React.FC<GlassCardProps> = (props) => (
  <GlassCard hover3D glowOnHover {...props} />
);

export const TicketCard: React.FC<GlassCardProps> = (props) => (
  <GlassCard hover3D variant="bordered" {...props} />
);

export const ModalCard: React.FC<GlassCardProps> = (props) => (
  <GlassCard variant="gradient-border" padding="lg" {...props} />
);
