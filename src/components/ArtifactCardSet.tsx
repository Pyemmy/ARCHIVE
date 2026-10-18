import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ARTIFACTS, Artifact } from '../data/artifacts';
import { ArtifactCard } from './ArtifactCard';
import { isReducedMotion } from '../utils/motion';

interface ArtifactCardSetProps {
  heading: string;
  descriptor?: string;
  artifactIds: string[];
  layout?: '3-up' | '4-up';
  onOpenDetail?: (id: string) => void;
  className?: string;
  id?: string;
}

export const ArtifactCardSet: React.FC<ArtifactCardSetProps> = ({
  heading,
  descriptor = 'AUTHENTICATED ACCESSION DOSSIER',
  artifactIds,
  layout = '3-up',
  onOpenDetail,
  className = '',
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [threadDrawn, setThreadDrawn] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const artifacts = artifactIds
    .map((aid) => ARTIFACTS.find((a) => a.id === aid))
    .filter((a): a is Artifact => Boolean(a));

  // Trigger Deal animation when set enters viewport
  useEffect(() => {
    if (isReducedMotion()) {
      setIsDealt(true);
      setThreadDrawn(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDealt(true);
          // Draw 1px vermilion set thread after the deal completes
          const threadTimer = window.setTimeout(() => {
            setThreadDrawn(true);
          }, 650);
          return () => clearTimeout(threadTimer);
        }
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleHoverChange = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  const total = artifacts.length;
  const isFourUp = layout === '4-up' || total === 4;

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full my-8 ${className}`}
      aria-label={`${heading} dossier`}
    >
      {/* Dossier Header: mono heading + short line */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-current/25 pb-3 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-[#E43D27] shrink-0" />
          <h3 className="font-mono text-xs uppercase tracking-widest font-bold">
            {heading}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] opacity-75 uppercase tracking-wider">
            {descriptor} · {total} ARTIFACTS
          </span>
          <span className="hidden sm:inline-block w-8 h-[1px] bg-current/30" />
        </div>
      </div>

      {/* Connecting 1px Vermilion SVG Set Thread: connects cards of the set in order and draws after deal */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute top-[280px] left-6 right-6 pointer-events-none z-0 overflow-visible"
      >
        <svg className="w-full h-2 overflow-visible" preserveAspectRatio="none">
          <line
            x1="8%"
            y1="50%"
            x2="92%"
            y2="50%"
            stroke="#E43D27"
            strokeWidth="1"
            strokeDasharray="1200"
            strokeDashoffset={threadDrawn || isReducedMotion() ? '0' : '1200'}
            className="transition-all duration-700 ease-out opacity-60"
          />
        </svg>
      </div>

      {/* Cards Deck / Grid
          Desktop:
            - 3-up: each ~28vw (md:grid-cols-3 max-w-[90vw] mx-auto)
            - 4-up: each ~21vw (lg:grid-cols-4 max-w-[92vw] mx-auto)
          Mobile:
            - Horizontal scroll-snap deck with each card 78vw and next card peeking */}
      <div
        className={`w-full ${
          isFourUp
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5'
            : 'grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8'
        } max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-5 max-md:pb-6 max-md:pt-2 max-md:scroll-smooth`}
      >
        {artifacts.map((artifact, index) => (
          <div
            key={artifact.id}
            className={`max-md:min-w-[78vw] max-md:max-w-[78vw] max-md:snap-center ${
              isFourUp ? 'lg:w-[21vw]' : 'md:w-[28vw]'
            }`}
          >
            <ArtifactCard
              artifact={artifact}
              index={index}
              totalCards={total}
              isDealt={isDealt}
              hoveredIndex={hoveredIndex}
              onHoverChange={handleHoverChange}
              onOpenDetail={onOpenDetail}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
