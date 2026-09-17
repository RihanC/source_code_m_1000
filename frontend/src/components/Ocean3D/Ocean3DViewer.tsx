import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { 
  Waves, 
  Layers, 
  Satellite, 
  RotateCcw, 
  Play, 
  Pause, 
  Grid3X3, 
  Maximize2,
  Minimize2,
  Eye
} from 'lucide-react';
import { OceanSurfaceMesh } from './OceanSurfaceMesh';
import { SubsurfaceColumn } from './SubsurfaceColumn';
import { ArgoBuoy } from './ArgoBuoy';
import { SatelliteScan } from './SatelliteScan';
import { MarineParticles } from './MarineParticles';

export type SeaState = 'calm' | 'moderate' | 'rough';
export type ViewMode = 'surface' | 'subsurface' | 'satellite';

interface Ocean3DViewerProps {
  className?: string;
}

export const Ocean3DViewer: React.FC<Ocean3DViewerProps> = ({ className = '' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('surface');
  const [seaState, setSeaState] = useState<SeaState>('moderate');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const seaStateDetails: Record<SeaState, { label: string; height: string; speed: string; desc: string }> = {
    calm: { label: 'Calm Swells', height: '0.6 m', speed: '4.2 kts', desc: 'Mild equatorial current' },
    moderate: { label: 'Moderate Sea', height: '1.6 m', speed: '12.4 kts', desc: 'Monsoon trade winds' },
    rough: { label: 'Rough Seas', height: '3.2 m', speed: '24.8 kts', desc: 'Tropical depression swell' },
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-[#061426] via-[#030d1a] to-[#020812] shadow-[0_12px_48px_0_rgba(2,132,199,0.15)] flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : 'w-full h-[460px] lg:h-[500px]'
      } ${className}`}
    >
      {/* ─── Top Control & Status Bar ─── */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#07172c]/80 backdrop-blur-md border-b border-white/[0.08]">
        {/* Left: Title & Sensor Status */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">3D Ocean Dynamics</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                INCOIS LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Center: View Mode Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setViewMode('surface')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'surface'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
            title="Surface Waves & Specular Sunlight"
          >
            <Waves size={13} />
            <span>Surface</span>
          </button>

          <button
            onClick={() => setViewMode('subsurface')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'subsurface'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
            title="Subsurface Thermocline (0-1000m) & CTD Profiler"
          >
            <Layers size={13} />
            <span>Thermocline</span>
          </button>

          <button
            onClick={() => setViewMode('satellite')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all ${
              viewMode === 'satellite'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
            title="Satellite Altimetry & LiDAR Beam"
          >
            <Satellite size={13} />
            <span>Satellite</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded-lg border transition-all ${
              wireframe
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
            title="Toggle Wireframe Mesh"
          >
            <Grid3X3 size={14} />
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg border transition-all ${
              autoRotate
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? 'Pause Rotation' : 'Auto-Rotate'}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg border bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white transition-all"
            title="Reset Camera Angle"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand View'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ─── 3D Three.js WebGL Canvas ─── */}
      <div className="relative flex-1 w-full cursor-grab active:cursor-grabbing">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center text-cyan-400 text-xs">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>Simulating 3D Ocean Fluid Surface...</span>
              </div>
            </div>
          }
        >
          <Canvas
            camera={{ position: [3.8, 2.6, 4.2], fov: 46 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Ambient and directional lights */}
            <ambientLight intensity={1.1} color="#0c4a6e" />
            <directionalLight position={[6, 12, 8]} intensity={2.4} color="#e0f2fe" castShadow />
            <pointLight position={[0, -1.2, 0]} intensity={1.8} color="#0ea5e9" distance={6} />
            <pointLight position={[1.2, 0.4, 0.8]} intensity={1.2} color="#22c55e" distance={2} />

            {/* Ocean 3D Model Components */}
            <OceanSurfaceMesh seaState={seaState} viewMode={viewMode} wireframe={wireframe} />
            <SubsurfaceColumn viewMode={viewMode} />
            <ArgoBuoy seaState={seaState} viewMode={viewMode} />
            <SatelliteScan viewMode={viewMode} />
            <MarineParticles />

            {/* Orbit Interaction */}
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.06}
              autoRotate={autoRotate}
              autoRotateSpeed={0.7}
              maxPolarAngle={Math.PI / 2.05}
              minDistance={2.4}
              maxDistance={9.0}
            />
          </Canvas>
        </Suspense>

        {/* ─── Floating Top-Left Mode Watermark & Depth Layer Indicator ─── */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5">
          <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
            <Eye size={12} className="text-cyan-400" />
            <span>
              {viewMode === 'surface' && 'SURFACE WAVE HARMONICS'}
              {viewMode === 'subsurface' && '0–1000m THERMOCLINE PROFILE'}
              {viewMode === 'satellite' && 'SATELLITE RADAR ALTIMETRY'}
            </span>
          </div>

          <div className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm border border-white/5 text-[10px] text-slate-400 font-mono">
            Click & drag to orbit • Scroll to zoom
          </div>
        </div>

        {/* ─── Floating Depth Axis Labels (visible in Subsurface mode) ─── */}
        {viewMode === 'subsurface' && (
          <div className="absolute top-14 left-3 pointer-events-none flex flex-col gap-1 text-[9px] font-mono text-cyan-300/80 bg-black/50 p-2 rounded-lg border border-cyan-500/20">
            <div className="font-bold text-white text-[10px] mb-0.5 border-b border-white/10 pb-0.5">
              DEPTH LAYERS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>0m: Epipelagic Surface</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>-50m: Mixed Layer (MLD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>-200m: Thermocline Peak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>-1000m: Abyssal Floor</span>
            </div>
          </div>
        )}

        {/* ─── Floating Floating Buoy Callout Badge ─── */}
        <div className="absolute top-3 right-3 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#031526]/80 backdrop-blur-md border border-cyan-500/30 text-[11px] text-cyan-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ARGO Float #5904812 (Active)</span>
        </div>

        {/* ─── Sea State Quick Selector (Bottom Center Overlay) ─── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1 rounded-xl bg-[#040f1d]/85 backdrop-blur-md border border-white/10 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase px-2 hidden sm:inline">
            Sea State:
          </span>
          {(['calm', 'moderate', 'rough'] as SeaState[]).map((state) => (
            <button
              key={state}
              onClick={() => setSeaState(state)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                seaState === state
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Bottom Live Oceanographic Telemetry Strip ─── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 bg-[#040f1d]/90 backdrop-blur-md border-t border-white/[0.08] text-[11px] font-mono">
        <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/[0.04]">
          <span className="text-slate-400">Wave Height:</span>
          <span className="font-bold text-cyan-300">{seaStateDetails[seaState].height}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/[0.04]">
          <span className="text-slate-400">SST Surface:</span>
          <span className="font-bold text-emerald-300">28.4 °C</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/[0.04]">
          <span className="text-slate-400">Thermocline:</span>
          <span className="font-bold text-indigo-300">85 m</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-black/30 border border-white/[0.04]">
          <span className="text-slate-400">Current Drift:</span>
          <span className="font-bold text-sky-300">{seaStateDetails[seaState].speed}</span>
        </div>
      </div>
    </div>
  );
};
