/**
 * AnimatedBackground Component
 * Premium animated gradient mesh background with floating particles
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'both';
  intensity?: 'low' | 'medium' | 'high';
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'both',
  intensity = 'medium',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant === 'gradient') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle configuration based on intensity
    const particleConfig = {
      low: { count: 30, speed: 0.3, size: 2 },
      medium: { count: 50, speed: 0.5, size: 3 },
      high: { count: 80, speed: 0.8, size: 4 },
    };

    const config = particleConfig[intensity];

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * config.size + 1;
        this.speedX = (Math.random() - 0.5) * config.speed;
        this.speedY = (Math.random() - 0.5) * config.speed;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;

        // Create gradient for particle
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.size
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(6, 182, 212, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < config.count; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach((particleB) => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, intensity]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      {(variant === 'gradient' || variant === 'both') && (
        <>
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg-base-start to-bg-base-end" />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Particle Canvas */}
      {(variant === 'particles' || variant === 'both') && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.6 }}
        />
      )}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// Reduced motion variant for accessibility
export const AnimatedBackgroundReduced: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-base-start to-bg-base-end" />
      <div
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
};
