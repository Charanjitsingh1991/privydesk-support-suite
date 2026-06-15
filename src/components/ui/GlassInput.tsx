/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GlassInput Component
 * Premium input field with glassmorphism, floating label, and glow effects
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'bordered' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      variant = 'default',
      inputSize = 'md',
      className,
      disabled,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      onChange?.(e);
    };

    const variantClasses = {
      default: 'bg-glass-base border border-glass-border',
      bordered: 'bg-glass-base border-2 border-glass-border',
      filled: 'bg-glass-hover border border-transparent',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    };

    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          {/* Icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none z-10">
              {icon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref || inputRef}
            className={cn(
              'w-full rounded-glass backdrop-blur-glass',
              'text-white placeholder:text-white/40',
              'transition-all duration-300 ease-smooth',
              'focus:outline-none focus:ring-2 focus:ring-primary-violet/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              variantClasses[variant],
              sizeClasses[inputSize],
              icon && iconPosition === 'left' && 'pl-12',
              icon && iconPosition === 'right' && 'pr-12',
              label && 'pt-6',
              error && 'border-error focus:ring-error/50',
              isFocused && !error && 'border-glass-border-hover shadow-glow-primary',
              className
            )}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            animate={{
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
            {...(props as any)}
          />

          {/* Floating Label */}
          {label && (
            <motion.label
              className={cn(
                'absolute left-4 pointer-events-none transition-all duration-300',
                labelSizeClasses[inputSize],
                icon && iconPosition === 'left' && 'left-12',
                error ? 'text-error' : 'text-white/60',
                (isFocused || hasValue) && 'text-primary-violet'
              )}
              animate={{
                top: isFocused || hasValue ? '0.5rem' : '50%',
                y: isFocused || hasValue ? 0 : '-50%',
                fontSize: isFocused || hasValue ? '0.75rem' : undefined,
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {label}
            </motion.label>
          )}

          {/* Icon Right */}
          {icon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none z-10">
              {icon}
            </div>
          )}
        </div>

        {/* Error or Helper Text */}
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              className={cn(
                'mt-2 text-xs',
                error ? 'text-error' : 'text-white/60'
              )}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// Textarea variant
interface GlassTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  textareaSize?: 'sm' | 'md' | 'lg';
}

export const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      textareaSize = 'md',
      className,
      disabled,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[80px]',
      md: 'px-4 py-3 text-base min-h-[120px]',
      lg: 'px-5 py-4 text-lg min-h-[160px]',
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          <motion.textarea
            ref={ref}
            className={cn(
              'w-full rounded-glass backdrop-blur-glass resize-y',
              'bg-glass-base border border-glass-border',
              'text-white placeholder:text-white/40',
              'transition-all duration-300 ease-smooth',
              'focus:outline-none focus:ring-2 focus:ring-primary-violet/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[textareaSize],
              label && 'pt-6',
              error && 'border-error focus:ring-error/50',
              isFocused && !error && 'border-glass-border-hover shadow-glow-primary',
              className
            )}
            value={value}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            disabled={disabled}
            {...(props as any)}
          />

          {label && (
            <motion.label
              className={cn(
                'absolute left-4 top-4 pointer-events-none transition-all duration-300',
                error ? 'text-error' : 'text-white/60',
                (isFocused || hasValue) && 'text-primary-violet text-xs top-2'
              )}
            >
              {label}
            </motion.label>
          )}
        </div>

        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              className={cn('mt-2 text-xs', error ? 'text-error' : 'text-white/60')}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';
