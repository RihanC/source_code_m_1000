"""
Core configuration for OCEANEMBED
INCOIS / Ministry of Earth Sciences - SIH 2026 Problem Statement 26066
"""
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "OCEANEMBED"
    PROJECT_TITLE: str = "Satellite Embedding-Based Deep Learning Framework for Subsurface Ocean Temperature Reconstruction"
    VERSION: str = "1.0.0-poc"
    IS_DEMO_MODE: bool = True
    DATA_SOURCE_NAME: str = "DEMO MODE — SYNTHETIC PHYSICAL OCEANOGRAPHY"
    
    # Geographic Domain: North Indian Ocean
    LAT_MIN: float = 5.0
    LAT_MAX: float = 30.0
    LON_MIN: float = 45.0
    LON_MAX: float = 105.0
    GRID_STEP: float = 0.5  # 0.5 deg resolution for responsive web visualization
    
    # 15 Standard Depths in meters (as per SIH PS 26066 specification)
    DEPTH_LEVELS: List[int] = [
        0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000
    ]
    
    # 7 Main Surface Input Variables
    SURFACE_VARIABLES: List[str] = [
        "SST",        # Sea Surface Temperature (°C)
        "SSS",        # Sea Surface Salinity (PSU)
        "SSH",        # Sea Surface Height / SLA (m)
        "Current_U",  # Zonal Surface Current (m/s)
        "Current_V",  # Meridional Surface Current (m/s)
        "Wind_U",     # Zonal Surface Wind 10m (m/s)
        "Wind_V"      # Meridional Surface Wind 10m (m/s)
    ]
    
    LATENT_EMBEDDING_DIM: int = 64
    DEFAULT_DATE: str = "2026-05-15"

settings = Settings()
