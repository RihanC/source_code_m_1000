import React from 'react';
import { 
  Info, 
  ShieldAlert, 
  FileCode, 
  Database,
  Compass,
  Zap
} from 'lucide-react';

export const AboutMethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Info className="text-cyan-400" size={22} />
          Scientific Methodology & Framework Overview
        </h2>
        <p className="text-xs text-slate-400">
          Deep learning reconstruction of vertical ocean thermal stratification from multi-channel surface satellite observations
        </p>
      </div>

      {/* Domain Specification Card with Glassmorphism */}
      <div className="ocean-card p-6 border-l-4 border-l-cyan-400 space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="text-cyan-400" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Domain & Scientific Target
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-light">
          <strong>Framework:</strong> Satellite Embedding-Based Deep Learning for Subsurface Ocean Temperature Reconstruction.<br />
          <strong>Domain:</strong> North Indian Ocean (Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean: 5.0°N–30.0°N, 45.0°E–105.0°E) at 0.25° × 0.25° spatial resolution and daily frequency.<br />
          <strong>Reconstructed Depth Levels (15):</strong> 0m, 5m, 10m, 20m, 30m, 50m, 75m, 100m, 125m, 150m, 200m, 300m, 500m, 700m, 1000m.
        </p>
      </div>

      {/* Core Scientific Principle & Physical Limitation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ocean-card p-6 space-y-3 border-t-2 border-t-rose-500">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert size={18} />
            <h3 className="text-sm font-bold text-white">Physical Principle: Satellite Penetration Limits</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Electromagnetic radiation in the thermal infrared and microwave spectrum is strongly attenuated by liquid seawater.
            Infrared radiometers (e.g., MODIS, VIIRS, SLSTR) penetrate only the oceanic skin layer (~10–20 micrometers).
            Microwave radiometers (e.g., AMSR2) penetrate only the sub-skin layer (~1 millimeter).
          </p>
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200">
            <strong>Scientific Fact:</strong> Satellites cannot directly measure water temperatures below the surface skin.
            The deep learning framework does not &quot;see through&quot; water; it models the physical and baroclinic coupling
            between surface signatures and vertical thermal structure.
          </div>
        </div>

        <div className="ocean-card p-6 space-y-3 border-t-2 border-t-cyan-500">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap size={18} />
            <h3 className="text-sm font-bold text-white">The Solution: Multi-Modal Satellite Coupling</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            Subsurface thermal variations (such as thermocline depression in warm-core eddies or thermocline shoaling during coastal upwelling)
            deform the sea surface through baroclinic expansion, producing correlated anomalies in Sea Surface Height (SSH/SLA),
            Sea Surface Salinity (SSS), surface currents, and wind-stress curl.
          </p>
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200">
            <strong>The Embedding Approach:</strong> All 7 surface channels are mapped through a 2D CNN encoder
            and self-attention block into a 64-dimensional latent ocean state, which a depth-aware decoder maps to the 15 vertical layers.
          </div>
        </div>
      </div>

      {/* Data Provider Architecture & Real Data Readiness */}
      <div className="ocean-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="text-cyan-400" size={18} />
          <h3 className="text-sm font-bold text-white">
            Software Architecture & Operational Data Provider Pattern
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-light">
          The OCEANEMBED codebase is engineered with strict modularity. The user interface and model inference
          do not depend directly on synthetic math functions; instead, they communicate through an abstract
          <code className="text-cyan-400 font-mono px-1">DataProvider</code> interface.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-amber-300 text-xs font-mono">DemoDataProvider (Active)</strong>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Prototype Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizes realistic North Indian Ocean physical oceanography: Arabian Sea evaporative high salinity (~36.5 PSU),
              Bay of Bengal river runoff plumes (~31.5 PSU), Somali upwelling, mesoscale eddies, and thermal decay down to 4.5°C at 1000m.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-cyan-300 text-xs font-mono">RealDataProvider (Ready Adapter)</strong>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                Production Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Structured adapter ready for NetCDF/xarray pipelines connecting:
              <br />• Copernicus Marine GLORYS12V1 Daily Reanalysis
              <br />• INCOIS / Coriolis ARGO Global Data Assembly Centre (GDAC)
              <br />• Sentinel-3 / VIIRS SST & Jason-3 / Sentinel-6 SSH
            </p>
          </div>
        </div>
      </div>

      {/* Real Data Connection Instructions */}
      <div className="ocean-card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="text-emerald-400" size={18} />
          <h3 className="text-sm font-bold text-white">How to Connect Real Operational Datasets</h3>
        </div>
        <div className="bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/[0.08] font-mono text-xs text-slate-300 space-y-2">
          <div className="text-slate-500"># Step 1: Download NetCDF data for North Indian Ocean (5-30N, 45-105E)</div>
          <div>mkdir -p /data/glorys /data/satellite /data/argo</div>
          <div className="text-slate-500 pt-2"># Step 2: In backend/app/core/config.py, switch mode:</div>
          <div>IS_DEMO_MODE = False</div>
          <div className="text-slate-500 pt-2"># Step 3: In backend/app/api/routes.py, swap provider:</div>
          <div>from app.data.real_provider import RealDataProvider</div>
          <div>data_provider = RealDataProvider(netcdf_dir=&quot;/data&quot;)</div>
        </div>
      </div>
    </div>
  );
};
