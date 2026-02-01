import { lazy, Suspense, ComponentType } from 'react';

/**
 * Lazy load component with loading fallback
 * Usage: const MyComponent = lazyLoad(() => import('./MyComponent'))
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Default loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-accent-lime border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Preload a lazy-loaded component
 * Usage: preloadComponent(() => import('./MyComponent'))
 */
export function preloadComponent(importFunc: () => Promise<any>) {
  importFunc();
}
