import React, { useState } from 'react';
import { ARTIFACTS, ArchivalArtifact } from '../data/artifacts';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export const Colophon: React.FC = () => {
  const [isCreditsExpanded, setIsCreditsExpanded] = useState<boolean>(false);

  const archivalArtifacts = ARTIFACTS.filter(
    (a): a is ArchivalArtifact => a.kind === 'archival'
  );

  return (
    <footer
      id="colophon"
      data-ground="ink"
      aria-label="Colophon and Credits"
      className="relative w-full bg-[#11110F] text-[#F0E8D8] border-t border-[#262624] px-6 py-16 md:px-16"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#262624] pb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-2">
              08 COLOPHON
            </span>
            <h2 className="font-display-condensed text-4xl md:text-6xl text-[#F0E8D8] tracking-tight">
              ARCHIVE
            </h2>
          </div>
          <div className="font-mono text-xs text-[#8B8982] uppercase tracking-wider">
            <span>A DIGITAL MUSEUM OF NIGERIAN CREATIVE HISTORY</span>
          </div>
        </div>

        {/* Institution Statement */}
        <div className="max-w-3xl">
          <p className="font-body-editorial text-xl md:text-2xl text-[#F0E8D8] leading-relaxed font-medium">
            Archival records are credited to their holding institutions and reproduced under open cultural access licenses. Conceptual studies are designated as interpretive historical reconstructions.
          </p>
          <p className="font-body-editorial text-base md:text-lg text-[#8B8982] mt-4 leading-relaxed">
            Every artifact in this index has been curated as an art-directed fragment to examine how creative culture endures across media, materials, and generations.
          </p>
        </div>

        {/* Discreet Expandable Attributions & Licensing Panel */}
        <div className="pt-2 border-t border-[#222220]">
          <button
            type="button"
            onClick={() => setIsCreditsExpanded((prev) => !prev)}
            aria-expanded={isCreditsExpanded}
            className="w-full flex items-center justify-between py-4 text-left font-mono text-xs uppercase tracking-wider text-[#8B8982] hover:text-[#F0E8D8] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E43D27] inline-block" />
              <span className="font-bold text-[#E4D9C0] group-hover:text-[#F0E8D8]">
                Institutional Provenance & Image Attributions ({archivalArtifacts.length} Records)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#8B8982] group-hover:text-[#E8F044]">
              <span>{isCreditsExpanded ? 'Hide Details' : 'View Credits'}</span>
              {isCreditsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          {isCreditsExpanded && (
            <div className="mt-4 pb-6 pt-2 border-t border-[#1e1e1c]">
              <p className="font-mono text-[11px] text-[#8B8982] uppercase tracking-wider mb-6">
                All historical photographic glass plates, musical instruments, and handwoven textiles are preserved in trust by partner collections:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {archivalArtifacts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#161614] border border-[#262624] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-[#E8F044] font-bold uppercase tracking-wider">
                          ACC. {item.id.toUpperCase()}
                        </span>
                        <span className="font-mono text-[10px] text-[#8B8982] uppercase">
                          {item.date}
                        </span>
                      </div>
                      <h4 className="font-display-wide text-sm text-[#F0E8D8] font-bold mt-1 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="font-mono text-[11px] text-[#8B8982] mt-1 line-clamp-2">
                        {item.creditLine}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#222220] font-mono text-[10px]">
                      <span className="text-[#E4D9C0]/75">{item.licence}</span>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E8F044] hover:underline inline-flex items-center gap-1"
                        >
                          Source <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editorial Footer Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-[#222220] font-mono text-xs text-[#8B8982] gap-4">
          <div>
            <span>© ARCHIVE — DIGITAL MUSEUM OF NIGERIAN CREATIVE HISTORY</span>
          </div>
          <div>
            <span>LAGOS · PRESERVING WHAT SURVIVES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
