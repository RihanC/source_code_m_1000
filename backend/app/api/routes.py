"""
FastAPI Routes for OCEANEMBED
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.core.config import settings
from app.schemas.models import (
    MetadataResponse,
    GridFieldResponse,
    ReconstructRequest,
    ReconstructResponse,
    EmbeddingsResponse,
    ValidationSummaryResponse,
    ArgoFloatMatch,
    SurfacePoint
)
from app.data.demo_provider import DemoDataProvider

router = APIRouter()

# Data provider instance (configured for demo mode; can be swapped with RealDataProvider)
data_provider = DemoDataProvider()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "mode": "DEMO_MODE" if settings.IS_DEMO_MODE else "REAL_MODE",
        "version": settings.VERSION
    }

@router.get("/metadata", response_model=MetadataResponse)
def get_metadata():
    return MetadataResponse(
        project_name=settings.PROJECT_NAME,
        project_title=settings.PROJECT_TITLE,
        version=settings.VERSION,
        is_demo_mode=settings.IS_DEMO_MODE,
        data_source_badge=settings.DATA_SOURCE_NAME,
        bbox={
            "lat_min": settings.LAT_MIN,
            "lat_max": settings.LAT_MAX,
            "lon_min": settings.LON_MIN,
            "lon_max": settings.LON_MAX
        },
        depth_levels=settings.DEPTH_LEVELS,
        surface_variables=settings.SURFACE_VARIABLES,
        available_dates=["2026-05-15", "2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19"]
    )

@router.get("/surface-point", response_model=SurfacePoint)
def get_surface_point(
    lat: float = Query(..., ge=settings.LAT_MIN, le=settings.LAT_MAX),
    lon: float = Query(..., ge=settings.LON_MIN, le=settings.LON_MAX),
    date: str = Query(default=settings.DEFAULT_DATE)
):
    return data_provider.get_surface_point(lat, lon, date)

@router.get("/surface-grid", response_model=GridFieldResponse)
def get_surface_grid(
    variable: str = Query(default="SST"),
    date: str = Query(default=settings.DEFAULT_DATE)
):
    if variable not in settings.SURFACE_VARIABLES:
        raise HTTPException(
            status_code=400,
            detail=f"Variable '{variable}' not found. Choose from {settings.SURFACE_VARIABLES}"
        )
    return data_provider.get_surface_grid(variable, date)

@router.get("/depth-grid", response_model=GridFieldResponse)
def get_depth_grid(
    depth: int = Query(default=100),
    date: str = Query(default=settings.DEFAULT_DATE)
):
    if depth not in settings.DEPTH_LEVELS:
        raise HTTPException(
            status_code=400,
            detail=f"Depth {depth}m not in standard depths: {settings.DEPTH_LEVELS}"
        )
    return data_provider.get_depth_grid(depth, date)

@router.post("/reconstruct", response_model=ReconstructResponse)
def reconstruct_subsurface(payload: ReconstructRequest):
    if payload.lat < settings.LAT_MIN or payload.lat > settings.LAT_MAX:
        raise HTTPException(status_code=400, detail=f"Latitude must be between {settings.LAT_MIN} and {settings.LAT_MAX}")
    if payload.lon < settings.LON_MIN or payload.lon > settings.LON_MAX:
        raise HTTPException(status_code=400, detail=f"Longitude must be between {settings.LON_MIN} and {settings.LON_MAX}")
    
    return data_provider.reconstruct_profile(payload.lat, payload.lon, payload.date)

@router.get("/embeddings", response_model=EmbeddingsResponse)
def get_embeddings():
    return data_provider.get_latent_embeddings()

@router.get("/validation/summary", response_model=ValidationSummaryResponse)
def get_validation_summary():
    return data_provider.get_validation_summary()

@router.get("/argo/matches", response_model=list[ArgoFloatMatch])
def get_argo_matches():
    return data_provider.get_argo_matches()
