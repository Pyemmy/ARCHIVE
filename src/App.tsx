import { useEffect, useState, useCallback } from 'react';
import { GrainOverlay } from './components/GrainOverlay';
import { Header } from './components/Header';
import { HeroSignal } from './components/HeroSignal';
import { WhatSurvives } from './components/WhatSurvives';
import { FourDisciplines } from './components/FourDisciplines';
import { Connections } from './components/Connections';
import { TimeGallery } from './components/TimeGallery';
import { ThePresent, VisitorFragment } from './components/ThePresent';
import { Inheritance } from './components/Inheritance';
import { Colophon } from './components/Colophon';
import { ArtifactDetail } from './components/ArtifactDetail';
import { IntroCurtain } from './components/IntroCurtain';
import { VelocityMarquee } from './components/VelocityMarquee';
import { MiniPlayer } from './components/MiniPlayer';
import { ArchiveTray } from './components/ArchiveTray';
import { AudioProvider } from './context/AudioContext';
import { CollectionProvider } from './context/CollectionContext';
import { ARTIFACTS, Artifact } from './data/artifacts';

function MainAppContent() {
  const [activeGround, setActiveGround] = useState<'ink' | 'cream' | 'paper-2' | 'vermilion' | 'yellow'>('ink');
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isIntroDone, setIsIntroDone] = useState<boolean>(false);
  const [fragments, setFragments] = useState<VisitorFragment[]>([]);

  // IntersectionObserver to sync activeGround with whichever section or band is dominant in viewport
  useEffect(() => {
    const groundElements = document.querySelectorAll<HTMLElement>('[data-ground]');
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const topEntry = visibleEntries[0];
          const ground = topEntry.target.getAttribute('data-ground') as
            | 'ink'
            | 'cream'
            | 'paper-2'
            | 'vermilion'
            | 'yellow'
            | null;
          if (ground) {
            setActiveGround(ground);
          }
        }
      },
      {
        rootMargin: '-10% 0px -40% 0px',
        threshold: [0.1, 0.3, 0.6],
      }
    );

    groundElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleOpenArtifact = useCallback((id: string) => {
    const found = ARTIFACTS.find((a) => a.id === id);
    if (found) {
      setSelectedArtifact(found);
      setIsDetailOpen(true);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleAddFragment = useCallback((newFrag: VisitorFragment) => {
    setFragments((prev) => [newFrag, ...prev]);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#11110F] text-[#F0E8D8] font-body-editorial antialiased selection:bg-[#E43D27] selection:text-[#F0E8D8]">
      {/* 1. Intro Curtain Overlay (hard capped at 2.0s with Skip button) */}
      {!isIntroDone && (
        <IntroCurtain onComplete={() => setIsIntroDone(true)} />
      )}

      {/* Skip to Content accessible link */}
      <a
        href="#signal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-2.5 focus:bg-[#E8F044] focus:text-[#11110F] focus:font-mono focus:font-bold focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Subtle Grain Texture Overlay */}
      <GrainOverlay />

      {/* Dynamic Header with ground-adaptive contrast, Lagos clock, and live waveform */}
      <Header activeGround={activeGround} onNavigate={handleNavigate} />

      {/* Main Editorial Canvas with safe-area bottom padding when mini-player is visible */}
      <main id="main-content" className="relative pb-24">
        {/* Section 01: SIGNAL */}
        <HeroSignal
          introFinished={isIntroDone}
          onEnter={() => handleNavigate('what-survives')}
          onOpenArtifact={handleOpenArtifact}
        />

        {/* Section 02: WHAT SURVIVES */}
        <WhatSurvives onOpenArtifact={handleOpenArtifact} />

        {/* Velocity Marquee 1 (between Sections 2–3) */}
        <VelocityMarquee direction="left" id="marquee-1" />

        {/* Section 03: FOUR DISCIPLINES (Photography, Music, Fashion, Design) */}
        <FourDisciplines onOpenArtifact={handleOpenArtifact} />

        {/* Section 04: CONNECTIONS (The Network) */}
        <Connections onOpenArtifact={handleOpenArtifact} />

        {/* Velocity Marquee 2 (between Sections 4–5) */}
        <VelocityMarquee direction="right" id="marquee-2" />

        {/* Section 05: TIME IS NOT A STRAIGHT LINE */}
        <TimeGallery onOpenArtifact={handleOpenArtifact} />

        {/* Section 06: THE PRESENT (Flood + Accession Card Generator) */}
        <ThePresent
          onOpenArtifact={handleOpenArtifact}
          onAddFragment={handleAddFragment}
        />

        {/* Velocity Marquee 3 (between Sections 6–7) */}
        <VelocityMarquee direction="left" id="marquee-3" />

        {/* Section 07: INHERITANCE & THE QUESTION */}
        <Inheritance
          fragments={fragments}
          onOpenArtifact={handleOpenArtifact}
          onBackToTop={() => handleNavigate('signal')}
        />
      </main>

      {/* Section 08: COLOPHON & FOOTER */}
      <Colophon />

      {/* Persistent Mini Player Bar (64px, ink with cream text, bottom safe area aware) */}
      <MiniPlayer />

      {/* Your Archive Slide-out Drawer */}
      <ArchiveTray />

      {/* Slide-out / Modal Drawer for Detailed Artifact Inspection */}
      <ArtifactDetail
        artifact={selectedArtifact}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onSelectArtifact={(art) => setSelectedArtifact(art)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <CollectionProvider>
        <MainAppContent />
      </CollectionProvider>
    </AudioProvider>
  );
}
