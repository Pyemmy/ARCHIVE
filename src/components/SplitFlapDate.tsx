import React, { useEffect, useState, useRef } from 'react';
import { isReducedMotion } from '../utils/motion';

interface SplitFlapDateProps {
  date: string;
  className?: string;
  startTrigger?: boolean;
}

const GLYPHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ·–—., ';

export const SplitFlapDate: React.FC<SplitFlapDateProps> = ({
  date,
  className = '',
  startTrigger = true,
}) => {
  const [displayedChars, setDisplayedChars] = useState<string[]>(() => date.split(''));
  const [flippingIndices, setFlippingIndices] = useState<Set<number>>(new Set());
  const hasRunRef = useRef<boolean>(false);

  useEffect(() => {
    if (!startTrigger || hasRunRef.current) return;
    hasRunRef.current = true;

    if (isReducedMotion()) {
      setDisplayedChars(date.split(''));
      return;
    }

    const targetChars = date.split('');
    const charTimers: number[] = [];

    targetChars.forEach((targetChar, index) => {
      if (targetChar === ' ') {
        return;
      }

      const totalSwaps = 3 + Math.floor(Math.random() * 3); // 3-5 swaps
      let swapCount = 0;
      const initialDelay = index * 25; // 25ms stagger per character

      const runSwap = () => {
        if (swapCount >= totalSwaps) {
          setDisplayedChars((prev) => {
            const next = [...prev];
            next[index] = targetChar;
            return next;
          });
          setFlippingIndices((prev) => {
            const next = new Set(prev);
            next.delete(index);
            return next;
          });
          return;
        }

        // Active flip
        setFlippingIndices((prev) => new Set(prev).add(index));
        const randGlyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        setDisplayedChars((prev) => {
          const next = [...prev];
          next[index] = randGlyph;
          return next;
        });

        swapCount++;
        const nextDelay = 45 + Math.random() * 25;
        const timer = window.setTimeout(runSwap, nextDelay);
        charTimers.push(timer);
      };

      const startTimer = window.setTimeout(runSwap, initialDelay);
      charTimers.push(startTimer);
    });

    // Hard cutoff at ~900ms to guarantee EXACT verbatim date string
    const finishTimer = window.setTimeout(() => {
      setDisplayedChars(date.split(''));
      setFlippingIndices(new Set());
    }, 900);
    charTimers.push(finishTimer);

    return () => {
      charTimers.forEach((t) => clearTimeout(t));
    };
  }, [date, startTrigger]);

  return (
    <div
      aria-label={date}
      className={`font-mono text-[12px] inline-flex items-center tracking-wider text-[#11110F] select-none uppercase ${className}`}
    >
      <span aria-hidden="true" className="inline-flex items-center flex-wrap gap-[1px]">
        {displayedChars.map((char, i) => {
          const isFlipping = flippingIndices.has(i);
          if (char === ' ') {
            return (
              <span key={i} className="inline-block w-[0.4em]">
                &nbsp;
              </span>
            );
          }

          return (
            <span
              key={i}
              className="relative inline-flex flex-col items-center justify-center bg-[#252522] text-[#F0E8D8] border border-[#11110F] w-[13px] h-[19px] overflow-hidden text-[11px] font-bold leading-none select-none shadow-xs"
              style={{
                perspective: '200px',
              }}
            >
              {/* Split horizontal dividing groove */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#11110F] z-20 pointer-events-none"
              />

              {/* Character display with 3D rotateX on flip */}
              <span
                className="relative z-10 block transition-transform duration-75 origin-center"
                style={{
                  transform: isFlipping && !isReducedMotion() ? 'rotateX(55deg)' : 'rotateX(0deg)',
                }}
              >
                {char}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
};
