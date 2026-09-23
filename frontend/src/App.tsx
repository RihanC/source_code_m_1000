import React, { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { PresentationBanner } from './components/PresentationBanner';
import { OceanParticles } from './components/OceanParticles';
import { LandingPage } from './pages/LandingPage';
import { OceanExplorerPage } from './pages/OceanExplorerPage';
import { SubsurfaceReconstructionPage } from './pages/SubsurfaceReconstructionPage';
import { EmbeddingPage } from './pages/EmbeddingPage';
import { ValidationPage } from './pages/ValidationPage';
import { AboutMethodologyPage } from './pages/AboutMethodologyPage';
import { MonitorPlay, FlaskConical } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [presentationMode, setPresentationMode] = useState(false);

  // Basin coordinate state (defaults to Arabian Sea central basin)
  const [selectedLat, setSelectedLat] = useState<number>(15.0);
  const [selectedLon, setSelectedLon] = useState<number>(65.0);

  const handleTriggerReconstruction = () => {
    setCurrentTab('reconstruct');
  };

  // Keyboard shortcut: Press 'P' to toggle presentation mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPresentationMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050c18] text-slate-100 selection:bg-cyan-500/40 selection:text-white relative overflow-x-hidden">

      {/* ── Bioluminescent Particle Background ── */}
      <OceanParticles />

      {/* ── Dynamic Ambient Background Glows ── */}
      <div className="ocean-glow-1 fixed top-0 left-1/4 w-[700px] h-[700px] bg-cyan-600/[0.07] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="ocean-glow-2 fixed bottom-10 right-1/4 w-[800px] h-[800px] bg-blue-700/[0.07] rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="ocean-glow-3 fixed top-1/2 right-10 w-[500px] h-[500px] bg-teal-600/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ── DEMO MODE Banner ── */}
      <div className="demo-mode-banner flex items-center justify-center gap-2 text-xs">
        <FlaskConical size={12} className="text-amber-400 shrink-0" />
        <span>
          DEMO MODE — SYNTHETIC OCEANOGRAPHIC DATA &nbsp;|&nbsp; SIH 2026 Problem Statement 26066 &nbsp;|&nbsp; INCOIS / Ministry of Earth Sciences
        </span>
        {!presentationMode && (
          <button
            onClick={() => setPresentationMode(true)}
            className="ml-4 flex items-center gap-1 px-2.5 py-0.5 rounded border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all text-[10px] font-semibold shrink-0"
          >
            <MonitorPlay size={11} />
            Presentation Mode
          </button>
        )}
      </div>

      {/* ── Presentation Mode Navigation Banner ── */}
      {presentationMode && (
        <PresentationBanner
          onExit={() => setPresentationMode(false)}
          activeView={currentTab}
          setActiveView={setCurrentTab}
        />
      )}

      {/* ── Glassmorphic Header ── */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* ── Main Page Body ── */}
      <main className="flex-1 pb-12">
        {currentTab === 'landing' && (
          <LandingPage onNavigate={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === 'explorer' && (
          <OceanExplorerPage
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            setSelectedLat={setSelectedLat}
            setSelectedLon={setSelectedLon}
            onTriggerReconstruction={handleTriggerReconstruction}
          />
        )}

        {currentTab === 'reconstruct' && (
          <SubsurfaceReconstructionPage
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            setSelectedLat={setSelectedLat}
            setSelectedLon={setSelectedLon}
          />
        )}

        {currentTab === 'embedding' && <EmbeddingPage />}

        {currentTab === 'validation' && <ValidationPage />}

        {currentTab === 'about' && <AboutMethodologyPage />}
      </main>

      {/* ── Clean Glassmorphic Footer ── */}
      <footer className="border-t border-white/[0.06] backdrop-blur-xl bg-[#06101f]/50 py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 tracking-wide">OCEANEMBED</span>
            <span className="text-slate-700">•</span>
            <span>Indian National Centre for Ocean Information Services (INCOIS)</span>
            <span className="text-slate-700">•</span>
            <span>Ministry of Earth Sciences</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span>5°N–30°N, 45°E–105°E</span>
            <span className="text-slate-700">•</span>
            <span>15 Depth Levels (0–1000m)</span>
            <span className="text-slate-700">•</span>
            <span>SIH 2026 PS#26066</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
