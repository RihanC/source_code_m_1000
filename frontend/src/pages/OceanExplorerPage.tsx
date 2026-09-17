import React, { useState, useEffect } from 'react';
import { OceanMap } from '../components/OceanMap';
import type { GridField, SurfacePoint, ArgoFloatMatch } from '../types/ocean';
import { fetchSurfaceGrid, fetchDepthGrid, fetchSurfacePoint, fetchArgoMatches } from '../services/api';
import { 
  Calendar, 
  Layers, 
  Compass, 
  MapPin, 
  ArrowRight, 
  Sliders, 
  RefreshCw,
  Thermometer,
  Waves
} from 'lucide-react';

interface OceanExplorerPageProps {
  selectedLat: number;
  selectedLon: number;
  setSelectedLat: (lat: number) => void;
  setSelectedLon: (lon: number) => void;
  onTriggerReconstruction: () => void;
}

export const OceanExplorerPage: React.FC<OceanExplorerPageProps> = ({
  selectedLat,
  selectedLon,
  setSelectedLat,
  setSelectedLon,
  onTriggerReconstruction
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-05-15');
  const [selectedVariable, setSelectedVariable] = useState('SST');
  const [selectedDepth, setSelectedDepth] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'surface' | 'depth'>('surface');
  
  const [gridData, setGridData] = useState<GridField | null>(null);
  const [pointData, setPointData] = useState<SurfacePoint | null>(null);
  const [argoFloats, setArgoFloats] = useState<ArgoFloatMatch[]>([]);
  const [showArgo, setShowArgo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const surfaceVars = [
    { id: 'SST', name: 'Sea Surface Temperature', unit: '°C' },
    { id: 'SSS', name: 'Sea Surface Salinity', unit: 'PSU' },
    { id: 'SSH', name: 'Sea Surface Height / SLA', unit: 'm' },
    { id: 'Current_U', name: 'Surface Current U', unit: 'm/s' },
    { id: 'Current_V', name: 'Surface Current V', unit: 'm/s' },
    { id: 'Wind_U', name: 'Surface Wind U (10m)', unit: 'm/s' },
    { id: 'Wind_V', name: 'Surface Wind V (10m)', unit: 'm/s' },
  ];

  const depthLevels = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

  const regions = [
    { name: 'North Indian Ocean (All)', lat: 14.5, lon: 75.0 },
    { name: 'Arabian Sea (High Salinity)', lat: 15.0, lon: 65.0 },
    { name: 'Bay of Bengal (Low Salinity Plume)', lat: 14.0, lon: 88.0 },
    { name: 'Equatorial Indian Ocean', lat: 6.5, lon: 75.0 },
    { name: 'Somali Upwelling Zone', lat: 10.5, lon: 53.5 },
  ];

  useEffect(() => {
    fetchArgoMatches()
      .then(setArgoFloats)
      .catch(err => console.warn('Could not load ARGO floats:', err));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (viewMode === 'surface') {
      fetchSurfaceGrid(selectedVariable, selectedDate)
        .then(setGridData)
        .catch(err => console.error('Grid fetch error:', err))
        .finally(() => setIsLoading(false));
    } else {
      fetchDepthGrid(selectedDepth, selectedDate)
        .then(setGridData)
        .catch(err => console.error('Depth grid error:', err))
        .finally(() => setIsLoading(false));
    }
  }, [selectedVariable, selectedDepth, selectedDate, viewMode]);

  useEffect(() => {
    fetchSurfacePoint(selectedLat, selectedLon, selectedDate)
      .then(setPointData)
      .catch(err => console.warn('Point fetch error:', err));
  }, [selectedLat, selectedLon, selectedDate]);

  return (
    <div className="space-y-6 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Top Header / Mode Toggle with Glassmorphism */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="text-cyan-400" size={22} />
            North Indian Ocean Surface & Subsurface Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Interactive multi-variable spatial analysis and point-wise subsurface probe
          </p>
        </div>

        {/* Surface vs Depth Slice Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08]">
          <button
            onClick={() => setViewMode('surface')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              viewMode === 'surface'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Surface Satellite Variables
          </button>
          <button
            onClick={() => setViewMode('depth')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              viewMode === 'depth'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Subsurface Depth Slice (0–1000m)
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Sidebar | Map | Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT SIDEBAR (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Date Selector */}
          <div className="ocean-card p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={13} className="text-cyan-400" />
              Observation Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-black/30 backdrop-blur-md text-slate-200 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="2026-05-15">2026-05-15 (Daily Synoptic)</option>
              <option value="2026-05-16">2026-05-16 (Daily Synoptic)</option>
              <option value="2026-05-17">2026-05-17 (Daily Synoptic)</option>
              <option value="2026-05-18">2026-05-18 (Daily Synoptic)</option>
              <option value="2026-05-19">2026-05-19 (Daily Synoptic)</option>
            </select>
          </div>

          {/* Region Quick Select */}
          <div className="ocean-card p-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Compass size={13} className="text-cyan-400" />
              Quick Region Zoom
            </label>
            <div className="space-y-1">
              {regions.map((reg) => (
                <button
                  key={reg.name}
                  onClick={() => {
                    setSelectedLat(reg.lat);
                    setSelectedLon(reg.lon);
                  }}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30 transition-all flex items-center justify-between"
                >
                  <span>{reg.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{reg.lat}°N, {reg.lon}°E</span>
                </button>
              ))}
            </div>
          </div>

          {/* Variable or Depth Selector */}
          {viewMode === 'surface' ? (
            <div className="ocean-card p-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={13} className="text-cyan-400" />
                Surface Satellite Variable (7 Channels)
              </label>
              <div className="space-y-1">
                {surfaceVars.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariable(v.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      selectedVariable === v.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'bg-white/[0.02] text-slate-300 border border-transparent hover:border-white/[0.1] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{v.unit}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ocean-card p-4 space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers size={13} className="text-cyan-400" />
                Subsurface Depth Level (15 Depths)
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {depthLevels.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDepth(d)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-medium transition-all ${
                      selectedDepth === d
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold shadow-sm'
                        : 'bg-white/[0.02] text-slate-300 hover:bg-white/[0.06] border border-white/[0.04]'
                    }`}
                  >
                    {d} m
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Showing horizontal temperature slice at <strong>{selectedDepth} meters</strong> depth.
              </div>
            </div>
          )}

          {/* ARGO Float Layer Toggle */}
          <div className="ocean-card p-4 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Show ARGO Float In-Situ Layer</span>
            <input
              type="checkbox"
              checked={showArgo}
              onChange={(e) => setShowArgo(e.target.checked)}
              className="accent-cyan-500 cursor-pointer w-4 h-4"
            />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onTriggerReconstruction}
            className="btn-primary w-full py-3 text-xs justify-center font-bold"
          >
            <span>Run Subsurface Reconstruction</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* CENTER MAP AREA (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          {isLoading && (
            <div className="text-xs text-cyan-400 flex items-center gap-1.5 animate-pulse mb-1">
              <RefreshCw size={12} className="animate-spin" />
              Loading high-resolution spatial raster grid...
            </div>
          )}
          <OceanMap
            gridData={gridData}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            onSelectLocation={(lat, lon) => {
              setSelectedLat(lat);
              setSelectedLon(lon);
            }}
            argoFloats={argoFloats}
            showArgoLayer={showArgo}
          />
        </div>

        {/* RIGHT PANEL: SELECTED LOCATION INSPECTOR (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="ocean-card p-4 space-y-4">
            <div className="border-b border-white/[0.08] pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-cyan-400" />
                Target Coordinate Probe
              </h3>
              <div className="text-base font-bold text-cyan-300 font-mono mt-1">
                {selectedLat.toFixed(2)}°N, {selectedLon.toFixed(2)}°E
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {pointData?.is_ocean ? (
                  <span className="text-emerald-400 font-semibold">● Ocean Coordinate (Valid)</span>
                ) : (
                  <span className="text-rose-400 font-semibold">● Continental Land Mask</span>
                )}
              </div>
            </div>

            {/* Surface Variables at Point */}
            {pointData?.is_ocean ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-sans font-semibold">
                  Surface Observations:
                </div>
                <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl space-y-1.5 border border-white/[0.06]">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">SST:</span>
                    <strong className="text-white">{pointData.sst} °C</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">SSS (Salinity):</span>
                    <strong className="text-white">{pointData.sss} PSU</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">SSH / SLA:</span>
                    <strong className="text-white">{pointData.ssh} m</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Surface Current U/V:</span>
                    <strong className="text-white">{pointData.current_u} / {pointData.current_v} m/s</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400 font-sans">Surface Wind U/V:</span>
                    <strong className="text-white">{pointData.wind_u} / {pointData.wind_v} m/s</strong>
                  </div>
                </div>

                <button
                  onClick={onTriggerReconstruction}
                  className="btn-primary w-full py-2.5 text-xs justify-center mt-2"
                >
                  <Thermometer size={14} />
                  <span>Reconstruct 15-Depth Profile</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-900/40 text-xs text-rose-300">
                Land location selected. Please click an ocean coordinate in the Arabian Sea, Bay of Bengal, or Equatorial Indian Ocean to reconstruct vertical subsurface temperature.
              </div>
            )}
          </div>

          {/* Quick Basin Info Card */}
          <div className="ocean-card p-4 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Waves size={14} className="text-cyan-400" />
              Basin Dynamic Context
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-400 font-light">
              {selectedLon < 77.5
                ? 'Arabian Sea: Characterized by strong evaporative high salinity (~36.5 PSU), seasonal upwelling along western boundaries, and active mesoscale eddy fields.'
                : 'Bay of Bengal: Governed by massive river discharge (Ganges, Brahmaputra) producing low-salinity surface plumes (~31-33 PSU) and stable barrier layers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
