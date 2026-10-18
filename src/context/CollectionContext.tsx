import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ARTIFACTS, Artifact } from '../data/artifacts';

interface FlyingThumbnail {
  id: string;
  src: string;
  startX: number;
  startY: number;
}

interface CollectionContextType {
  keptIds: string[];
  keptArtifacts: Artifact[];
  totalArchivalCount: number;
  isTrayOpen: boolean;
  flyingThumb: FlyingThumbnail | null;
  toggleKeep: (id: string, event?: React.MouseEvent) => void;
  removeKept: (id: string) => void;
  openTray: () => void;
  closeTray: () => void;
  downloadArchiveContactSheet: () => Promise<void>;
  shareArchive: () => Promise<void>;
  announcement: string;
}

const CollectionContext = createContext<CollectionContextType | null>(null);

export const useCollection = () => {
  const ctx = useContext(CollectionContext);
  if (!ctx) {
    throw new Error('useCollection must be used within CollectionProvider');
  }
  return ctx;
};

const STORAGE_KEY = 'archive_museum_kept_cards_v1';

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const totalArchivalCount = ARTIFACTS.filter((a) => a.kind === 'archival').length; // 13 archival records
  const [keptIds, setKeptIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {
      // sessionStorage unavailable or blocked
    }
    return [];
  });

  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [flyingThumb, setFlyingThumb] = useState<FlyingThumbnail | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const timeoutRef = useRef<number | null>(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(keptIds));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [keptIds]);

  const toggleKeep = useCallback((id: string, event?: React.MouseEvent) => {
    const art = ARTIFACTS.find((a) => a.id === id);
    if (!art) return;

    setKeptIds((prev) => {
      const isAlreadyKept = prev.includes(id);
      if (isAlreadyKept) {
        const next = prev.filter((item) => item !== id);
        setAnnouncement(`Removed from archive: ${art.title}. ${next.length} of ${totalArchivalCount} kept.`);
        return next;
      } else {
        const next = [...prev, id];
        setAnnouncement(`Kept: ${art.title}. ${next.length} of ${totalArchivalCount}.`);

        // Trigger flying thumbnail animation toward header
        if (event) {
          const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
          setFlyingThumb({
            id,
            src: art.file,
            startX: rect.left + rect.width / 2,
            startY: rect.top + rect.height / 2,
          });

          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = window.setTimeout(() => {
            setFlyingThumb(null);
          }, 650);
        }
        return next;
      }
    });
  }, [totalArchivalCount]);

  const removeKept = useCallback((id: string) => {
    const art = ARTIFACTS.find((a) => a.id === id);
    setKeptIds((prev) => {
      const next = prev.filter((item) => item !== id);
      if (art) {
        setAnnouncement(`Removed: ${art.title}. ${next.length} of ${totalArchivalCount} kept.`);
      }
      return next;
    });
  }, [totalArchivalCount]);

  const openTray = useCallback(() => setIsTrayOpen(true), []);
  const closeTray = useCallback(() => setIsTrayOpen(false), []);

  const keptArtifacts = keptIds
    .map((id) => ARTIFACTS.find((a) => a.id === id))
    .filter((a): a is Artifact => Boolean(a));

  // Generate 1080x1350 contact sheet canvas from same-origin images
  const generateCanvasContactSheet = async (): Promise<HTMLCanvasElement> => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await document.fonts.load('16px JetBrains Mono');
        await document.fonts.load('bold 32px Archivo');
      } catch {
        // Font loading fallback
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Cream background
    ctx.fillStyle = '#F0E8D8';
    ctx.fillRect(0, 0, 1080, 1350);

    // Ink border & header
    ctx.fillStyle = '#11110F';
    ctx.fillRect(40, 40, 1000, 80);

    ctx.fillStyle = '#F0E8D8';
    ctx.font = 'bold 36px "Archivo", sans-serif';
    ctx.fillText('ARCHIVE — PERSONAL COLLECTION', 64, 94);

    const today = new Date().toISOString().split('T')[0];
    ctx.fillStyle = '#E8F044';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillText(`SESSION DOSSIER · ${today} · ${keptArtifacts.length} ARTIFACTS`, 64, 114);

    // Inner grid frame
    ctx.strokeStyle = '#11110F';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 130, 1000, 1130);

    // Layout cards up to 6 in a 2x3 or 3x2 grid
    const cardsToDraw = keptArtifacts.slice(0, 6);
    const cols = cardsToDraw.length > 2 ? 3 : 2;
    const rows = Math.ceil(Math.max(1, cardsToDraw.length) / cols);
    const cellW = (1000 - (cols + 1) * 20) / cols;
    const cellH = (1130 - (rows + 1) * 20) / rows;

    for (let i = 0; i < cardsToDraw.length; i++) {
      const art = cardsToDraw[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 50 + col * (cellW + 20);
      const y = 145 + row * (cellH + 20);

      // Card frame
      ctx.fillStyle = '#E4D9C0';
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = '#11110F';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellW, cellH);

      // Load image
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = art.file;
        await new Promise<void>((resolve) => {
          if (img.complete) resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });

        const imgH = cellH * 0.72;
        if (img.naturalWidth > 0) {
          ctx.drawImage(img, x + 6, y + 6, cellW - 12, imgH - 12);
        }
      } catch {
        // Ignore single image failure
      }

      // Title & Accession code
      ctx.fillStyle = '#11110F';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText(art.id.toUpperCase(), x + 8, y + cellH * 0.77);

      ctx.fillStyle = '#11110F';
      ctx.font = 'bold 15px "Archivo", sans-serif';
      const truncatedTitle = art.title.length > 26 ? art.title.slice(0, 24) + '...' : art.title;
      ctx.fillText(truncatedTitle, x + 8, y + cellH * 0.85);

      ctx.fillStyle = '#555';
      ctx.font = '11px "JetBrains Mono", monospace';
      const sub = art.kind === 'archival' ? `${art.makerCulture || ''} · ${art.date || ''}` : 'CONCEPTUAL';
      ctx.fillText(sub.slice(0, 32), x + 8, y + cellH * 0.93);
    }

    // Footer
    ctx.fillStyle = '#11110F';
    ctx.fillRect(40, 1270, 1000, 40);
    ctx.fillStyle = '#F0E8D8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('NIGERIAN CREATIVE HISTORY ARCHIVE · NO DATA UPLOADED · CLIENT SESSION PROOF', 60, 1295);

    return canvas;
  };

  const downloadArchiveContactSheet = async () => {
    try {
      const canvas = await generateCanvasContactSheet();
      const link = document.createElement('a');
      link.download = `ARCHIVE-dossier-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('Contact sheet export failed', err);
    }
  };

  const shareArchive = async () => {
    try {
      const canvas = await generateCanvasContactSheet();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'archive-dossier.png', { type: 'image/png' });

        if (typeof navigator !== 'undefined' && 'canShare' in navigator && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'ARCHIVE — Digital Museum of Nigerian Creative History',
              text: `My curated collection of ${keptArtifacts.length} archival objects.`,
              files: [file],
            });
            return;
          } catch (e: unknown) {
            if ((e as Error)?.name === 'AbortError') return;
          }
        }

        // Fallback: trigger download
        downloadArchiveContactSheet();
      }, 'image/png');
    } catch {
      downloadArchiveContactSheet();
    }
  };

  return (
    <CollectionContext.Provider
      value={{
        keptIds,
        keptArtifacts,
        totalArchivalCount,
        isTrayOpen,
        flyingThumb,
        toggleKeep,
        removeKept,
        openTray,
        closeTray,
        downloadArchiveContactSheet,
        shareArchive,
        announcement,
      }}
    >
      {/* Screen Reader Live announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {children}
    </CollectionContext.Provider>
  );
};
