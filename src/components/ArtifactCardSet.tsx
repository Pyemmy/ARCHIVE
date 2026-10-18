import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ARTIFACTS, Artifact } from '../data/artifacts';
import { ArtifactCard } from './ArtifactCard';
import { isReducedMotion } from '../utils/motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDealt, setIsDealt] = useState<boolean>(false);
  const [threadDrawn, setThreadDrawn] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

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

  // Update activeIndex when user swipes or scrolls on mobile
  const handleMobileScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width > 0) {
      const idx = Math.round(el.scrollLeft / width);
      const clamped = Math.max(0, Math.min(artifacts.length - 1, idx));
      setActiveIndex(clamped);
    }
  }, [artifacts.length]);

  const scrollToCard = useCallback((idx: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({
      left: idx * width,
      behavior: isReducedMotion() ? 'auto' : 'smooth',
    });
    setActiveIndex(idx);
  }, []);

  const handlePrev = useCallback(() => {
    scrollToCard(Math.max(0, activeIndex - 1));
  }, [activeIndex, scrollToCard]);

  const handleNext = useCallback(() => {
    scrollToCard(Math.min(artifacts.length - 1, activeIndex + 1));
  }, [activeIndex, artifacts.length, scrollToCard]);

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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-current/25 pb-3 mb-6 sm:mb-8">
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

      {/* Connecting 1px Vermilion SVG Set Thread (desktop) */}
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
            - Full responsive grid spanning to the edges of the frame
          Mobile:
            - Clean 100% width card carousel without ugly browser scrollbars or cut-off side cards */}
      <div
        ref={scrollContainerRef}
        onScroll={handleMobileScroll}
        className={`w-full ${
          isFourUp
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5'
            : 'grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8'
        } max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-0 max-md:pb-2 max-md:pt-1 max-md:scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      >
        {artifacts.map((artifact, index) => (
          <div
            key={artifact.id}
            className="w-full max-md:min-w-full max-md:max-w-full max-md:w-full max-md:shrink-0 max-md:snap-center max-md:px-1"
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

      {/* Fancy Mobile Navigation Deck (replaces the ugly browser scrollbar and peeking card) */}
      <div className="md:hidden mt-5 flex flex-col gap-3 select-none">
        {/* Status line: Active Card Index & Title */}
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#E43D27] inline-block" />
            <span className="font-bold text-[#E8F044] tracking-widest uppercase">
              CARD {activeIndex + 1} OF {total}
            </span>
          </div>
          <span className="opacity-75 uppercase tracking-wider text-[11px] truncate max-w-[190px]">
            {artifacts[activeIndex]?.title}
          </span>
        </div>

        {/* Segmented Progress Indicator Bar */}
        <div className="flex gap-1.5 w-full px-1">
          {artifacts.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToCard(i)}
              aria-label={`Go to card ${i + 1}`}
              className={`h-1.5 flex-1 transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'bg-[#E8F044] shadow-xs'
                  : i < activeIndex
                  ? 'bg-[#E43D27]'
                  : 'bg-current/25'
              }`}
            />
          ))}
        </div>

        {/* Fancy Navigation Buttons: Prev & Next */}
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous card"
            className={`min-h-[44px] flex-1 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold border transition-all flex items-center justify-center gap-2 ${
              activeIndex === 0
                ? 'opacity-30 cursor-not-allowed border-current/20'
                : 'border-current/40 bg-current/5 hover:bg-current/10 active:scale-[0.98] cursor-pointer'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === total - 1}
            aria-label="Next card"
            className={`min-h-[44px] flex-1 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold border transition-all flex items-center justify-center gap-2 ${
              activeIndex === total - 1
                ? 'opacity-30 cursor-not-allowed border-current/20'
                : 'bg-[#E8F044] text-[#11110F] border-[#11110F] shadow-md hover:bg-[#F0E8D8] active:scale-[0.98] cursor-pointer'
            }`}
          >
            <span>Next ({activeIndex + 1}/{total})</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
