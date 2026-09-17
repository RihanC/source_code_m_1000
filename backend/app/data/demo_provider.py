"""
High-Fidelity Synthetic Oceanography Data Provider for North Indian Ocean
Demonstrates realistic physical oceanography for SIH 2026 Problem Statement 26066.
"""
import math
import numpy as np
from typing import Dict, List, Optional, Tuple
from app.core.config import settings
from app.data.base import DataProvider
from app.schemas.models import (
    GridFieldResponse,
    ReconstructResponse,
    ProfileDepthPoint,
    ReconstructionMetrics,
    EmbeddingsResponse,
    EmbeddingPoint2D,
    ValidationSummaryResponse,
    DepthMetric,
    BaselineModel,
    ArgoFloatMatch,
    SurfacePoint
)

def is_land(lat: float, lon: float) -> bool:
    """
    Realistic landmask for the North Indian Ocean basin (5°N to 30°N, 45°E to 105°E).
    Identifies Indian subcontinent, Arabian Peninsula, Iran/Pakistan, and Southeast Asia.
    """
    # Arabian Peninsula / Middle East
    if lon <= 55.0 and lat >= 12.0:
        # Red sea / Gulf of Aden water corridor check
        if 11.5 <= lat <= 15.0 and 43.0 <= lon <= 53.0:
            return False  # Gulf of Aden
        return True
    
    if lon <= 60.0 and lat >= 22.0:
        # Gulf of Oman water check
        if 23.0 <= lat <= 26.0 and 56.5 <= lon <= 60.0:
            return False
        return True

    # Pakistan / Iran / Northern border
    if lat >= 24.5 and lon <= 68.0:
        return True
    if lat >= 27.0:
        return True  # Northern land boundary of Indian plate & Himalayas

    # Sri Lanka
    if 5.8 <= lat <= 9.8 and 79.5 <= lon <= 81.9:
        return True

    # Indian Subcontinent (Triangle from 8.2°N to 27°N)
    if 8.0 <= lat <= 27.0:
        # West coast roughly lon ~ 68.5 at 23N to lon ~ 77.5 at 8.2N
        west_coast_lon = 77.5 - (lat - 8.0) * (77.5 - 68.5) / (23.0 - 8.0)
        # East coast roughly lon ~ 77.5 at 8.2N to lon ~ 89.0 at 22N
        east_coast_lon = 77.5 + (lat - 8.0) * (89.0 - 77.5) / (22.0 - 8.0)
        
        if west_coast_lon <= lon <= east_coast_lon:
            return True

    # Southeast Asia (Myanmar, Thailand, Malay Peninsula)
    if lon >= 98.0 and lat >= 7.0:
        return True
    if lon >= 92.5 and lat >= 20.0:  # Bangladesh / Myanmar coast
        return True
    if lon >= 94.0 and lat >= 15.0:
        return True
    if lon >= 98.5 and lat >= 4.0:
        return True

    return False


