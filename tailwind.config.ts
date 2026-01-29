import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        // Legacy support
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Premium Design System Colors
        'bg-base-start': '#0a0a0f',
        'bg-base-end': '#1a0b2e',
        
        // Glass surfaces
        glass: {
          base: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.05)',
          active: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.1)',
          'border-hover': 'rgba(255, 255, 255, 0.2)',
        },
        
        // Gradient colors
        'gradient-primary-start': '#8b5cf6',
        'gradient-primary-end': '#06b6d4',
        'gradient-secondary-start': '#f43f5e',
        'gradient-secondary-end': '#f97316',
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          rose: '#f43f5e',
          orange: '#f97316',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
          light: '#34d399',
        },
        warning: {
          DEFAULT: '#f59e0b',
          foreground: '#ffffff',
          light: '#fbbf24',
        },
        error: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
          light: '#f87171',
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        status: {
          open: '#06b6d4',
          'in-progress': '#8b5cf6',
          waiting: '#f59e0b',
          resolved: '#10b981',
          closed: '#6b7280',
        },
        priority: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          urgent: '#ef4444',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'glass': '12px',
        'glass-lg': '16px',
        'glass-xl': '24px',
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        // Card shadows
        'card': '0 20px 60px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 30px 90px rgba(0, 0, 0, 0.4)',
        'card-active': '0 10px 40px rgba(0, 0, 0, 0.25)',
        // Glow effects
        'glow-primary': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-primary-strong': '0 0 60px rgba(139, 92, 246, 0.5)',
        'glow-secondary': '0 0 40px rgba(244, 63, 94, 0.3)',
        'glow-success': '0 0 40px rgba(16, 185, 129, 0.3)',
        'glow-warning': '0 0 40px rgba(245, 158, 11, 0.3)',
        'glow-error': '0 0 40px rgba(239, 68, 68, 0.3)',
        // Inner glow
        'inner-glow-primary': 'inset 0 0 60px rgba(139, 92, 246, 0.1)',
        'inner-glow-secondary': 'inset 0 0 60px rgba(244, 63, 94, 0.1)',
      },
      backdropBlur: {
        'glass': '24px',
        'glass-sm': '16px',
        'glass-lg': '32px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Premium animations
        "float": {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "pulse-glow": {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        "shimmer": {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        "gradient-shift": {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        "slide-in-right": {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        "slide-in-left": {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        "scale-in": {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        "fade-in": {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
