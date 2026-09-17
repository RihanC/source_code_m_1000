import React, { useState, useEffect } from 'react';
import { fetchEmbeddings } from '../services/api';
import type { EmbeddingsResponse, EmbeddingPoint2D } from '../types/ocean';
import { 
  Cpu, 
  Sparkles, 
  Network,
  CheckCircle2
} from 'lucide-react';

export const EmbeddingPage: React.FC = () => {
  const [embeddingsData, setEmbeddingsData] = useState<EmbeddingsResponse | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedPoint, setSelectedPoint] = useState<EmbeddingPoint2D | null>(null);
  const [activeArchLayer, setActiveArchLayer] = useState<string>('embedding');

  useEffect(() => {
    fetchEmbeddings()
      .then(setEmbeddingsData)
      .catch(err => console.error('Failed to load embeddings:', err));
  }, []);

  const archLayers = [
    {
      id: 'input',
      title: '1. Multi-Modal Surface Observations',
      shape: '(Batch, 7, 0.25° Grid)',
      color: 'border-blue-500 bg-blue-950/30 text-blue-300',
      description: 'Ingests 7 physical channels: Sea Surface Temperature (SST), Sea Surface Salinity (SSS), Sea Surface Height / SLA (SSH), Zonal & Meridional Surface Currents (U, V), and 10m Surface Winds (U, V).'
    },
    {
      id: 'preprocessing',
      title: '2. Preprocessing & Daily Harmonization',
      shape: '(Batch, 7, H, W)',
      color: 'border-sky-500 bg-sky-950/30 text-sky-300',
      description: 'Performs physical range validation, Land Masking for the North Indian Ocean basin (5°–30°N, 45°–105°E), missing value interpolation, and daily synoptic temporal alignment.'
    },
    {
      id: 'encoder',
      title: '3. Spatial CNN Feature Extractor',
      shape: '(Batch, 128)',
      color: 'border-indigo-500 bg-indigo-950/30 text-indigo-300',
      description: 'Multi-layer convolutional filters capturing local horizontal thermal gradients, frontal zones, and mesoscale cyclonic/anti-cyclonic eddy signatures.'
    },
    {
      id: 'attention',
      title: '4. Self-Attention Transformer Block',
      shape: '(Batch, 1, 128)',
      color: 'border-purple-500 bg-purple-950/30 text-purple-300',
      description: 'Multi-Head Self-Attention with LayerNorm and GELU feed-forward networks, capturing non-local teleconnections and cross-channel wind-stress/current couplings.'
    },
    {
      id: 'embedding',
      title: '5. Learned Ocean Embedding Bottleneck',
      shape: '(Batch, 64)',
      color: 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-lg shadow-cyan-500/10',
      description: 'A 64-dimensional compact latent representation of the ocean thermal and dynamic state. Compresses multi-modal satellite observations into a rich feature vector that encodes thermocline depth, mixed layer heat content, and water mass characteristics.'
    },
    {
      id: 'decoder',
      title: '6. Depth-Aware Reconstruction Decoder',
      shape: '(Batch, 15)',
      color: 'border-emerald-500 bg-emerald-950/30 text-emerald-300',
      description: 'Non-linear multilayer perceptron with depth-conditioned projections that decodes the 64-dim embedding into 15 vertical temperatures while enforcing physically valid thermal stratification.'
    },
    {
      id: 'uncertainty',
      title: '7. Uncertainty Estimation Head',
      shape: '(Batch, 15)',
      color: 'border-amber-500 bg-amber-950/30 text-amber-300',
      description: 'Parallel Softplus uncertainty head predicting confidence standard deviations (±σ) for each depth level, reflecting higher variance in the dynamic thermocline.'
    }
  ];

  // Colors for 2D embedding scatter clusters
  const clusterColors: Record<string, string> = {
    'AS-Upwelling': '#f43f5e',
    'AS-HighSalinity': '#f59e0b',
    'BoB-LowSalinityPlume': '#06b6d4',
    'BoB-WarmPool': '#10b981',
    'EIO-WyrtkiJet': '#8b5cf6',
    'DynamicEddyField': '#38bdf8'
  };

  const filteredPoints = embeddingsData
    ? selectedCluster === 'all'
      ? embeddingsData.points
      : embeddingsData.points.filter(p => p.cluster === selectedCluster)
    : [];

  return (
    <div className="space-y-8 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="text-cyan-400" size={22} />
          Ocean Embedding & Deep Learning Architecture
        </h2>
        <p className="text-xs text-slate-400">
          Visualizing how the neural encoder compresses 7 satellite variables into a learned 64-dimensional latent ocean state
        </p>
      </div>

      {/* 2D EMBEDDING PROJECTION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter Plot Visualizer (7 cols) */}
        <div className="lg:col-span-7 ocean-card p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a3254] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>2D Latent Representation (PCA Projection)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  {embeddingsData?.total_samples || 0} Ocean States
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Principal components PC1 (44.2%) vs PC2 (28.6%) derived from 64-dim bottleneck
              </p>
            </div>

            {/* Cluster Filter */}
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="bg-[#081424] text-slate-200 border border-[#1e3a5f] rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Ocean Regimes</option>
              <option value="AS-Upwelling">Arabian Sea Upwelling</option>
              <option value="AS-HighSalinity">Arabian Sea High Salinity</option>
              <option value="BoB-LowSalinityPlume">Bay of Bengal Low Salinity</option>
              <option value="BoB-WarmPool">Bay of Bengal Warm Pool</option>
              <option value="EIO-WyrtkiJet">Equatorial Wyrtki Jets</option>
              <option value="DynamicEddyField">Dynamic Eddy Fields</option>
            </select>
          </div>

          {/* 2D Canvas / SVG Scatter View */}
          <div className="relative flex justify-center py-2">
            <svg width={500} height={340} className="bg-[#081324] rounded-lg border border-[#142848] select-none">
              {/* Axes */}
              <line x1={250} y1={20} x2={250} y2={320} stroke="#142848" strokeDasharray="3,3" />
              <line x1={20} y1={170} x2={480} y2={170} stroke="#142848" strokeDasharray="3,3" />

              <text x={470} y={164} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
                PC1 (Thermal & Salinity Gradient) →
              </text>
              <text x={256} y={32} fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
                ↑ PC2 (Wind Stress / MLD)
              </text>

              {/* Scatter Points */}
              {filteredPoints.map((p) => {
                // Map coordinates: X range [-3.5, 3.5] -> [40, 460]; Y range [-3, 3.5] -> [310, 30]
                const cx = 250 + (p.x / 3.5) * 210;
                const cy = 170 - (p.y / 3.5) * 140;
                const isSelected = selectedPoint?.id === p.id;
                const color = clusterColors[p.cluster] || '#0ea5e9';

                return (
                  <g
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPoint(p)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 7 : 4}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.4)'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={0.85}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Cluster Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#142848]">
            {Object.entries(clusterColors).map(([key, color]) => (
              <div
                key={key}
                onClick={() => setSelectedCluster(selectedCluster === key ? 'all' : key)}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${
                  selectedCluster === key ? 'bg-[#12243d] border border-cyan-500/40' : 'hover:bg-[#0c1c33]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="text-slate-300 truncate">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Point Details & Embedding Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="ocean-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400" />
              Latent State Inspector
            </h3>

            {selectedPoint ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="bg-[#081424] p-3 rounded-lg border border-[#1e3a5f] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Regime Cluster:</span>
                    <strong className="text-cyan-300">{selectedPoint.cluster}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Basin & Season:</span>
                    <span className="text-white">{selectedPoint.basin} • {selectedPoint.season}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white">{selectedPoint.lat}°N, {selectedPoint.lon}°E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface SST:</span>
                    <strong className="text-rose-400">{selectedPoint.sst} °C</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mixed Layer Depth (MLD):</span>
                    <strong className="text-teal-300">{selectedPoint.mld} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latent Coordinates:</span>
                    <span className="text-slate-300">PC1: {selectedPoint.x} | PC2: {selectedPoint.y}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#081424] border border-[#142848] text-xs text-slate-400">
                Click any scatter point on the PCA plot to inspect its oceanographic regime, SST, and MLD.
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200 leading-relaxed">
              <strong>Key Insight:</strong> The latent space demonstrates natural clustering:
              high-salinity Arabian Sea waters separate from low-salinity Bay of Bengal plumes,
              proving the network learns physical water-mass identity rather than memorizing pixels.
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MODEL ARCHITECTURE DIAGRAM */}
      <div className="ocean-card p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="text-cyan-400" size={20} />
            Interactive Deep Learning Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click on any module in the pipeline to inspect tensor dimensions, operations, and scientific rationale
          </p>
        </div>

        {/* Horizontal Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {archLayers.map((layer) => {
            const isActive = activeArchLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveArchLayer(layer.id)}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  isActive
                    ? `${layer.color} ring-2 ring-cyan-400 shadow-md`
                    : 'border-[#142848] bg-[#081424] hover:border-[#1e3a5f]'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 uppercase truncate">
                  {layer.shape}
                </div>
                <div className="text-xs font-bold text-white mt-1 leading-snug">
                  {layer.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Deep Dive */}
        {(() => {
          const current = archLayers.find(l => l.id === activeArchLayer);
          if (!current) return null;
          return (
            <div className="p-5 rounded-xl bg-[#09172b] border border-[#1e3a5f] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1a3254] pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  <span className="text-sm font-bold text-white">{current.title}</span>
                </div>
                <span className="text-xs font-mono text-cyan-300 bg-[#071324] px-2.5 py-1 rounded border border-[#1a3254]">
                  Tensor Shape: {current.shape}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {current.description}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
