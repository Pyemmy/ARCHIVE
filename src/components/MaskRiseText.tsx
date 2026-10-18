import React, { useEffect, useRef, useState } from 'react';
import { isReducedMotion } from '../utils/motion';

interface MaskRiseTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  staggerMs?: number;
  threshold?: number;
  delayMs?: number;
}

export const MaskRiseText: React.FC<MaskRiseTextProps> = ({
  children,
  as: Component = 'h2',
  className = '',
  staggerMs = 30,
  threshold = 0.15,
  delayMs = 0,
}) => {
  const [risen, setRisen] = useState<boolean>(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isReducedMotion()) {
      setRisen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setRisen(true), delayMs);
          } else {
            setRisen(true);
          }
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delayMs]);

  const words = children.split(' ');

  return (
    <Component ref={containerRef as any} className={className}>
      {words.map((word, idx) => (
        <span key={idx} className="mask-rise-overflow mr-[0.25em] last:mr-0">
          <span
            className={`mask-rise-item ${risen ? 'risen' : ''}`}
            style={{
              transitionDelay: `${idx * staggerMs}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
};
