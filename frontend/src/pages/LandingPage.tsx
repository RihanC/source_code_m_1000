import React from 'react';
import { 
  Waves, 
  Satellite, 
  Layers, 
  Cpu, 
  Compass, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Thermometer,
  GitBranch,
  Database
} from 'lucide-react';

import { Ocean3DViewer } from '../components/Ocean3D/Ocean3DViewer';
import { OceanWaveDivider } from '../components/OceanWaveDivider';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 py-8 px-4 md:px-10 max-w-7xl mx-auto">

      {/* ═══════════════════════════════════════
          HERO SECTION WITH 3D OCEAN DYNAMICS
          ═══════════════════════════════════════ */}
      <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-[#0b1b33]/50 to-white/[0.01] backdrop-blur-2xl shadow-[0_16px_64px_0_rgba(0,0,0,0.5)]">

        {/* Internal glowing orbs */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Content Grid: Copy on Left, 3D Ocean Dynamics on Right */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Mission & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="badge-incois">INCOIS · Ministry of Earth Sciences</span>
              <span className="science-tag tag-glorys">SIH 2026 · PS#26066</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white tracking-tight leading-[1.06]">
              Revealing the Ocean{' '}
              <br className="hidden sm:block" />
              <span className="gradient-shimmer">
                Beneath the Surface
              </span>
            </h1>

            <p className="text-base text-slate-300 font-light leading-relaxed max-w-xl">
              AI-powered reconstruction of subsurface ocean temperature from satellite observations.
              Transforming 7 multi-modal surface signatures into 15 high-resolution vertical temperature 
              layers across the North Indian Ocean — in real time.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('reconstruct')}
                className="btn-primary py-3 px-6 text-sm flex items-center gap-2"
              >
                <Layers size={16} />
                <span>Run Subsurface Reconstruction</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => onNavigate('explorer')}
                className="btn-secondary py-3 px-5 text-sm bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] flex items-center gap-2"
              >
                <Compass size={16} className="text-cyan-400" />
                <span>Explore Ocean Basin</span>
              </button>

              <button
                onClick={() => onNavigate('embedding')}
                className="btn-secondary py-3 px-5 text-sm bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] flex items-center gap-2"
              >
                <Cpu size={16} className="text-indigo-400" />
                <span>View AI Embeddings</span>
              </button>
            </div>

            {/* Live Telemetry Highlights */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Active GLORYS12V1 Reference</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>0–1000m Depth Stratification</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Three.js Ocean Dynamics */}
          <div className="lg:col-span-6 w-full">
            <Ocean3DViewer />
          </div>
        </div>

        {/* ─── Conceptual Pipeline Flow ─── */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <div className="text-[11px] text-slate-500 font-mono uppercase tracking-widest mb-4">
            End-to-End Reconstruction Pipeline
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
            {[
              { icon: Satellite,   color: 'cyan',    label: 'Satellite',      sub: 'Surface Remote Sensing'  },
              { icon: Waves,       color: 'blue',    label: 'Surface Ocean',  sub: '7 Multi-Modal Channels'  },
              { icon: Cpu,         color: 'indigo',  label: 'AI Embedding',   sub: '64-Dim Latent State'     },
              { icon: Layers,      color: 'teal',    label: 'Hidden Layers',  sub: 'Thermocline & Abyss'     },
              { icon: Thermometer, color: 'emerald', label: 'Profile (0–1000m)', sub: '15 Depth Levels',     },
            ].map((item, idx) => {
              const Icon = item.icon;
              const colors: Record<string, string> = {
                cyan:    'bg-cyan-500/15 border-cyan-400/30 text-cyan-400   hover:border-cyan-400/60',
                blue:    'bg-blue-500/15 border-blue-400/30 text-blue-400   hover:border-blue-400/60',
                indigo:  'bg-indigo-500/15 border-indigo-400/30 text-indigo-400 hover:border-indigo-400/60',
                teal:    'bg-teal-500/15 border-teal-400/30 text-teal-400   hover:border-teal-400/60',
                emerald: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400 hover:border-emerald-400/60',
              };
              const iconColors: Record<string, string> = {
                cyan: 'bg-cyan-500/20 border-cyan-400/30', blue: 'bg-blue-500/20 border-blue-400/30',
                indigo: 'bg-indigo-500/20 border-indigo-400/30', teal: 'bg-teal-500/20 border-teal-400/30',
                emerald: 'bg-emerald-500/20 border-emerald-400/30',
              };
              return (
                <div key={idx} className={`p-4 rounded-2xl backdrop-blur-md border transition-all ${colors[item.color]} ${idx === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
                  <div className={`w-9 h-9 mx-auto mb-2.5 rounded-xl flex items-center justify-center border ${iconColors[item.color]}`}>
                    <Icon size={17} />
                  </div>
                  <div className="text-xs font-bold text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Animated Wave Divider ═══ */}
      <OceanWaveDivider />

      {/* ═══════════════════════════════════════
          STATS STRIP
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Vertical Resolution',
            value: '15 Depths',
            sub: '0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000 m',
            accent: 'border-l-cyan-400',
            revealClass: 'stat-reveal stat-reveal-1',
          },
          {
            label: 'Spatial Resolution',
            value: '0.25° × 0.25°',
            sub: 'High-res gridded mesoscale ocean features',
            accent: 'border-l-sky-400',
            revealClass: 'stat-reveal stat-reveal-2',
          },
          {
            label: 'Temporal Frequency',
            value: 'Daily Updates',
            sub: 'Harmonized daily satellite observations',
            accent: 'border-l-blue-400',
            revealClass: 'stat-reveal stat-reveal-3',
          },
          {
            label: 'Geographic Coverage',
            value: 'North Indian Ocean',
            sub: '5.0°N to 30.0°N • 45.0°E to 105.0°E',
            accent: 'border-l-indigo-400',
            revealClass: 'stat-reveal stat-reveal-4',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`ocean-card p-5 border-l-4 ${stat.accent} hover:scale-[1.01] ${stat.revealClass}`}
          >
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">{stat.label}</div>
            <div className="text-2xl font-extrabold font-mono leading-tight value-shimmer">{stat.value}</div>
            <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          PROBLEM + SOLUTION CARDS
          ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem */}
        <div className="ocean-card p-7 space-y-4 border-t-2 border-t-rose-500/60 card-entrance card-entrance-1">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="w-10 h-10 rounded-xl bg-rose-950/50 border border-rose-700/50 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h2 className="text-base font-bold text-white">The Oceanographic Challenge</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            Satellites provide frequent and large-scale observations of the ocean surface, but infrared and microwave
            sensors cannot penetrate deep water columns. Direct observations from in-situ floats (such as ARGO) are 
            sparse and irregular — leaving vast 3D ocean volumes unobserved.
          </p>
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-slate-300 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold mt-0.5">→</span>
              <span><strong className="text-rose-300">Key Limitation:</strong> We cannot directly measure the thermocline (50–200m) or deep ocean from orbit.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold mt-0.5">→</span>
              <span>However, subsurface dynamics leave distinct footprints on SSH, SSS, surface currents, and wind stress.</span>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className="ocean-card p-7 space-y-4 border-t-2 border-t-cyan-500/60 card-entrance card-entrance-2">
          <div className="flex items-center gap-3 text-cyan-400">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-700/50 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-base font-bold text-white">The OCEANEMBED Innovation</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-light">
            OCEANEMBED uses a deep learning framework with self-attention to compress 7 multi-modal satellite observations
            into a learned <strong className="text-cyan-300">64-dimensional Ocean Embedding</strong>, which a physics-aware decoder 
            transforms into a complete 15-depth vertical temperature profile with uncertainty.
          </p>
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-xs text-slate-300 space-y-1">
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-0.5">→</span>
              <span><strong className="text-cyan-300">Scientific Rigor:</strong> Benchmarked against Copernicus GLORYS12V1 reanalysis.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold mt-0.5">→</span>
              <span>Validated independently against in-situ ARGO float profiles with uncertainty quantification (±σ).</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DATA PIPELINE OVERVIEW
          ═══════════════════════════════════════ */}
      <div className="ocean-card p-7 space-y-5 card-entrance card-entrance-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch size={16} className="text-cyan-400" />
              Modular Data Provider Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Plug-in design for seamless swapping between demo and real-world NetCDF datasets
            </p>
          </div>
          <Database size={20} className="text-slate-600 hidden md:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            {
              stage: 'Input Layer',
              title: 'Multi-Modal Satellite Observations',
              items: ['SST (MODIS / VIIRS)', 'SSS (SMOS / Aquarius)', 'SSH / SLA (Jason-3 / Sentinel-6)', 'Surface Currents (OSCAR)', 'Wind Stress (ASCAT / ERA5)'],
              color: 'text-blue-400 bg-blue-950/30 border-blue-800/40',
            },
            {
              stage: 'Model Core',
              title: 'Deep Learning Architecture',
              items: ['2D Multi-Scale CNN Encoder', 'Multi-Head Self-Attention', '64-Dim Bottleneck Embedding', 'Depth-Aware MLP Decoder', 'Softplus Uncertainty Head'],
              color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40',
            },
            {
              stage: 'Validation Layer',
              title: 'Scientific Benchmarks',
              items: ['GLORYS12V1 Reanalysis Reference', 'ARGO Float In-Situ Profiles', 'RMSE / Pearson-r / Bias Metrics', 'Depth-resolved error profiles', 'Climatology baseline comparison'],
              color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
            },
          ].map((col) => (
            <div key={col.stage} className={`p-4 rounded-xl border space-y-2 ${col.color}`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{col.stage}</div>
              <div className="font-bold text-white">{col.title}</div>
              <ul className="space-y-1">
                {col.items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
