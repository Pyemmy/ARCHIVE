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
  togglePlay: () => void;
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
  const [hasPlayedOnce, setHasPlayedOnce] = useState<boolean>(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState<boolean>(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [waveformLevels, setWaveformLevels] = useState<number[]>([]);

  // Audio nodes refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Initialize or get Web Audio Context and AnalyserNode on first gesture
  const initWebAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        if (audioRef.current && !sourceNodeRef.current) {
          try {
            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceNodeRef.current = source;
          } catch {
            // Element may already be connected
          }
        }
      }
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
  }, []);

  // Update Media Session API
  const updateMediaSession = useCallback((track: Track) => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'ARCHIVE Digital Museum',
        artwork: [
          { src: track.cover, sizes: '512x512', type: 'image/jpeg' },
        ],
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

  // Play a specific track
  const playTrack = useCallback(async (track: Track) => {
    setAudioError(null);
    setCurrentTrack(track);
    setHasPlayedOnce(true);
    setIsMiniPlayerOpen(true);
    setLiveAnnouncement(`Now playing: ${track.title} by ${track.artist}`);
    updateMediaSession(track);

    if (track.kind === 'file') {
      initWebAudio();
      const audio = audioRef.current;
      if (audio) {
        audio.src = track.src;
        audio.volume = volume;
        try {
          await audio.play();
          setIsPlaying(true);
        } catch {
          setAudioError('Playback was interrupted. Click Retry to play.');
          setIsPlaying(false);
        }
      }
    } else {
      // Embed track (YouTube / embed)
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(true);
    }
  }, [initWebAudio, volume, updateMediaSession]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (currentTrack.kind === 'file') {
      initWebAudio();
      const audio = audioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setLiveAnnouncement(`Paused: ${currentTrack.title}`);
      } else {
        setHasPlayedOnce(true);
        setIsMiniPlayerOpen(true);
        audio.play().then(() => {
          setIsPlaying(true);
          setAudioError(null);
          setLiveAnnouncement(`Now playing: ${currentTrack.title} by ${currentTrack.artist}`);
        }).catch(() => {
          setAudioError('Unable to start playback. Click Retry.');
          setIsPlaying(false);
        });
      }
    } else {
      // For embed tracks, toggle play state
      setIsPlaying((prev) => !prev);
      setHasPlayedOnce(true);
      setIsMiniPlayerOpen(true);
    }
  }, [currentTrack, isPlaying, initWebAudio]);

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
      // Ease CSS variables to 0
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
    if (!analyser) return;

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

      // Bass bins (approx 20-150 Hz): bins 0..4
      let bassSum = 0;
      for (let i = 0; i < 4; i++) bassSum += dataArray[i];
      const rawBass = bassSum / (4 * 255);

      // Mid bins (approx 150-2500 Hz): bins 4..16
      let midSum = 0;
      for (let i = 4; i < 16; i++) midSum += dataArray[i];
      const rawMid = midSum / (12 * 255);

      // Total level
      let totalSum = 0;
      for (let i = 0; i < bufferLength; i++) totalSum += dataArray[i];
      const rawLevel = totalSum / (bufferLength * 255);

      // Smooth lerp (0.2)
      smoothedBass += (rawBass - smoothedBass) * 0.22;
      smoothedMid += (rawMid - smoothedMid) * 0.2;
      smoothedLevel += (rawLevel - smoothedLevel) * 0.22;

      document.documentElement.style.setProperty('--bass', smoothedBass.toFixed(3));
      document.documentElement.style.setProperty('--mid', smoothedMid.toFixed(3));
      document.documentElement.style.setProperty('--level', smoothedLevel.toFixed(3));

      // 16 points for live SVG waveform in Header
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

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
      setAudioError('Audio playback failed to load.');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
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
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />

      {/* Screen Reader Live Announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {children}
    </AudioContext.Provider>
  );
};
