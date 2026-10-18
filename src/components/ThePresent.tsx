import React, { useEffect, useRef, useState } from 'react';
import { ArchivalImage } from './ArchivalImage';
import { MaskRiseText } from './MaskRiseText';
import { MagneticButton } from './MagneticButton';
import { ArtifactCardSet } from './ArtifactCardSet';
import { useCollection } from '../context/CollectionContext';
import { isReducedMotion } from '../utils/motion';

export interface VisitorFragment {
  id: string;
  dataUrl: string;
  text: string;
  credit: string;
  discipline: string;
  code: string;
  dateStr: string;
  rotation: number;
}

interface ThePresentProps {
  onOpenArtifact: (id: string) => void;
  onAddFragment: (fragment: VisitorFragment) => void;
}

const DISCIPLINE_PHOTOS: Record<string, string> = {
  photography: '/img/ph-hist-1.jpg',
  music: '/img/mu-inst-2.jpg',
  fashion: '/img/fa-textile-1.jpg',
  design: '/img/de-obj-3.jpg',
};

export const ThePresent: React.FC<ThePresentProps> = ({
  onOpenArtifact,
  onAddFragment,
}) => {
  const { keptArtifacts } = useCollection();
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  // Form State
  const [fragmentText, setFragmentText] = useState<string>('');
  const [discipline, setDiscipline] = useState<'photography' | 'music' | 'fashion' | 'design'>('photography');
  const [credit, setCredit] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCard, setGeneratedCard] = useState<VisitorFragment | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 40% threshold FLOOD wipe
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (isReducedMotion()) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setHasEntered(true);
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasEntered]);

  // Compose Accession Card on 1080x1350 canvas
  const handleComposeCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fragmentText.trim().length < 3) {
      setFormError('Please enter at least 3 characters.');
      return;
    }
    if (fragmentText.length > 140) {
      setFormError('Text must not exceed 140 characters.');
      return;
    }
    setFormError(null);
    setIsGenerating(true);

    try {
      // Ensure fonts are loaded if available
      try {
        await document.fonts.load('bold 52px Archivo');
        await document.fonts.load('16px "JetBrains Mono"');
      } catch {
        // Continue if document.fonts is unsupported or network blocked
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas 2d context');

      // 1. Draw base photo from chosen discipline
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = DISCIPLINE_PHOTOS[discipline];
      await new Promise<void>((resolve) => {
        if (img.complete) resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // continue even if fallback
      });

      // Cover fill canvas with image
      ctx.fillStyle = '#11110F';
      ctx.fillRect(0, 0, 1080, 1350);

      if (img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, 1080, 920);
      }

      // 2. Ink overlay at about 55% opacity (Safari safe duotone)
      ctx.fillStyle = '#11110F';
      ctx.globalAlpha = 0.55;
      ctx.fillRect(0, 0, 1080, 920);
      ctx.globalAlpha = 1.0;

      // 3. Vermilion accent band using multiply
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = '#E43D27';
      ctx.fillRect(0, 0, 1080, 920);

      // Vermilion diagonal stripe graphic
      ctx.fillStyle = '#E8F044';
      ctx.fillRect(0, 890, 1080, 30);
      ctx.globalCompositeOperation = 'source-over';

      // 4. Card Bottom Placard (Cream)
      ctx.fillStyle = '#F0E8D8';
      ctx.fillRect(0, 920, 1080, 430);

      // Thin inner border lines
      ctx.strokeStyle = '#11110F';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, 1060, 1330);

      // Metadata Header on Placard
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const code = `ARC-${randNum}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase();

      ctx.fillStyle = '#E43D27';
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillText(code, 60, 980);

      ctx.fillStyle = '#11110F';
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillText(`RECORDED: ${dateStr}`, 600, 980);

      // 5. Visitor Text in Wrapped Display Type
      ctx.fillStyle = '#11110F';
      ctx.font = '900 48px "Archivo", sans-serif';
      ctx.textBaseline = 'top';

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let curY = y;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, curY);
            line = words[n] + ' ';
            curY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, curY);
        return curY + lineHeight;
      };

      wrapText(`"${fragmentText}"`, 60, 1020, 960, 60);

      // Credit and Discipline Tag
      ctx.fillStyle = '#8B8982';
      ctx.font = '700 22px "JetBrains Mono", monospace';
      const creditLine = credit.trim() ? `CREDIT: ${credit.toUpperCase()}` : 'ANONYMOUS ACCESSION';
      ctx.fillText(`${creditLine} — DISCIPLINE: ${discipline.toUpperCase()}`, 60, 1260);

      const dataUrl = canvas.toDataURL('image/png');
      const newFragment: VisitorFragment = {
        id: `frag-${Date.now()}`,
        dataUrl,
        text: fragmentText,
        credit: credit.trim() || 'Anonymous',
        discipline,
        code,
        dateStr,
        rotation: (Math.random() - 0.5) * 10,
      };

      setGeneratedCard(newFragment);
    } catch (err) {
      console.error('Failed to generate card', err);
      setFormError('Failed to generate canvas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedCard) return;
    const a = document.createElement('a');
    a.href = generatedCard.dataUrl;
    a.download = `${generatedCard.code}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!generatedCard) return;
    if (navigator.share) {
      try {
        const blob = await (await fetch(generatedCard.dataUrl)).blob();
        const file = new File([blob], `${generatedCard.code}.png`, { type: 'image/png' });
        await navigator.share({
          title: `ARCHIVE accession card: ${generatedCard.code}`,
          text: `"${generatedCard.text}" — ARCHIVE Digital Museum of Nigerian Creative History`,
          files: [file],
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback: clipboard URL
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMsg('LINK COPIED TO CLIPBOARD');
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastMsg('SHARE VIA PAGE URL');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleAddToArchive = () => {
    if (!generatedCard) return;
    onAddFragment(generatedCard);
    setToastMsg('FRAGMENT DEPOSITED IN INHERITANCE PILE ↓');
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <section
      ref={sectionRef}
      id="present"
      data-ground="yellow"
      aria-label="The Present"
      className="relative w-full min-h-[100svh] bg-[#11110F] text-[#11110F] overflow-hidden"
    >
      {/* FLOOD wipe layer: wipes from top edge on enter once (900ms --ease-cut) */}
      <div
        className="absolute inset-0 bg-[#E8F044] transition-all duration-900 pointer-events-none"
        style={{
          clipPath: hasEntered || isReducedMotion()
            ? 'inset(0% 0% 0% 0%)'
            : 'inset(0% 0% 100% 0%)',
          transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.2, 1)',
        }}
      />

      <div className="relative z-10 px-6 py-24 md:px-16 min-h-[100svh] flex flex-col justify-between">
        {/* Header Block */}
        <div className="max-w-4xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#11110F] font-bold block mb-2">
            06 IMMEDIATE
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(3.5rem,9.5vw,10.5rem)] leading-[0.84] text-[#11110F] tracking-tighter"
          >
            THE PRESENT.
          </MaskRiseText>
          <p className="font-display-wide text-2xl md:text-3xl text-[#11110F] mt-4 max-w-2xl font-bold leading-snug">
            Today’s streets, screens, and playlists are tomorrow’s surviving fragments.
          </p>
        </div>

        {/* Living Dossier Set: 3 Contemporary Still Lifes */}
        <div className="relative z-20 my-8 max-w-6xl w-full">
          <ArtifactCardSet
            heading="DOSSIER // 05 CONTEMPORARY — THE LIVING REPOSITORY"
            descriptor="CONCEPTUAL STILL LIFE CODEX"
            artifactIds={['now-phone', 'now-street-poster', 'now-night-road']}
            onOpenDetail={onOpenArtifact}
          />
        </div>

        {/* Kept Prints on the Present Collage Board */}
        {keptArtifacts.length > 0 && (
          <div className="my-8 p-6 md:p-8 bg-[#11110F] text-[#F0E8D8] border-2 border-[#11110F] shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-6 border-b border-[#333330]">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block mb-1">
                  COLLAGE BOARD
                </span>
                <h3 className="font-display-condensed text-2xl md:text-3xl text-[#F0E8D8]">
                  YOUR ARCHIVE PRINTS ({keptArtifacts.length})
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#8B8982] uppercase">
                SESSION PRINTS PINNED FOR DIALOGUE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {keptArtifacts.map((art, idx) => (
                <div
                  key={art.id}
                  className="bg-[#F0E8D8] text-[#11110F] p-2 border border-[#11110F] shadow-md relative group select-none transition-transform hover:scale-105"
                  style={{
                    transform: isReducedMotion() ? 'none' : `rotate(${(idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3))}deg)`,
                  }}
                >
                  {/* Tape strip */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-[#f8f0c8]/70 border-t border-b border-[#d8c898]/70 shadow-xs pointer-events-none z-10"
                  />
                  <div className="w-full aspect-square bg-[#11110F] overflow-hidden mb-2">
                    <img
                      src={art.file}
                      alt={art.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="block font-mono text-[9px] uppercase font-bold text-[#E43D27] truncate">
                    {art.id.toUpperCase()}
                  </span>
                  <span className="block font-hanken font-bold text-xs truncate">
                    {art.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            MAKE YOUR FRAGMENT (Interactive Accession Card Generator)
        ======================================================== */}
        <div className="my-12 p-6 md:p-10 bg-[#11110F] text-[#F0E8D8] border-2 border-[#11110F] shadow-2xl">
          <div className="max-w-4xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block mb-2">
              PUBLIC INTAKE DESK
            </span>
            <h3 className="font-display-condensed text-3xl md:text-5xl text-[#F0E8D8] mb-2 tracking-tight">
              MAKE YOUR FRAGMENT
            </h3>
            <p className="font-body-editorial text-base md:text-lg text-[#E4D9C0] mb-8">
              Accession a testimony of your era into the living repository.
            </p>

            <form onSubmit={handleComposeCard} className="space-y-6">
              {/* Textarea */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label
                    htmlFor="fragment-text"
                    className="font-mono text-xs uppercase tracking-wider font-bold text-[#F0E8D8]"
                  >
                    What will they find of your generation? *
                  </label>
                  <span
                    className={`font-mono text-xs ${
                      fragmentText.length > 140 ? 'text-[#E43D27] font-bold' : 'text-[#8B8982]'
                    }`}
                  >
                    {fragmentText.length}/140
                  </span>
                </div>
                <textarea
                  id="fragment-text"
                  required
                  rows={3}
                  maxLength={140}
                  value={fragmentText}
                  onChange={(e) => setFragmentText(e.target.value)}
                  placeholder="Record an observation, a song line, a fabric style, or an unforgettable street corner..."
                  aria-describedby="text-counter-hint"
                  className="w-full p-3 bg-[#181816] border border-[#333330] focus:border-[#E8F044] text-[#F0E8D8] font-body-editorial placeholder:text-[#666] outline-none text-base resize-none"
                />
                <span id="text-counter-hint" className="sr-only">
                  Must be between 3 and 140 characters.
                </span>
                {formError && (
                  <p className="mt-1 font-mono text-xs text-[#E43D27] font-bold uppercase">
                    {formError}
                  </p>
                )}
              </div>

              {/* Discipline Radio (4 options) */}
              <div>
                <fieldset>
                  <legend className="font-mono text-xs uppercase tracking-wider font-bold text-[#F0E8D8] mb-3">
                    Select Discipline Domain *
                  </legend>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['photography', 'music', 'fashion', 'design'] as const).map((d) => (
                      <label
                        key={d}
                        className={`min-h-[44px] flex items-center justify-center p-3 border cursor-pointer font-mono text-xs uppercase tracking-wider transition-colors ${
                          discipline === d
                            ? 'bg-[#E8F044] text-[#11110F] border-[#E8F044] font-bold'
                            : 'bg-[#181816] text-[#F0E8D8] border-[#333330] hover:border-[#F0E8D8]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="discipline"
                          value={d}
                          checked={discipline === d}
                          onChange={() => setDiscipline(d)}
                          className="sr-only"
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Optional Credit as */}
              <div>
                <label
                  htmlFor="fragment-credit"
                  className="font-mono text-xs uppercase tracking-wider font-bold text-[#F0E8D8] block mb-2"
                >
                  Credit as (optional, max 30 chars)
                </label>
                <input
                  id="fragment-credit"
                  type="text"
                  maxLength={30}
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="e.g. Lagos Night Walker / Studio Archivist"
                  className="w-full max-w-md p-3 bg-[#181816] border border-[#333330] focus:border-[#E8F044] text-[#F0E8D8] font-body-editorial placeholder:text-[#666] outline-none text-base"
                />
              </div>

              {/* Action Button */}
              <div>
                <MagneticButton
                  type="submit"
                  disabled={isGenerating}
                  className="min-h-[52px] px-8 bg-[#E43D27] text-[#11110F] font-display-condensed text-xl tracking-wider hover:bg-[#E8F044] transition-colors cursor-pointer font-bold uppercase disabled:opacity-50"
                >
                  {isGenerating ? 'Composing Accession Card...' : 'Compose Accession Card ↗'}
                </MagneticButton>
              </div>

              {/* Microcopy disclaimer */}
              <div className="pt-2 text-xs font-mono text-[#8B8982] space-y-1">
                <p>This stays on your device. Nothing is uploaded, saved or published.</p>
                <p>Your fragments disappear when you close this tab.</p>
              </div>
            </form>

            {/* Generated Card Preview & Actions */}
            {generatedCard && (
              <div className="mt-10 pt-8 border-t border-[#333330] animate-fadeIn">
                <div className="font-mono text-xs uppercase text-[#E8F044] font-bold mb-4 tracking-wider">
                  ACCESSION PROOF GENERATED: {generatedCard.code}
                </div>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  {/* Card Visual Preview */}
                  <div className="w-full sm:w-[280px] bg-[#F0E8D8] p-2 shadow-2xl border-2 border-[#11110F] rotate-[-2deg]">
                    <img
                      src={generatedCard.dataUrl}
                      alt={`Generated accession card ${generatedCard.code}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex-1 space-y-4">
                    <p className="font-body-editorial text-lg text-[#F0E8D8]">
                      Accession print rendered at 1080 × 1350 duotone with verified archive serial.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="min-h-[44px] px-5 bg-[#F0E8D8] text-[#11110F] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#E8F044] transition-colors cursor-pointer"
                      >
                        Download PNG
                      </button>
                      <button
                        type="button"
                        onClick={handleShare}
                        className="min-h-[44px] px-5 bg-transparent border border-[#F0E8D8] text-[#F0E8D8] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#E8F044] hover:text-[#11110F] hover:border-[#E8F044] transition-colors cursor-pointer"
                      >
                        Share Accession
                      </button>
                      <button
                        type="button"
                        onClick={handleAddToArchive}
                        className="min-h-[44px] px-5 bg-[#E8F044] text-[#11110F] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#E43D27] hover:text-[#11110F] transition-colors cursor-pointer"
                      >
                        Add to my fragments ↓
                      </button>
                    </div>
                    {toastMsg && (
                      <div
                        role="status"
                        aria-live="polite"
                        className="font-mono text-xs text-[#E8F044] font-bold uppercase tracking-wider mt-2 animate-bounce"
                      >
                        ✓ {toastMsg}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom statement marker */}
        <div className="border-t border-[#11110F] pt-4 flex justify-between font-mono text-xs uppercase tracking-wider text-[#11110F] font-bold">
          <span>RECORDING IN PROGRESS</span>
          <span>LAGOS — LONDON — ACCRA — ATLANTA</span>
        </div>
      </div>
    </section>
  );
};
