import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ARTIFACTS, Artifact } from '../data/artifacts';
import { ArchivalImage } from './ArchivalImage';

interface ArtifactDetailProps {
  artifact: Artifact | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectArtifact: (artifact: Artifact) => void;
}

export const ArtifactDetail: React.FC<ArtifactDetailProps> = ({
  artifact,
  isOpen,
  onClose,
  onSelectArtifact,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const touchStartY = useRef<number>(0);
  const [animStage, setAnimStage] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && artifact) {
      if (!dialog.open) {
        dialog.showModal();
      }
      setTimeout(() => setAnimStage(true), 20);
    } else {
      setAnimStage(false);
      if (dialog.open) {
        dialog.close();
      }
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, artifact]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !artifact) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const related = artifact.relatedIds
        .map((id) => ARTIFACTS.find((a) => a.id === id))
        .filter((a): a is Artifact => Boolean(a));

      if (related.length === 0) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSelectArtifact(related[0]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSelectArtifact(related[related.length - 1]);
      }
    },
    [isOpen, artifact, onClose, onSelectArtifact]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 90) {
      onClose();
    }
  };

  if (!artifact) return null;

  const isSacred = artifact.kind === 'archival' && artifact.sacred;
  const relatedArtifacts = artifact.relatedIds
    .map((id) => ARTIFACTS.find((a) => a.id === id))
    .filter((a): a is Artifact => Boolean(a));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        margin: 0,
        marginLeft: 'auto',
        marginRight: 0,
        transform: animStage ? 'translateX(0%)' : 'translateX(100%)',
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="fixed inset-y-0 right-0 max-h-none h-full w-full md:w-[560px] bg-[#11110F] text-[#F0E8D8] border-l border-[#333330] p-0 backdrop:bg-[#11110F]/75 z-50 open:flex open:flex-col overflow-y-auto will-change-transform"
      aria-labelledby="artifact-dialog-title"
      aria-describedby="artifact-dialog-caption"
    >
      {/* Mobile Swipe handle */}
      <div className="md:hidden w-full flex justify-center py-2 bg-[#11110F]">
        <span className="w-10 h-1 bg-[#444] rounded-none" />
      </div>

      {/* Drawer Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#333330] bg-[#11110F] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold">
            {artifact.discipline}
          </span>
          {isSacred && (
            <span className="bg-[#E43D27] text-[#11110F] font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider">
              SACRED OBJECT
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] px-3 font-mono text-xs uppercase tracking-widest text-[#F0E8D8] hover:text-[#E8F044] border border-[#333330] hover:border-[#E8F044] transition-colors cursor-pointer"
          aria-label="Close artifact details"
        >
          Close [Esc]
        </button>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-6">
        {/* Sacred Notice Banner */}
        {isSacred && (
          <div className="bg-[#1c1816] border-l-4 border-[#E43D27] p-3 text-xs font-mono text-[#F0E8D8] leading-relaxed uppercase">
            SACRED CEREMONIAL ARTIFACT — DISPLAYED UNTOUCHED WITHOUT FILTERS, OVERLAYS, OR OBSCURING CROPS
          </div>
        )}

        {/* Image Frame - Sacred items shown whole (contain) with zero filter or rotation */}
        <div
          className={`relative w-full aspect-[4/3] bg-[#181816] overflow-hidden border ${
            isSacred ? 'border-[#E43D27]' : 'border-[#2a2a26]'
          }`}
        >
          <ArchivalImage
            src={artifact.file}
            alt={artifact.alt}
            discipline={artifact.discipline}
            sacred={isSacred}
            enableDevelop={false}
            className={`w-full h-full ${isSacred ? 'object-contain' : 'object-cover'}`}
          />
        </div>

        {/* Kind Chip */}
        {artifact.kind === 'archival' ? (
          <div className="bg-[#181816] border border-[#333330] px-3.5 py-2 text-[11px] font-mono tracking-wider text-[#E8F044] leading-relaxed uppercase">
            VERIFIED ARCHIVAL RECORD · AUTHENTIC MUSEUM PROVENANCE
          </div>
        ) : (
          <div className="bg-[#1c1c18] border-l-2 border-[#E8F044] px-3 py-2 text-[11px] font-mono tracking-wider text-[#E4D9C0] leading-relaxed uppercase">
            CONCEPTUAL IMAGE · AI-GENERATED STILL LIFE
          </div>
        )}

        {/* Title, Provenance and Caption */}
        <div>
          <h2
            id="artifact-dialog-title"
            className="font-display-condensed text-3xl md:text-4xl text-[#F0E8D8] leading-tight mb-2"
          >
            {artifact.title}
          </h2>

          {artifact.kind === 'archival' && (
            <div className="mb-4 font-mono text-xs space-y-1.5 border-b border-[#2a2a26] pb-4">
              <div className="text-[#E8F044] font-bold">
                {artifact.makerCulture} · {artifact.date}
              </div>
              <div className="text-[#E4D9C0]">
                <span className="text-[#8B8982]">Credit: </span>
                {artifact.creditLine}
              </div>
              <div className="text-[#8B8982]">
                <span>Licence: </span>
                <span className="text-[#F0E8D8]">{artifact.licence}</span>
              </div>
              {artifact.sourceUrl && (
                <div className="pt-2">
                  <a
                    href={artifact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#E8F044] hover:underline underline-offset-4 tracking-wider"
                  >
                    <span>View Museum Source Record</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          <p
            id="artifact-dialog-caption"
            className="font-body-editorial text-[#E4D9C0] leading-relaxed text-base"
          >
            {artifact.caption}
          </p>
        </div>

        {/* Motifs Tags */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#262624]">
          <span className="font-mono text-[11px] text-[#8B8982] self-center mr-2 uppercase">
            Visibly Present Motifs:
          </span>
          {artifact.motifs.map((motif) => (
            <span
              key={motif}
              className="font-mono text-xs uppercase px-2.5 py-1 border border-[#3a3a36] text-[#F0E8D8] tracking-wider"
            >
              #{motif}
            </span>
          ))}
        </div>

        {/* Connected Fragments */}
        <div className="mt-4 pt-6 border-t border-[#333330]">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold">
              CONNECTED FRAGMENTS ({relatedArtifacts.length})
            </h3>
            <span className="hidden sm:inline font-mono text-[10px] text-[#8B8982] uppercase">
              [← → to navigate]
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {relatedArtifacts.map((rel) => {
              const relSacred = rel.kind === 'archival' && rel.sacred;
              return (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectArtifact(rel)}
                  className="group flex items-center gap-4 p-3 bg-[#181816] hover:bg-[#22221e] border border-[#262624] hover:border-[#E8F044] text-left transition-colors cursor-pointer min-h-[44px]"
                >
                  <div className="w-14 h-14 shrink-0 bg-[#242420] overflow-hidden">
                    <ArchivalImage
                      src={rel.file}
                      alt={rel.alt}
                      discipline={rel.discipline}
                      sacred={relSacred}
                      enableDevelop={false}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="block font-mono text-[10px] uppercase text-[#8B8982] tracking-wider">
                        {rel.discipline}
                      </span>
                      {relSacred && (
                        <span className="font-mono text-[9px] text-[#E43D27] font-bold uppercase">
                          SACRED
                        </span>
                      )}
                    </div>
                    <span className="block font-display-wide text-base text-[#F0E8D8] group-hover:text-[#E8F044] truncate">
                      {rel.title}
                    </span>
                    {rel.kind === 'archival' && (
                      <span className="block font-mono text-[10px] text-[#8B8982] truncate">
                        {rel.makerCulture} · {rel.date}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
};
