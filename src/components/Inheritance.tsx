import React, { useState, useEffect, useRef } from 'react';
import { ArchivalImage } from './ArchivalImage';
import { VisitorFragment } from './ThePresent';
import { useCollection } from '../context/CollectionContext';
import { isReducedMotion } from '../utils/motion';

interface InheritanceProps {
  fragments: VisitorFragment[];
  onOpenArtifact: (id: string) => void;
  onBackToTop: () => void;
}

const BOOKEND_OFFSETS = [-14, 18, -12, 16, -15, 11, -17]; // vw offsets for SLICE-LOCK

export const Inheritance: React.FC<InheritanceProps> = ({
  fragments,
  onOpenArtifact,
  onBackToTop,
}) => {
  const { keptArtifacts } = useCollection();
  const sectionRef = useRef<HTMLElement>(null);
  const [sectionEntered, setSectionEntered] = useState<boolean>(false);
  const [lightSwept, setLightSwept] = useState<boolean>(false);
  const [bookendLocked, setBookendLocked] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [showFallbackInput, setShowFallbackInput] = useState<boolean>(false);

  // Trigger light shaft sweep and bookend slice-lock
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (isReducedMotion()) {
      setSectionEntered(true);
      setLightSwept(true);
      setBookendLocked(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionEntered(true);
          setTimeout(() => setLightSwept(true), 150);
          setTimeout(() => setBookendLocked(true), 800);
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'ARCHIVE — Digital Museum of Nigerian Creative History',
      text: 'NOTHING STAYS BURIED. A digital museum of Nigerian creative history — photography, music, fashion, design.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback: clipboard copy
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback('LINK COPIED TO CLIPBOARD');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setShowFallbackInput(true);
      setCopyFeedback('COPY URL BELOW:');
    }
  };

  return (
    <section
      ref={sectionRef}
      id="inheritance"
      data-ground="ink"
      aria-label="The Question & Inheritance"
      className="relative w-full min-h-[100svh] bg-[#11110F] text-[#F0E8D8] overflow-hidden flex flex-col justify-between"
    >
      {/* LAYER 1: inh-archive-boxes full-bleed, brightness ~45% */}
      <div className="absolute inset-0 z-0">
        <ArchivalImage
          src="/img/inh-archive-boxes.jpg"
          alt="Stack of archival storage boxes in preservation repository"
          discipline="inheritance"
          className="w-full h-full object-cover grayscale contrast-125 brightness-[0.45]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#11110F] via-black/40 to-[#11110F]/80 pointer-events-none"
        />
      </div>

      {/* Diagonal Light Shaft (skewed gradient div, screen blend sweeps across over 2s) */}
      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-0 w-[40vw] pointer-events-none z-10 mix-blend-screen opacity-45 will-change-transform"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(232, 240, 68, 0.25) 50%, transparent 100%)',
          transform: lightSwept || isReducedMotion()
            ? 'skewX(-26deg) translate3d(250vw, 0, 0)'
            : 'skewX(-26deg) translate3d(-100vw, 0, 0)',
          transition: isReducedMotion() ? 'none' : 'transform 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 px-6 py-28 md:px-16 flex-1 flex flex-col justify-center max-w-6xl">
        <div className="mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block mb-3">
            07 INHERITANCE
          </span>
        </div>

        {/* Closing question over three lines with MASK-RISE */}
        <h2 className="font-display-condensed text-[clamp(2.75rem,8.5vw,9.5rem)] leading-[0.88] text-[#F0E8D8] tracking-tight">
          <span className="block overflow-hidden">
            <span
              className="block transition-transform duration-900"
              style={{
                transform: sectionEntered || isReducedMotion() ? 'translateY(0%)' : 'translateY(110%)',
                transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
              }}
            >
              When they build the archive of our time,
            </span>
          </span>
          <span className="block font-whisper text-[clamp(3rem,9vw,10rem)] text-[#E4D9C0] italic font-normal py-1 overflow-hidden">
            <span
              className="block transition-transform duration-900"
              style={{
                transform: sectionEntered || isReducedMotion() ? 'translateY(0%)' : 'translateY(110%)',
                transitionDelay: '120ms',
                transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
              }}
            >
              what will they
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="block transition-transform duration-900"
              style={{
                transform: sectionEntered || isReducedMotion() ? 'translateY(0%)' : 'translateY(110%)',
                transitionDelay: '240ms',
                transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
              }}
            >
              find?
            </span>
          </span>
        </h2>

        {/* Closing line in vermilion */}
        <p className="font-display-wide text-2xl sm:text-3xl md:text-5xl text-[#E43D27] mt-8 font-bold tracking-tight">
          The next archive is being made right now.
        </p>

        {/* Interactive Archival Box trigger */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => onOpenArtifact('inh-archive-boxes')}
            className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-[#8B8982] hover:text-[#E8F044] transition-colors cursor-pointer"
          >
            <span className="w-4 h-[1px] bg-[#8B8982]" />
            <span>Inspect fragment: inh-archive-boxes [Preservation Repository]</span>
          </button>
        </div>

        {/* ========================================================
            ACCESSION PILE (Kept cards from session + visitor fragments)
        ======================================================== */}
        <div className="mt-12 pt-8 border-t border-[#333330]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block">
              ACCESSION PILE ({keptArtifacts.length + fragments.length} OBJECTS)
            </span>
            <span className="font-mono text-[11px] text-[#8B8982] uppercase">
              {keptArtifacts.length} KEPT FROM ARCHIVE · {fragments.length} VISITOR TESTIMONIES
            </span>
          </div>

          {keptArtifacts.length === 0 && fragments.length === 0 ? (
            <p className="font-whisper text-xl text-[#8B8982] italic">
              Keep a card above or deposit a visitor fragment in The Present to build your archive pile.
            </p>
          ) : (
            <div className="relative flex flex-wrap gap-4 items-start min-h-[220px] p-4 bg-[#141412] border border-[#2a2a26]">
              {/* Kept Archival Cards in Pile */}
              {keptArtifacts.map((art, idx) => (
                <div
                  key={`kept-${art.id}`}
                  className="w-44 sm:w-52 p-2 bg-[#F0E8D8] border border-[#11110F] shadow-2xl transition-all duration-700 select-none hover:scale-105"
                  style={{
                    transform: isReducedMotion() ? 'none' : `rotate(${(idx % 2 === 0 ? -1 : 1) * (3 + (idx % 4))}deg)`,
                    zIndex: idx + 1,
                  }}
                >
                  <div className="w-full aspect-[4/5] bg-[#11110F] overflow-hidden mb-1">
                    <img
                      src={art.file}
                      alt={art.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-between items-baseline text-[9px] font-mono text-[#11110F] font-bold">
                    <span className="text-[#E43D27] uppercase">ACC. {art.id.toUpperCase()}</span>
                    <span className="uppercase">{art.discipline}</span>
                  </div>
                  <span className="block font-hanken font-bold text-xs text-[#11110F] truncate mt-0.5">
                    {art.title}
                  </span>
                </div>
              ))}

              {/* Visitor Submitted Fragments in Pile */}
              {fragments.map((frag, idx) => (
                <div
                  key={frag.id}
                  className="w-48 sm:w-56 p-2 bg-[#F0E8D8] border border-[#11110F] shadow-2xl transition-all duration-700 will-change-transform"
                  style={{
                    transform: `rotate(${frag.rotation}deg) translate3d(0, 0, 0)`,
                    zIndex: keptArtifacts.length + idx + 1,
                  }}
                >
                  <img
                    src={frag.dataUrl}
                    alt={frag.code}
                    className="w-full h-auto object-cover border border-[#11110F]"
                  />
                  <div className="mt-1 text-[9px] font-mono text-[#11110F] font-bold flex justify-between">
                    <span>{frag.code}</span>
                    <span>{frag.discipline}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons: Share ARCHIVE + Back to the start */}
        <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[56px] px-8 bg-[#E8F044] text-[#11110F] font-display-condensed text-xl tracking-wider hover:bg-[#F0E8D8] transition-colors cursor-pointer flex items-center justify-center font-bold"
            aria-label="Share ARCHIVE exhibition"
          >
            {copyFeedback || 'Share ARCHIVE'}
          </button>
          <button
            type="button"
            onClick={onBackToTop}
            className="min-h-[56px] px-8 bg-transparent border-2 border-[#F0E8D8] text-[#F0E8D8] font-display-condensed text-xl tracking-wider hover:bg-[#F0E8D8] hover:text-[#11110F] transition-colors cursor-pointer flex items-center justify-center font-bold"
            aria-label="Back to the start of the archive"
          >
            Back to the start ↑
          </button>
        </div>

        {/* Fallback copy input if clipboard is blocked */}
        {showFallbackInput && (
          <div className="mt-4 flex items-center gap-2 max-w-md">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              onFocus={(e) => e.target.select()}
              className="w-full p-2 bg-[#1c1c18] border border-[#E8F044] text-[#F0E8D8] font-mono text-xs"
            />
          </div>
        )}
      </div>

      {/* Bookend: Giant ARCHIVE wordmark SLICE-LOCK into perfectly clean cream wordmark */}
      <div
        aria-hidden="true"
        className="relative z-10 w-full overflow-hidden select-none pointer-events-none translate-y-1/4"
      >
        <div className="relative w-full h-[clamp(5rem,18vw,20rem)] flex items-center justify-center">
          {BOOKEND_OFFSETS.map((offsetVw, idx) => {
            const topPct = (idx * 100) / 7;
            const bottomPct = 100 - ((idx + 1) * 100) / 7;
            return (
              <span
                key={idx}
                className="absolute inset-0 flex items-center justify-center font-display-condensed text-[clamp(6rem,24vw,26rem)] text-[#F0E8D8]/20 leading-[0.72] tracking-tighter whitespace-nowrap will-change-transform transition-transform duration-900"
                style={{
                  clipPath: `inset(${topPct}% 0% ${bottomPct}% 0%)`,
                  transform: bookendLocked || isReducedMotion()
                    ? 'translateX(0vw)'
                    : `translateX(${offsetVw}vw)`,
                  transitionDelay: `${idx * 40}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
                }}
              >
                ARCHIVE
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
};
