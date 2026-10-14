"""
GlucoTwin AI - Dual-Branch Multimodal Fusion Network
Fuses static clinical EHR embeddings with dynamic wearable time-series telemetry.
"""

import torch
import torch.nn as nn

class GlucoTwinNetwork(nn.Module):
    def __init__(self, ehr_dim=5, sensor_features=3, hidden_dim=64, pred_horizon=8):
        super(GlucoTwinNetwork, self).__init__()
        
        # Branch 1: Static EHR Dense Encoder
        self.ehr_branch = nn.Sequential(
            nn.Linear(ehr_dim, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 32),
            nn.ReLU()
        )
        
        # Branch 2: Dynamic Wearable GRU Encoder
        self.sensor_gru = nn.GRU(
            input_size=sensor_features,
            hidden_size=hidden_dim,
            num_layers=2,
            batch_first=True,
            bidirectional=False,
            dropout=0.2
        )
        
        # Multimodal Fusion Head
        fusion_dim = 32 + hidden_dim
        self.fusion_layer = nn.Sequential(
            nn.Linear(fusion_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Head 1: Continuous 2-Hour Trajectory Regressor (8 time steps)
        self.trajectory_head = nn.Linear(64, pred_horizon)
        
        # Head 2: Adverse Clinical Event Classifier (0: Target, 1: Hyper, 2: Hypo)
        self.alert_head = nn.Linear(64, 3)
        
    def forward(self, ehr_input, sensor_input):
        # ehr_input: (Batch, 5)
        # sensor_input: (Batch, Seq_Len, 3)
        
        ehr_features = self.ehr_branch(ehr_input)
        gru_out, _ = self.sensor_gru(sensor_input)
        temporal_features = gru_out[:, -1, :]  # Take final hidden state
        
        # Concatenate static + dynamic streams
        fused = torch.cat([ehr_features, temporal_features], dim=1)
        fused_rep = self.fusion_layer(fused)
        
        predicted_curve = self.trajectory_head(fused_rep)
        alert_logits = self.alert_head(fused_rep)
        
        return predicted_curve, alert_logits