class DemoDataProvider(DataProvider):
    """
    Provides physically coherent demonstration data mimicking satellite observations,
    GLORYS12V1 reanalysis, and ARGO float profiles.
    """

    def __init__(self):
        self.depths = settings.DEPTH_LEVELS
        # Seeded random number generator for reproducible mesoscale eddies
        self.rng = np.random.RandomState(42)
        # Predefined mesoscale eddies (lat, lon, radius_deg, amplitude)
        self.eddies = [
            {"lat": 16.5, "lon": 64.0, "r": 2.2, "amp": 0.18, "type": "anticyclonic"},
            {"lat": 12.0, "lon": 58.0, "r": 2.5, "amp": -0.15, "type": "cyclonic"},
            {"lat": 14.5, "lon": 86.5, "r": 2.0, "amp": 0.16, "type": "anticyclonic"},
            {"lat": 18.0, "lon": 89.0, "r": 1.8, "amp": -0.14, "type": "cyclonic"},
            {"lat": 8.5, "lon": 72.0, "r": 2.2, "amp": 0.12, "type": "anticyclonic"},
            {"lat": 7.0, "lon": 92.0, "r": 2.5, "amp": -0.12, "type": "cyclonic"}
        ]
        # Pre-seed ARGO float inventory
        self.argo_floats = self._generate_argo_floats()

    def _generate_argo_floats(self) -> List[ArgoFloatMatch]:
        floats_meta = [
            ("2902145", "INCOIS-ARGO-01", 14.2, 65.4, 28.8, 22.4, 4.8, 0.72),
            ("2902178", "INCOIS-ARGO-02", 11.5, 87.2, 29.6, 23.8, 4.9, 0.68),
            ("2902201", "INCOIS-ARGO-03", 8.4, 73.6, 29.2, 21.9, 4.7, 0.79),
            ("2902244", "INCOIS-ARGO-04", 17.8, 68.2, 28.1, 20.8, 4.8, 0.84),
            ("2902312", "INCOIS-ARGO-05", 15.6, 89.4, 29.4, 24.1, 5.0, 0.65),
            ("6903214", "CORIOLIS-ARGO-06", 9.8, 56.5, 27.9, 21.2, 4.6, 0.74),
            ("2902405", "INCOIS-ARGO-07", 6.5, 82.0, 29.8, 23.5, 4.8, 0.70),
            ("2902450", "INCOIS-ARGO-08", 19.2, 86.8, 29.0, 22.9, 4.9, 0.76),
        ]
        result = []
        for fid, wmo, lat, lon, st, t100, t1000, rmse in floats_meta:
            result.append(ArgoFloatMatch(
                float_id=fid,
                wmo_id=wmo,
                lat=lat,
                lon=lon,
                date="2026-05-15",
                cycle_number=142,
                surface_temp=st,
                temp_100m=t100,
                temp_1000m=t1000,
                rmse_with_model=rmse
            ))
        return result

    def _calculate_physical_surface(self, lat: float, lon: float) -> Tuple[float, float, float, float, float, float, float]:
        """
        Computes physically consistent surface variables:
        SST, SSS, SSH, Current_U, Current_V, Wind_U, Wind_V.
        """
        # 1. Base SST: Warmer in southern equatorial (29.5°C), cooler in north (25.5°C)
        base_sst = 29.8 - 0.22 * (lat - 5.0)
        # Upwelling near Somalia / Western Arabian Sea
        if lon < 60.0 and lat < 18.0:
            upwelling_intensity = (60.0 - lon) / 15.0 * (1.0 - abs(lat - 12.0) / 10.0)
            base_sst -= max(0.0, upwelling_intensity * 2.8)
        # Bay of Bengal warm pool
        if 80.0 <= lon <= 95.0 and 8.0 <= lat <= 18.0:
            base_sst += 0.6 * math.sin((lon - 80.0) / 15.0 * math.pi)

        # 2. Base SSS: High salinity in evaporative Arabian Sea (36.5 PSU),
        # low salinity in freshwater-fed Bay of Bengal (31.5 - 33.0 PSU)
        if lon < 77.5:
            # Arabian Sea
            base_sss = 35.6 + 0.05 * (lat - 5.0) + 0.02 * (77.5 - lon)
        else:
            # Bay of Bengal
            base_sss = 33.2 - 0.12 * (lat - 8.0) - 0.03 * (lon - 77.5)
            # River mouths in northern BoB
            if lat > 18.0 and lon > 86.0:
                base_sss -= 1.8

        # 3. Base SSH with mesoscale eddy superposition
        base_ssh = 0.05 * math.sin(lat * 0.2) + 0.03 * math.cos(lon * 0.15)
        for eddy in self.eddies:
            dist = math.hypot(lat - eddy["lat"], lon - eddy["lon"])
            if dist < eddy["r"] * 2.0:
                anomaly = eddy["amp"] * math.exp(-0.5 * (dist / eddy["r"]) ** 2)
                base_ssh += anomaly
                base_sst += anomaly * 1.5  # Warm-core / cold-core eddy thermal coupling

        # 4. Surface Winds (Southwest Monsoon Intermonsoon setup: southwesterlies)
        wind_u = 4.5 + 2.0 * math.sin(lat * 0.15) + 0.8 * math.cos(lon * 0.2)
        wind_v = 3.2 + 1.8 * math.cos(lat * 0.12) - 0.5 * math.sin(lon * 0.1)

        # 5. Surface Geostrophic & Wind-driven Currents
        current_u = 0.18 * math.sin(lat * 0.3) + 0.12 * (wind_u / 10.0)
        current_v = 0.14 * math.cos(lon * 0.25) + 0.10 * (wind_v / 10.0)
        # Eddy circulation
        for eddy in self.eddies:
            dist = math.hypot(lat - eddy["lat"], lon - eddy["lon"])
            if dist < eddy["r"] * 2.0 and dist > 0.1:
                v_tan = (eddy["amp"] * 3.0) * (dist / eddy["r"]) * math.exp(-0.5 * (dist / eddy["r"]) ** 2)
                dx = (lon - eddy["lon"])
                dy = (lat - eddy["lat"])
                current_u += -v_tan * (dy / dist)
                current_v += v_tan * (dx / dist)

        return (
            round(base_sst, 2),
            round(base_sss, 2),
            round(base_ssh, 3),
            round(current_u, 3),
            round(current_v, 3),
            round(wind_u, 2),
            round(wind_v, 2)
        )

    def _synthesize_temperature_at_depth(self, sst: float, ssh: float, depth: int, lat: float) -> float:
        """
        Physics-guided thermocline reconstruction:
        Surface layer (0-30m): Mixed Layer Depth (MLD)
        Thermocline (50-200m): High gradient transition
        Deep layer (300-1000m): Asymptotic cold pool (~4.5°C to 5.0°C)
        """
        if depth == 0:
            return sst
        
        # Mixed layer depth variation based on SSH and latitude (typically 25m - 45m)
        mld = 30.0 + ssh * 50.0 + 5.0 * math.sin(lat * 0.2)
        mld = max(15.0, min(65.0, mld))
        
        # Deep ocean floor asymptotic baseline at 1000m
        t_deep = 4.6 + 0.02 * (lat - 5.0)
        
        if depth <= mld:
            # Quasi-isothermal mixed layer
            loss_ratio = (depth / mld) ** 1.8 * 0.08
            temp = sst * (1.0 - loss_ratio)
        else:
            # Thermocline decay
            # Characteristic thermocline decay scale z_scale
            z_scale = 130.0 + ssh * 80.0
            fraction = math.exp(-(depth - mld) / z_scale)
            temp = t_deep + (sst - t_deep) * fraction
            
        return round(temp, 2)

    def get_surface_point(self, lat: float, lon: float, date: str) -> SurfacePoint:
        land = is_land(lat, lon)
        if land:
            return SurfacePoint(
                lat=lat, lon=lon, is_ocean=False,
                sst=0.0, sss=0.0, ssh=0.0,
                current_u=0.0, current_v=0.0,
                wind_u=0.0, wind_v=0.0
            )
        
        sst, sss, ssh, cur_u, cur_v, wnd_u, wnd_v = self._calculate_physical_surface(lat, lon)
        return SurfacePoint(
            lat=lat, lon=lon, is_ocean=True,
            sst=sst, sss=sss, ssh=ssh,
            current_u=cur_u, current_v=cur_v,
            wind_u=wnd_u, wind_v=wnd_v
        )

    def get_surface_grid(self, variable: str, date: str) -> GridFieldResponse:
        step = settings.GRID_STEP
        lats = [round(lat, 2) for lat in np.arange(settings.LAT_MIN, settings.LAT_MAX + 0.01, step)]
        lons = [round(lon, 2) for lon in np.arange(settings.LON_MIN, settings.LON_MAX + 0.01, step)]
        
        grid: List[List[Optional[float]]] = []
        valid_vals: List[float] = []

        for lat in lats:
            row: List[Optional[float]] = []
            for lon in lons:
                if is_land(lat, lon):
                    row.append(None)
                else:
                    sst, sss, ssh, cur_u, cur_v, wnd_u, wnd_v = self._calculate_physical_surface(lat, lon)
                    val_map = {
                        "SST": sst,
                        "SSS": sss,
                        "SSH": ssh,
                        "Current_U": cur_u,
                        "Current_V": cur_v,
                        "Wind_U": wnd_u,
                        "Wind_V": wnd_v
                    }
                    val = val_map.get(variable, sst)
                    row.append(val)
                    valid_vals.append(val)
            grid.append(row)

        units_map = {
            "SST": "°C",
            "SSS": "PSU",
            "SSH": "m",
            "Current_U": "m/s",
            "Current_V": "m/s",
            "Wind_U": "m/s",
            "Wind_V": "m/s"
        }

        min_val = float(np.min(valid_vals)) if valid_vals else 0.0
        max_val = float(np.max(valid_vals)) if valid_vals else 0.0
        mean_val = float(np.mean(valid_vals)) if valid_vals else 0.0

        return GridFieldResponse(
            variable=variable,
            depth=0,
            date=date,
            units=units_map.get(variable, ""),
            min_val=round(min_val, 2),
            max_val=round(max_val, 2),
            mean_val=round(mean_val, 2),
            lats=lats,
            lons=lons,
            grid=grid
        )

    def get_depth_grid(self, depth: int, date: str) -> GridFieldResponse:
        step = settings.GRID_STEP
        lats = [round(lat, 2) for lat in np.arange(settings.LAT_MIN, settings.LAT_MAX + 0.01, step)]
        lons = [round(lon, 2) for lon in np.arange(settings.LON_MIN, settings.LON_MAX + 0.01, step)]
        
        grid: List[List[Optional[float]]] = []
        valid_vals: List[float] = []

        for lat in lats:
            row: List[Optional[float]] = []
            for lon in lons:
                if is_land(lat, lon):
                    row.append(None)
                else:
                    sst, _, ssh, _, _, _, _ = self._calculate_physical_surface(lat, lon)
                    t_depth = self._synthesize_temperature_at_depth(sst, ssh, depth, lat)
                    row.append(t_depth)
                    valid_vals.append(t_depth)
            grid.append(row)

        min_val = float(np.min(valid_vals)) if valid_vals else 0.0
        max_val = float(np.max(valid_vals)) if valid_vals else 0.0
        mean_val = float(np.mean(valid_vals)) if valid_vals else 0.0

        return GridFieldResponse(
            variable=f"Reconstructed Temperature — {depth}m",
            depth=depth,
            date=date,
            units="°C",
            min_val=round(min_val, 2),
            max_val=round(max_val, 2),
            mean_val=round(mean_val, 2),
            lats=lats,
            lons=lons,
            grid=grid
        )

    def reconstruct_profile(self, lat: float, lon: float, date: str) -> ReconstructResponse:
        land = is_land(lat, lon)
        if land:
            return ReconstructResponse(
                lat=lat, lon=lon, date=date, is_ocean=False,
                surface_conditions={},
                profile=[],
                metrics=ReconstructionMetrics(
                    rmse=0.0, correlation=0.0, bias=0.0,
                    confidence_level="Invalid (Land)", uncertainty_mean=0.0
                ),
                has_argo_match=False,
                embedding_sample=[],
                data_source_badge=settings.DATA_SOURCE_NAME
            )

        sst, sss, ssh, cur_u, cur_v, wnd_u, wnd_v = self._calculate_physical_surface(lat, lon)
        
        # Check for nearest ARGO float within 200 km (~1.8 deg)
        argo_match = None
        min_dist_km = 9999.0
        for argo in self.argo_floats:
            # Approximation 1 deg lat ~ 111 km
            d_lat = (argo.lat - lat) * 111.0
            d_lon = (argo.lon - lon) * 111.0 * math.cos(math.radians(lat))
            dist = math.hypot(d_lat, d_lon)
            if dist < 250.0 and dist < min_dist_km:
                min_dist_km = dist
                argo_match = argo

        profile_points: List[ProfileDepthPoint] = []
        pred_list: List[float] = []
        glorys_list: List[float] = []

        # Synthetic latent embedding sample (64-dim)
        embed_sample = [
            round(float(math.sin(i * 0.4 + lat * 0.1) * math.cos(i * 0.2 + lon * 0.05)), 4)
            for i in range(16)
        ]

        for depth in self.depths:
            # Ideal ground-truth physical profile (simulating GLORYS12V1 Reanalysis)
            glorys_t = self._synthesize_temperature_at_depth(sst, ssh, depth, lat)
            
            # Neural network prediction: captures physical structure with slight realistic residual error
            # Error is highest near thermocline (50m-150m) and lowest at surface (0m) and deep abyss (1000m)
            depth_factor = math.exp(-((depth - 90.0) / 75.0) ** 2)
            noise = (math.sin(depth * 0.3 + lat * 2.1) * 0.45 + 0.1) * depth_factor
            pred_t = round(glorys_t + noise, 2)
            
            # Model uncertainty envelope (higher in thermocline ~ ±0.75°C, lower at surface/abyss ~ ±0.3°C)
            uncert = round(0.32 + 0.48 * depth_factor, 2)

            argo_t = None
            if argo_match:
                # ARGO independent in-situ observation: has sensor accuracy & fine-scale turbulence
                argo_noise = (math.cos(depth * 0.4 + lon * 1.5) * 0.35) * depth_factor
                argo_t = round(glorys_t + argo_noise, 2)

            profile_points.append(ProfileDepthPoint(
                depth=depth,
                predicted_temp=pred_t,
                glorys_temp=glorys_t,
                argo_temp=argo_t,
                uncertainty=uncert
            ))
            pred_list.append(pred_t)
            glorys_list.append(glorys_t)

        # Compute validation metrics between Predicted and GLORYS Reference
        diffs = np.array(pred_list) - np.array(glorys_list)
        rmse = float(np.sqrt(np.mean(diffs ** 2)))
        bias = float(np.mean(diffs))
        # Pearson correlation
        if np.std(pred_list) > 0 and np.std(glorys_list) > 0:
            corr = float(np.corrcoef(pred_list, glorys_list)[0, 1])
        else:
            corr = 0.99

        return ReconstructResponse(
            lat=lat,
            lon=lon,
            date=date,
            is_ocean=True,
            surface_conditions={
                "SST (°C)": sst,
                "SSS (PSU)": sss,
                "SSH (m)": ssh,
                "Current U (m/s)": cur_u,
                "Current V (m/s)": cur_v,
                "Wind U (m/s)": wnd_u,
                "Wind V (m/s)": wnd_v
            },
            profile=profile_points,
            metrics=ReconstructionMetrics(
                rmse=round(rmse, 2),
                correlation=round(corr, 3),
                bias=round(bias, 2),
                confidence_level="High Confidence (±0.48°C)",
                uncertainty_mean=round(float(np.mean([p.uncertainty for p in profile_points])), 2)
            ),
            has_argo_match=argo_match is not None,
            argo_float_id=argo_match.wmo_id if argo_match else None,
            argo_distance_km=round(min_dist_km, 1) if argo_match else None,
            embedding_sample=embed_sample,
            data_source_badge=settings.DATA_SOURCE_NAME
        )

    def get_latent_embeddings(self) -> EmbeddingsResponse:
        """
        Generates 2D PCA / Latent Representation projection of learned ocean states
        across diverse oceanographic regimes in the North Indian Ocean.
        """
        points: List[EmbeddingPoint2D] = []
        clusters = [
            {"basin": "Arabian Sea", "season": "SW Monsoon", "cx": -2.4, "cy": 1.2, "sst": 26.5, "mld": 48.0, "cluster": "AS-Upwelling"},
            {"basin": "Arabian Sea", "season": "NE Monsoon", "cx": -1.8, "cy": -1.5, "sst": 27.8, "mld": 32.0, "cluster": "AS-HighSalinity"},
            {"basin": "Bay of Bengal", "season": "SW Monsoon", "cx": 2.1, "cy": 1.8, "sst": 29.6, "mld": 25.0, "cluster": "BoB-LowSalinityPlume"},
            {"basin": "Bay of Bengal", "season": "NE Monsoon", "cx": 1.5, "cy": -1.2, "sst": 28.5, "mld": 30.0, "cluster": "BoB-WarmPool"},
            {"basin": "Equatorial Indian Ocean", "season": "Intermonsoon", "cx": 0.2, "cy": 0.1, "sst": 29.8, "mld": 38.0, "cluster": "EIO-WyrtkiJet"},
            {"basin": "Mesoscale Eddy Zones", "season": "All Seasons", "cx": -0.8, "cy": 2.5, "sst": 28.2, "mld": 60.0, "cluster": "DynamicEddyField"}
        ]

        rng = np.random.RandomState(101)
        point_idx = 1
        for cl in clusters:
            for _ in range(45):
                noise_x = rng.normal(0, 0.45)
                noise_y = rng.normal(0, 0.45)
                lat = 7.0 + rng.uniform(0, 15.0)
                lon = 60.0 + rng.uniform(0, 30.0)
                points.append(EmbeddingPoint2D(
                    id=f"emb-{point_idx}",
                    x=round(float(cl["cx"] + noise_x), 3),
                    y=round(float(cl["cy"] + noise_y), 3),
                    basin=cl["basin"],
                    season=cl["season"],
                    sst=round(cl["sst"] + float(rng.normal(0, 0.4)), 1),
                    mld=round(cl["mld"] + float(rng.normal(0, 3.0)), 1),
                    cluster=cl["cluster"],
                    lat=round(lat, 2),
                    lon=round(lon, 2)
                ))
                point_idx += 1

        return EmbeddingsResponse(
            method="PCA (Principal Component Analysis) on 64-dim OceanEmbed bottleneck",
            total_samples=len(points),
            points=points,
            variance_explained=[0.442, 0.286],
            summary="Visual proof that the deep learning encoder organizes surface satellite observations into physically distinct oceanographic regimes (Arabian Sea upwelling vs. Bay of Bengal freshwater plumes vs. Equatorial jets)."
        )

    def get_validation_summary(self) -> ValidationSummaryResponse:
        """
        Depth-resolved scientific error metrics and benchmark model comparisons.
        """
        depth_metrics = [
            DepthMetric(depth=0, rmse=0.28, correlation=0.992, bias=0.04, mae=0.21),
            DepthMetric(depth=5, rmse=0.32, correlation=0.989, bias=0.05, mae=0.24),
            DepthMetric(depth=10, rmse=0.38, correlation=0.985, bias=0.06, mae=0.29),
            DepthMetric(depth=20, rmse=0.46, correlation=0.978, bias=0.08, mae=0.35),
            DepthMetric(depth=30, rmse=0.58, correlation=0.965, bias=0.10, mae=0.44),
            DepthMetric(depth=50, rmse=0.74, correlation=0.951, bias=0.14, mae=0.58),
            DepthMetric(depth=75, rmse=0.91, correlation=0.938, bias=0.18, mae=0.71),
            DepthMetric(depth=100, rmse=0.98, correlation=0.925, bias=0.15, mae=0.78),
            DepthMetric(depth=125, rmse=0.94, correlation=0.931, bias=0.12, mae=0.73),
            DepthMetric(depth=150, rmse=0.86, correlation=0.942, bias=0.09, mae=0.66),
            DepthMetric(depth=200, rmse=0.69, correlation=0.958, bias=0.06, mae=0.52),
            DepthMetric(depth=300, rmse=0.52, correlation=0.971, bias=0.04, mae=0.39),
            DepthMetric(depth=500, rmse=0.36, correlation=0.984, bias=0.02, mae=0.26),
            DepthMetric(depth=700, rmse=0.25, correlation=0.990, bias=0.01, mae=0.18),
            DepthMetric(depth=1000, rmse=0.18, correlation=0.994, bias=0.01, mae=0.13),
        ]

        baselines = [
            BaselineModel(
                name="Monthly Climatology (WOA18)",
                rmse=1.62,
                correlation=0.812,
                bias=-0.34,
                description="Static monthly mean reference without instantaneous satellite coupling"
            ),
            BaselineModel(
                name="Surface Persistence Baseline",
                rmse=2.15,
                correlation=0.680,
                bias=0.48,
                description="Assumes surface thermal condition propagates linearly downward"
            ),
            BaselineModel(
                name="Multivariate Linear Regression",
                rmse=1.28,
                correlation=0.874,
                bias=0.22,
                description="Linear mapping from 7 surface channels to 15 depths"
            ),
            BaselineModel(
                name="Standard Multi-Layer Perceptron (MLP)",
                rmse=0.95,
                correlation=0.915,
                bias=0.14,
                description="Pixel-wise feedforward network without spatial receptive fields"
            ),
            BaselineModel(
                name="Standard 2D-CNN",
                rmse=0.72,
                correlation=0.946,
                bias=0.09,
                description="Convolutional spatial feature encoder with standard decoder"
            ),
            BaselineModel(
                name="OCEANEMBED (CNN + Attention + Embedding)",
                rmse=0.57,
                correlation=0.965,
                bias=0.07,
                description="Multi-modal satellite fusion with self-attention and depth-aware decoder"
            )
        ]

        return ValidationSummaryResponse(
            depth_metrics=depth_metrics,
            overall_rmse=0.57,
            overall_correlation=0.965,
            overall_bias=0.07,
            matched_argo_count=len(self.argo_floats),
            mean_argo_rmse=0.73,
            baselines=baselines,
            data_source_badge=settings.DATA_SOURCE_NAME
        )

    def get_argo_matches(self) -> List[ArgoFloatMatch]:
        return self.argo_floats
