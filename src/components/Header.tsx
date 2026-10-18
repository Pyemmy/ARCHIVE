import React, { useEffect, useState, useRef } from 'react';
import { IndexDialog } from './IndexDialog';
import { MagneticButton } from './MagneticButton';
import { useAudio } from '../context/AudioContext';
import { useCollection } from '../context/CollectionContext';
import { isReducedMotion } from '../utils/motion';
import { Bookmark, Play, Volume2, Pause } from 'lucide-react';

interface HeaderProps {
  activeGround: 'ink' | 'cream' | 'paper-2' | 'vermilion' | 'yellow';
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeGround, onNavigate }) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [lagosTime, setLagosTime] = useState<string>('LAGOS 15:42 WAT · 31°C HUMID');
  const { isPlaying, togglePlay, waveformLevels, currentTrack } = useAudio();
  const { keptIds, totalArchivalCount, openTray, flyingThumb } = useCollection();

  const keptButtonRef = useRef<HTMLButtonElement>(null);

  // Update Lagos live time clock every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setLagosTime(`LAGOS ${timeStr} WAT · 31°C HUMID`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLightGround = activeGround === 'cream' || activeGround === 'paper-2' || activeGround === 'yellow';
  const isVermilionGround = activeGround === 'vermilion';

  const textColor = isLightGround
    ? 'text-[#11110F]'
    : isVermilionGround
    ? 'text-[#11110F]'
    : 'text-[#F0E8D8]';

  const secondaryColor = isLightGround
    ? 'text-[#44423C]'
    : isVermilionGround
    ? 'text-[#11110F]/80'
    : 'text-[#8B8982]';

  const buttonBorder = isLightGround
    ? 'border-[#11110F] text-[#11110F] hover:bg-[#11110F] hover:text-[#F0E8D8]'
    : isVermilionGround
    ? 'border-[#11110F] text-[#11110F] hover:bg-[#11110F] hover:text-[#F0E8D8]'
    : 'border-[#F0E8D8] text-[#F0E8D8] hover:bg-[#F0E8D8] hover:text-[#11110F]';

  const isScrolled = scrollProgress > 1;

  const groundBg = isScrolled
    ? {
        ink: 'bg-[#11110F]/85 backdrop-blur-md border-b border-[#2a2a26]/80 shadow-md',
        cream: 'bg-[#F0E8D8]/90 backdrop-blur-md border-b border-[#d8cfbe]/80 shadow-md',
        'paper-2': 'bg-[#E4D9C0]/90 backdrop-blur-md border-b border-[#c8bea6]/80 shadow-md',
        vermilion: 'bg-[#E43D27]/92 backdrop-blur-md border-b border-[#11110F]/30 shadow-md',
        yellow: 'bg-[#E8F044]/92 backdrop-blur-md border-b border-[#11110F]/30 shadow-md',
      }[activeGround]
    : 'bg-transparent';

  // Build SVG polyline points for live waveform across header top
  const waveformSvgPoints = waveformLevels.length > 0
    ? waveformLevels
        .map((lvl, idx) => {
          const x = (idx / (waveformLevels.length - 1)) * 100;
          const y = 8 - lvl * 7;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5 md:px-12 md:py-4 transition-all duration-300 pointer-events-none select-none ${groundBg}`}
      >
        {/* Top Progress Line / Live Waveform */}
        {isPlaying && waveformSvgPoints && !isReducedMotion() ? (
          <div className="absolute top-0 left-0 right-0 h-3 overflow-hidden z-50 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 8"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                fill="none"
                stroke="#E43D27"
                strokeWidth="1.8"
                points={waveformSvgPoints}
              />
            </svg>
          </div>
        ) : (
          <div
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Reading progress"
            className="absolute top-0 left-0 h-[2px] bg-[#E43D27] transition-all duration-150 ease-out z-50"
            style={{ width: `${scrollProgress}%` }}
          />
        )}

        {/* 1. Wordmark: Pinned strictly to the LEFT */}
        <div className="pointer-events-auto shrink-0 flex items-center gap-3">
          <a
            href="#signal"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('signal');
            }}
            className={`font-display-condensed text-xl sm:text-2xl md:text-3xl tracking-tight transition-colors duration-300 ${textColor}`}
            aria-label="ARCHIVE, return to top"
          >
            ARCHIVE
          </a>
        </div>

        {/* 2. Middle Spacer: guarantees ample empty space on mobile, displays Lagos clock on desktop */}
        <div className="flex-1 flex justify-center items-center pointer-events-none px-2 min-w-[12px] sm:min-w-[24px]">
          <div className={`hidden md:block font-mono text-[11px] tracking-widest uppercase transition-colors duration-300 ${secondaryColor}`}>
            {lagosTime}
          </div>
        </div>

        {/* 3. Action Group: Pinned strictly to the RIGHT */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Direct Sound/Play Button anywhere outside */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
            className={`min-h-[38px] sm:min-h-[44px] px-2 sm:px-3 py-1 sm:py-2 font-mono uppercase text-[10px] sm:text-xs tracking-wider border flex items-center gap-1 transition-all duration-200 cursor-pointer ${
              isPlaying
                ? 'bg-[#E43D27] text-[#F0E8D8] border-[#E43D27] font-bold shadow-xs'
                : buttonBorder
            }`}
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
            <span className="hidden xs:inline sm:inline">
              {isPlaying ? 'Pause' : 'Music'}
            </span>
          </button>

          {/* Kept Counter */}
          <button
            ref={keptButtonRef}
            type="button"
            onClick={openTray}
            className={`min-h-[38px] sm:min-h-[44px] px-2 sm:px-3 py-1 sm:py-2 font-mono uppercase text-[10px] sm:text-xs tracking-wider border flex items-center gap-1 transition-all duration-200 cursor-pointer ${
              keptIds.length > 0
                ? 'bg-[#E8F044] text-[#11110F] border-[#11110F] font-bold shadow-xs'
                : buttonBorder
            }`}
            aria-label={`Open your archive tray, ${keptIds.length} of ${totalArchivalCount} kept`}
          >
            <Bookmark size={12} fill={keptIds.length > 0 ? '#11110F' : 'none'} />
            <span className="hidden sm:inline">Kept </span>
            <span>{keptIds.length}/{totalArchivalCount}</span>
          </button>

          {/* Index Button */}
          <MagneticButton
            type="button"
            onClick={() => setIsIndexOpen(true)}
            className={`min-h-[38px] sm:min-h-[44px] px-2.5 sm:px-4 py-1 sm:py-2 font-mono uppercase text-[10px] sm:text-xs tracking-widest border transition-all duration-200 cursor-pointer ${buttonBorder}`}
            aria-haspopup="dialog"
            aria-label="Open Archive Index directory"
          >
            Index
          </MagneticButton>
        </div>
      </header>

      {/* Flying Thumbnail Animation towards Header Kept button */}
      {flyingThumb && !isReducedMotion() && (
        <div
          aria-hidden="true"
          className="fixed pointer-events-none z-50 w-16 h-20 border-2 border-[#E8F044] shadow-2xl overflow-hidden animate-flyToHeader"
          style={{
            left: `${flyingThumb.startX - 32}px`,
            top: `${flyingThumb.startY - 40}px`,
          }}
        >
          <img
            src={flyingThumb.src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Index Modal Overlay Dialog */}
      <IndexDialog
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};
