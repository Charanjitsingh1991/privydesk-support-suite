/**
 * PRIVYDESK Design System - Design Tokens
 * Premium 5D-style SaaS Platform
 * World-class UI/UX with glassmorphism and fluid animations
 */

export const designTokens = {
  // ============================================
  // COLOR PALETTE
  // ============================================
  colors: {
    // Background
    background: {
      base: 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 100%)',
      baseStart: '#0a0a0f',
      baseEnd: '#1a0b2e',
      overlay: 'rgba(10, 10, 15, 0.8)',
    },

    // Glass Surfaces
    glass: {
      base: 'rgba(255, 255, 255, 0.03)',
      hover: 'rgba(255, 255, 255, 0.05)',
      active: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
    },

    // Gradient Accents
    gradient: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
      primaryStart: '#8b5cf6',
      primaryEnd: '#06b6d4',
      secondary: 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
      secondaryStart: '#f43f5e',
      secondaryEnd: '#f97316',
      success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    },

    // Text
    text: {
      primary: '#ffffff',
      secondary: 'rgba(229, 231, 235, 0.85)',
      tertiary: 'rgba(229, 231, 235, 0.6)',
      disabled: 'rgba(229, 231, 235, 0.4)',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    },

    // Status Colors
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
    },

    // Priority Colors
    priority: {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#f97316',
      urgent: '#ef4444',
    },

    // Ticket Status
    ticketStatus: {
      open: '#06b6d4',
      in_progress: '#8b5cf6',
      waiting_customer: '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      sans: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    base: 4,
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // ============================================
  // LAYOUT
  // ============================================
  layout: {
    sidebar: {
      width: '280px',
      widthCollapsed: '80px',
    },
    header: {
      height: '64px',
    },
    container: {
      maxWidth: '1440px',
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
  },

  // ============================================
  // SHADOWS & DEPTH
  // ============================================
  shadows: {
    // Card Shadows
    card: {
      base: '0 20px 60px rgba(0, 0, 0, 0.3)',
      hover: '0 30px 90px rgba(0, 0, 0, 0.4)',
      active: '0 10px 40px rgba(0, 0, 0, 0.25)',
    },

    // Glow Effects
    glow: {
      primary: '0 0 40px rgba(139, 92, 246, 0.3)',
      primaryStrong: '0 0 60px rgba(139, 92, 246, 0.5)',
      secondary: '0 0 40px rgba(244, 63, 94, 0.3)',
      success: '0 0 40px rgba(16, 185, 129, 0.3)',
      warning: '0 0 40px rgba(245, 158, 11, 0.3)',
      error: '0 0 40px rgba(239, 68, 68, 0.3)',
    },

    // Inner Glow
    innerGlow: {
      primary: 'inset 0 0 60px rgba(139, 92, 246, 0.1)',
      secondary: 'inset 0 0 60px rgba(244, 63, 94, 0.1)',
    },

    // Text Glow
    textGlow: {
      primary: '0 0 20px rgba(139, 92, 246, 0.5)',
      white: '0 0 20px rgba(255, 255, 255, 0.3)',
    },
  },

  // ============================================
  // BACKDROP BLUR
  // ============================================
  blur: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    // Durations
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
      slower: '0.8s',
    },

    // Easing Functions (Cubic Bezier)
    easing: {
      // Standard easing
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      // Deceleration (ease-out)
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      // Acceleration (ease-in)
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      // Sharp (for exits)
      sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      // Smooth (for entrances)
      smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      // Spring-like
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      // Bounce
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Framer Motion Variants
    variants: {
      // Page transitions
      page: {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.98 },
      },

      // Fade in
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },

      // Slide up
      slideUp: {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -40 },
      },

      // Scale
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      },

      // Stagger children
      stagger: {
        animate: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      },
    },

    // Transition configs
    transitions: {
      page: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      smooth: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
      spring: { type: 'spring', stiffness: 300, damping: 30 },
      springBouncy: { type: 'spring', stiffness: 400, damping: 20 },
    },
  },

  // ============================================
  // Z-INDEX LAYERS
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type DesignTokens = typeof designTokens;
export type ColorPalette = typeof designTokens.colors;
export type Typography = typeof designTokens.typography;
export type Spacing = typeof designTokens.spacing;
export type Shadows = typeof designTokens.shadows;
export type Animations = typeof designTokens.animations;
