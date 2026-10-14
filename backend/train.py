"""
GlucoTwin AI - Model Training & Evaluation Pipeline
"""

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from model import GlucoTwinNetwork

def train_pipeline(epochs=25, batch_size=32, lr=0.002):
    # Load dataset
    data = np.load("synthetic_digital_twin_data.npz")
    ehr = torch.tensor(data['ehr'], dtype=torch.float32)
    sensor = torch.tensor(data['sensor'], dtype=torch.float32)
    y_curve = torch.tensor(data['y_future'], dtype=torch.float32)
    y_alert = torch.tensor(data['y_alert'], dtype=torch.long)
    
    # Train / Test split (80/20)
    n_train = int(0.8 * len(ehr))
    dataset_train = TensorDataset(ehr[:n_train], sensor[:n_train], y_curve[:n_train], y_alert[:n_train])
    dataset_val = TensorDataset(ehr[n_train:], sensor[n_train:], y_curve[n_train:], y_alert[n_train:])
    
    loader_train = DataLoader(dataset_train, batch_size=batch_size, shuffle=True)
    loader_val = DataLoader(dataset_val, batch_size=batch_size)
    
    model = GlucoTwinNetwork()
    reg_criterion = nn.MSELoss()
    clf_criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    
    print("🚀 Training GlucoTwin Multimodal Network...")
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        
        for b_ehr, b_sensor, b_curve, b_alert in loader_train:
            optimizer.zero_grad()
            pred_curve, pred_alert = model(b_ehr, b_sensor)
            
            # Joint multi-task loss
            loss_reg = reg_criterion(pred_curve, b_curve)
            loss_clf = clf_criterion(pred_alert, b_alert)
            loss = loss_reg + 15.0 * loss_clf
            
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        if epoch % 5 == 0 or epoch == epochs:
            # Validation
            model.eval()
            val_mse = 0.0
            correct = 0
            total = 0
            with torch.no_grad():
                for b_ehr, b_sensor, b_curve, b_alert in loader_val:
                    p_curve, p_alert = model(b_ehr, b_sensor)
                    val_mse += reg_criterion(p_curve, b_curve).item() * len(b_ehr)
                    preds = torch.argmax(p_alert, dim=1)
                    correct += (preds == b_alert).sum().item()
                    total += len(b_ehr)
                    
            val_rmse = np.sqrt(val_mse / total)
            val_acc = (correct / total) * 100.0
            print(f"Epoch [{epoch}/{epochs}] - Loss: {total_loss/len(loader_train):.3f} | Val RMSE: {val_rmse:.2f} mg/dL | Alert Acc: {val_acc:.1f}%")
            
    torch.save(model.state_dict(), "glucotwin_weights.pth")
    print("✅ Weights saved to 'glucotwin_weights.pth'")

if __name__ == "__main__":
    train_pipeline()