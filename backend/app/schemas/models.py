"""
Data schemas for OCEANEMBED API
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MetadataResponse(BaseModel):
    project_name: str
    project_title: str
    version: str
    is_demo_mode: bool
    data_source_badge: str
    bbox: Dict[str, float]
    depth_levels: List[int]
    surface_variables: List[str]
    available_dates: List[str]

class SurfacePoint(BaseModel):
    lat: float
    lon: float
    is_ocean: bool
    sst: float
    sss: float
    ssh: float
    current_u: float
    current_v: float
    wind_u: float
    wind_v: float

class GridFieldResponse(BaseModel):
    variable: str
    depth: Optional[int] = 0
    date: str
    units: str
    min_val: float
    max_val: float
    mean_val: float
    lats: List[float]
    lons: List[float]
    # 2D array [len(lats)][len(lons)] with None for land
    grid: List[List[Optional[float]]]

class ReconstructRequest(BaseModel):
    lat: float = Field(..., ge=5.0, le=30.0, description="Latitude (5.0 to 30.0 N)")
    lon: float = Field(..., ge=45.0, le=105.0, description="Longitude (45.0 to 105.0 E)")
    date: str = Field(default="2026-05-15")

class ProfileDepthPoint(BaseModel):
    depth: int
    predicted_temp: float
    glorys_temp: float
    argo_temp: Optional[float] = None
    uncertainty: float  # +/- temp in deg C

class ReconstructionMetrics(BaseModel):
    rmse: float
    correlation: float
    bias: float
    confidence_level: str
    uncertainty_mean: float

class ReconstructResponse(BaseModel):
    lat: float
    lon: float
    date: str
    is_ocean: bool
    surface_conditions: Dict[str, float]
    profile: List[ProfileDepthPoint]
    metrics: ReconstructionMetrics
    has_argo_match: bool
    argo_float_id: Optional[str] = None
    argo_distance_km: Optional[float] = None
    embedding_sample: List[float]
    data_source_badge: str

class EmbeddingPoint2D(BaseModel):
    id: str
    x: float
    y: float
    basin: str
    season: str
    sst: float
    mld: float
    cluster: str
    lat: float
    lon: float

class EmbeddingsResponse(BaseModel):
    method: str
    total_samples: int
    points: List[EmbeddingPoint2D]
    variance_explained: List[float]
    summary: str

class DepthMetric(BaseModel):
    depth: int
    rmse: float
    correlation: float
    bias: float
    mae: float

class BaselineModel(BaseModel):
    name: str
    rmse: float
    correlation: float
    bias: float
    description: str

class ValidationSummaryResponse(BaseModel):
    depth_metrics: List[DepthMetric]
    overall_rmse: float
    overall_correlation: float
    overall_bias: float
    matched_argo_count: int
    mean_argo_rmse: float
    baselines: List[BaselineModel]
    data_source_badge: str

class ArgoFloatMatch(BaseModel):
    float_id: str
    wmo_id: str
    lat: float
    lon: float
    date: str
    cycle_number: int
    surface_temp: float
    temp_100m: float
    temp_1000m: float
    rmse_with_model: float
