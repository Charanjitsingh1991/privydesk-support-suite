/**
 * GradientButton Component
 * Premium button with gradient background, glow effects, and ripple animation
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end shadow-glow-primary hover:shadow-glow-primary-strong',
    secondary: 'bg-gradient-to-r from-gradient-secondary-start to-gradient-secondary-end shadow-glow-secondary',
    success: 'bg-gradient-to-r from-success to-success-light shadow-glow-success',
    warning: 'bg-gradient-to-r from-warning to-warning-light shadow-glow-warning',
    error: 'bg-gradient-to-r from-error to-error-light shadow-glow-error',
    ghost: 'bg-glass-base border border-glass-border hover:bg-glass-hover',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-glass font-semibold text-white',
        'transition-all duration-300 ease-smooth',
        'focus:outline-none focus:ring-2 focus:ring-primary-violet focus:ring-offset-2 focus:ring-offset-bg-base-start',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </span>

      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </motion.button>
  );
};

// Icon-only button variant
export const GradientIconButton: React.FC<Omit<GradientButtonProps, 'children'> & { icon: React.ReactNode }> = ({
  icon,
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  return (
    <GradientButton
      {...props}
      size={size}
      className={cn(sizeClasses[size], 'rounded-full', props.className)}
    >
      {icon}
    </GradientButton>
  );
};
