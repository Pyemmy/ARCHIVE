import { useEffect, useRef, useState } from 'react';

export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    document.documentElement.getAttribute('data-reduced-motion') === 'true' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
};

/**
 * One-shot IntersectionObserver that unobserves immediately after firing.
 */
export const useOneShotObserver = (
  callback: () => void,
  options: IntersectionObserverInit = { threshold: 0.2 }
) => {
  const targetRef = useRef<any>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (isReducedMotion()) {
      callback();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(el);
        observer.disconnect();
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

/**
 * Hook to trigger DEVELOP reveal on an element
 */
export const useDevelopReveal = (delayMs: number = 0) => {
  const [developed, setDeveloped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isReducedMotion()) {
      setDeveloped(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setDeveloped(true), delayMs);
          } else {
            setDeveloped(true);
          }
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return { ref, developed };
};
