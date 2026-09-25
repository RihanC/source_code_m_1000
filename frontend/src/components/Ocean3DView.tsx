import React from 'react';
import type { DepthProfile } from '../types/ocean';
import { Layers } from 'lucide-react';

interface Ocean3DViewProps {
  profile: DepthProfile[];
}

export const Ocean3DView: React.FC<Ocean3DViewProps> = ({ profile }) => {
  // We only want to show a subset of depths to avoid clutter, e.g., 0, 20, 50, 100, 300, 1000
  const displayDepths = [0, 20, 50, 100, 300, 1000];
  const filteredProfile = profile.filter(p => displayDepths.includes(p.depth));

  return (
    <div className="ocean-card p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1a3254] pb-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={14} className="text-cyan-400" />
          3D Isometric Thermocline
        </h4>
        <span className="text-[10px] text-slate-400 font-mono">Bonus Feature</span>
      </div>

      <div className="relative h-72 w-full flex items-center justify-center" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-40 h-40 transition-transform duration-1000 group"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(60deg) rotateZ(-45deg)',
          }}
        >
          {filteredProfile.map((p, index) => {
            // Map temp (2°C - 30°C) to hue (240 Blue - 0 Red)
            const hue = Math.max(0, 240 - ((Math.min(32, Math.max(2, p.predicted_temp)) - 2) / 30) * 240);
            
            // Calculate Z translation based on depth (exaggerated for visual effect)
            // 0m -> 80px, 1000m -> -80px
            const maxDepth = 1000;
            const zTranslate = 100 - (p.depth / maxDepth) * 200;
            
            return (
              <div
                key={p.depth}
                className="absolute inset-0 border border-white/20 flex items-center justify-center transition-all duration-700 hover:border-white/50"
                style={{
                  transform: `translateZ(${zTranslate}px)`,
                  backgroundColor: `hsla(${hue}, 85%, 55%, 0.15)`,
                  boxShadow: `0 0 15px hsla(${hue}, 85%, 55%, 0.3) inset, 0 0 20px hsla(${hue}, 85%, 55%, 0.2)`,
                  backdropFilter: 'blur(2px)'
                }}
              >
                <div 
                  className="absolute -right-14 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg transition-all"
                  style={{ 
                    color: `hsl(${hue}, 85%, 70%)`,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    transform: 'rotateX(-90deg) rotateY(-45deg)', // Counter-rotate to face camera
                    transformOrigin: 'left center'
                  }}
                >
                  {p.depth}m
                </div>
                {/* Glowing Core */}
                <div 
                  className="w-1/2 h-1/2 rounded-full blur-md opacity-60"
                  style={{ backgroundColor: `hsl(${hue}, 85%, 60%)` }}
                />
              </div>
            );
          })}
          
          {/* Vertical connection line */}
          <div 
            className="absolute left-1/2 top-1/2 w-0.5 bg-white/20 transform -translate-x-1/2 -translate-y-1/2 h-[240px]" 
            style={{ transform: 'translate(-50%, -50%) rotateX(90deg)' }} 
          />
        </div>
      </div>
      <div className="text-[10px] text-slate-400 text-center leading-relaxed">
        Isometric glass panes representing the vertical thermal stratification structure. Red hues indicate warm mixed layer, while blue hues denote the cold deep ocean layer.
      </div>
    </div>
  );
};
