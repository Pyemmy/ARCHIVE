import React from 'react';
import { ArchivalImage } from './ArchivalImage';
import { MaskRiseText } from './MaskRiseText';
import { ARTIFACTS } from '../data/artifacts';

interface WhatSurvivesProps {
  onOpenArtifact: (id: string) => void;
}

export const WhatSurvives: React.FC<WhatSurvivesProps> = ({ onOpenArtifact }) => {
  const ph3 = ARTIFACTS.find((a) => a.id === 'ph-hist-3');
  const mu1 = ARTIFACTS.find((a) => a.id === 'mu-inst-1');
  const fa1 = ARTIFACTS.find((a) => a.id === 'fa-textile-1');
  const de1 = ARTIFACTS.find((a) => a.id === 'de-obj-1');

  return (
    <section
      id="what-survives"
      data-ground="ink"
      aria-label="What Survives"
      className="relative w-full bg-[#11110F] text-[#F0E8D8] overflow-hidden"
    >
      {/* Stage 1: "A photograph outlasts the afternoon." + ph-hist-3 */}
      <div className="relative min-h-[85svh] flex flex-col md:flex-row items-center justify-between px-6 py-20 md:px-16 overflow-hidden border-b border-[#222220]">
        <div className="w-full md:w-[58%] z-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E43D27] font-bold block mb-4">
            01 SURVIVAL
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(2.75rem,7.5vw,7.5rem)] leading-[0.88] text-[#F0E8D8] tracking-tight"
          >
            A photograph outlasts the afternoon.
          </MaskRiseText>
        </div>

        <div className="w-full md:w-[38vw] mt-10 md:mt-0 relative z-20">
          <button
            type="button"
            onClick={() => onOpenArtifact('ph-hist-3')}
            className="group relative block w-full aspect-[4/3] p-3 bg-[#F0E8D8] torn-edge-sheet rotate-[2deg] hover:rotate-0 transition-transform duration-300 text-left cursor-pointer"
            aria-label="Open artifact: Market Day Gathering along the Marina"
          >
            <div className="w-full h-[76%] bg-[#1c1a17] overflow-hidden">
              <ArchivalImage
                src="/img/ph-hist-3.jpg"
                alt={ph3?.alt || 'Market Day Gathering along the Marina'}
                discipline="photography"
                eager={true}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 text-[#11110F]">
              <span className="block font-display-wide text-[14px] leading-tight font-bold truncate">
                {ph3?.title}
              </span>
              <span className="block font-mono text-[12px] text-[#11110F]/80 uppercase truncate">
                {ph3?.kind === 'archival' ? `${ph3.makerCulture} · ${ph3.date}` : ''}
              </span>
              <span className="block font-mono text-[11px] text-[#E43D27] uppercase truncate">
                {ph3?.kind === 'archival' ? `${ph3.creditLine} (${ph3.licence})` : ''}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Stage 2: "A sleeve outlasts the record store." + mu-inst-1 (Ikoro drum) */}
      <div className="relative min-h-[85svh] flex flex-col-reverse md:flex-row items-center justify-between px-6 py-20 md:px-16 overflow-hidden border-b border-[#222220]">
        <div className="w-full md:w-[38vw] mt-10 md:mt-0 relative z-20">
          <button
            type="button"
            onClick={() => onOpenArtifact('mu-inst-1')}
            className="group relative block w-full aspect-[4/3] p-3 bg-[#1c1a17] torn-edge-small text-left border border-[#333330] cursor-pointer"
            aria-label="Open artifact: Carved Slit Drum (Ikoro)"
          >
            <div className="w-full h-[74%] bg-[#11110F] overflow-hidden">
              <ArchivalImage
                src="/img/mu-inst-1.jpg"
                alt={mu1?.alt || 'Carved Slit Drum (Ikoro)'}
                discipline="music"
                sacred={mu1?.kind === 'archival' ? mu1.sacred : false}
                eager={true}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 text-[#E4D9C0]">
              <div className="flex items-center gap-2">
                <span className="block font-display-wide text-[14px] leading-tight font-bold truncate text-[#F0E8D8]">
                  {mu1?.title}
                </span>
                {mu1?.kind === 'archival' && mu1.sacred && (
                  <span className="bg-[#E43D27] text-[#11110F] font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                    SACRED REGALIA
                  </span>
                )}
              </div>
              <span className="block font-mono text-[12px] text-[#8B8982] uppercase truncate">
                {mu1?.kind === 'archival' ? `${mu1.makerCulture} · ${mu1.date}` : ''}
              </span>
              <span className="block font-mono text-[11px] text-[#E8F044] uppercase truncate">
                {mu1?.kind === 'archival' ? `${mu1.creditLine} (${mu1.licence})` : ''}
              </span>
            </div>
          </button>
        </div>

        <div className="w-full md:w-[58%] z-10 text-right md:pl-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#E8F044] font-bold block mb-4">
            02 RESONANCE
          </span>
          <MaskRiseText
            as="h2"
            className="font-display-condensed text-[clamp(2.75rem,7.5vw,7.5rem)] leading-[0.88] text-[#F0E8D8] tracking-tight"
          >
            A sleeve outlasts the record store.
          </MaskRiseText>
        </div>
      </div>

      {/* Stage 3: Staggered statements and images:
          "A hem outlasts the occasion." + fa-textile-1
          and "A poster outlasts the event it announced." + de-obj-1 */}
      <div className="relative min-h-[90svh] px-6 py-24 md:px-16 border-b border-[#222220] flex flex-col justify-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8B8982] font-bold block mb-12">
          03 RETENTION
        </span>

        {/* Pair A: Hem & Textile */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="w-full md:w-[52%]">
            <MaskRiseText
              as="h2"
              className="font-display-condensed text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.9] text-[#F0E8D8]"
            >
              A hem outlasts the occasion.
            </MaskRiseText>
          </div>
          <div className="w-full md:w-[34vw]">
            <button
              type="button"
              onClick={() => onOpenArtifact('fa-textile-1')}
              className="group block w-full aspect-[4/3] p-3 bg-[#F0E8D8] rotate-[2deg] hover:rotate-0 transition-transform duration-300 text-left cursor-pointer"
              aria-label="Open artifact: Indigo-Dyed Resist Cloth (Adire Eleko)"
            >
              <div className="w-full h-[74%] bg-[#11110F] overflow-hidden">
                <ArchivalImage
                  src="/img/fa-textile-1.jpg"
                  alt={fa1?.alt || 'Indigo-Dyed Resist Cloth'}
                  discipline="fashion"
                  eager={true}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-[#11110F]">
                <span className="block font-display-wide text-[14px] leading-tight font-bold truncate">
                  {fa1?.title}
                </span>
                <span className="block font-mono text-[12px] text-[#11110F]/80 uppercase truncate">
                  {fa1?.kind === 'archival' ? `${fa1.makerCulture} · ${fa1.date}` : ''}
                </span>
                <span className="block font-mono text-[11px] text-[#E43D27] uppercase truncate">
                  {fa1?.kind === 'archival' ? `${fa1.creditLine} (${fa1.licence})` : ''}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Pair B: Poster & Plaque */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:pl-16">
          <div className="w-full md:w-[34vw]">
            <button
              type="button"
              onClick={() => onOpenArtifact('de-obj-1')}
              className="group block w-full aspect-[4/3] p-3 bg-[#1c1c18] border border-[#3a3a36] text-left cursor-pointer"
              aria-label="Open artifact: Cast Brass Commemorative Relief Plaque"
            >
              <div className="w-full h-[74%] bg-[#11110F] overflow-hidden">
                <ArchivalImage
                  src="/img/de-obj-1.jpg"
                  alt={de1?.alt || 'Cast Brass Commemorative Relief Plaque'}
                  discipline="design"
                  sacred={de1?.kind === 'archival' ? de1.sacred : false}
                  eager={true}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-[#E4D9C0]">
                <div className="flex items-center gap-2">
                  <span className="block font-display-wide text-[14px] leading-tight font-bold truncate text-[#F0E8D8]">
                    {de1?.title}
                  </span>
                  {de1?.kind === 'archival' && de1.sacred && (
                    <span className="bg-[#E43D27] text-[#11110F] font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                      SACRED COURT RELIEF
                    </span>
                  )}
                </div>
                <span className="block font-mono text-[12px] text-[#8B8982] uppercase truncate">
                  {de1?.kind === 'archival' ? `${de1.makerCulture} · ${de1.date}` : ''}
                </span>
                <span className="block font-mono text-[11px] text-[#E8F044] uppercase truncate">
                  {de1?.kind === 'archival' ? `${de1.creditLine} (${de1.licence})` : ''}
                </span>
              </div>
            </button>
          </div>
          <div className="w-full md:w-[58%] text-right">
            <MaskRiseText
              as="h2"
              className="font-display-condensed text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.9] text-[#F0E8D8]"
            >
              A poster outlasts the event it announced.
            </MaskRiseText>
          </div>
        </div>
      </div>

      {/* Stage 4: "None of it survives alone." -> "Unless someone remembers." */}
      <div className="relative min-h-[85svh] flex flex-col justify-center px-6 py-24 md:px-16 border-b border-[#222220]">
        <MaskRiseText
          as="p"
          className="font-display-condensed text-[clamp(2.5rem,6vw,5.5rem)] text-[#8B8982] leading-tight mb-4"
        >
          None of it survives alone.
        </MaskRiseText>
        <MaskRiseText
          as="h2"
          delayMs={250}
          className="font-display-condensed text-[clamp(3.5rem,11.5vw,13rem)] leading-[0.84] text-[#E43D27] tracking-tight"
        >
          Unless someone remembers.
        </MaskRiseText>
      </div>
    </section>
  );
};
