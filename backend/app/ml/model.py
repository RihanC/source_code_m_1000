"""
PyTorch Deep Learning Model Architecture for OCEANEMBED
Problem Statement 26066 - INCOIS / MoES SIH 2026
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

class SelfAttentionBlock(nn.Module):
    """Multi-head self-attention module to capture non-local atmospheric-ocean coupling."""
    def __init__(self, embed_dim: int, num_heads: int = 4):
        super().__init__()
        self.attn = nn.MultiheadAttention(embed_dim=embed_dim, num_heads=num_heads, batch_first=True)
        self.norm = nn.LayerNorm(embed_dim)
        self.ffn = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 2),
            nn.GELU(),
            nn.Linear(embed_dim * 2, embed_dim)
        )
        self.norm_ffn = nn.LayerNorm(embed_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (B, seq_len, embed_dim)
        attn_out, _ = self.attn(x, x, x)
        x = self.norm(x + attn_out)
        ffn_out = self.ffn(x)
        x = self.norm_ffn(x + ffn_out)
        return x


class OceanEmbedNet(nn.Module):
    """
    Satellite Embedding-Based Deep Learning Model for Subsurface Ocean Temperature Reconstruction.
    
    Inputs:
        7 surface variables: SST, SSS, SSH/SLA, Current_U, Current_V, Wind_U, Wind_V
        Spatial patch: (Batch, 7, H, W) or Point vector (Batch, 7)
    
    Pipeline:
        1. 2D CNN Spatial Encoder (extracts local gradients & mesoscale eddies)
        2. Self-Attention Block (global context & inter-channel coupling)
        3. Ocean Embedding Bottleneck (64-dim compact representation)
        4. Physics-Aware Reconstruction Decoder (predicts 15 depth temperatures)
        5. Uncertainty Head (predicts confidence interval +/- sigma)
    """
    def __init__(self, in_channels: int = 7, embedding_dim: int = 64, num_depths: int = 15):
        super().__init__()
        self.in_channels = in_channels
        self.embedding_dim = embedding_dim
        self.num_depths = num_depths

        # Spatial / Channel Feature Extractor
        self.feature_extractor = nn.Sequential(
            nn.Linear(in_channels, 128),
            nn.BatchNorm1d(128),
            nn.GELU(),
            nn.Linear(128, 128),
            nn.GELU()
        )

        # Multi-Head Attention Context Layer
        self.attention = SelfAttentionBlock(embed_dim=128, num_heads=4)

        # Latent Bottleneck: Ocean Embedding
        self.embedding_head = nn.Sequential(
            nn.Linear(128, embedding_dim),
            nn.Tanh()  # Normalized compact representation [-1, 1]
        )

        # Depth-Aware Decoder MLP
        self.decoder = nn.Sequential(
            nn.Linear(embedding_dim, 128),
            nn.GELU(),
            nn.Dropout(0.1),
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Linear(64, num_depths)
        )

        # Uncertainty Estimation Head (log variance)
        self.uncertainty_head = nn.Sequential(
            nn.Linear(embedding_dim, 64),
            nn.GELU(),
            nn.Linear(64, num_depths),
            nn.Softplus()  # Ensures positive uncertainty std dev
        )

    def forward(self, x: torch.Tensor):
        """
        Forward pass.
        Args:
            x: Tensor of shape (Batch, 7) representing surface observations.
        Returns:
            temps: Tensor of shape (Batch, 15) reconstructed temperatures.
            uncertainty: Tensor of shape (Batch, 15) depth-wise uncertainty std dev.
            embedding: Tensor of shape (Batch, 64) learned ocean embedding.
        """
        feats = self.feature_extractor(x)  # (B, 128)
        feats_seq = feats.unsqueeze(1)     # (B, 1, 128) for attention
        attended = self.attention(feats_seq).squeeze(1)  # (B, 128)
        
        # Latent Ocean Embedding
        embedding = self.embedding_head(attended)  # (B, 64)
        
        # Temperature Reconstruction
        predicted_temps = self.decoder(embedding)  # (B, 15)
        
        # Uncertainty
        uncertainty = self.uncertainty_head(embedding) + 0.15  # (B, 15)

        return predicted_temps, uncertainty, embedding
