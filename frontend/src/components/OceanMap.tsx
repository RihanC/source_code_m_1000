import React, { useRef, useEffect, useState } from 'react';
import type { GridField, ArgoFloatMatch } from '../types/ocean';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface OceanMapProps {
  gridData: GridField | null;
  selectedLat: number;
  selectedLon: number;
  onSelectLocation: (lat: number, lon: number) => void;
  argoFloats?: ArgoFloatMatch[];
  showArgoLayer?: boolean;
}

export const OceanMap: React.FC<OceanMapProps> = ({
  gridData,
  selectedLat,
  selectedLon,
  onSelectLocation,
  argoFloats = [],
  showArgoLayer = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ lat: number; lon: number; val: number | null; x: number; y: number } | null>(null);

  // Geographic bounds
  const LAT_MIN = 5.0;
  const LAT_MAX = 30.0;
  const LON_MIN = 45.0;
  const LON_MAX = 105.0;

  // Convert geographic coordinates to canvas pixel coordinates
  const geoToPixel = (lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * width;
    const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;
    return { x, y };
  };

  // Convert canvas pixel coordinates to geographic coordinates
  const pixelToGeo = (x: number, y: number, width: number, height: number) => {
    const lon = LON_MIN + (x / width) * (LON_MAX - LON_MIN);
    const lat = LAT_MAX - (y / height) * (LAT_MAX - LAT_MIN);
    return {
      lat: Math.round(lat * 100) / 100,
      lon: Math.round(lon * 100) / 100
    };
  };

  // Scientific Colormaps (Thermal/Cmocean inspired)
  const getColor = (val: number, min: number, max: number, variable: string): [number, number, number] => {
    if (min === max) return [30, 80, 160];
    const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));

    if (variable.includes("Temperature") || variable === "SST") {
      // Thermal colormap (Deep Navy -> Cyan -> Green -> Yellow -> Orange -> Crimson)
      if (norm < 0.2) return [15, 30, 85 + norm * 500];
      if (norm < 0.4) return [20, 120 + norm * 200, 200];
      if (norm < 0.6) return [30, 200, 140 - (norm - 0.4) * 400];
      if (norm < 0.8) return [240, 180 + (norm - 0.6) * 150, 40];
      return [230, 50 + (1 - norm) * 300, 40];
    } else if (variable === "SSS") {
      // Haline colormap (Teal to Deep Blue/Violet)
      const r = Math.round(20 + norm * 180);
      const g = Math.round(180 - norm * 120);
      const b = Math.round(150 + norm * 100);
      return [r, g, b];
    } else if (variable.includes("Current") || variable.includes("Wind")) {
      // Speed colormap (Cyan to Vivid Coral)
      return [
        Math.round(20 + norm * 220),
        Math.round(140 + (1 - Math.abs(norm - 0.5) * 2) * 80),
        Math.round(230 * (1 - norm * 0.8))
      ];
    } else {
      // Balance / Anomaly colormap (SSH/SLA)
      if (norm < 0.5) {
        const factor = norm * 2;
        return [30, Math.round(80 + factor * 80), Math.round(180 + factor * 70)];
      } else {
        const factor = (norm - 0.5) * 2;
        return [Math.round(200 + factor * 50), Math.round(100 - factor * 60), 50];
      }
    }
  };

  // Draw raster field and land boundaries
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill ocean background
    ctx.fillStyle = '#061326';
    ctx.fillRect(0, 0, width, height);

    if (gridData && gridData.grid.length > 0) {
      const numRows = gridData.lats.length;
      const numCols = gridData.lons.length;
      const cellW = width / numCols;
      const cellH = height / numRows;

      for (let r = 0; r < numRows; r++) {
        const lat = gridData.lats[r];
        const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;

        for (let c = 0; c < numCols; c++) {
          const lon = gridData.lons[c];
          const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * width;
          const val = gridData.grid[r][c];

          if (val !== null && val !== undefined) {
            const [red, green, blue] = getColor(val, gridData.min_val, gridData.max_val, gridData.variable);
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fillRect(x - 0.5, y - cellH - 0.5, cellW + 1, cellH + 1);
          } else {
            // Land cell
            ctx.fillStyle = '#111e2e';
            ctx.fillRect(x - 0.5, y - cellH - 0.5, cellW + 1, cellH + 1);
          }
        }
      }
    }

    // Draw Graticule lines (Parallels and Meridians)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';

    // Latitude parallels: 10, 15, 20, 25
    [10, 15, 20, 25].forEach((lat) => {
      const { y } = geoToPixel(lat, LON_MIN, width, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${lat}°N`, 8, y - 4);
    });

    // Longitude meridians: 50, 60, 70, 80, 90, 100
    [50, 60, 70, 80, 90, 100].forEach((lon) => {
      const { x } = geoToPixel(LAT_MIN, lon, width, height);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(`${lon}°E`, x + 4, height - 8);
    });

    // Basin Labels
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const asPos = geoToPixel(15, 63, width, height);
    ctx.fillText('ARABIAN SEA', asPos.x - 45, asPos.y);

    const bobPos = geoToPixel(14, 88, width, height);
    ctx.fillText('BAY OF BENGAL', bobPos.x - 50, bobPos.y);

    const eioPos = geoToPixel(6.5, 75, width, height);
    ctx.fillText('EQUATORIAL INDIAN OCEAN', eioPos.x - 85, eioPos.y);

    // Selected Pinpoint Target
    const targetPixel = geoToPixel(selectedLat, selectedLon, width, height);
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetPixel.x, targetPixel.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(targetPixel.x, targetPixel.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetPixel.x, targetPixel.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ARGO Float Markers
    if (showArgoLayer && argoFloats.length > 0) {
      argoFloats.forEach((float) => {
        const pos = geoToPixel(float.lat, float.lon, width, height);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(float.wmo_id.replace('INCOIS-', ''), pos.x + 6, pos.y + 3);
      });
    }

  }, [gridData, selectedLat, selectedLon, argoFloats, showArgoLayer]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const { lat, lon } = pixelToGeo(x, y, canvas.width, canvas.height);
    if (lat >= LAT_MIN && lat <= LAT_MAX && lon >= LON_MIN && lon <= LON_MAX) {
      onSelectLocation(lat, lon);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Physical pixels in the DOM
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    // Canvas internal pixels
    const x = (rawX / rect.width) * canvas.width;
    const y = (rawY / rect.height) * canvas.height;

    const { lat, lon } = pixelToGeo(x, y, canvas.width, canvas.height);

    let val: number | null = null;
    if (gridData && gridData.grid.length > 0) {
      const latIdx = gridData.lats.findIndex(l => Math.abs(l - lat) < 0.3);
      const lonIdx = gridData.lons.findIndex(l => Math.abs(l - lon) < 0.3);
      if (latIdx >= 0 && lonIdx >= 0 && gridData.grid[latIdx]) {
        val = gridData.grid[latIdx][lonIdx] ?? null;
      }
    }

    setHoverInfo({ lat, lon, val, x: rawX, y: rawY });
  };

  return (
    <div className="ocean-card overflow-hidden relative shadow-2xl">
      {/* Map Control Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#091526] border-b border-[#1a3254]">
        <div className="flex items-center gap-2 text-xs">
          <Compass size={15} className="text-cyan-400" />
          <span className="font-semibold text-slate-200">
            {gridData?.variable || 'North Indian Ocean Field'}
          </span>
          <span className="text-slate-400">
            ({LAT_MIN}°N–{LAT_MAX}°N, {LON_MIN}°E–{LON_MAX}°E)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {gridData && (
            <div className="flex items-center gap-3 font-mono text-[11px] bg-[#0c1c33] px-2.5 py-1 rounded border border-[#1a3254]">
              <span className="text-slate-400">Min: <strong className="text-blue-400">{gridData.min_val} {gridData.units}</strong></span>
              <span className="text-slate-400">Mean: <strong className="text-emerald-400">{gridData.mean_val} {gridData.units}</strong></span>
              <span className="text-slate-400">Max: <strong className="text-rose-400">{gridData.max_val} {gridData.units}</strong></span>
            </div>
          )}

          {showArgoLayer && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span>ARGO In-Situ Floats ({argoFloats.length})</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative cursor-crosshair group overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={480}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-auto block"
        />

        {/* Interactive Crosshair & Following Tooltip */}
        {hoverInfo && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal Line */}
            <div 
              className="absolute left-0 right-0 h-px bg-cyan-400/30"
              style={{ top: hoverInfo.y }}
            />
            {/* Vertical Line */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-cyan-400/30"
              style={{ left: hoverInfo.x }}
            />
            {/* Center Glowing Dot */}
            <div 
              className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#06b6d4] transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: hoverInfo.x, top: hoverInfo.y }}
            />
            
            {/* Tooltip Card Following Cursor */}
            <div 
              className="absolute z-10 glass-panel px-3 py-2 rounded-md text-[11px] font-mono text-slate-200 pointer-events-none shadow-xl border border-cyan-500/30 whitespace-nowrap transform -translate-y-[120%] -translate-x-1/2"
              style={{ left: hoverInfo.x, top: hoverInfo.y }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between gap-4 border-b border-cyan-900/40 pb-1 mb-1">
                  <span className="text-slate-400">Target</span>
                  <span className="text-cyan-400">{hoverInfo.lat.toFixed(2)}°N, {hoverInfo.lon.toFixed(2)}°E</span>
                </div>
                <div className="flex items-center gap-2">
                  {hoverInfo.val !== null ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                      <span className="text-slate-400">Data:</span>
                      <span className="text-emerald-300 font-bold">{hoverInfo.val} {gridData?.units}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                      <span className="text-rose-400 font-semibold italic">Land Mask</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Indicator Tooltip */}
        <div className="absolute bottom-3 left-3 glass-panel px-3 py-1.5 rounded-md text-xs text-slate-300 flex items-center gap-2 border border-[#1e3a5f]">
          <MapPin size={13} className="text-cyan-400 animate-bounce" />
          <span>Active Target: <strong className="text-white font-mono">{selectedLat.toFixed(2)}°N, {selectedLon.toFixed(2)}°E</strong></span>
        </div>
      </div>

      {/* Map Footer / Scientific Colormap Bar */}
      <div className="px-4 py-2 bg-[#081220] border-t border-[#142848] flex items-center justify-between text-xs">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Navigation size={12} className="text-slate-500" />
          Click anywhere on the ocean surface to probe coordinates and trigger subsurface reconstruction.
        </div>

        {/* Dynamic Gradient Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">{gridData?.min_val ?? 0} {gridData?.units}</span>
          <div 
            className="w-32 h-2.5 rounded-full border border-slate-700" 
            style={{
              background: 'linear-gradient(to right, #0f1e55, #1478c8, #1eb48c, #f0b428, #e63228)'
            }}
          />
          <span className="text-[10px] text-slate-400 font-mono">{gridData?.max_val ?? 32} {gridData?.units}</span>
        </div>
      </div>
    </div>
  );
};
