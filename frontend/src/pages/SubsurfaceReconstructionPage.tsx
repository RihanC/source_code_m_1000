import React, { useState, useEffect } from 'react';
import { reconstructSubsurface } from '../services/api';
import type { ReconstructResponse } from '../types/ocean';
import { ProfileChart } from '../components/ProfileChart';
import { ProcessingPipeline } from '../components/ProcessingPipeline';
import { 
  Play, 
  MapPin, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Thermometer,
  Cpu
} from 'lucide-react';

interface SubsurfaceReconstructionPageProps {
  selectedLat: number;
  selectedLon: number;
  setSelectedLat: (lat: number) => void;
  setSelectedLon: (lon: number) => void;
}

export const SubsurfaceReconstructionPage: React.FC<SubsurfaceReconstructionPageProps> = ({
  selectedLat,
  selectedLon,
  setSelectedLat,
  setSelectedLon
}) => {
  const selectedDate = '2026-05-15';
  const [reconstruction, setReconstruction] = useState<ReconstructResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(6); // 6 = complete initially

  // Quick preset locations
  const presets = [
    { label: 'Arabian Sea (15.0°N, 65.0°E)', lat: 15.0, lon: 65.0 },
    { label: 'Bay of Bengal (14.0°N, 88.0°E)', lat: 14.0, lon: 88.0 },
    { label: 'Equatorial Warm Pool (7.0°N, 78.0°E)', lat: 7.0, lon: 78.0 },
    { label: 'Somali Upwelling (10.0°N, 53.0°E)', lat: 10.0, lon: 53.0 },
    { label: 'Near ARGO Float 2902145 (14.2°N, 65.4°E)', lat: 14.2, lon: 65.4 },
  ];

  const runReconstructionPipeline = async (lat: number, lon: number, date: string) => {
    setIsProcessing(true);
    setPipelineStep(1);

    // Stage 1: Loading satellite observations
    await new Promise(r => setTimeout(r, 220));
    setPipelineStep(2);

    // Stage 2: Harmonizing surface variables
    await new Promise(r => setTimeout(r, 220));
    setPipelineStep(3);

    // Stage 3: Generating Ocean Embedding
    await new Promise(r => setTimeout(r, 240));
    setPipelineStep(4);

    // Stage 4: Running reconstruction model
    await new Promise(r => setTimeout(r, 220));
    setPipelineStep(5);

    try {
      const data = await reconstructSubsurface(lat, lon, date);
      setReconstruction(data);
    } catch (err) {
      console.error('Reconstruction error:', err);
    } finally {
      await new Promise(r => setTimeout(r, 200));
      setPipelineStep(6);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    runReconstructionPipeline(selectedLat, selectedLon, selectedDate);
  }, [selectedLat, selectedLon, selectedDate]);

  return (
    <div className="space-y-6 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-cyan-400" size={22} />
            Subsurface Temperature Reconstruction (0–1000m)
          </h2>
          <p className="text-xs text-slate-400">
            Multi-modal satellite fusion decoded into a 15-depth vertical thermal profile with uncertainty estimation
          </p>
        </div>

        {/* Location Presets & Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            onChange={(e) => {
              const [latStr, lonStr] = e.target.value.split(',');
              const newLat = parseFloat(latStr);
              const newLon = parseFloat(lonStr);
              setSelectedLat(newLat);
              setSelectedLon(newLon);
            }}
            className="bg-[#081424] text-slate-200 border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            {presets.map((p) => (
              <option key={p.label} value={`${p.lat},${p.lon}`}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            disabled={isProcessing}
            onClick={() => runReconstructionPipeline(selectedLat, selectedLon, selectedDate)}
            className="btn-primary py-2 px-4 text-xs font-bold disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Reconstructing...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="white" />
                <span>Run Reconstruction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5-Step Animated Pipeline Banner */}
      <ProcessingPipeline currentStep={pipelineStep} isProcessing={isProcessing} />

      {/* Main Reconstruction Content */}
      {reconstruction && reconstruction.is_ocean ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <ProfileChart
              profile={reconstruction.profile}
              metrics={reconstruction.metrics}
              hasArgoMatch={reconstruction.has_argo_match}
              argoFloatId={reconstruction.argo_float_id}
              argoDistanceKm={reconstruction.argo_distance_km}
              uncertaintyMean={reconstruction.metrics.uncertainty_mean}
            />

            {/* Learned Ocean Embedding Vector Sample */}
            <div className="ocean-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={14} className="text-cyan-400" />
                  Learned Ocean State Latent Embedding (64-Dim Bottleneck)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Normalized [-1.0, 1.0]</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 pt-1">
                {reconstruction.embedding_sample.slice(0, 16).map((val, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-[#061222] border border-[#142848] text-center"
                  >
                    <div className="text-[9px] text-slate-500 font-mono">e{idx}</div>
                    <div className={`text-[11px] font-mono font-bold ${val >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {val.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-400">
                This latent vector represents the compressed oceanic state derived from surface SST, SSS, SSH, currents, and winds.
              </div>
            </div>
          </div>

          {/* Right Column: 15-Depth Table & Surface Conditions (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Target Coordinate & Surface Conditions */}
            <div className="ocean-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1a3254] pb-2">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin size={13} className="text-cyan-400" />
                    Target Coordinates
                  </div>
                  <div className="text-sm font-mono font-bold text-cyan-300">
                    {selectedLat.toFixed(2)}°N, {selectedLon.toFixed(2)}°E
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge-incois text-[10px]">North Indian Ocean</span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">{selectedDate}</div>
                </div>
              </div>

              {/* Surface Inputs Bar */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(reconstruction.surface_conditions).map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-[#081424] border border-[#142848]">
                    <div className="text-[10px] text-slate-400 font-sans">{k}</div>
                    <div className="text-white font-bold">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 15-Depth Numerical Data Table */}
            <div className="ocean-card p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-[#1a3254] pb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer size={14} className="text-cyan-400" />
                  15 Target Depths Data
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Depth (m) | Temp (°C)</span>
              </div>

              <div className="max-h-72 overflow-y-auto pr-1">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase border-b border-[#142848] font-mono">
                      <th className="py-1.5">Depth</th>
                      <th className="py-1.5 text-cyan-400">Predicted</th>
                      <th className="py-1.5 text-emerald-400">GLORYS</th>
                      <th className="py-1.5 text-amber-400">ARGO</th>
                      <th className="py-1.5 text-slate-400">Uncert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#142848] font-mono">
                    {reconstruction.profile.map((p) => (
                      <tr key={p.depth} className="hover:bg-[#0c1c33]">
                        <td className="py-1.5 text-slate-300 font-semibold">{p.depth} m</td>
                        <td className="py-1.5 text-cyan-300 font-bold">{p.predicted_temp}°C</td>
                        <td className="py-1.5 text-emerald-400">{p.glorys_temp}°C</td>
                        <td className="py-1.5 text-amber-400">
                          {p.argo_temp !== null ? `${p.argo_temp}°C` : '—'}
                        </td>
                        <td className="py-1.5 text-slate-400">±{p.uncertainty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ocean-card p-12 text-center text-slate-400 space-y-3">
          <ShieldAlert size={36} className="text-amber-400 mx-auto" />
          <div className="text-base font-bold text-white">Selected Coordinate is on Land</div>
          <p className="text-xs max-w-md mx-auto">
            The coordinate ({selectedLat.toFixed(2)}°N, {selectedLon.toFixed(2)}°E) falls on the continental landmass.
            Subsurface ocean reconstruction is only valid for ocean water bodies.
          </p>
          <button
            onClick={() => {
              setSelectedLat(15.0);
              setSelectedLon(65.0);
            }}
            className="btn-primary text-xs py-2 px-4 inline-flex mt-2"
          >
            Switch to Arabian Sea (15°N, 65°E)
          </button>
        </div>
      )}
    </div>
  );
};
