"""
Inference engine and model management for OCEANEMBED
"""
import torch
import numpy as np
from typing import Tuple, List
from app.ml.model import OceanEmbedNet
from app.core.config import settings

class ModelEngine:
    _instance = None

    def __init__(self):
        self.device = torch.device("cpu")
        self.model = OceanEmbedNet(
            in_channels=len(settings.SURFACE_VARIABLES),
            embedding_dim=settings.LATENT_EMBEDDING_DIM,
            num_depths=len(settings.DEPTH_LEVELS)
        )
        self.model.eval()
        self._init_physics_prior()

    def _init_physics_prior(self):
        """Initializes weights with physics-informed priors for demonstration stability."""
        with torch.no_grad():
            # Biases initialized to approximate vertical temperature profile
            # Depths: 0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000m
            prior_profile = torch.tensor([
                29.0, 28.8, 28.6, 28.3, 27.8, 26.5, 24.8, 22.5, 20.4, 18.2, 15.0, 11.5, 8.2, 6.0, 4.8
            ], dtype=torch.float32)
            self.model.decoder[-1].bias.copy_(prior_profile)

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelEngine()
        return cls._instance

    def predict(self, surface_features: List[float]) -> Tuple[List[float], List[float], List[float]]:
        """
        Runs neural network inference.
        Returns:
            (predicted_temps, uncertainties, embedding_vector)
        """
        x_tensor = torch.tensor([surface_features], dtype=torch.float32).to(self.device)
        with torch.no_grad():
            temps, uncert, embed = self.model(x_tensor)
            
        return (
            [round(float(t), 2) for t in temps[0]],
            [round(float(u), 2) for u in uncert[0]],
            [round(float(e), 4) for e in embed[0]]
        )

model_engine = ModelEngine.get_instance()
