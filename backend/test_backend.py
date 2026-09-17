"""
Self-contained verification test for OCEANEMBED backend and ML engine
"""
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.core.config import settings
from app.data.demo_provider import DemoDataProvider, is_land
from app.ml.model import OceanEmbedNet
from app.ml.inference import model_engine
import torch

def run_tests():
    print("=== Testing OCEANEMBED Backend ===")
    
    # 1. Config tests
    assert len(settings.DEPTH_LEVELS) == 15, "Must have exactly 15 depth levels"
    assert len(settings.SURFACE_VARIABLES) == 7, "Must have exactly 7 surface variables"
    print("✓ Config OK: 15 Depths and 7 Surface Variables verified.")

    # 2. Landmask tests
    assert is_land(20.0, 78.0) is True, "Central India should be land"
    assert is_land(15.0, 65.0) is False, "Arabian Sea should be ocean"
    assert is_land(14.0, 88.0) is False, "Bay of Bengal should be ocean"
    assert is_land(28.0, 50.0) is True, "Arabian Peninsula interior should be land"
    print("✓ Landmask OK: Accurate ocean/land classification.")

    # 3. Data provider test
    provider = DemoDataProvider()
    pt = provider.get_surface_point(15.0, 65.0, "2026-05-15")
    assert pt.is_ocean is True
    assert 20.0 < pt.sst < 33.0
    print(f"✓ Surface Point (Arabian Sea 15°N, 65°E): SST={pt.sst}°C, SSS={pt.sss} PSU, SSH={pt.ssh}m")

    # 4. Reconstruction test
    rec = provider.reconstruct_profile(15.0, 65.0, "2026-05-15")
    assert rec.is_ocean is True
    assert len(rec.profile) == 15
    assert rec.profile[0].depth == 0
    assert rec.profile[-1].depth == 1000
    # Check thermal stratification (surface warmer than deep ocean)
    assert rec.profile[0].predicted_temp > rec.profile[-1].predicted_temp
    print(f"✓ Profile Reconstruction OK: Surface {rec.profile[0].predicted_temp}°C -> 1000m {rec.profile[-1].predicted_temp}°C")
    print(f"✓ Metrics: RMSE={rec.metrics.rmse}°C, Correlation={rec.metrics.correlation}, Bias={rec.metrics.bias}°C")

    # 5. ML PyTorch model test
    model = OceanEmbedNet()
    dummy_input = torch.randn(2, 7)
    temps, uncert, embed = model(dummy_input)
    assert temps.shape == (2, 15), f"Expected shape (2, 15), got {temps.shape}"
    assert uncert.shape == (2, 15)
    assert embed.shape == (2, 64)
    print(f"✓ PyTorch OceanEmbedNet Forward Pass OK: Outputs (2, 15) temps, (2, 64) embeddings")

    # 6. Grid test
    grid = provider.get_surface_grid("SST", "2026-05-15")
    assert len(grid.lats) > 0 and len(grid.lons) > 0
    assert grid.min_val < grid.max_val
    print(f"✓ Surface Grid OK: [{len(grid.lats)}x{len(grid.lons)}] range [{grid.min_val}, {grid.max_val}] {grid.units}")

    print("\n🎉 ALL BACKEND AND ML TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
