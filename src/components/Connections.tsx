import React, { useState } from 'react';
import { ARTIFACTS } from '../data/artifacts';
import { ArchivalImage } from './ArchivalImage';
import { MaskRiseText } from './MaskRiseText';
import { ArtifactCardSet } from './ArtifactCardSet';

interface ConnectionsProps {
  onOpenArtifact: (id: string) => void;
}

// 9 composed nodes across disciplines with hand-tuned positions (x%, y%)
const NETWORK_NODES: { id: string; x: number; y: number; rot: number; size: number }[] = [
  { id: 'ph-hist-1', x: 18, y: 18, rot: -2, size: 165 },
  { id: 'ph-hist-2', x: 48, y: 14, rot: 2, size: 155 },
  { id: 'mu-inst-2', x: 80, y: 22, rot: -3, size: 165 },
  { id: 'de-obj-2', x: 22, y: 48, rot: 0, size: 165 }, // Sacred: rot 0
  { id: 'mu-inst-1', x: 50, y: 46, rot: 0, size: 175 }, // Sacred: rot 0
  { id: 'fa-textile-2', x: 82, y: 54, rot: 2, size: 160 },
  { id: 'de-obj-1', x: 18, y: 80, rot: 0, size: 165 }, // Sacred: rot 0
  { id: 'fa-textile-1', x: 48, y: 78, rot: 2, size: 170 },
  { id: 'fa-textile-3', x: 80, y: 82, rot: 0, size: 160 }, // Sacred: rot 0
];

// Defined cross-disciplinary connection threads between the 9 nodes
const THREADS: [string, string][] = [
  ['ph-hist-1', 'ph-hist-2'],
  ['ph-hist-1', 'fa-textile-1'],
  ['ph-hist-2', 'fa-textile-2'],
  ['mu-inst-1', 'de-obj-1'],
  ['mu-inst-1', 'ph-hist-1'],
  ['mu-inst-2', 'fa-textile-2'],
  ['mu-inst-2', 'de-obj-2'],
  ['de-obj-1', 'de-obj-2'],
  ['de-obj-1', 'fa-textile-3'],
  ['fa-textile-1', 'fa-textile-2'],
  ['fa-textile-3', 'de-obj-2'],
];

