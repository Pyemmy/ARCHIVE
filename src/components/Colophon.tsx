import React from 'react';
import { siteConfig } from '../data/siteConfig';

export const Colophon: React.FC = () => {
  return (
    <footer
      id="colophon"
      data-ground="ink"
      aria-label="Colophon and Credits"
      className="relative w-full bg-[#11110F] text-[#F0E8D8] border-t border-[#262624] px-6 py-20 md:px-16"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
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
            <span>CHALLENGE: </span>
            <span className="text-[#E8F044] font-bold">ONE-TEN — DESIGN INDEPENDENTLY</span>
          </div>
        </div>

        {/* Institution Statement */}
        <div className="max-w-3xl">
          <p className="font-body-editorial text-xl md:text-2xl text-[#F0E8D8] leading-relaxed font-medium">
            Archival images are credited to their institutions and used under the licences shown. Conceptual images are AI-generated studies, not historical records.
          </p>
          <p className="font-body-editorial text-base md:text-lg text-[#8B8982] mt-4 leading-relaxed">
            Every artifact in this index has been curated as an art-directed fragment to examine how creative culture endures across media, materials, and generations.
          </p>
        </div>

        {/* Technical & Design Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-6 border-t border-[#222220]">
          {/* Column 1: Designer Credit */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold mb-3">
              CREATIVE DIRECTION
            </h3>
            <p className="font-display-wide text-lg text-[#F0E8D8] font-bold">
              {siteConfig.designerName}
            </p>
            <p className="font-mono text-xs text-[#8B8982] mt-1">
              Curatorial & Editorial Systems
            </p>
          </div>

          {/* Column 2: Typography */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold mb-3">
              TYPOGRAPHY
            </h3>
            <ul className="space-y-1.5 font-mono text-xs text-[#E4D9C0] list-none p-0 m-0">
              <li>
                <strong className="text-[#F0E8D8]">Archivo:</strong> Condensed & Wide (800–900)
              </li>
              <li>
                <strong className="text-[#F0E8D8]">Instrument Serif:</strong> Italic Whisper
              </li>
              <li>
                <strong className="text-[#F0E8D8]">Hanken Grotesk:</strong> Editorial Body
              </li>
              <li>
                <strong className="text-[#F0E8D8]">JetBrains Mono:</strong> Catalog Notation
              </li>
            </ul>
          </div>

          {/* Column 3: Color Tokens */}
          <div className="sm:col-span-2">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold mb-3">
              CHROMATIC TOKENS
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#11110F] border border-[#444] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Ink</div>
                  <div className="text-[#8B8982]">#11110F</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#F0E8D8] border border-[#111] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Cream</div>
                  <div className="text-[#8B8982]">#F0E8D8</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#E4D9C0] border border-[#111] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Paper-2</div>
                  <div className="text-[#8B8982]">#E4D9C0</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#E43D27] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Vermilion</div>
                  <div className="text-[#8B8982]">#E43D27</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#E8F044] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Yellow</div>
                  <div className="text-[#8B8982]">#E8F044</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#8B8982] shrink-0" />
                <div className="font-mono text-[11px] leading-tight">
                  <div className="text-[#F0E8D8] font-bold">Grey</div>
                  <div className="text-[#8B8982]">#8B8982</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 border-t border-[#222220] font-mono text-xs text-[#8B8982] gap-4">
          <div>
            <span>© ARCHIVE — DIGITAL MUSEUM PROJECT</span>
          </div>
          <div>
            <span>NATIVE SCROLLING — 100SVH VIEWPORTS — ZERO-PILL DISCIPLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
