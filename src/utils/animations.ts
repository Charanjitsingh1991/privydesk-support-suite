/**
 * Animation Utilities
 * Reusable Framer Motion animation configurations
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1],
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideInRightVariants: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const slideInLeftVariants: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleInVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const scaleUpVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
};

// ============================================
// STAGGER ANIMATIONS
// ============================================

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// ============================================
// MODAL/OVERLAY ANIMATIONS
// ============================================

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================

export const notificationVariants: Variants = {
  initial: { opacity: 0, x: 100, scale: 0.8 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 100, scale: 0.8 },
};

// ============================================
// TRANSITIONS
// ============================================

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1],
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const springBouncyTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
};

export const slowTransition: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

// ============================================
// HOVER ANIMATIONS
// ============================================

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 },
};

export const hoverLift = {
  y: -5,
  boxShadow: '0 30px 90px rgba(0, 0, 0, 0.4)',
  transition: { duration: 0.2 },
};

export const hoverGlow = {
  boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
  transition: { duration: 0.2 },
};

// ============================================
// TAP ANIMATIONS
// ============================================

export const tapScale = {
  scale: 0.95,
};

export const tapScaleSmall = {
  scale: 0.98,
};

// ============================================
// LOADING ANIMATIONS
// ============================================

export const pulseVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get transition based on user preference
 */
export const getTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 };
  }
  return transition;
};

/**
 * Get variants based on user preference
 */
export const getVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }
  return variants;
};