export const Connections: React.FC<ConnectionsProps> = ({ onOpenArtifact }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedArtifact = selectedId ? ARTIFACTS.find((a) => a.id === selectedId) : null;

  // Connected node IDs
  const connectedIds = new Set<string>();
  if (selectedId) {
    connectedIds.add(selectedId);
    THREADS.forEach(([a, b]) => {
      if (a === selectedId) connectedIds.add(b);
      if (b === selectedId) connectedIds.add(a);
    });
  }

  const connectedNames = Array.from(connectedIds)
    .filter((id) => id !== selectedId)
    .map((id) => ARTIFACTS.find((a) => a.id === id)?.title)
    .filter(Boolean) as string[];

  const handleToggle = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="connections"
      data-ground="ink"
      aria-label="Connections"
      className="relative w-full min-h-[100svh] bg-[#11110F] text-[#F0E8D8] px-6 py-24 md:px-16 overflow-hidden flex flex-col justify-between"
    >
      {/* Heading */}
      <div className="relative z-10 max-w-3xl mb-8">
        <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-2">
          04 NETWORK
        </span>
        <MaskRiseText
          as="h2"
          className="font-display-condensed text-[clamp(3rem,9vw,9rem)] leading-[0.86] text-[#F0E8D8] tracking-tight"
        >
          Nothing is made alone.
        </MaskRiseText>
        <p className="font-body-editorial text-lg md:text-xl text-[#8B8982] mt-3">
          Every motif echoes an adjacent practice across the workshop floor.
        </p>

        {selectedId && (
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="min-h-[44px] px-4 py-2 font-mono text-xs uppercase tracking-wider bg-[#E43D27] text-[#11110F] font-bold hover:bg-[#E8F044] transition-colors cursor-pointer"
            >
              Clear selection [✕]
            </button>
          </div>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedArtifact
          ? `Selected ${selectedArtifact.title}. Connected to: ${connectedNames.join(', ')}.`
          : 'Selection cleared.'}
      </div>

      {/* DESKTOP MAP: Composed canvas with threads visible at rest (45% opacity) */}
      <div className="hidden md:block relative w-full h-[680px] bg-[#141412] border border-[#222220] my-8 overflow-hidden select-none">
        {/* SVG curved threads: All visible at rest at 45% opacity */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {THREADS.map(([startId, endId], i) => {
            const start = NETWORK_NODES.find((n) => n.id === startId);
            const end = NETWORK_NODES.find((n) => n.id === endId);
            if (!start || !end) return null;

            const isThreadConnected =
              selectedId !== null &&
              (startId === selectedId || endId === selectedId);

            const midX = (start.x + end.x) / 2 + (i % 2 === 0 ? 3 : -3);
            const midY = (start.y + end.y) / 2 + (i % 3 === 0 ? -4 : 4);

            return (
              <path
                key={`${startId}-${endId}`}
                d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
                fill="none"
                stroke="#E43D27"
                strokeWidth={isThreadConnected ? '2.5' : '1'}
                strokeOpacity={isThreadConnected ? '1' : selectedId ? '0.2' : '0.45'}
                strokeDasharray={isThreadConnected ? '0' : '4 3'}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* 9 Composed Nodes: All visible at rest in full colour */}
        {NETWORK_NODES.map((node) => {
          const artifact = ARTIFACTS.find((a) => a.id === node.id);
          if (!artifact) return null;

          const isSelected = selectedId === node.id;
          const isConnected = selectedId !== null && connectedIds.has(node.id);
          const isSacred = artifact.kind === 'archival' && artifact.sacred;

          return (
            <div
              key={node.id}
              className="absolute z-20 transition-all duration-300 will-change-transform"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(${isSelected ? '-65%' : '-50%'}, ${
                  isSelected ? '-55%' : '-50%'
                }) rotate(${isSacred ? 0 : node.rot}deg) scale(${
                  isSelected ? 1.2 : isConnected ? 1.06 : 1
                })`,
                opacity: selectedId && !isConnected ? 0.65 : 1, // Selection emphasizes, never conceals
              }}
            >
              <button
                type="button"
                onClick={() => handleToggle(node.id)}
                aria-pressed={isSelected}
                aria-label={`${artifact.title}, ${artifact.discipline}. ${
                  isSelected ? 'Selected' : 'Press to emphasize connections'
                }`}
                className={`group block p-2 bg-[#1c1c1a] border transition-colors cursor-pointer text-left shadow-2xl ${
                  isSelected
                    ? 'border-[#E43D27] ring-2 ring-[#E43D27]'
                    : isConnected
                    ? 'border-[#E8F044]'
                    : 'border-[#333330] hover:border-[#F0E8D8]'
                }`}
                style={{ width: `${node.size}px` }}
              >
                <div className="w-full aspect-[4/3] bg-[#11110F] overflow-hidden mb-1.5">
                  <ArchivalImage
                    src={artifact.file}
                    alt={artifact.alt}
                    discipline={artifact.discipline}
                    sacred={isSacred}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-mono text-[10px] text-[#8B8982] uppercase">
                    {artifact.discipline}
                  </span>
                  {isSacred && (
                    <span className="font-mono text-[8px] text-[#E43D27] font-bold uppercase">
                      SACRED
                    </span>
                  )}
                </div>
                <span className="block font-display-wide text-xs text-[#F0E8D8] truncate leading-tight mt-0.5">
                  {artifact.title}
                </span>
                <span className="block font-mono text-[9px] text-[#E4D9C0]/80 truncate mt-0.5">
                  {artifact.kind === 'archival' ? artifact.date : ''}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* MOBILE LIST: vertical chain with threads */}
      <div className="md:hidden relative my-8 pl-6 border-l-2 border-[#E43D27]">
        <div className="flex flex-col gap-5">
          {NETWORK_NODES.map((node) => {
            const artifact = ARTIFACTS.find((a) => a.id === node.id);
            if (!artifact) return null;

            const isSelected = selectedId === node.id;
            const isConnected = selectedId !== null && connectedIds.has(node.id);
            const isSacred = artifact.kind === 'archival' && artifact.sacred;

            return (
              <div key={node.id} className="relative">
                <div
                  className={`absolute -left-[31px] top-4 w-3.5 h-3.5 border-2 border-[#11110F] transition-colors duration-300 ${
                    isSelected ? 'bg-[#E8F044]' : 'bg-[#E43D27]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleToggle(node.id)}
                  aria-pressed={isSelected}
                  className={`block w-full p-3 bg-[#181816] border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E43D27] bg-[#221816]'
                      : isConnected
                      ? 'border-[#E8F044]'
                      : 'border-[#333330]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 shrink-0 bg-[#111] overflow-hidden">
                      <ArchivalImage
                        src={artifact.file}
                        alt={artifact.alt}
                        discipline={artifact.discipline}
                        sacred={isSacred}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-mono text-[10px] uppercase text-[#E43D27] block">
                          {artifact.discipline}
                        </span>
                        {isSacred && (
                          <span className="font-mono text-[9px] text-[#E43D27] font-bold uppercase">
                            SACRED
                          </span>
                        )}
                      </div>
                      <span className="font-display-wide text-base text-[#F0E8D8] block truncate">
                        {artifact.title}
                      </span>
                      <span className="font-mono text-[11px] text-[#8B8982] block truncate">
                        {artifact.kind === 'archival' ? `${artifact.makerCulture} · ${artifact.date}` : ''}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Lineage Dossier Set */}
      <div className="relative z-10 my-8">
        <ArtifactCardSet
          heading={
            selectedArtifact
              ? `DOSSIER // LINEAGE OF ${selectedArtifact.title.toUpperCase()}`
              : 'DOSSIER // CROSS-DISCIPLINARY WORKSHOP LINEAGE'
          }
          descriptor="CONNECTED ACCESSED OBJECTS"
          layout="3-up"
          artifactIds={
            selectedId
              ? Array.from(connectedIds).filter((id) => id !== selectedId).slice(0, 3).length >= 2
                ? Array.from(connectedIds).filter((id) => id !== selectedId).slice(0, 3)
                : ['ph-hist-1', 'mu-inst-1', 'fa-textile-1']
              : ['ph-hist-1', 'fa-textile-2', 'mu-inst-2']
          }
          onOpenDetail={onOpenArtifact}
        />
      </div>
    </section>
  );
};
