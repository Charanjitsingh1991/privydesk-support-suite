/**
 * Scroll Animation Utilities
 * Intersection Observer based scroll animations
 */

import { useEffect, useState, RefObject } from 'react';

export interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect if element is in viewport
 */
export const useInView = (
  ref: RefObject<HTMLElement>,
  options: ScrollAnimationOptions = {}
): boolean => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold, rootMargin, triggerOnce]);

  return isInView;
};

/**
 * Hook for scroll progress (0 to 1)
 */
export const useScrollProgress = (): number => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / documentHeight, 1);
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

/**
 * Hook for element scroll progress
 */
export const useElementScrollProgress = (
  ref: RefObject<HTMLElement>
): number => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 when element enters viewport, 1 when it leaves)
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const scrollProgress = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight);
      
      setProgress(Math.max(0, Math.min(1, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
};

/**
 * Hook for parallax scroll effect
 */
export const useParallaxScroll = (speed: number = 0.5): number => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
};

/**
 * Stagger animation delay calculator
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  return index * baseDelay;
};

/**
 * Scroll to element smoothly
 */
export const scrollToElement = (
  element: HTMLElement | null,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
) => {
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.scrollY - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior,
  });
};

/**
 * Scroll to top
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior,
  });
};

/**
 * Check if element is near viewport (for preloading)
 */
export const useIsNearViewport = (
  ref: RefObject<HTMLElement>,
  distance: number = 200
): boolean => {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNear(entry.isIntersecting);
      },
      { rootMargin: `${distance}px` }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, distance]);

  return isNear;
};
