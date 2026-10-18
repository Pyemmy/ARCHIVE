import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArchivalImage } from './ArchivalImage';
import { MaskRiseText } from './MaskRiseText';
import { TornDivider } from './TornDivider';
import { MagneticButton } from './MagneticButton';
import { isReducedMotion } from '../utils/motion';
import { useAudio } from '../context/AudioContext';
import { ARTIFACTS } from '../data/artifacts';
import { ArtifactCardSet } from './ArtifactCardSet';
import { Play, Pause, SkipBack, SkipForward, ExternalLink } from 'lucide-react';

interface FourDisciplinesProps {
  onOpenArtifact: (id: string) => void;
}

export const FourDisciplines: React.FC<FourDisciplinesProps> = ({ onOpenArtifact }) => {
  // Photography Loupe state
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const contactCardRef = useRef<HTMLDivElement>(null);

  // Audio Context integration
  const {
    tracks,
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
  } = useAudio();

  // Music: Continuous vinyl rotation while playing + scroll scrub
  const musicSectionRef = useRef<HTMLDivElement>(null);
  const [recordRotation, setRecordRotation] = useState<number>(0);

  // Fashion: Accordion / Deck film strip fan-out
  const fashionSectionRef = useRef<HTMLDivElement>(null);
  const [fanProgress, setFanProgress] = useState<number>(1);
  const lastSnapIdxRef = useRef<number>(-1);

  // Design: Registration Slider state - DEFAULT 35 per Law
  const [registration, setRegistration] = useState<number>(35);
  const [isRegisteredFlash, setIsRegisteredFlash] = useState<boolean>(false);

  // Historical Photo artifacts
  const ph1 = ARTIFACTS.find((a) => a.id === 'ph-hist-1');
  const ph2 = ARTIFACTS.find((a) => a.id === 'ph-hist-2');
  const ph3 = ARTIFACTS.find((a) => a.id === 'ph-hist-3');

  // Music Instrument artifacts
  const mu1 = ARTIFACTS.find((a) => a.id === 'mu-inst-1');
  const mu2 = ARTIFACTS.find((a) => a.id === 'mu-inst-2');
  const mu3 = ARTIFACTS.find((a) => a.id === 'mu-inst-3');

  // Fashion Textile artifacts
  const fa1 = ARTIFACTS.find((a) => a.id === 'fa-textile-1');
  const fa2 = ARTIFACTS.find((a) => a.id === 'fa-textile-2');
  const fa3 = ARTIFACTS.find((a) => a.id === 'fa-textile-3');
  const fa4 = ARTIFACTS.find((a) => a.id === 'fa-textile-4');

  // Design Object artifacts
  const de1 = ARTIFACTS.find((a) => a.id === 'de-obj-1');
  const de2 = ARTIFACTS.find((a) => a.id === 'de-obj-2');
  const de3 = ARTIFACTS.find((a) => a.id === 'de-obj-3');

  // Photography Loupe pointer move
  const handleLoupePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isReducedMotion()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLoupePos({ x, y, active: true });
  };

  const handleLoupePointerLeave = () => {
    setLoupePos((prev) => ({ ...prev, active: false }));
  };

  // Vinyl disc spin loop when playing + scroll scrub
  useEffect(() => {
    if (isReducedMotion()) return;

    let rafId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying && !document.hidden) {
        // Spin at 33 1/3 rpm = 200 deg/sec
        setRecordRotation((prev) => (prev + 200 * dt) % 360);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Audio snap sound for fashion film strip
  const playSnapAudio = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // AudioContext unavailable or blocked
    }
  }, []);

  // Fashion: Accordion / Deck Fan-Out scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const el = fashionSectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // When section enters top 80% to bottom 20%
      const start = windowH * 0.85;
      const end = windowH * 0.15;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

      if (isReducedMotion()) {
        setFanProgress(1);
        return;
      }

      setFanProgress(progress);

      // Check snap points (0.25, 0.5, 0.75, 1.0)
      const snapIdx = Math.floor(progress * 4);
      if (snapIdx !== lastSnapIdxRef.current && progress > 0.05 && progress < 0.98) {
        lastSnapIdxRef.current = snapIdx;
        playSnapAudio();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(8);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [playSnapAudio]);

  // Registration slider handler
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setRegistration(val);
    if (val === 50) {
      setIsRegisteredFlash(true);
      setTimeout(() => setIsRegisteredFlash(false), 800);
    }
  };

  const getRegistrationValueText = (val: number) => {
    if (val === 50) return '50 — ALIGNED';
    if (val < 50) return `${val} — UNDER-REGISTERED`;
    return `${val} — OVER-REGISTERED`;
  };

  const regOffsetVw = (registration - 50) * 0.12;

  return (
    <section aria-label="Four Disciplines of Nigerian Creative History" className="relative w-full">
      {/* ========================================================
          1. PHOTOGRAPHY BAND: cream ground, ink text
      ======================================================== */}
      <div
        id="photography"
        data-ground="cream"
        className="relative w-full min-h-[100svh] bg-[#F0E8D8] text-[#11110F] px-6 py-24 md:px-16 overflow-hidden flex flex-col justify-between"
      >
        <TornDivider color="#F0E8D8" position="top" height={60} />

        <div className="relative z-10 max-w-4xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-2">
            DISCIPLINE 01
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(3.5rem,11vw,11rem)] leading-[0.84] text-[#11110F] tracking-tighter"
          >
            PHOTOGRAPHY
          </MaskRiseText>
          <p className="font-display-wide text-2xl md:text-3xl text-[#11110F] mt-3 font-semibold">
            Light, fixed on paper.
          </p>
        </div>

        {/* Living Dossier Set: 3 Historical Photos fully visible at rest */}
        <div className="relative z-20 my-8 w-full">
          <ArtifactCardSet
            heading="DOSSIER // 01 PHOTOGRAPHY — HISTORICAL GLASS NEGATIVES"
            descriptor="EARLY PORTRAITURE REGISTER"
            artifactIds={['ph-hist-1', 'ph-hist-2', 'ph-hist-3']}
            onOpenDetail={onOpenArtifact}
          />
        </div>

        {/* Wide strip: ph-darkroom */}
        <div className="relative z-10 w-full overflow-hidden mt-2">
          <button
            type="button"
            onClick={() => onOpenArtifact('ph-darkroom')}
            className="group block w-full h-32 md:h-40 bg-[#11110F] text-left overflow-hidden cursor-pointer relative"
            aria-label="Open artifact: Darkroom under a safelight"
          >
            <ArchivalImage
              src="/img/ph-darkroom.jpg"
              alt="Darkroom trays and developing basins"
              discipline="photography"
              className="w-full h-full object-cover object-bottom"
            />
            <div className="absolute bottom-2 left-4 bg-[#11110F]/85 px-3 py-1">
              <span className="font-mono text-[12px] text-[#F0E8D8] uppercase tracking-wider font-bold">
                ph-darkroom — Darkroom under a safelight [Conceptual Still Life]
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. MUSIC BAND: ink ground, cream/vermilion text
      ======================================================== */}
      <div
        ref={musicSectionRef}
        id="music"
        data-ground="ink"
        className="relative w-full min-h-[100svh] bg-[#11110F] text-[#F0E8D8] px-6 py-24 md:px-16 overflow-hidden flex flex-col justify-between"
      >
        <TornDivider color="#11110F" position="top" height={64} />

        <div className="relative z-20 max-w-4xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block mb-2">
            DISCIPLINE 02
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(3.5rem,11vw,11rem)] leading-[0.84] text-[#F0E8D8] tracking-tighter"
          >
            MUSIC
          </MaskRiseText>
          <p className="font-display-wide text-2xl md:text-3xl text-[#E4D9C0] mt-3 font-semibold">
            Sound, sleeved.
          </p>
        </div>

        {/* Music Display: Interactive Vinyl Disc Player + 3 Instruments */}
        {tracks.length > 0 && (
          <div className="relative z-10 my-10 min-h-[580px] flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Interactive Vinyl Disc: The Disc IS the player */}
            <div
              className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] shrink-0 rounded-full vinyl-disc shadow-2xl border-4 border-[#252522] z-10 flex items-center justify-center select-none"
              style={{
                transform: `rotate(${recordRotation}deg)`,
                transition: isReducedMotion() ? 'none' : 'transform 0.05s linear',
              }}
              aria-label="Interactive Vinyl Record Player"
            >
              {/* Disc Center Label */}
              <div
                className="w-[45%] h-[45%] rounded-full disc-label bg-[#E43D27] flex flex-col items-center justify-center text-center p-4 border-4 border-[#11110F] shadow-inner relative z-20 will-change-transform"
                style={{
                  transform: 'scale(calc(1 + var(--bass, 0) * 0.04))',
                }}
              >
                {/* 64px Visible Play Button */}
                <div className="mb-2">
                  <MagneticButton
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause playback' : 'Play audio'}
                    aria-pressed={isPlaying}
                    className="w-16 h-16 rounded-full disc-btn bg-[#F0E8D8] text-[#11110F] flex items-center justify-center shadow-xl hover:bg-[#E8F044] transition-colors cursor-pointer border-2 border-[#11110F]"
                  >
                    {isPlaying ? (
                      <Pause size={28} fill="#11110F" />
                    ) : (
                      <Play size={28} fill="#11110F" className="ml-1" />
                    )}
                  </MagneticButton>
                </div>

                {/* Track title under play button */}
                <span className="font-display-condensed text-base md:text-lg text-[#F0E8D8] tracking-wider leading-tight max-w-[160px] truncate block">
                  {currentTrack?.title || 'LISTENING ROOM'}
                </span>

                {/* Prev / Next controls */}
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevTrack();
                    }}
                    aria-label="Previous track"
                    className="p-1 text-[#11110F] hover:text-[#F0E8D8] transition-colors cursor-pointer"
                  >
                    <SkipBack size={16} />
                  </button>

                  <span className="font-mono text-[9px] text-[#11110F] font-black uppercase tracking-widest">
                    33 ⅓ RPM
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextTrack();
                    }}
                    aria-label="Next track"
                    className="p-1 text-[#11110F] hover:text-[#F0E8D8] transition-colors cursor-pointer"
                  >
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Living Dossier Set: 3 Real Instruments */}
            <div className="relative z-10 w-full">
              <ArtifactCardSet
                heading="DOSSIER // 02 MUSIC — PERCUSSION & RESONANCE ACCESSIONS"
                descriptor="ORGANOLOGICAL ARCHIVES"
                artifactIds={['mu-inst-1', 'mu-inst-2', 'mu-inst-3']}
                onOpenDetail={onOpenArtifact}
              />
            </div>
          </div>
        )}

        {/* Embed Player Card for YouTube / External Streams */}
        {currentTrack && currentTrack.kind !== 'file' && (
          <div className="relative z-20 my-6 bg-[#F0E8D8] text-[#11110F] p-5 border-2 border-[#11110F] shadow-2xl max-w-xl mx-auto w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#E43D27] font-bold">
                Listening Room • Official Stream
              </span>
              <a
                href={currentTrack.src.replace('/embed/', '/watch?v=').replace('?enablejsapi=1', '')}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-[#11110F] hover:text-[#E43D27] underline flex items-center gap-1 font-bold"
              >
                <span>Listen on YouTube ↗</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="aspect-video w-full bg-[#11110F] overflow-hidden">
              <iframe
                src={currentTrack.src}
                title={currentTrack.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="mt-3 flex justify-between items-center text-xs font-mono text-[#44423C]">
              <span className="truncate">{currentTrack.credit}</span>
              <span className="shrink-0">{currentTrack.licence}</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          3. FASHION BAND: paper-2 ground (#E4D9C0), ink text
          Sticky film strip: 4 textile strips scrolling as accordion/deck
      ======================================================== */}
      <div
        ref={fashionSectionRef}
        id="fashion"
        data-ground="paper-2"
        className="relative w-full min-h-[100svh] bg-[#E4D9C0] text-[#11110F] px-6 py-24 md:px-16 overflow-hidden flex flex-col justify-between"
      >
        <TornDivider color="#E43D27" position="top" height={68} />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/img/tex-paper.jpg')] bg-repeat opacity-35 mix-blend-multiply pointer-events-none"
        />

        <div className="relative z-10 max-w-4xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-2">
            DISCIPLINE 03
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(3.5rem,11vw,11rem)] leading-[0.84] text-[#11110F] tracking-tighter"
          >
            FASHION
          </MaskRiseText>
          <p className="font-display-wide text-2xl md:text-3xl text-[#11110F] mt-3 font-semibold">
            Identity, worn.
          </p>
        </div>

        {/* Living Dossier Set: 4 Textile Codices */}
        <div className="relative z-20 my-8 w-full max-w-7xl">
          <ArtifactCardSet
            heading="DOSSIER // 03 FASHION — INDIGO RESIST & WEAVE REGISTRY"
            descriptor="TEXTILE CODICES"
            layout="4-up"
            artifactIds={['fa-textile-1', 'fa-textile-2', 'fa-textile-3', 'fa-textile-4']}
            onOpenDetail={onOpenArtifact}
          />
        </div>
      </div>

      {/* ========================================================
          4. DESIGN BAND: vermilion ground (#E43D27), ink text
      ======================================================== */}
      <div
        id="design"
        data-ground="vermilion"
        className={`relative w-full min-h-[100svh] bg-[#E43D27] text-[#11110F] px-6 py-24 md:px-16 overflow-hidden flex flex-col justify-between transition-colors duration-300 ${
          isRegisteredFlash ? 'ring-8 ring-[#E8F044]' : ''
        }`}
      >
        <TornDivider color="#E43D27" position="top" height={68} />

        <div className="relative z-10 max-w-4xl">
          <span className="font-mono text-sm uppercase tracking-widest text-[#11110F] font-bold block mb-2">
            DISCIPLINE 04
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(3.5rem,11vw,11rem)] leading-[0.84] text-[#11110F] tracking-tighter"
          >
            DESIGN
          </MaskRiseText>
          <p className="font-display-wide text-2xl md:text-4xl text-[#11110F] mt-3 font-bold">
            Message, printed.
          </p>
        </div>

        {/* Live-text REMEMBER Overprint layers + Interactive Registration Slider defaulting to 35 */}
        <div className="relative z-20 my-10">
          <div className="relative w-full md:w-[70vw] min-h-[220px] md:min-h-[300px] overflow-hidden border-2 border-[#11110F] p-4 bg-[#E43D27]">
            {/* Background design object image */}
            <div className="absolute inset-0 opacity-40 overflow-hidden pointer-events-none">
              <ArchivalImage
                src="/img/de-obj-1.jpg"
                alt="Cast Brass Relief Plaque"
                discipline="design"
                sacred={true}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Layer 1: Ink REMEMBER (Fixed anchor) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display-condensed text-[clamp(3.5rem,13vw,11rem)] text-[#11110F] select-none pointer-events-none"
            >
              REMEMBER
            </div>

            {/* Layer 2: Yellow REMEMBER (Offset by slider) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display-condensed text-[clamp(3.5rem,13vw,11rem)] text-[#E8F044] mix-blend-screen select-none pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(${regOffsetVw}vw, -${regOffsetVw * 0.5}vw, 0)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              REMEMBER
            </div>

            {/* Layer 3: Cream REMEMBER (Offset opposite by slider) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display-condensed text-[clamp(3.5rem,13vw,11rem)] text-[#F0E8D8] mix-blend-screen select-none pointer-events-none will-change-transform"
              style={{
                transform: `translate3d(-${regOffsetVw}vw, ${regOffsetVw * 0.5}vw, 0)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              REMEMBER
            </div>

            {isRegisteredFlash && (
              <div className="absolute top-4 right-4 bg-[#E8F044] text-[#11110F] font-mono text-sm px-4 py-2 font-bold tracking-widest shadow-2xl animate-bounce">
                ✓ REGISTERED — ALIGNED
              </div>
            )}
          </div>

          {/* Native Registration Range Input (defaults to 35) */}
          <div className="mt-6 max-w-xl bg-[#11110F] text-[#F0E8D8] p-4 border border-[#11110F] flex flex-col sm:flex-row items-center gap-4">
            <label
              htmlFor="reg-slider"
              className="font-mono text-xs uppercase tracking-wider font-bold text-[#E8F044] whitespace-nowrap"
            >
              Registration:
            </label>
            <input
              id="reg-slider"
              type="range"
              min="0"
              max="100"
              value={registration}
              onChange={handleRegistrationChange}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={registration}
              aria-valuetext={getRegistrationValueText(registration)}
              className="w-full accent-[#E8F044] cursor-ew-resize h-3"
            />
            <span className="font-mono text-xs uppercase text-[#F0E8D8] tracking-widest font-bold min-w-[140px] text-right">
              {getRegistrationValueText(registration)}
            </span>
          </div>
        </div>

        {/* Living Dossier Set: 3 Design Objects */}
        <div className="relative z-20 my-8 w-full max-w-6xl">
          <ArtifactCardSet
            heading="DOSSIER // 04 DESIGN — CEREMONIAL & DIVINATION CASTINGS"
            descriptor="METALLURGIC & WOOD RELIEF REGISTER"
            artifactIds={['de-obj-1', 'de-obj-2', 'de-obj-3']}
            onOpenDetail={onOpenArtifact}
          />
        </div>

        <div className="relative z-10 pt-4 border-t border-[#11110F]">
          <span className="font-mono text-sm text-[#11110F] uppercase tracking-wider font-bold">
            RELIEF — CAST BRONZE — BEAD EMBROIDERY — CARVED HARDWOOD
          </span>
        </div>
      </div>
    </section>
  );
};
