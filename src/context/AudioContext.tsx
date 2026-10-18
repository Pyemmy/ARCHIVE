import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { TRACKS, Track } from '../data/tracks';
import { isReducedMotion } from '../utils/motion';

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  hasPlayedOnce: boolean;
  isMiniPlayerOpen: boolean;
  audioError: string | null;
  waveformLevels: number[];
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  closeMiniPlayer: () => void;
  retryPlayback: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(TRACKS.length > 0 ? TRACKS[0] : null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [hasPlayedOnce, setHasPlayedOnce] = useState<boolean>(true);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [waveformLevels, setWaveformLevels] = useState<number[]>([]);

  // Audio element & Web Audio nodes
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Set initial audio source on mount
  useEffect(() => {
    if (audioRef.current && TRACKS[0]?.kind === 'file') {
      audioRef.current.src = TRACKS[0].src;
    }
  }, []);

  // Setup Web Audio Analyser optionally inside a user gesture
  const setupAnalyserIfPossible = async (audioEl: HTMLAudioElement, isCrossOrigin: boolean) => {
    // Skip analyser on iOS Safari (Web Audio can be muted by hardware silent switch) or cross-origin
    const isIOSSafari =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    if (isIOSSafari || isCrossOrigin) {
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtxClass) return;
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // ONLY if context is running and source hasn't been connected for this audio element
      if (ctx.state === 'running' && !sourceNodeRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(ctx.destination); // MUST connect to destination or output is silent

        analyserRef.current = analyser;
        sourceNodeRef.current = source;
      }
    } catch (err) {
      // Gracefully fall back to playing without analyser
      console.warn('Web Audio Analyser skipped, proceeding with direct HTML5 audio output', err);
      analyserRef.current = null;
    }
  };

  // Update Media Session API
  const updateMediaSession = useCallback((track: Track) => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'ARCHIVE Digital Museum',
        artwork: [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }],
      });
      navigator.mediaSession.setActionHandler('play', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });
    }
  }, []);

  // Play a specific track (starting a track stops any other)
  const playTrack = useCallback(async (track: Track) => {
    setAudioError(null);
    setCurrentTrack(track);
    setHasPlayedOnce(true);
    setIsMiniPlayerOpen(true);
    setLiveAnnouncement(`Now playing: ${track.title} by ${track.artist}`);
    updateMediaSession(track);

    const audio = audioRef.current;

    if (track.kind === 'file') {
      if (audio) {
        // Wait for any existing play promise before changing src to prevent race interruptions
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch {
            // Expected interruption
          }
        }

        const isCrossOrigin = track.src.startsWith('http://') || track.src.startsWith('https://');
        if (isCrossOrigin) {
          audio.crossOrigin = 'anonymous';
        } else {
          audio.removeAttribute('crossorigin');
        }

        // Set src ONLY if actually changed to avoid triggering unnecessary load events
        const isSameSrc = audio.getAttribute('src') === track.src || audio.src.endsWith(track.src);
        if (!isSameSrc) {
          audio.src = track.src;
        }
        audio.volume = volume;

        try {
          const promise = audio.play();
          playPromiseRef.current = promise;
          await promise;
          setAudioError(null);
        } catch (err: any) {
          // If aborted or interrupted by subsequent user track switch or pause, ignore cleanly
          if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
            return;
          }
          console.error('Audio play failed:', err);
          setAudioError("This track couldn't load");
        } finally {
          playPromiseRef.current = null;
        }

        // Setup analyser optionally in background
        setupAnalyserIfPossible(audio, isCrossOrigin);
      }
    } else {
      // Embed track (YouTube/external) -> stop HTML5 audio
      if (audio) {
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch {
            // Ignore
          }
        }
        audio.pause();
      }
      setIsPlaying(true);
    }
  }, [volume, updateMediaSession]);

  // Toggle playback in user's click handler
  const togglePlay = useCallback(async () => {
    if (!currentTrack) return;

    if (currentTrack.kind === 'file') {
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch {
            // Ignore
          }
        }
        audio.pause();
        setLiveAnnouncement(`Paused: ${currentTrack.title}`);
      } else {
        setHasPlayedOnce(true);
        setIsMiniPlayerOpen(true);

        // Wait for any in-flight play request
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch {
            // Ignore
          }
        }

        const isCrossOrigin =
          currentTrack.src.startsWith('http://') || currentTrack.src.startsWith('https://');
        if (isCrossOrigin) {
          audio.crossOrigin = 'anonymous';
        } else {
          audio.removeAttribute('crossorigin');
        }

        const isSameSrc =
          audio.getAttribute('src') === currentTrack.src || audio.src.endsWith(currentTrack.src);
        if (!isSameSrc) {
          audio.src = currentTrack.src;
        }
        audio.volume = volume;

        try {
          const promise = audio.play();
          playPromiseRef.current = promise;
          await promise;
          setAudioError(null);
          setLiveAnnouncement(`Now playing: ${currentTrack.title} by ${currentTrack.artist}`);
        } catch (err: any) {
          if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
            return;
          }
          console.error('Audio togglePlay failed:', err);
          setAudioError("This track couldn't load");
        } finally {
          playPromiseRef.current = null;
        }

        // Setup analyser optionally in background without blocking play gesture
        setupAnalyserIfPossible(audio, isCrossOrigin);
      }
    } else {
      setIsPlaying((prev) => !prev);
      setHasPlayedOnce(true);
      setIsMiniPlayerOpen(true);
    }
  }, [currentTrack, isPlaying, volume]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && currentTrack?.kind === 'file') {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, [currentTrack]);

  const setVolumeLevel = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (TRACKS.length === 0) return;
    const currentIndex = TRACKS.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = (currentIndex + 1) % TRACKS.length;
    playTrack(TRACKS[nextIdx]);
  }, [currentTrack, playTrack]);

  const prevTrack = useCallback(() => {
    if (TRACKS.length === 0) return;
    const currentIndex = TRACKS.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
    playTrack(TRACKS[prevIdx]);
  }, [currentTrack, playTrack]);

  const closeMiniPlayer = useCallback(() => {
    setIsMiniPlayerOpen(false);
  }, []);

  const retryPlayback = useCallback(() => {
    if (currentTrack) {
      playTrack(currentTrack);
    }
  }, [currentTrack, playTrack]);

  // AnalyserNode rAF animation loop computing --bass, --mid, --level
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isPlaying || currentTrack?.kind !== 'file' || isReducedMotion()) {
      document.documentElement.style.setProperty('--bass', '0');
      document.documentElement.style.setProperty('--mid', '0');
      document.documentElement.style.setProperty('--level', '0');
      setWaveformLevels([]);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const analyser = analyserRef.current;
    if (!analyser) {
      // If analyser is not active, synthesize subtle audio activity based on isPlaying state
      document.documentElement.style.setProperty('--bass', '0.15');
      document.documentElement.style.setProperty('--mid', '0.12');
      document.documentElement.style.setProperty('--level', '0.18');
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let smoothedBass = 0;
    let smoothedMid = 0;
    let smoothedLevel = 0;

    const renderAudioLoop = () => {
      if (document.hidden) {
        rafIdRef.current = requestAnimationFrame(renderAudioLoop);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      let bassSum = 0;
      for (let i = 0; i < 4; i++) bassSum += dataArray[i];
      const rawBass = bassSum / (4 * 255);

      let midSum = 0;
      for (let i = 4; i < 16; i++) midSum += dataArray[i];
      const rawMid = midSum / (12 * 255);

      let totalSum = 0;
      for (let i = 0; i < bufferLength; i++) totalSum += dataArray[i];
      const rawLevel = totalSum / (bufferLength * 255);

      smoothedBass += (rawBass - smoothedBass) * 0.22;
      smoothedMid += (rawMid - smoothedMid) * 0.2;
      smoothedLevel += (rawLevel - smoothedLevel) * 0.22;

      document.documentElement.style.setProperty('--bass', smoothedBass.toFixed(3));
      document.documentElement.style.setProperty('--mid', smoothedMid.toFixed(3));
      document.documentElement.style.setProperty('--level', smoothedLevel.toFixed(3));

      const levels: number[] = [];
      const step = Math.floor(bufferLength / 16);
      for (let i = 0; i < 16; i++) {
        levels.push((dataArray[i * step] || 0) / 255);
      }
      setWaveformLevels(levels);

      rafIdRef.current = requestAnimationFrame(renderAudioLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderAudioLoop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      document.documentElement.style.setProperty('--bass', '0');
      document.documentElement.style.setProperty('--mid', '0');
      document.documentElement.style.setProperty('--level', '0');
    };
  }, [isPlaying, currentTrack]);

  // Wire audio element events directly to state: play, pause, ended, timeupdate, error, loadedmetadata
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setIsPlaying(true);
      setAudioError(null);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };
    const onError = () => {
      if (audio.error && audio.error.code !== 0) {
        setAudioError("This track couldn't load");
        setIsPlaying(false);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [nextTrack]);

  return (
    <AudioContext.Provider
      value={{
        tracks: TRACKS,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        hasPlayedOnce,
        isMiniPlayerOpen,
        audioError,
        waveformLevels,
        playTrack,
        togglePlay,
        seek,
        setVolumeLevel,
        nextTrack,
        prevTrack,
        closeMiniPlayer,
        retryPlayback,
      }}
    >
      {/* Single HTML5 <audio> element with preload="metadata" managed imperatively via ref to prevent React reconciliation from interrupting playback */}
      <audio ref={audioRef} preload="metadata" playsInline />

      {/* Screen Reader Live Announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {children}
    </AudioContext.Provider>
  );
};
