export interface Metadata {
  project_name: string;
  project_title: string;
  version: string;
  is_demo_mode: boolean;
  data_source_badge: string;
  bbox: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };
  depth_levels: number[];
  surface_variables: string[];
  available_dates: string[];
}

export interface SurfacePoint {
  lat: number;
  lon: number;
  is_ocean: boolean;
  sst: number;
  sss: number;
  ssh: number;
  current_u: number;
  current_v: number;
  wind_u: number;
  wind_v: number;
}

export interface GridField {
  variable: string;
  depth: number;
  date: string;
  units: string;
  min_val: number;
  max_val: number;
  mean_val: number;
  lats: number[];
  lons: number[];
  grid: (number | null)[][];
}

export interface ProfileDepthPoint {
  depth: number;
  predicted_temp: number;
  glorys_temp: number;
  argo_temp: number | null;
  uncertainty: number;
}

export interface ReconstructionMetrics {
  rmse: number;
  correlation: number;
  bias: number;
  confidence_level: string;
  uncertainty_mean: number;
}

export interface ReconstructResponse {
  lat: number;
  lon: number;
  date: string;
  is_ocean: boolean;
  surface_conditions: Record<string, number>;
  profile: ProfileDepthPoint[];
  metrics: ReconstructionMetrics;
  has_argo_match: boolean;
  argo_float_id: string | null;
  argo_distance_km: number | null;
  embedding_sample: number[];
  data_source_badge: string;
}

export interface EmbeddingPoint2D {
  id: string;
  x: number;
  y: number;
  basin: string;
  season: string;
  sst: number;
  mld: number;
  cluster: string;
  lat: number;
  lon: number;
}

export interface EmbeddingsResponse {
  method: string;
  total_samples: number;
  points: EmbeddingPoint2D[];
  variance_explained: number[];
  summary: string;
}

export interface DepthMetric {
  depth: number;
  rmse: number;
  correlation: number;
  bias: number;
  mae: number;
}

export interface BaselineModel {
  name: string;
  rmse: number;
  correlation: number;
  bias: number;
  description: string;
}

export interface ValidationSummary {
  depth_metrics: DepthMetric[];
  overall_rmse: number;
  overall_correlation: number;
  overall_bias: number;
  matched_argo_count: number;
  mean_argo_rmse: number;
  baselines: BaselineModel[];
  data_source_badge: string;
}

export interface ArgoFloatMatch {
  float_id: string;
  wmo_id: string;
  lat: number;
  lon: number;
  date: string;
  cycle_number: number;
  surface_temp: number;
  temp_100m: number;
  temp_1000m: number;
  rmse_with_model: number;
}
