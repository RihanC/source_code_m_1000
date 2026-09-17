# OCEANEMBED 🌊🛰️
**Satellite Embedding-Based Deep Learning Framework for Reconstruction of Subsurface Ocean Temperature from Surface Satellite Observations**

Developed for **Smart India Hackathon (SIH) 2026 — Problem Statement 26066**  
**Organization**: Indian National Centre for Ocean Information Services (INCOIS), Ministry of Earth Sciences (MoES), Government of India.

---

## 🎯 Executive Summary & Problem Context

Satellites provide frequent, basin-wide observations of the ocean surface (SST, SSS, SSH, currents, winds), but electromagnetic radiation in infrared and microwave frequencies penetrates only a few micrometers to millimeters into seawater. Subsurface in-situ profiles (such as autonomous ARGO floats) are sparse and irregular.

**OCEANEMBED** bridges this physical observation gap by learning the dynamic baroclinic relationships between multi-modal surface satellite observations and the hidden subsurface thermal stratification.

```
       Surface Satellite Observations (7 Channels)
                           ↓
        Data Preprocessing & Spatial Regridding (0.25°)
                           ↓
     AI Spatial Feature Extraction (2D CNN Filters)
                           ↓
     Global Context & Cross-Channel Coupling (Self-Attention)
                           ↓
       Learned Ocean Embedding (64-Dim Latent Bottleneck)
                           ↓
       Physics-Aware Depth Reconstruction Decoder
                           ↓
      Reconstructed Subsurface Temperature (15 Depths: 0–1000m)
                           ↓
  Benchmarking against GLORYS12V1 & Independent ARGO In-Situ Floats
```

---

## 🌍 Domain & Specifications

| Parameter | Specification |
|---|---|
| **Geographic Region** | North Indian Ocean (Arabian Sea, Bay of Bengal, Equatorial Indian Ocean) |
| **Bounding Box** | 5.0°N to 30.0°N Latitude, 45.0°E to 105.0°E Longitude |
| **Spatial Resolution** | 0.25° × 0.25° Grid |
| **Temporal Frequency** | Daily Synoptic Reconstruction |
| **Surface Inputs (7)** | SST (°C), SSS (PSU), SSH/SLA (m), Current U (m/s), Current V (m/s), Wind U (m/s), Wind V (m/s) |
| **Target Depths (15)** | **0m, 5m, 10m, 20m, 30m, 50m, 75m, 100m, 125m, 150m, 200m, 300m, 500m, 700m, 1000m** |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start the Backend API & Deep Learning Engine

```bash
cd backend

# Install Python dependencies (FastAPI, PyTorch, NumPy, SciPy)
pip install fastapi uvicorn torch numpy scipy pydantic

# Run verification test suite
python test_backend.py

# Launch FastAPI development server (runs on http://localhost:8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI/Swagger documentation is immediately available at `http://localhost:8000/docs`.

### 2. Start the Frontend Scientific Dashboard

```bash
cd frontend

# Install Node dependencies
npm install

# Launch Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 System Architecture & Key Components

### 1. Abstract Data Provider Pattern
The codebase separates data ingestion from inference logic using an abstract `DataProvider` class:
- `DemoDataProvider` (**Active in PoC**): Generates physically coherent North Indian Ocean oceanography (Arabian Sea evaporative high salinity ~36.5 PSU, Bay of Bengal river discharge plumes ~31.5 PSU, Somali upwelling, mesoscale eddies, and realistic thermocline decay down to 4.5°C at 1000m).
- `RealDataProvider` (**Operational Adapter**): Pre-structured adapter ready to connect Copernicus Marine GLORYS12V1 NetCDF reanalysis files, Sentinel-3/Jason satellite rasters, and INCOIS ARGO GDAC profiles.

### 2. Deep Learning Pipeline (`OceanEmbedNet` in PyTorch)
- **Input Layer**: 7-channel multi-modal observation tensor.
- **2D CNN Feature Extractor**: Extracts local horizontal thermal gradients and mesoscale eddy curl.
- **Self-Attention Context Layer**: Multi-head self-attention capturing basin-scale atmospheric-ocean teleconnections.
- **Latent Bottleneck**: 64-dimensional learned Ocean Embedding vector normalized to `[-1, 1]`.
- **Depth-Aware Decoder MLP**: Projects latent ocean state to 15 vertical depth temperatures.
- **Uncertainty Head**: Predicts depth-wise confidence interval ($\pm \sigma$), reflecting higher variance in the dynamic thermocline (50–150m) and stability in the deep abyss (1000m).

---

## 🖥️ Dashboard Views & SIH Pitch Flow

1. **Overview / Landing Page**:
   - Hero: *"Revealing the Ocean Beneath the Surface"*.
   - Core metrics: 15 Depths, 0.25° Resolution, Daily Reconstruction, North Indian Ocean domain.
   - Conceptual satellite-to-subsurface visualization.
2. **Ocean Explorer**:
   - Interactive high-performance Canvas map of North Indian Ocean with bathymetry, coastlines, and scientific colormaps (Thermal, Haline, Balance).
   - Variable switcher: SST, SSS, SSH, currents U/V, winds U/V.
   - Depth slice switcher: Horizontal temperature map at any depth from 0m to 1000m.
   - Click-to-probe coordinates and inspect surface variables.
3. **Subsurface Reconstruction**:
   - Animated 5-step reconstruction pipeline execution.
   - Scientific downward vertical profile chart (0 to 1000m on Y-axis downward, Temperature on X-axis).
   - Multi-trace visualization: Model Prediction, GLORYS Reference, ARGO Float matchup, and Uncertainty Envelope.
   - Full 15-depth numerical table.
4. **Ocean Embedding & AI**:
   - 2D PCA projection of learned ocean states: clusters Arabian Sea upwelling, Bay of Bengal freshwater plumes, and equatorial jets.
   - Interactive architecture diagram with clickable layers detailing tensor shapes and operations.
5. **Scientific Validation**:
   - Depth-wise error curves (RMSE vs Depth, Correlation vs Depth, Bias vs Depth).
   - Benchmark comparison table demonstrating progressive gain over Climatology (WOA18), Persistence, Linear Regression, MLP, and Standard CNN.
   - Independent ARGO float matchup inspector.
6. **Presentation Mode**:
   - One-click presentation header that highlights the 4-step story for judges in under 10 seconds.

---

## 🛰️ How to Connect Real NetCDF Operational Data

When operational NetCDF/GRIB datasets from INCOIS or Copernicus Marine Service become available:

1. Place NetCDF files in `/data/glorys`, `/data/satellite`, and `/data/argo`.
2. In `backend/app/core/config.py`, toggle `IS_DEMO_MODE = False`.
3. In `backend/app/api/routes.py`, initialize `RealDataProvider(netcdf_dir="/data")`.

The frontend and API endpoints automatically adapt without modifying a single UI component.

---

## 🔬 Scientific Limitations & Integrity

> **Scientific Transparency**:
> AI does not "see through" water. AI learns statistical and physical relationships between surface multi-modal observations and the underlying baroclinic structure of the ocean. In demonstration mode, all synthetic demonstration data is explicitly labeled with a `DEMO MODE — SYNTHETIC DATA` badge.
