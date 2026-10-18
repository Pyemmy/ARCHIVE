import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArchivalImage } from './ArchivalImage';
import { MagneticButton } from './MagneticButton';
import { isReducedMotion } from '../utils/motion';
import { ARTIFACTS } from '../data/artifacts';
import { Play, Pause } from 'lucide-react';

interface HeroSignalProps {
  introFinished: boolean;
  onEnter: () => void;
  onOpenArtifact: (id: string) => void;
}

const PROJECTOR_SLIDES = [
  { src: '/img/ph-darkroom.jpg', alt: 'Darkroom laboratory under safelight', num: '01/04' },
  { src: '/img/ph-hist-1.jpg', alt: 'Studio Portrait of a Chief and Attendants', num: '02/04' },
  { src: '/img/ph-hist-2.jpg', alt: 'Portrait of Two Women with Elaborate Hairstyles', num: '03/04' },
  { src: '/img/ph-hist-3.jpg', alt: 'Market Day Gathering along the Marina', num: '04/04' },
];

export const HeroSignal: React.FC<HeroSignalProps> = ({
  introFinished,
  onEnter,
  onOpenArtifact,
}) => {
  const [animStage, setAnimStage] = useState<number>(0);
  const lampRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Projector Hero state
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isProjectorPlaying, setIsProjectorPlaying] = useState<boolean>(true);
  const lastSwitchTimeRef = useRef<number>(Date.now());

  const hist1 = ARTIFACTS.find((a) => a.id === 'ph-hist-1');
  const hist2 = ARTIFACTS.find((a) => a.id === 'ph-hist-2');

  // Scroll drift offsets (first 100vh only)
  const [scrollOffsets, setScrollOffsets] = useState({
    headline: 0,
    sheet: 0,
    bg: 0,
  });

  useEffect(() => {
    if (!introFinished) return;
    if (isReducedMotion()) {
      setAnimStage(4);
      return;
    }

    setAnimStage(1);
    const t2 = setTimeout(() => setAnimStage(2), 200);
    const t3 = setTimeout(() => setAnimStage(3), 450);
    const t4 = setTimeout(() => setAnimStage(4), 900);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [introFinished]);

  // Projector Hero Timer (every 5s, 350ms crossfade, never faster than 1s)
  useEffect(() => {
    if (!isProjectorPlaying || isReducedMotion()) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - lastSwitchTimeRef.current < 1000) return; // Never flash faster than 1s

      lastSwitchTimeRef.current = now;
      setActiveSlide((prev) => (prev + 1) % PROJECTOR_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isProjectorPlaying]);

  const toggleProjector = useCallback(() => {
    setIsProjectorPlaying((prev) => !prev);
  }, []);

  // Pointer tracking for Safelight Lamp
  useEffect(() => {
    if (isReducedMotion()) return;

    let targetX = window.innerWidth * 0.7;
    let targetY = window.innerHeight * 0.4;
    let currentX = targetX;
    let currentY = targetY;
    let rafId: number;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        targetX = e.clientX;
        targetY = e.clientY;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const loop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      if (lampRef.current) {
        lampRef.current.style.transform = `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Scroll drift
  useEffect(() => {
    if (isReducedMotion()) return;

    let rafId: number;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (scrollY <= vh) {
        setScrollOffsets({
          headline: -(scrollY * 0.12),
          sheet: scrollY * 0.08,
          bg: scrollY * 0.06,
        });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="signal"
      data-ground="ink"
      aria-label="Signal"
      className="relative w-full h-[100svh] min-h-[640px] bg-[#11110F] text-[#F0E8D8] overflow-hidden select-none"
    >
      {/* 600px Safelight Lamp (desktop) with audio reactivity */}
      <div
        ref={lampRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] z-10 will-change-transform mix-blend-screen opacity-55"
        style={{
          background:
            'radial-gradient(circle, rgba(228,61,39,calc(0.7 + var(--level, 0) * 0.25)) 0%, rgba(232,240,68,0.2) 35%, rgba(228,61,39,0.05) 60%, transparent 75%)',
        }}
      />

      {/* LAYER 1: Projector Hero - 4 images cycling every 5s with 350ms crossfade & 5% Ken Burns drift */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          transform: `translate3d(0, ${scrollOffsets.bg}px, 0)`,
        }}
      >
        <div className="w-full h-full relative" style={{ backgroundColor: '#1a1614' }}>
          {PROJECTOR_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <div
                key={slide.src}
                aria-hidden={!isActive}
                className="absolute inset-0 transition-opacity duration-[350ms] ease-in-out will-change-transform"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isReducedMotion() ? 'none' : isActive ? 'scale(1.05)' : 'scale(1.0)',
                  transition: 'opacity 350ms ease-in-out, transform 5000ms ease-out',
                }}
              >
                <ArchivalImage
                  src={slide.src}
                  alt={slide.alt}
                  discipline="photography"
                  eager={idx <= 1}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  className="w-full h-full object-cover brightness-[0.52]"
                />
              </div>
            );
          })}
        </div>

        {/* Projector Controls & Counter Overlay */}
        <div className="absolute top-24 right-6 md:top-24 md:right-12 z-30 flex items-center gap-3 bg-[#11110F]/80 border border-[#333330] px-3 py-1.5 backdrop-blur-xs">
          <span className="font-mono text-xs text-[#E8F044] font-bold tracking-widest">
            PROJECTOR {PROJECTOR_SLIDES[activeSlide].num}
          </span>
          <button
            type="button"
            onClick={toggleProjector}
            aria-label={isProjectorPlaying ? 'Pause hero projector rotation' : 'Play hero projector rotation'}
            aria-pressed={isProjectorPlaying}
            className="min-h-[44px] min-w-[44px] px-2 text-[#F0E8D8] hover:text-[#E8F044] transition-colors cursor-pointer flex items-center justify-center font-mono text-xs uppercase"
          >
            {isProjectorPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#E43D27]/12 mix-blend-color-burn pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#11110F] via-transparent to-black/60 pointer-events-none"
        />
      </div>

      {/* DESCRIPTOR */}
      <div
        className="absolute top-20 left-6 md:top-24 md:left-12 z-20 max-w-xl transition-all duration-700"
        style={{
          opacity: animStage >= 4 ? 1 : 0,
          transform: animStage >= 4 ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <p className="font-mono text-[12px] md:text-[13px] tracking-wider text-[#F0E8D8] uppercase leading-tight">
          A DIGITAL MUSEUM OF NIGERIAN CREATIVE HISTORY — PHOTOGRAPHY — MUSIC — FASHION — DESIGN
        </p>
      </div>

      {/* LAYER 2: Whisper + Massive Headline + Subline with MASK-RISE */}
      <div
        className="absolute top-36 left-6 md:top-40 md:left-12 z-20 flex flex-col pointer-events-none max-w-[90vw]"
        style={{
          transform: `translate3d(0, ${scrollOffsets.headline}px, 0)`,
        }}
      >
        <div className="overflow-hidden mb-2">
          <p
            className="font-whisper text-2xl md:text-3xl lg:text-4xl text-[#F0E8D8]/90 italic tracking-wide transition-all duration-700"
            style={{
              clipPath:
                animStage >= 2 ? 'inset(0% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            &ldquo;Somebody has to remember.&rdquo;
          </p>
        </div>

        <h1 className="font-display-condensed text-[clamp(3.5rem,11vw,12rem)] leading-[0.84] text-[#F0E8D8] tracking-tighter m-0">
          {['NOTHING', 'STAYS', 'BURIED.'].map((word, idx) => (
            <span key={word} className="block overflow-hidden">
              <span
                className="block transition-transform duration-[600ms] will-change-transform"
                style={{
                  transform:
                    animStage >= 2 ? 'translateY(0%)' : 'translateY(112%)',
                  transitionDelay: `${idx * 60}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
                }}
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <div className="overflow-hidden mt-4">
          <p
            className="font-body-editorial text-lg md:text-2xl text-[#8B8982] max-w-md font-medium tracking-wide transition-all duration-700"
            style={{
              opacity: animStage >= 4 ? 1 : 0,
              transform: animStage >= 4 ? 'translateY(0)' : 'translateY(15px)',
              transitionDelay: '600ms',
            }}
          >
            The future has a memory.
          </p>
        </div>
      </div>

      {/* LAYER 3: Cream torn sheet with historical photo ph-hist-1, fully visible in full color at rest */}
      <div
        className="absolute bottom-[-6svh] right-[-5vw] md:bottom-[-2svh] md:right-[-2vw] w-[64vw] h-[48svh] md:w-[38vw] md:h-[64svh] z-20 torn-edge-sheet bg-[#F0E8D8] p-3 md:p-6 shadow-2xl pointer-events-auto cursor-pointer will-change-transform transition-all duration-[700ms]"
        style={{
          transform: `translate3d(0, ${
            scrollOffsets.sheet + (animStage >= 3 ? 0 : -window.innerHeight * 1.1)
          }px, 0) rotate(${animStage >= 3 ? -3 : -9}deg)`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={() => onOpenArtifact('ph-hist-1')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenArtifact('ph-hist-1');
          }
        }}
        aria-label="View Studio Portrait of a Chief and Attendants"
      >
        <div
          aria-hidden="true"
          className="absolute -top-3 left-6 md:left-10 w-20 md:w-28 h-6 md:h-7 bg-[#fbf6e8]/70 backdrop-blur-xs rotate-[-8deg] shadow-sm z-30 pointer-events-none"
        />
        <div className="relative w-full h-[72%] md:h-[76%] bg-[#1c1a17] overflow-hidden aspect-[4/3]">
          <ArchivalImage
            src="/img/ph-hist-1.jpg"
            alt={hist1?.alt || 'Studio Portrait of a Chief and Attendants'}
            discipline="photography"
            eager={true}
            className="w-full h-full object-cover"
          />

          {/* Grease-pencil circle drawn once */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <circle
              cx="48"
              cy="48"
              r="22"
              fill="none"
              stroke="#E43D27"
              strokeWidth="2.5"
              strokeDasharray="180"
              style={{
                strokeDashoffset: animStage >= 4 ? 0 : 180,
                transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1) 800ms',
              }}
              transform="rotate(-12 48 48)"
            />
          </svg>
        </div>

        {/* Caption and credit always visible under image (14px title + 12px mono metadata) */}
        <div className="mt-2 text-[#11110F]">
          <span className="block font-display-wide text-[13px] md:text-[14px] leading-tight font-bold truncate">
            {hist1?.title || 'Studio Portrait of a Chief and Attendants'}
          </span>
          <span className="block font-mono text-[11px] md:text-[12px] text-[#11110F]/80 uppercase tracking-tight mt-0.5 truncate">
            {hist1?.kind === 'archival' ? `${hist1.makerCulture} · ${hist1.date}` : 'Historical Record'}
          </span>
          <span className="block font-mono text-[9px] md:text-[10px] text-[#E43D27] uppercase tracking-wider font-semibold">
            {hist1?.kind === 'archival' ? hist1.licence : 'Open Access'}
          </span>
        </div>
      </div>

      {/* LAYER 4: Negatives / Historical portrait 2, fully visible at rest */}
      <div
        className="hidden sm:block absolute bottom-6 right-[48vw] md:bottom-12 md:right-[26vw] w-[36vw] h-[24svh] md:w-[17vw] md:h-[30svh] z-30 torn-edge-small bg-[#F0E8D8] p-2.5 md:p-3 shadow-2xl pointer-events-auto cursor-pointer will-change-transform transition-all duration-[700ms]"
        style={{
          transform: `translate3d(${animStage >= 3 ? 0 : -350}px, ${
            scrollOffsets.sheet
          }px, 0) rotate(${animStage >= 3 ? 5 : -4}deg)`,
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: '150ms',
        }}
        onClick={() => onOpenArtifact('ph-hist-2')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenArtifact('ph-hist-2');
          }
        }}
        aria-label="View Portrait of Two Women with Elaborate Hairstyles"
      >
        <div className="relative w-full h-[74%] bg-[#1c1a17] overflow-hidden aspect-[4/3]">
          <ArchivalImage
            src="/img/ph-hist-2.jpg"
            alt={hist2?.alt || 'Portrait of Two Women with Elaborate Hairstyles'}
            discipline="photography"
            eager={true}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-1 text-[#11110F]">
          <span className="block font-display-wide text-[12px] leading-tight font-bold truncate">
            {hist2?.title || 'Two Women with Elaborate Hairstyles'}
          </span>
          <span className="block font-mono text-[10px] text-[#11110F]/80 uppercase truncate">
            {hist2?.kind === 'archival' ? `${hist2.makerCulture} · ${hist2.date}` : ''}
          </span>
        </div>
      </div>

      {/* BOTTOM-LEFT: Magnetic Button CTA + scroll cue */}
      <div
        className="absolute bottom-6 left-5 md:bottom-12 md:left-12 z-30 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 transition-all duration-700"
        style={{
          opacity: animStage >= 4 ? 1 : 0,
          transform: animStage >= 4 ? 'translateY(0)' : 'translateY(16px)',
          transitionDelay: '800ms',
        }}
      >
        <MagneticButton
          type="button"
          onClick={onEnter}
          className="h-[52px] sm:h-[56px] px-6 sm:px-8 bg-[#F0E8D8] text-[#11110F] font-display-condensed text-lg sm:text-xl tracking-wider hover:bg-[#E8F044] transition-colors cursor-pointer flex items-center justify-center font-bold"
        >
          Enter the archive
        </MagneticButton>
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#8B8982] tracking-widest uppercase">
          <span className="w-5 h-[1px] bg-[#8B8982]" />
          <span>Scroll to uncover</span>
        </div>
      </div>
    </section>
  );
};
