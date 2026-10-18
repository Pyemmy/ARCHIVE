import React, { useEffect, useRef, useState } from 'react';

interface IndexDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

const SECTIONS = [
  { id: 'signal', number: '01', title: 'SIGNAL', preview: '/img/ph-darkroom.jpg' },
  { id: 'what-survives', number: '02', title: 'WHAT SURVIVES', preview: '/img/ph-negatives.jpg' },
  { id: 'disciplines', number: '03', title: 'THE FOUR DISCIPLINES', preview: '/img/mu-turntable.jpg' },
  { id: 'connections', number: '04', title: 'CONNECTIONS', preview: '/img/de-poster-wall.jpg' },
  { id: 'time', number: '05', title: 'TIME IS NOT A STRAIGHT LINE', preview: '/img/fa-fabric-folds.jpg' },
  { id: 'present', number: '06', title: 'THE PRESENT', preview: '/img/now-street-poster.jpg' },
  { id: 'inheritance', number: '07', title: 'INHERITANCE', preview: '/img/inh-archive-boxes.jpg' },
  { id: 'colophon', number: '08', title: 'COLOPHON', preview: '/img/de-type-blocks.jpg' },
];

export const IndexDialog: React.FC<IndexDialogProps> = ({ isOpen, onClose, onNavigate }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [hoveredPreview, setHoveredPreview] = useState<string>('/img/ph-darkroom.jpg');
  const [animStage, setAnimStage] = useState<boolean>(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const isReduced =
      document.documentElement.getAttribute('data-reduced-motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(isReduced);
  }, []);

  const toggleMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    document.documentElement.setAttribute('data-reduced-motion', next ? 'true' : 'false');
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      if (!dialog.open) {
        dialog.showModal();
      }
      setTimeout(() => setAnimStage(true), 20);
    } else {
      setAnimStage(false);
      if (dialog.open) {
        dialog.close();
      }
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-0 h-screen w-screen max-h-none max-w-none bg-[#11110F] text-[#F0E8D8] p-0 backdrop:bg-black/80 open:flex open:flex-col justify-between overflow-hidden transition-all duration-[650ms]"
      style={{
        clipPath: reducedMotion
          ? undefined
          : animStage
          ? 'circle(150% at calc(100% - 50px) 35px)'
          : 'circle(0% at calc(100% - 50px) 35px)',
        transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
      }}
      aria-label="Archive Index Navigation"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-[#333330] z-20">
        <div className="font-mono-tag text-[#E43D27] text-xs">
          INDEX — DIRECTORY OF SECTIONS
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={toggleMotion}
            aria-pressed={reducedMotion}
            className="flex items-center gap-2 h-11 px-4 text-xs font-mono uppercase border border-[#333330] hover:border-[#F0E8D8] text-[#F0E8D8] transition-colors cursor-pointer"
          >
            <span>Motion:</span>
            <span className={reducedMotion ? 'text-[#8B8982]' : 'text-[#E8F044] font-bold'}>
              {reducedMotion ? 'REDUCED' : 'ACTIVE'}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 font-mono uppercase text-xs tracking-widest bg-[#F0E8D8] text-[#11110F] font-bold hover:bg-[#E8F044] transition-colors cursor-pointer"
          >
            Close [Esc]
          </button>
        </div>
      </div>

      {/* Main content grid with interactive right-side crossfade preview on desktop */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-12 z-20">
        {/* Numbered Sections list */}
        <nav aria-label="Index directory" className="w-full lg:w-[60%]">
          <ol className="flex flex-col gap-3 md:gap-4 list-none p-0 m-0 max-w-4xl">
            {SECTIONS.map((sec, idx) => (
              <li key={sec.id} className="overflow-hidden">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredPreview(sec.preview)}
                  onFocus={() => setHoveredPreview(sec.preview)}
                  onClick={() => {
                    onClose();
                    onNavigate(sec.id);
                  }}
                  className="group flex items-baseline gap-4 md:gap-8 w-full text-left py-1.5 hover:pl-4 transition-all cursor-pointer"
                >
                  <span className="font-mono text-sm md:text-base text-[#E43D27] font-bold tracking-widest">
                    {sec.number}
                  </span>
                  <span
                    className="font-display-condensed text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F0E8D8] group-hover:text-[#E8F044] transition-transform duration-700 block will-change-transform"
                    style={{
                      transform: animStage || reducedMotion ? 'translateY(0%)' : 'translateY(110%)',
                      transitionDelay: `${idx * 70}ms`,
                      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {sec.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Right Preview Card (Desktop crossfade) */}
        <div className="hidden lg:flex w-[35%] aspect-[4/3] bg-[#161614] border border-[#333330] p-4 relative overflow-hidden shadow-2xl">
          <img
            key={hoveredPreview}
            src={hoveredPreview}
            alt="Section archival preview"
            className="w-full h-full object-cover filter grayscale contrast-110 brightness-90 animate-fadeIn"
          />
          <div className="absolute bottom-2 left-4 bg-[#11110F]/85 px-2 py-1 font-mono text-[10px] text-[#E8F044] uppercase tracking-wider">
            PREVIEW // ARCHIVAL RECORD
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 py-6 md:px-12 border-t border-[#333330] flex flex-col sm:flex-row justify-between text-xs font-mono text-[#8B8982] z-20">
        <span>ONE-TEN — DESIGN INDEPENDENTLY</span>
        <span className="mt-2 sm:mt-0">ARCHIVE IS A DIGITAL MUSEUM OF NIGERIAN CREATIVE HISTORY</span>
      </div>
    </dialog>
  );
};
