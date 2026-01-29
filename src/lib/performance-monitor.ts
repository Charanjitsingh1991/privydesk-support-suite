export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  private constructor() {
    this.initializeWebVitals();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime, {
            element: (lastEntry as any).element?.tagName,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime, {
              eventType: entry.name,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }
  }

  startMeasure(name: string): void {
    this.marks.set(name, performance.now());
  }

  endMeasure(name: string, metadata?: Record<string, unknown>): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.recordMetric(name, duration, metadata);
    this.marks.delete(name);
    return duration;
  }

  recordMetric(name: string, duration: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  getReport(): {
    totalMetrics: number;
    averages: Record<string, number>;
    slowest: PerformanceMetric[];
  } {
    const metricsByName = new Map<string, number[]>();
    
    this.metrics.forEach(metric => {
      if (!metricsByName.has(metric.name)) {
        metricsByName.set(metric.name, []);
      }
      metricsByName.get(metric.name)!.push(metric.duration);
    });

    const averages: Record<string, number> = {};
    metricsByName.forEach((durations, name) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      averages[name] = Math.round(avg * 100) / 100;
    });

    const slowest = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalMetrics: this.metrics.length,
      averages,
      slowest,
    };
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export const startMeasure = (name: string) => performanceMonitor.startMeasure(name);
export const endMeasure = (name: string, metadata?: Record<string, unknown>) => 
  performanceMonitor.endMeasure(name, metadata);
export const recordMetric = (name: string, duration: number, metadata?: Record<string, unknown>) =>
  performanceMonitor.recordMetric(name, duration, metadata);

// React Hook for measuring component render time
export function useMeasureRender(componentName: string) {
  if (typeof window === 'undefined') return;

  const measureId = `${componentName}-render`;
  startMeasure(measureId);

  // Cleanup and measure on unmount
  return () => {
    endMeasure(measureId, { component: componentName });
  };
}

// Decorator for measuring async function execution
export function measureAsync<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    startMeasure(name);
    try {
      const result = await fn(...args);
      endMeasure(name, { success: true });
      return result;
    } catch (error) {
      endMeasure(name, { success: false, error: String(error) });
      throw error;
    }
  }) as T;
}
