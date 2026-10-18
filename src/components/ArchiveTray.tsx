import React, { useEffect, useRef } from 'react';
import { useCollection } from '../context/CollectionContext';
import { X, Trash2, Download, Share2, ArrowRight } from 'lucide-react';

export const ArchiveTray: React.FC = () => {
  const {
    keptArtifacts,
    isTrayOpen,
    closeTray,
    removeKept,
    downloadArchiveContactSheet,
    shareArchive,
    totalArchivalCount,
  } = useCollection();

  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trap & escape key handler
  useEffect(() => {
    if (!isTrayOpen) return;

    firstFocusableRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTray();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTrayOpen, closeTray]);

  if (!isTrayOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tray-heading"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-[#11110F]/70 backdrop-blur-xs transition-opacity"
        onClick={closeTray}
        aria-hidden="true"
      />

      {/* Tray Sheet (Right drawer on desktop, bottom sheet on mobile) */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full md:w-[460px] h-full bg-[#F0E8D8] text-[#11110F] border-l-2 border-[#11110F] shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Tray Header */}
        <div className="p-6 border-b-2 border-[#11110F] bg-[#F0E8D8] flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-1">
              SESSION DOSSIER
            </span>
            <h2 id="tray-heading" className="font-display-condensed text-3xl text-[#11110F] leading-none">
              YOUR ARCHIVE ({keptArtifacts.length}/{totalArchivalCount})
            </h2>
          </div>

          <button
            ref={firstFocusableRef}
            type="button"
            onClick={closeTray}
            className="min-h-[44px] min-w-[44px] p-2 text-[#11110F] hover:bg-[#11110F] hover:text-[#F0E8D8] transition-colors border border-[#11110F] flex items-center justify-center cursor-pointer"
            aria-label="Close archive tray"
          >
            <X size={20} />
          </button>
        </div>

        {/* Kept List or Empty State */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {keptArtifacts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#11110F]/30">
              <span className="font-display-condensed text-2xl text-[#11110F] mb-2">
                YOUR TRAY IS EMPTY
              </span>
              <p className="font-body-editorial text-sm text-[#55534E] max-w-xs mb-4">
                Keep a card to start your archive. Every accession card has a visible "Keep" action.
              </p>
              <button
                type="button"
                onClick={closeTray}
                className="min-h-[44px] px-5 bg-[#11110F] text-[#F0E8D8] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#E8F044] hover:text-[#11110F] transition-colors cursor-pointer"
              >
                Explore exhibitions
              </button>
            </div>
          ) : (
            keptArtifacts.map((art) => (
              <div
                key={art.id}
                className="bg-[#E4D9C0] border border-[#11110F] shadow-[3px_3px_0px_#11110F] p-3 flex items-center gap-3 relative group"
              >
                <img
                  src={art.file}
                  alt={art.alt}
                  className="w-16 h-16 object-cover border border-[#11110F] shrink-0 bg-[#11110F]"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[10px] text-[#E43D27] uppercase font-bold block">
                    {art.id.toUpperCase()} · {art.discipline}
                  </span>
                  <span className="font-hanken font-bold text-sm text-[#11110F] block truncate">
                    {art.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#55534E] block truncate">
                    {art.kind === 'archival' ? `${art.makerCulture} · ${art.date}` : 'CONCEPTUAL'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeKept(art.id)}
                  className="min-h-[44px] min-w-[44px] p-2 text-[#11110F]/60 hover:text-[#E43D27] hover:bg-[#11110F]/10 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label={`Remove ${art.title} from your archive`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Tray Footer & Export Actions */}
        <div className="p-6 border-t-2 border-[#11110F] bg-[#F0E8D8] space-y-4">
          {keptArtifacts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={downloadArchiveContactSheet}
                className="min-h-[44px] flex-1 px-4 py-2.5 bg-[#11110F] text-[#F0E8D8] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#E8F044] hover:text-[#11110F] transition-colors flex items-center justify-center gap-2 border border-[#11110F] cursor-pointer"
              >
                <Download size={15} />
                <span>Download my archive</span>
              </button>

              <button
                type="button"
                onClick={shareArchive}
                className="min-h-[44px] px-4 py-2.5 bg-[#E8F044] text-[#11110F] font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#11110F] hover:text-[#F0E8D8] transition-colors flex items-center justify-center gap-2 border border-[#11110F] cursor-pointer"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          )}

          {/* Microcopy */}
          <div className="font-mono text-[11px] text-[#55534E] leading-relaxed">
            Kept cards stay on your device for this session. Nothing is uploaded.
          </div>
        </div>
      </div>
    </div>
  );
};
