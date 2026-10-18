import React, { useEffect, useRef, useState } from 'react';
import { DISCIPLINE_FALLBACKS, Discipline } from '../data/artifacts';
import { isReducedMotion } from '../utils/motion';

interface ArchivalImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  discipline?: Discipline;
  sacred?: boolean;
  eager?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  fallbackSrc?: string;
  className?: string;
  enableDevelop?: boolean;
  delayMs?: number;
  dominantColor?: string;
}

const DOMINANT_DISCIPLINE_COLORS: Record<Discipline, string> = {
  photography: '#1e1c1a',
  music: '#1c1816',
  fashion: '#231e1c',
  design: '#241e1a',
  now: '#181816',
  inheritance: '#1a1917',
};

export const ArchivalImage: React.FC<ArchivalImageProps> = ({
  src,
  alt,
  discipline,
  sacred = false,
  eager = false,
  fetchPriority,
  fallbackSrc,
  className = '',
  enableDevelop = false, // Default visible at rest
  delayMs = 0,
  dominantColor,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isDeveloped, setIsDeveloped] = useState<boolean>(!enableDevelop || eager || sacred);
  const wrapRef = useRef<HTMLDivElement>(null);

  const bgColor =
    dominantColor ||
    (discipline ? DOMINANT_DISCIPLINE_COLORS[discipline] : '#1c1b18');

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!enableDevelop || eager || sacred) {
      setIsDeveloped(true);
      return;
    }

    if (isReducedMotion()) {
      setIsDeveloped(true);
      return;
    }

    // Safety fallback: if observer hasn't fired in 1200ms, show everything unconditionally
    const safetyTimer = setTimeout(() => {
      setIsDeveloped(true);
    }, 1200);

    const el = wrapRef.current;
    if (!el) return () => clearTimeout(safetyTimer);

    // rootMargin '0px 0px 25% 0px', threshold 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setIsDeveloped(true), delayMs);
          } else {
            setIsDeveloped(true);
          }
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px 25% 0px', threshold: 0 }
    );

    observer.observe(el);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [enableDevelop, eager, sacred, delayMs]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback =
        fallbackSrc ||
        (discipline ? DISCIPLINE_FALLBACKS[discipline] : '/img/ph-darkroom.jpg');
      if (fallback && fallback !== currentSrc) {
        setCurrentSrc(fallback);
      }
    }
  };

  const imageFilterClass = sacred
    ? 'sacred object-contain'
    : 'photo-archival';

  // For eager or sacred images or when develop is disabled, render direct image inside dominant-color container
  if (!enableDevelop || eager || sacred) {
    return (
      <div
        className="w-full h-full overflow-hidden relative"
        style={{ backgroundColor: bgColor }}
      >
        <img
          src={currentSrc}
          alt={alt || 'Archival photographic still-life'}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          fetchPriority={fetchPriority}
          onError={handleError}
          className={`w-full h-full ${imageFilterClass} ${className}`}
          {...rest}
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={`develop-wrap w-full h-full relative overflow-hidden ${
        isDeveloped ? 'developed' : ''
      }`}
      style={{
        backgroundColor: bgColor,
        transition: 'clip-path 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        clipPath: isDeveloped ? 'inset(0% 0% 0% 0%)' : 'inset(10% 0% 0% 0%)',
      }}
    >
      <img
        src={currentSrc}
        alt={alt || 'Archival photographic still-life'}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        fetchPriority={fetchPriority}
        onError={handleError}
        className={`w-full h-full ${imageFilterClass} ${className}`}
        {...rest}
      />
    </div>
  );
};
