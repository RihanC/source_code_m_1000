"""
Abstract Base Class for Data Providers in OCEANEMBED.
Allows seamless swapping between DemoDataProvider and RealDataProvider (NetCDF/Copernicus/ARGO).
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.models import (
    GridFieldResponse,
    ReconstructResponse,
    EmbeddingsResponse,
    ValidationSummaryResponse,
    ArgoFloatMatch,
    SurfacePoint
)

class DataProvider(ABC):
    """
    Abstract interface for oceanographic data ingestion and retrieval.
    """

    @abstractmethod
    def get_surface_point(self, lat: float, lon: float, date: str) -> SurfacePoint:
        """Retrieve multi-variable surface conditions at a specific coordinate."""
        pass

    @abstractmethod
    def get_surface_grid(self, variable: str, date: str) -> GridFieldResponse:
        """Retrieve 2D spatial raster grid for a surface variable."""
        pass

    @abstractmethod
    def get_depth_grid(self, depth: int, date: str) -> GridFieldResponse:
        """Retrieve 2D spatial raster grid for temperature at a specific depth."""
        pass

    @abstractmethod
    def reconstruct_profile(self, lat: float, lon: float, date: str) -> ReconstructResponse:
        """Reconstruct the 15-depth vertical temperature profile at coordinate."""
        pass

    @abstractmethod
    def get_latent_embeddings(self) -> EmbeddingsResponse:
        """Retrieve 2D projection of ocean state embeddings for visualization."""
        pass

    @abstractmethod
    def get_validation_summary(self) -> ValidationSummaryResponse:
        """Retrieve comprehensive validation metrics against GLORYS and ARGO."""
        pass

    @abstractmethod
    def get_argo_matches(self) -> List[ArgoFloatMatch]:
        """Retrieve independent ARGO float profiles in the basin."""
        pass
