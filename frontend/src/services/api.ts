import type {
  Metadata,
  SurfacePoint,
  GridField,
  ReconstructResponse,
  EmbeddingsResponse,
  ValidationSummary,
  ArgoFloatMatch
} from '../types/ocean';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchMetadata(): Promise<Metadata> {
  const res = await fetch(`${API_BASE_URL}/metadata`);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export async function fetchSurfacePoint(lat: number, lon: number, date: string): Promise<SurfacePoint> {
  const res = await fetch(`${API_BASE_URL}/surface-point?lat=${lat}&lon=${lon}&date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch surface point');
  return res.json();
}

export async function fetchSurfaceGrid(variable: string, date: string): Promise<GridField> {
  const res = await fetch(`${API_BASE_URL}/surface-grid?variable=${variable}&date=${date}`);
  if (!res.ok) throw new Error(`Failed to fetch surface grid for ${variable}`);
  return res.json();
}

export async function fetchDepthGrid(depth: number, date: string): Promise<GridField> {
  const res = await fetch(`${API_BASE_URL}/depth-grid?depth=${depth}&date=${date}`);
  if (!res.ok) throw new Error(`Failed to fetch depth grid for ${depth}m`);
  return res.json();
}

export async function reconstructSubsurface(lat: number, lon: number, date: string): Promise<ReconstructResponse> {
  const res = await fetch(`${API_BASE_URL}/reconstruct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon, date })
  });
  if (!res.ok) throw new Error('Failed to run reconstruction');
  return res.json();
}

export async function fetchEmbeddings(): Promise<EmbeddingsResponse> {
  const res = await fetch(`${API_BASE_URL}/embeddings`);
  if (!res.ok) throw new Error('Failed to fetch ocean embeddings');
  return res.json();
}

export async function fetchValidationSummary(): Promise<ValidationSummary> {
  const res = await fetch(`${API_BASE_URL}/validation/summary`);
  if (!res.ok) throw new Error('Failed to fetch validation summary');
  return res.json();
}

export async function fetchArgoMatches(): Promise<ArgoFloatMatch[]> {
  const res = await fetch(`${API_BASE_URL}/argo/matches`);
  if (!res.ok) throw new Error('Failed to fetch ARGO matches');
  return res.json();
}
