/**
 * Mouse Parallax Utilities
 * 3D tilt effect based on mouse position
 */

import { useEffect, useState, RefObject } from 'react';
import { useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

export interface ParallaxOptions {
  maxRotation?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
}

export interface ParallaxReturn {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseLeave: () => void;
}

/**
 * Hook for 3D mouse parallax effect
 */
export const useMouseParallax = (
  ref: RefObject<HTMLElement>,
  options: ParallaxOptions = {}
): ParallaxReturn => {
  const {
    maxRotation = 10,
    springConfig = { stiffness: 300, damping: 30 },
  } = options;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [maxRotation, -maxRotation]),
    springConfig
  );

  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxRotation, maxRotation]),
    springConfig
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
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
  };

  return {
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
  };
};

/**
 * Calculate parallax offset for layered elements
 */
export const calculateParallaxOffset = (
  mouseX: number,
  mouseY: number,
  depth: number
): { x: number; y: number } => {
  return {
    x: mouseX * depth,
    y: mouseY * depth,
  };
};

/**
 * Hook for cursor tracking
 */
export const useCursorTracking = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
};

/**
 * Magnetic button effect - button follows cursor when nearby
 */
export const useMagneticEffect = (
  ref: RefObject<HTMLElement>,
  strength: number = 0.3
) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    x: springX,
    y: springY,
    handleMouseMove,
    handleMouseLeave,
  };
};
