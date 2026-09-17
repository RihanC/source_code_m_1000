import React from 'react';
import { Satellite, Sliders, Cpu, GitCommit, Layers, CheckCircle2 } from 'lucide-react';

interface ProcessingPipelineProps {
  currentStep: number; // 0 = idle, 1..5 = active steps, 6 = complete
  isProcessing: boolean;
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  currentStep,
  isProcessing
}) => {
  const steps = [
    {
      id: 1,
      title: 'Satellite Data Loading',
      desc: 'Ingesting 7 multi-modal surface observation channels',
      icon: Satellite,
    },
    {
      id: 2,
      title: 'Preprocessing & Harmonization',
      desc: 'Quality control, 0.25° regridding & land masking',
      icon: Sliders,
    },
    {
      id: 3,
      title: 'Ocean Embedding Generation',
      desc: 'CNN spatial encoder + multi-head attention (64-dim bottleneck)',
      icon: Cpu,
    },
    {
      id: 4,
      title: 'Deep Learning Decoder',
      desc: 'Physics-informed depth-aware MLP reconstruction',
      icon: GitCommit,
    },
    {
      id: 5,
      title: '15-Depth Profile Output',
      desc: 'Vertical thermal stratification from 0m to 1000m',
      icon: Layers,
    },
  ];

  return (
    <div className="ocean-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Reconstruction Execution Pipeline
        </h4>
        {isProcessing && (
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
            Executing Step {currentStep} of 5...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCurrent = isProcessing && currentStep === step.id;
          const isDone = currentStep > step.id || currentStep === 6;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all duration-300 relative ${
                isCurrent
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : isDone
                  ? 'bg-[#09182b] border-[#1e3a5f]'
                  : 'bg-[#061120] border-[#112238] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-400">0{step.id}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-cyan-500 text-white animate-bounce'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={13} /> : <Icon size={12} />}
                </div>
              </div>

              <div className="text-xs font-bold text-white mb-0.5">{step.title}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{step.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
