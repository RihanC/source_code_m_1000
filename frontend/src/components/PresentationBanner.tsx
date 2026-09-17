import React from 'react';
import { MonitorPlay, ChevronRight, X } from 'lucide-react';

interface PresentationBannerProps {
  onExit: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const PresentationBanner: React.FC<PresentationBannerProps> = ({
  onExit,
  activeView,
  setActiveView
}) => {
  const steps = [
    { id: 'explorer', label: '1. Surface Satellite Observations' },
    { id: 'reconstruct', label: '2. Subsurface Reconstruction & Thermocline' },
    { id: 'embedding', label: '3. Ocean Embeddings & Latent States' },
    { id: 'validation', label: '4. Scientific Benchmarks & ARGO Validation' },
  ];

  return (
    <div className="bg-gradient-to-r from-cyan-950/90 via-[#0a1b33]/90 to-blue-950/90 border-b border-cyan-500/30 px-6 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
          <MonitorPlay size={13} />
          SIH 2026 Presentation Flow:
        </div>
        <div className="flex items-center gap-2 ml-3">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveView(step.id)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeView === step.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {step.label}
              </button>
              {idx < steps.length - 1 && <ChevronRight size={12} className="text-slate-500" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <button
        onClick={onExit}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
      >
        <X size={14} />
        Exit Full Presentation
      </button>
    </div>
  );
};
