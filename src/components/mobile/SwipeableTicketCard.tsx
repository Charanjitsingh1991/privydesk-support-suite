import { useState, useRef, ReactNode } from 'react';
import { Archive, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableTicketCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: ReactNode;
    label: string;
    color: string;
  };
  className?: string;
  disabled?: boolean;
}

const DEFAULT_LEFT_ACTION = {
  icon: <Archive className="h-5 w-5" />,
  label: 'Archive',
  color: 'bg-muted-foreground',
};

const DEFAULT_RIGHT_ACTION = {
  icon: <CheckCircle className="h-5 w-5" />,
  label: 'Resolve',
  color: 'bg-success',
};

export function SwipeableTicketCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = DEFAULT_LEFT_ACTION,
  rightAction = DEFAULT_RIGHT_ACTION,
  className,
  disabled = false,
}: SwipeableTicketCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;
  const maxSwipe = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Apply resistance at edges
    const resistedDiff = diff > 0
      ? Math.min(diff * 0.8, maxSwipe)
      : Math.max(diff * 0.8, -maxSwipe);
    
    setTranslateX(resistedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    if (translateX > threshold && onSwipeRight) {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
      onSwipeRight();
    } else if (translateX < -threshold && onSwipeLeft) {
      if (navigator.vibrate) navigator.vibrate(10);
      onSwipeLeft();
    }

    setTranslateX(0);
  };

  const leftProgress = Math.min(Math.max(-translateX / threshold, 0), 1);
  const rightProgress = Math.min(Math.max(translateX / threshold, 0), 1);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-lg', className)}
    >
      {/* Left action background (swipe left reveals) */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end px-4 text-white transition-opacity',
          leftAction.color
        )}
        style={{
          width: Math.abs(Math.min(translateX, 0)) + 20,
          opacity: leftProgress,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {leftAction.icon}
          <span className="text-xs font-medium">{leftAction.label}</span>
        </div>
      </div>

      {/* Right action background (swipe right reveals) */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex items-center justify-start px-4 text-white transition-opacity',
          rightAction.color
        )}
        style={{
          width: Math.max(translateX, 0) + 20,
          opacity: rightProgress,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {rightAction.icon}
          <span className="text-xs font-medium">{rightAction.label}</span>
        </div>
      </div>

      {/* Card content */}
      <div
        className="relative bg-background transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transitionDuration: isDragging ? '0ms' : '200ms',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
