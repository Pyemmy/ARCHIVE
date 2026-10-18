import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Artifact } from '../data/artifacts';
import { SplitFlapDate } from './SplitFlapDate';
import { useCollection } from '../context/CollectionContext';
import { isReducedMotion } from '../utils/motion';
import { Bookmark, ArrowLeft, ExternalLink } from 'lucide-react';

// Global registry to ensure at most 6 living photos are actively animating at once
const activeLivingPhotos = new Set<string>();

interface ArtifactCardProps {
  artifact: Artifact;
  index: number;
  totalCards: number;
  isDealt: boolean;
  hoveredIndex: number | null;
  onHoverChange: (index: number | null) => void;
  onOpenDetail?: (id: string) => void;
  className?: string;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  index,
  totalCards,
  isDealt,
  hoveredIndex,
  onHoverChange,
  onOpenDetail,
  className = '',
}) => {
  const { keptIds, toggleKeep } = useCollection();
  const isKept = keptIds.includes(artifact.id);

  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [hasStartedHighlight, setHasStartedHighlight] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(false);
  const [canAnimateLiving, setCanAnimateLiving] = useState<boolean>(false);

  // Desktop 3D Tilt and sheen
  const [tilt, setTilt] = useState<{ x: number; y: number; sheenX: number; sheenY: number; parallaxX: number; parallaxY: number }>({
    x: 0,
    y: 0,
    sheenX: 50,
    sheenY: 50,
    parallaxX: 0,
    parallaxY: 0,
  });

  // Touch scroll-linked tilt (+/-3deg)
  const [touchScrollTilt, setTouchScrollTilt] = useState<number>(0);

  const cardRef = useRef<HTMLDivElement>(null);

  // Fan angles: 4 cards: -6, -2, +2, +6; 3 cards: -5, 0, +5
  const fanAngles4 = [-6, -2, 2, 6];
  const fanAngles3 = [-5, 0, 5];
  const targetAngle = totalCards === 4 ? (fanAngles4[index] ?? 0) : (fanAngles3[index] ?? 0);

  // Delayed deal sequence: Highlighter and grease-pencil trigger after deal
  useEffect(() => {
    if (!isDealt) return;
    if (isReducedMotion()) {
      setHasStartedHighlight(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setHasStartedHighlight(true);
    }, 450 + index * 110);
    return () => clearTimeout(timer);
  }, [isDealt, index]);

  // Viewport tracking for Living Photo & touch tilt
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInViewport(inView);

        if (inView) {
          if (activeLivingPhotos.size < 6) {
            activeLivingPhotos.add(artifact.id);
            setCanAnimateLiving(true);
          }
        } else {
          activeLivingPhotos.delete(artifact.id);
          setCanAnimateLiving(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    // Touch device gentle scroll-linked tilt (+/-3deg)
    const handleScroll = () => {
      if (isReducedMotion() || window.matchMedia('(pointer: fine)').matches) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const centerDelta = (rect.top + rect.height / 2 - windowH / 2) / (windowH / 2);
      // Clamp to -1..1 then scale to +/-3deg
      const clamped = Math.max(-1, Math.min(1, centerDelta));
      setTouchScrollTilt(clamped * 3);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      activeLivingPhotos.delete(artifact.id);
    };
  }, [artifact.id]);

  // Desktop Pointer move 3D tilt & sheen (perspective 900px, tilt up to 7deg, parallax 10px)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1

    setTilt({
      x: -normY * 7,
      y: normX * 7,
      sheenX: (x / rect.width) * 100,
      sheenY: (y / rect.height) * 100,
      parallaxX: -normX * 10,
      parallaxY: -normY * 10,
    });
  };

  const handlePointerEnter = () => {
    onHoverChange(index);
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0, sheenX: 50, sheenY: 50, parallaxX: 0, parallaxY: 0 });
    onHoverChange(null);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onHoverChange(index);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!cardRef.current?.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
      onHoverChange(null);
    }
  };

  const isSacred = artifact.kind === 'archival' && artifact.sacred;
  const isArchival = artifact.kind === 'archival';

  // Fan-out calculations:
  // Active card: lifts 8px, brings to top (z-40)
  // Neighbours aside by 1.5vw: cards before active move left, cards after active move right
  const isCardActive = hoveredIndex === index || isFocused;
  let neighborOffsetX = '0vw';
  if (hoveredIndex !== null && hoveredIndex !== index) {
    neighborOffsetX = index < hoveredIndex ? '-1.5vw' : '1.5vw';
  }

  const staggerDelay = `${index * 110}ms`;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`group relative select-none will-change-transform ${className}`}
      style={{
        perspective: '900px',
        zIndex: isCardActive || isFlipped ? 40 : 10 + index,
      }}
    >
      {/* Outer Card Shell with 3D RotateY Flip and Fan Deal */}
      <div
        className="w-full relative transition-all duration-650 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isReducedMotion()
            ? `rotate(${isDealt ? targetAngle : 0}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
            : isDealt
            ? `translateX(${neighborOffsetX}) rotate(${targetAngle}deg) ${
                isCardActive ? 'translateY(-8px) scale(1.02)' : ''
              } rotateX(${tilt.x || touchScrollTilt}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`
            : `translateY(40px) rotate(${index % 2 === 0 ? -12 : 12}deg) scale(0.92)`,
          transitionDelay: isDealt && !isCardActive ? staggerDelay : '0ms',
        }}
      >
        {/* ============================================================
            FRONT OF DOSSIER CARD (Index/Accession Card)
            - Cream stock #F0E8D8 with paper-fibre grain
            - Sharp corners (no rounded pill)
            - Hard 6px offset solid block shadow
            - Wobbly clip-path
            - Faint foxing spots (radial gradients at ~4% opacity)
            - Semi-transparent tape strip on corner
        ============================================================ */}
        <div
          className={`w-full bg-[#F0E8D8] text-[#11110F] border-2 border-[#11110F] shadow-[6px_6px_0px_#11110F] p-4 flex flex-col justify-between relative overflow-hidden transition-opacity duration-300 ${
            isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            minHeight: '530px',
            // Slightly wobbly edges via clip-path
            clipPath: 'polygon(0% 0.5%, 99.7% 0%, 100% 99.5%, 0.3% 100%)',
          }}
        >
          {/* Faint paper-fibre grain & foxing spots (radial gradients at ~4% opacity) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-70"
            style={{
              backgroundImage: `
                radial-gradient(circle at 16% 20%, rgba(120, 85, 20, 0.04) 0%, transparent 22%),
                radial-gradient(circle at 84% 78%, rgba(120, 85, 20, 0.04) 0%, transparent 26%),
                radial-gradient(circle at 52% 44%, rgba(120, 85, 20, 0.03) 0%, transparent 32%)
              `,
            }}
          />

          {/* Semi-transparent tape strip on one corner (top right) */}
          <div
            aria-hidden="true"
            className="absolute -top-1.5 right-6 w-14 h-4 bg-[#f8f0c8]/65 border-t border-b border-[#d8c898]/70 shadow-xs rotate-[-3deg] pointer-events-none z-20"
          />

          {/* Card Top Row: Accession Tab + Sacred / Conceptual Badge */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            {/* Accession Tab at top-left: mono 12px, ink on signal yellow */}
            <span className="font-mono text-[12px] bg-[#E8F044] text-[#11110F] px-2 py-0.5 font-bold uppercase tracking-wider border border-[#11110F]">
              ACC. {artifact.id.toUpperCase()}
            </span>

            {isSacred && (
              <span className="font-mono text-[10px] bg-[#E43D27] text-[#F0E8D8] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                SACRED UNTOUCHED
              </span>
            )}

            {!isArchival && (
              <span className="font-mono text-[10px] bg-[#11110F] text-[#F0E8D8] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                CONCEPTUAL STILL LIFE
              </span>
            )}
          </div>

          {/* Image 4:5 at ~70% height:
              - Sacred items: whole on a cream mat, never cropped
              - Non-sacred items: object-fit cover, living photo drift (6% over 16s), inner parallax 10px */}
          <div
            className={`w-full aspect-[4/5] overflow-hidden relative border border-[#11110F] ${
              isSacred ? 'bg-[#F0E8D8] p-3 flex items-center justify-center' : 'bg-[#181816]'
            }`}
          >
            <img
              src={artifact.file}
              alt={artifact.alt}
              loading="lazy"
              className={`w-full h-full transition-transform duration-500 ease-out ${
                isSacred
                  ? 'object-contain filter-none transform-none'
                  : `object-cover filter-[contrast(1.05)_saturate(0.9)_sepia(0.12)] ${
                      isInViewport && canAnimateLiving && !isReducedMotion() ? 'living-drift' : ''
                    }`
              }`}
              style={{
                transform: !isSacred && isCardActive
                  ? `translate3d(${tilt.parallaxX}px, ${tilt.parallaxY}px, 0) scale(1.06)`
                  : undefined,
              }}
            />

            {/* Stepped 2-frame grain overlay for living photo */}
            {!isSacred && (
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:4px_4px]"
              />
            )}

            {/* Diagonal sheen glare layer tracking pointer */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.sheenX}% ${tilt.sheenY}%, rgba(255,255,255,0.85) 0%, transparent 60%)`,
              }}
            />
          </div>

          {/* Middle Body: Title with Highlighter Bar + makerCulture + DATE + Credit */}
          <div className="mt-3.5 flex-1 flex flex-col justify-between relative z-10 text-left">
            <div>
              {/* Title in Hanken 600, 17px, with yellow highlighter bar behind it */}
              <div className="relative inline-block max-w-full">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[#E8F044] -z-10 origin-left transition-transform duration-400 ease-out"
                  style={{
                    transform: hasStartedHighlight ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
                <h3 className="font-hanken font-semibold text-[17px] text-[#11110F] leading-snug truncate px-1">
                  {artifact.title}
                </h3>
              </div>

              {/* makerCulture in mono 12px with vermilion grease-pencil underline */}
              {isArchival && (
                <div className="relative mt-1">
                  <span className="font-mono text-[12px] text-[#11110F] block truncate uppercase">
                    {artifact.makerCulture}
                  </span>
                  <div
                    aria-hidden="true"
                    className="h-[1.5px] bg-[#E43D27] mt-0.5 origin-left transition-transform duration-500 ease-out"
                    style={{
                      transform: hasStartedHighlight ? 'scaleX(1)' : 'scaleX(0)',
                      width: '65%',
                    }}
                  />
                </div>
              )}

              {/* DATE line as Split-Flap (verbatim characters, mechanical rotation) */}
              {isArchival && artifact.date && (
                <div className="mt-1 flex items-center gap-1.5">
                  <SplitFlapDate date={artifact.date} startTrigger={hasStartedHighlight} />
                </div>
              )}

              {/* Credit line & licence in mono 12px */}
              {isArchival && (
                <div className="font-mono text-[11px] text-[#55534E] uppercase truncate mt-1">
                  {artifact.creditLine} ({artifact.licence})
                </div>
              )}
            </div>

            {/* Footer row with two visible 44px buttons: "Read the record" and "Keep" */}
            <div className="mt-3 pt-3 border-t border-[#11110F]/20 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="min-h-[44px] flex-1 px-3 py-2 bg-[#11110F] text-[#F0E8D8] font-mono text-[12px] uppercase font-bold tracking-wider hover:bg-[#E8F044] hover:text-[#11110F] transition-colors cursor-pointer border border-[#11110F] text-center"
                aria-label={`Read the record for ${artifact.title}`}
              >
                Read the record ↻
              </button>

              <button
                type="button"
                onClick={(e) => toggleKeep(artifact.id, e)}
                aria-pressed={isKept}
                className={`min-h-[44px] min-w-[44px] px-3 py-2 font-mono text-[12px] uppercase font-bold flex items-center justify-center gap-1 border border-[#11110F] transition-colors cursor-pointer ${
                  isKept
                    ? 'bg-[#E8F044] text-[#11110F]'
                    : 'bg-[#F0E8D8] text-[#11110F] hover:bg-[#E8F044]'
                }`}
                aria-label={isKept ? `Remove ${artifact.title} from archive` : `Keep ${artifact.title} in archive`}
              >
                <Bookmark size={15} fill={isKept ? '#11110F' : 'none'} />
                <span>{isKept ? 'Kept' : 'Keep'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================
            BACK OF DOSSIER CARD (Verbatim Record, Licence, Source link)
            - 3D rotateY flip, 600ms
        ============================================================ */}
        <div
          className={`absolute inset-0 w-full bg-[#11110F] text-[#F0E8D8] border-2 border-[#F0E8D8] shadow-[6px_6px_0px_#E8F044] p-5 flex flex-col justify-between overflow-y-auto ${
            isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            clipPath: 'polygon(0% 0.5%, 99.7% 0%, 100% 99.5%, 0.3% 100%)',
            transition: 'opacity 0.25s ease',
          }}
        >
          {/* Back Header with Back button */}
          <div className="flex items-center justify-between border-b border-[#333330] pb-2">
            <span className="font-mono text-xs uppercase text-[#E8F044] font-bold">
              VERBATIM CATALOG ENTRY
            </span>
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="min-h-[44px] min-w-[44px] px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#F0E8D8] hover:text-[#E8F044] flex items-center gap-1 cursor-pointer"
              aria-label="Back to front of card"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          {/* Record text */}
          <div className="my-auto space-y-3 py-3 text-left">
            <h4 className="font-display-condensed text-2xl text-[#F0E8D8] leading-tight">
              {artifact.title}
            </h4>

            {isArchival && (
              <div className="font-mono text-xs text-[#E8F044] space-y-1">
                <div>{artifact.makerCulture}</div>
                <div>Date: {artifact.date}</div>
              </div>
            )}

            <p className="font-body-editorial text-sm text-[#E4D9C0] leading-relaxed">
              {artifact.caption}
            </p>

            {isArchival && (
              <div className="font-mono text-[11px] text-[#8B8982] space-y-1 pt-2 border-t border-[#262624]">
                <div>Credit: {artifact.creditLine}</div>
                <div>Licence: {artifact.licence}</div>
              </div>
            )}
          </div>

          {/* Back Footer */}
          <div className="pt-3 border-t border-[#333330] flex items-center justify-between gap-3">
            {isArchival && artifact.sourceUrl ? (
              <a
                href={artifact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-3 py-2 font-mono text-xs text-[#E8F044] underline hover:text-[#F0E8D8] flex items-center gap-1 font-bold"
              >
                <span>Source ↗</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <span className="font-mono text-[11px] text-[#8B8982]">INTERNAL REPOSITORY ENTRY</span>
            )}

            {onOpenDetail && (
              <button
                type="button"
                onClick={() => onOpenDetail(artifact.id)}
                className="min-h-[44px] px-3 py-2 bg-[#F0E8D8] text-[#11110F] font-mono text-xs font-bold uppercase hover:bg-[#E8F044] transition-colors cursor-pointer"
              >
                Inspect
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
