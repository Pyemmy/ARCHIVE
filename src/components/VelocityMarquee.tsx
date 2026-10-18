import React, { useEffect, useRef } from 'react';
import { isReducedMotion } from '../utils/motion';

interface VelocityMarqueeProps {
  direction?: 'left' | 'right';
  className?: string;
  id?: string;
}

const MARQUEE_ITEMS = [
  { word: 'PHOTOGRAPHY', img: '/img/ph-hist-1.jpg' },
  { word: 'MUSIC', img: '/img/mu-inst-2.jpg' },
  { word: 'FASHION', img: '/img/fa-textile-1.jpg' },
  { word: 'DESIGN', img: '/img/de-obj-1.jpg' },
];

export const VelocityMarquee: React.FC<VelocityMarqueeProps> = ({
  direction = 'left',
  className = '',
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    if (isReducedMotion()) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(el);

    // Track scroll velocity
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let scrollVelocity = 0;
    let targetSkew = 0;
    let currentSkew = 0;
    let offset = 0;
    let lastTime = performance.now();
    let rafId: number;

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastScrollTime);
      const dy = window.scrollY - lastScrollY;
      scrollVelocity = (dy / dt) * 1000; // px per second
      lastScrollY = window.scrollY;
      lastScrollTime = now;

      // Clamp skew to [-6, 6]
      const skewVal = Math.max(-6, Math.min(6, (scrollVelocity / 600) * 6));
      targetSkew = direction === 'left' ? skewVal : -skewVal;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = (time: number) => {
      const dt = Math.min(100, time - lastTime) / 1000;
      lastTime = time;

      if (isVisibleRef.current && trackRef.current && !document.hidden) {
        // Read audio reactivity level if active
        const rootLevel = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--level')) || 0;
        const speedBoost = 1 + rootLevel * 1.5;
        const velBoost = Math.abs(scrollVelocity) * 0.4;
        const currentSpeed = (60 * speedBoost + velBoost) * dt;

        // Dampen scroll velocity
        scrollVelocity *= 0.92;
        currentSkew += (targetSkew - currentSkew) * 0.12;

        if (direction === 'left') {
          offset -= currentSpeed;
          if (offset <= -1200) offset += 1200;
        } else {
          offset += currentSpeed;
          if (offset >= 0) offset -= 1200;
        }

        trackRef.current.style.transform = `translate3d(${offset}px, 0, 0) skewX(${currentSkew.toFixed(2)}deg)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [direction]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`relative w-full overflow-hidden py-3 bg-[#11110F] border-y border-[#262624] select-none ${className}`}
      aria-label="Discipline marquee ticker"
    >
      <span className="sr-only">
        PHOTOGRAPHY · MUSIC · FASHION · DESIGN
      </span>

      <div
        ref={trackRef}
        aria-hidden="true"
        className="flex items-center whitespace-nowrap will-change-transform gap-8 text-[#F0E8D8]"
        style={{
          transform: isReducedMotion() ? 'none' : undefined,
        }}
      >
        {/* Render 3 repeat sets for seamless continuous ticker */}
        {[0, 1, 2, 3].map((setIdx) => (
          <React.Fragment key={setIdx}>
            {MARQUEE_ITEMS.map((item, idx) => (
              <div key={`${setIdx}-${idx}`} className="flex items-center gap-6 shrink-0">
                <span className="font-display-condensed text-3xl md:text-5xl lg:text-6xl tracking-tight uppercase hover:text-[#E8F044] transition-colors">
                  {item.word}
                </span>
                <span className="text-[#E43D27] font-display-condensed text-2xl md:text-3xl font-black">
                  ·
                </span>
                <div className="w-16 h-8 md:w-20 md:h-10 overflow-hidden bg-[#1c1a17] shrink-0 border border-[#333330]">
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="text-[#E8F044] font-display-condensed text-2xl md:text-3xl font-black">
                  ·
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
