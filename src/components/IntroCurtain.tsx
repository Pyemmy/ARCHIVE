import React, { useEffect, useRef, useState, useCallback } from 'react';
import { isReducedMotion } from '../utils/motion';

interface IntroCurtainProps {
  onComplete: () => void;
}

const CRITICAL_IMAGES = [
  '/img/ph-darkroom.jpg',
  '/img/ph-contact-sheet.jpg',
  '/img/ph-negatives.jpg',
  '/img/ph-studio.jpg',
  '/img/mu-turntable.jpg',
  '/img/de-poster-wall.jpg',
];

const SLICE_OFFSETS = [14, -18, 12, -16, 15, -11, 17]; // offsets in vw

export const IntroCurtain: React.FC<IntroCurtainProps> = ({ onComplete }) => {
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isThreaded, setIsThreaded] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dismissedRef = useRef<boolean>(false);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Load real images and track decoding
  useEffect(() => {
    if (isReducedMotion()) {
      dismiss();
      return;
    }

    let count = 0;
    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      const onDone = () => {
        count += 1;
        setLoadedCount(count);
      };
      if (img.complete && img.naturalWidth > 0) {
        onDone();
      } else {
        img.decode().then(onDone).catch(onDone);
      }
    });

    // Timeline management hard-capped under 2.0s
    const lockTimer = setTimeout(() => {
      setIsLocked(true);
    }, 700);

    const threadTimer = setTimeout(() => {
      setIsThreaded(true);
    }, 850);

    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1250);

    const completeTimer = setTimeout(() => {
      dismiss();
    }, 1900);

    return () => {
      clearTimeout(lockTimer);
      clearTimeout(threadTimer);
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, [dismiss]);

  // Global skip listener on any key, click, touch, or scroll
  useEffect(() => {
    const handleSkipEvent = () => {
      dismiss();
    };

    window.addEventListener('keydown', handleSkipEvent, { passive: true });
    window.addEventListener('click', handleSkipEvent, { passive: true });
    window.addEventListener('touchstart', handleSkipEvent, { passive: true });
    window.addEventListener('wheel', handleSkipEvent, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleSkipEvent);
      window.removeEventListener('click', handleSkipEvent);
      window.removeEventListener('touchstart', handleSkipEvent);
      window.removeEventListener('wheel', handleSkipEvent);
    };
  }, [dismiss]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-auto overflow-hidden select-none"
    >
      {/* Top Half of Curtain */}
      <div
        className="absolute top-0 left-0 w-full h-[50.5svh] bg-[#11110F] z-10 transition-transform duration-750"
        style={{
          transform: isOpen ? 'translateY(-100%)' : 'translateY(0%)',
          transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
        }}
      />
      {/* Bottom Half of Curtain */}
      <div
        className="absolute bottom-0 left-0 w-full h-[50.5svh] bg-[#11110F] z-10 transition-transform duration-750"
        style={{
          transform: isOpen ? 'translateY(100%)' : 'translateY(0%)',
          transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
        }}
      />

      {/* Center Slice-Lock Stage */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-300"
        style={{ opacity: isOpen ? 0 : 1 }}
      >
        <div className="relative text-center w-full px-4 max-w-5xl">
          {/* Main Sliced Text & Ghosts */}
          <div className="relative inline-block">
            {/* Real Accessible Text for assistive tech in DOM */}
            <span className="sr-only">ARCHIVE</span>

            {/* 7 Horizontal Slices */}
            {SLICE_OFFSETS.map((offsetVw, idx) => {
              const topPct = (idx * 100) / 7;
              const bottomPct = 100 - ((idx + 1) * 100) / 7;
              const sliceDelay = idx * 60; // 60ms stagger per slice
              return (
                <div
                  key={idx}
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none transition-transform duration-900"
                  style={{
                    clipPath: `inset(${topPct}% 0% ${bottomPct}% 0%)`,
                    transform: isLocked
                      ? 'translateX(0vw)'
                      : `translateX(${offsetVw}vw)`,
                    transitionDelay: `${sliceDelay}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
                  }}
                >
                  {/* Yellow ghost offset 6px */}
                  {!isLocked && (
                    <span
                      className="absolute inset-0 font-display-condensed text-[clamp(4.5rem,16vw,14rem)] leading-[0.82] text-[#E8F044]/60 mix-blend-screen"
                      style={{ transform: 'translate(6px, -4px)' }}
                    >
                      ARCHIVE
                    </span>
                  )}
                  {/* Vermilion ghost offset -6px */}
                  {!isLocked && (
                    <span
                      className="absolute inset-0 font-display-condensed text-[clamp(4.5rem,16vw,14rem)] leading-[0.82] text-[#E43D27]/70 mix-blend-screen"
                      style={{ transform: 'translate(-6px, 4px)' }}
                    >
                      ARCHIVE
                    </span>
                  )}
                  {/* Clean Cream Slice */}
                  <span className="relative block font-display-condensed text-[clamp(4.5rem,16vw,14rem)] leading-[0.82] text-[#F0E8D8]">
                    ARCHIVE
                  </span>
                </div>
              );
            })}

            {/* Ghost invisible container for dimensions */}
            <span
              aria-hidden="true"
              className="invisible font-display-condensed text-[clamp(4.5rem,16vw,14rem)] leading-[0.82]"
            >
              ARCHIVE
            </span>

            {/* 2px Vermilion Thread line below wordmark */}
            <div
              className="absolute left-0 bottom-[-12px] h-[2px] bg-[#E43D27] transition-all duration-300"
              style={{
                width: isThreaded ? '100%' : '0%',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>

        {/* Real Fragments Counter at Bottom-Left */}
        <div className="absolute bottom-8 left-8 z-30 font-mono text-xs text-[#E4D9C0] tracking-widest uppercase">
          FRAGMENTS {loadedCount}/6
        </div>

        {/* Visible 44px Skip Button at Bottom-Right */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute bottom-6 right-6 z-30 min-h-[44px] min-w-[44px] px-5 py-2.5 bg-transparent border border-[#F0E8D8] text-[#F0E8D8] font-mono text-xs uppercase tracking-widest hover:bg-[#E8F044] hover:text-[#11110F] hover:border-[#E8F044] transition-colors cursor-pointer"
          aria-label="Skip intro animation"
        >
          Skip [Space]
        </button>
      </div>
    </div>
  );
};
