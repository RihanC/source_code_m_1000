import React from 'react';
import { Waves, Compass, Layers, Cpu, CheckCircle2, Info } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const tabs = [
    { id: 'landing',     label: 'Overview',                 icon: Waves       },
    { id: 'explorer',    label: 'Ocean Explorer',            icon: Compass     },
    { id: 'reconstruct', label: 'Subsurface Reconstruction', icon: Layers      },
    { id: 'embedding',   label: 'Ocean Embedding & AI',      icon: Cpu         },
    { id: 'validation',  label: 'Scientific Validation',     icon: CheckCircle2},
    { id: 'about',       label: 'Methodology & INCOIS',      icon: Info        },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#050c18]/75 border-b border-white/[0.07] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">

        {/* ── Brand Logo ── */}
        <button
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-2.5 mr-2 shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.25)] group-hover:shadow-[0_0_18px_rgba(6,182,212,0.4)] transition-shadow">
            <Waves size={16} className="text-cyan-300" />
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-black text-white tracking-tight">OCEANEMBED</div>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">INCOIS · SIH 2026</div>
          </div>
        </button>

        {/* ── Navigation Tabs ── */}
        <nav className="flex-1 flex items-center justify-center overflow-x-auto">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-250 flex items-center gap-1.5 relative shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-400/35 shadow-[0_0_14px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <Icon
                    size={13}
                    className={isActive ? 'text-cyan-400' : 'text-slate-500'}
                  />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">
                    {tab.label.split(' ')[0]}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_6px_#06b6d4]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Status Indicator ── */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-2">
          <span className="live-pulse w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-[10px] text-slate-500 font-mono">DEMO LIVE</span>
        </div>
      </div>
    </header>
  );
};
