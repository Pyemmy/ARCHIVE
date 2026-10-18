import React, { useEffect, useRef, useState } from 'react';
import { isReducedMotion } from '../utils/motion';

export const CustomCursor: React.FC = () => {
  const [cursorState, setCursorState] = useState<'default' | 'open' | 'drag'>('default');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device supports fine pointer and hover
    if (typeof window === 'undefined') return;
    const hasFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    if (!hasFinePointer || isReducedMotion()) {
      return;
    }

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let rafId: number;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Instantly position the 14px dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }

      // Detect hover target context
      const target = e.target as HTMLElement | null;
      if (target) {
        if (target.closest('input[type="range"]') || target.closest('[data-cursor="drag"]')) {
          setCursorState('drag');
        } else if (
          target.closest('button[aria-label*="artifact"]') ||
          target.closest('button[aria-label*="Open artifact"]') ||
          target.closest('.photo-archival') ||
          target.closest('[data-cursor="open"]')
        ) {
          setCursorState('open');
        } else {
          setCursorState('default');
        }
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Shared rAF loop for ring lerp .18
    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible || isReducedMotion()) return null;

  return (
    <>
      {/* 14px Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="custom-cursor-dot"
        style={{ display: isVisible ? 'block' : 'none' }}
      />
      {/* 56px Ring (grows to 88px with OPEN / DRAG label) */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`custom-cursor-ring ${
          cursorState === 'open'
            ? 'cursor-open'
            : cursorState === 'drag'
            ? 'cursor-drag'
            : ''
        }`}
        style={{ display: isVisible ? 'flex' : 'none' }}
      >
        {cursorState === 'open' && <span>OPEN</span>}
        {cursorState === 'drag' && <span>DRAG</span>}
      </div>
    </>
  );
};
