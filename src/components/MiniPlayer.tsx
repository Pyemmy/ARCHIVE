import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, RotateCcw } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    hasPlayedOnce,
    isMiniPlayerOpen,
    audioError,
    togglePlay,
    seek,
    setVolumeLevel,
    nextTrack,
    prevTrack,
    closeMiniPlayer,
    retryPlayback,
  } = useAudio();

  if (!hasPlayedOnce || !isMiniPlayerOpen || !currentTrack) {
    return null;
  }

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <aside
      aria-label="Audio Mini Player"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed bottom-0 left-0 right-0 z-50 h-16 min-h-[64px] bg-[#11110F] text-[#F0E8D8] border-t border-[#333330] px-4 md:px-8 flex items-center justify-between gap-4 shadow-2xl safe-area-bottom select-none outline-none focus-visible:ring-2 focus-visible:ring-[#E8F044]"
    >
      {/* Track Cover & Details */}
      <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs">
        <img
          src={currentTrack.cover}
          alt={`Cover of ${currentTrack.title}`}
          className="w-11 h-11 object-cover shrink-0 border border-[#333330]"
        />
        <div className="min-w-0">
          <span className="block font-display-wide text-xs md:text-sm font-bold text-[#F0E8D8] truncate leading-tight">
            {currentTrack.title}
          </span>
          <span className="block font-mono text-[10px] text-[#8B8982] truncate">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Center Controls & Scrubber */}
      <div className="flex-1 max-w-xl flex flex-col items-center justify-center">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={prevTrack}
            aria-label="Previous track"
            className="p-1 text-[#F0E8D8] hover:text-[#E8F044] transition-colors cursor-pointer"
          >
            <SkipBack size={18} />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            aria-pressed={isPlaying}
            className="w-10 h-10 bg-[#F0E8D8] text-[#11110F] flex items-center justify-center font-bold hover:bg-[#E8F044] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause size={18} fill="#11110F" /> : <Play size={18} fill="#11110F" className="ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            aria-label="Next track"
            className="p-1 text-[#F0E8D8] hover:text-[#E8F044] transition-colors cursor-pointer"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Scrubber for file tracks */}
        {currentTrack.kind === 'file' ? (
          <div className="w-full flex items-center gap-2 mt-1">
            <span className="font-mono text-[9px] text-[#8B8982] w-7 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Scrub track progress"
              className="flex-1 accent-[#E8F044] h-1.5 cursor-pointer bg-[#333330]"
            />
            <span className="font-mono text-[9px] text-[#8B8982] w-7">
              {formatTime(duration)}
            </span>
          </div>
        ) : (
          <div className="mt-0.5 font-mono text-[10px] text-[#E8F044] uppercase tracking-wider">
            {currentTrack.kind.toUpperCase()} STREAM • {currentTrack.durationLabel}
          </div>
        )}
      </div>

      {/* Right: Volume & Error & Close */}
      <div className="flex items-center gap-3">
        {audioError ? (
          <div className="flex items-center gap-1.5 text-xs text-[#E43D27] font-mono">
            <span className="hidden sm:inline">{audioError}</span>
            <button
              type="button"
              onClick={retryPlayback}
              className="flex items-center gap-1 text-[#E8F044] underline font-bold uppercase cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Volume2 size={16} className="text-[#8B8982]" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              aria-label="Volume slider"
              className="w-16 accent-[#E8F044] h-1.5 cursor-pointer bg-[#333330]"
            />
          </div>
        )}

        <button
          type="button"
          onClick={closeMiniPlayer}
          aria-label="Close audio player"
          className="p-1.5 text-[#8B8982] hover:text-[#F0E8D8] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </aside>
  );
};
