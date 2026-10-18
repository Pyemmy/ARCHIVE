import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { ARTIFACTS, Motif } from '../data/artifacts';
import { ArchivalImage } from './ArchivalImage';
import { MaskRiseText } from './MaskRiseText';
import { isReducedMotion } from '../utils/motion';

interface TimeGalleryProps {
  onOpenArtifact: (id: string) => void;
}

const ALL_MOTIFS: Motif[] = [
  'portrait',
  'sleeve',
  'stripe',
  'lettering',
  'repeat',
  'crop',
  'grain',
  'circle',
  'light',
];

export const TimeGallery: React.FC<TimeGalleryProps> = ({ onOpenArtifact }) => {
  const [selectedMotif, setSelectedMotif] = useState<Motif | 'all'>('all');
  const [arrangeBy, setArrangeBy] = useState<'motif' | 'discipline'>('discipline');
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevPositions = useRef<Map<string, DOMRect>>(new Map());

  const sortedArtifacts = useMemo(() => {
    const list = [...ARTIFACTS];
    if (arrangeBy === 'discipline') {
      return list.sort((a, b) => a.discipline.localeCompare(b.discipline));
    } else {
      return list.sort((a, b) => (a.motifs[0] || '').localeCompare(b.motifs[0] || ''));
    }
  }, [arrangeBy]);

  const handleArrangeChange = (type: 'motif' | 'discipline') => {
    if (!isReducedMotion()) {
      cardRefs.current.forEach((el, id) => {
        if (el) {
          prevPositions.current.set(id, el.getBoundingClientRect());
        }
      });
    }
    setArrangeBy(type);
  };

  const handleMotifChange = (motif: Motif | 'all') => {
    if (!isReducedMotion()) {
      cardRefs.current.forEach((el, id) => {
        if (el) {
          prevPositions.current.set(id, el.getBoundingClientRect());
        }
      });
    }
    setSelectedMotif(motif);
  };

  useLayoutEffect(() => {
    if (isReducedMotion()) return;
    if (prevPositions.current.size === 0) return;

    cardRefs.current.forEach((el, id) => {
      if (!el) return;
      const prevRect = prevPositions.current.get(id);
      if (!prevRect) return;

      const currentRect = el.getBoundingClientRect();
      const dx = prevRect.left - currentRect.left;
      const dy = prevRect.top - currentRect.top;

      if (dx !== 0 || dy !== 0) {
        el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        el.style.transition = 'none';

        requestAnimationFrame(() => {
          el.style.transform = 'translate3d(0, 0, 0)';
          el.style.transition = 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
        });
      }
    });

    prevPositions.current.clear();
  }, [sortedArtifacts, selectedMotif]);

  return (
    <section
      id="time"
      data-ground="cream"
      aria-label="Time Is Not a Straight Line"
      className="relative w-full min-h-[100svh] bg-[#F0E8D8] text-[#11110F] px-6 py-24 md:px-16 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/img/tex-paper.jpg')] bg-repeat opacity-25 mix-blend-multiply pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-2">
          05 CHRONOLOGY
        </span>
        <MaskRiseText
          as="h2"
          className="font-display-condensed text-[clamp(3.5rem,10vw,10.5rem)] leading-[0.84] text-[#11110F] tracking-tighter"
        >
          TIME IS NOT A STRAIGHT LINE.
        </MaskRiseText>
        <p className="font-body-editorial text-lg md:text-2xl text-[#11110F] mt-4 max-w-2xl font-medium">
          Fragments surface out of order, linked by method rather than calendar.
        </p>
        <div className="mt-4 font-mono text-xs uppercase tracking-widest text-[#8B8982] border-l-2 border-[#11110F] pl-3 py-0.5">
          Dates appear only when verified.
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-[#d8cfbe] mb-12">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-[#11110F] font-bold">
            Arrange by:
          </span>
          <div className="inline-flex border border-[#11110F] p-0.5 bg-[#F0E8D8]">
            <button
              type="button"
              onClick={() => handleArrangeChange('motif')}
              className={`min-h-[44px] px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                arrangeBy === 'motif'
                  ? 'bg-[#11110F] text-[#F0E8D8] font-bold'
                  : 'text-[#11110F] hover:bg-black/5'
              }`}
            >
              Motif
            </button>
            <button
              type="button"
              onClick={() => handleArrangeChange('discipline')}
              className={`min-h-[44px] px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                arrangeBy === 'discipline'
                  ? 'bg-[#11110F] text-[#F0E8D8] font-bold'
                  : 'text-[#11110F] hover:bg-black/5'
              }`}
            >
              Discipline
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleMotifChange('all')}
            className={`min-h-[44px] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider border border-[#11110F] transition-all cursor-pointer ${
              selectedMotif === 'all'
                ? 'bg-[#11110F] text-[#F0E8D8] font-bold'
                : 'bg-transparent text-[#11110F] hover:bg-[#11110F] hover:text-[#F0E8D8]'
            }`}
          >
            All Motifs
          </button>
          {ALL_MOTIFS.map((motif) => (
            <button
              key={motif}
              type="button"
              onClick={() => handleMotifChange(motif)}
              className={`min-h-[44px] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider border border-[#11110F] transition-all cursor-pointer ${
                selectedMotif === motif
                  ? 'bg-[#E43D27] text-[#F0E8D8] border-[#E43D27] font-bold'
                  : 'bg-transparent text-[#11110F] hover:border-[#E43D27] hover:text-[#E43D27]'
              }`}
            >
              #{motif}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery: All images fully visible at rest in full colour */}
      <div className="relative z-10 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {sortedArtifacts.map((artifact, i) => {
          const isMatch =
            selectedMotif === 'all' || artifact.motifs.includes(selectedMotif);
          const isSacred = artifact.kind === 'archival' && artifact.sacred;
          const rot = isSacred ? 0 : [-1.5, 1.5, -1, 2, -2, 1.5][i % 6];
          const aspectClass = isSacred ? 'aspect-[4/3]' : ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square'][i % 3];

          return (
            <div
              key={artifact.id}
              ref={(el) => {
                if (el) cardRefs.current.set(artifact.id, el);
                else cardRefs.current.delete(artifact.id);
              }}
              className={`break-inside-avoid will-change-transform transition-all duration-300 ${
                isMatch ? 'opacity-100 z-20 scale-100' : 'opacity-40 z-0 scale-98'
              }`}
              style={{
                transform: `rotate(${rot}deg)`,
              }}
            >
              <button
                type="button"
                onClick={() => onOpenArtifact(artifact.id)}
                className={`group block w-full bg-[#11110F] p-3 shadow-xl border text-left cursor-pointer transition-all ${
                  isSacred
                    ? 'border-[#E43D27] ring-1 ring-[#E43D27]'
                    : isMatch
                    ? 'border-[#11110F] hover:border-[#E43D27] hover:-translate-y-1'
                    : 'border-transparent'
                }`}
                aria-label={`Open artifact: ${artifact.title}`}
              >
                <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#1a1917]`}>
                  <ArchivalImage
                    src={artifact.file}
                    alt={artifact.alt}
                    discipline={artifact.discipline}
                    sacred={isSacred}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Visible Caption under each image: 14px title + 12px mono metadata */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] text-[#E43D27] font-bold uppercase tracking-wider">
                      {artifact.discipline}
                    </span>
                    <span className="font-mono text-[10px] text-[#8B8982] uppercase">
                      #{artifact.motifs[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-display-wide text-[14px] text-[#F0E8D8] font-bold leading-snug truncate group-hover:text-[#E8F044] transition-colors">
                      {artifact.title}
                    </h3>
                    {isSacred && (
                      <span className="bg-[#E43D27] text-[#11110F] font-mono text-[8px] font-bold px-1.5 py-0.5 uppercase shrink-0">
                        SACRED
                      </span>
                    )}
                  </div>

                  {artifact.kind === 'archival' ? (
                    <div className="mt-1 font-mono text-[12px] text-[#E4D9C0] leading-tight">
                      <span className="block truncate">{artifact.makerCulture} · {artifact.date}</span>
                      <span className="block text-[10px] text-[#8B8982] truncate mt-0.5">
                        {artifact.creditLine} ({artifact.licence})
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 font-mono text-[11px] text-[#8B8982] leading-tight">
                      CONCEPTUAL IMAGE · AI-GENERATED STILL LIFE
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
