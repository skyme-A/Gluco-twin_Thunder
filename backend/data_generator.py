"""
GlucoTwin AI - Synthetic Data Generator
Generates paired static EHR records and dynamic CGM/Wearable time-series streams
based on physiological postprandial glucose-insulin kinetics.
"""

import numpy as np
import pandas as pd

def generate_digital_twin_dataset(n_patients=500, seq_len=24, pred_horizon=8, random_state=42):
    """
    Args:
        n_patients: Number of simulated patient sessions
        seq_len: Past historical steps (24 steps * 5 mins = 2 hours)
        pred_horizon: Target forecast steps (8 steps * 15 mins = 2 hours)
    Returns:
        ehr_data: (n_patients, 5) -> [Age, BMI, HbA1c, Duration_Years, Med_Intensity]
        sensor_data: (n_patients, seq_len, 3) -> [CGM (mg/dL), Heart_Rate (bpm), Step_Count]
        y_future: (n_patients, pred_horizon) -> Future glucose curve
        y_alert: (n_patients,) -> 0: Normal, 1: Hyperglycemia (>180), 2: Hypoglycemia (<70)
    """
    np.random.seed(random_state)
    
    # 1. Static EHR Feature Generation
    age = np.random.normal(52, 10, (n_patients, 1)).clip(25, 75)
    bmi = np.random.normal(27.5, 4.5, (n_patients, 1)).clip(18.5, 40.0)
    hba1c = np.random.normal(7.8, 1.4, (n_patients, 1)).clip(5.5, 12.0)
    duration_yrs = np.random.exponential(6.0, (n_patients, 1)).clip(0.5, 25.0)
    # Med Intensity score: 0 (Lifestyle) to 3 (Insulin + Polypharmacy)
    med_intensity = np.random.choice([0, 1, 2, 3], size=(n_patients, 1), p=[0.15, 0.45, 0.30, 0.10])
    
    ehr_data = np.hstack([age, bmi, hba1c, duration_yrs, med_intensity])
    
    # 2. Dynamic Wearable / CGM Time-Series Generation
    sensor_data = np.zeros((n_patients, seq_len, 3))
    y_future = np.zeros((n_patients, pred_horizon))
    y_alert = np.zeros(n_patients, dtype=int)
    
    for i in range(n_patients):
        baseline_glucose = 85 + (hba1c[i, 0] - 5.0) * 16.0
        
        # Simulate baseline with random walk noise
        noise = np.random.normal(0, 3, seq_len + pred_horizon)
        cgm_full = np.zeros(seq_len + pred_horizon)
        cgm_full[0] = baseline_glucose + np.random.normal(0, 10)
        
        # Simulate meal event at step 18 (30 mins before prediction cut-off)
        carb_intake = np.random.choice([0, 35, 65, 90], p=[0.2, 0.3, 0.35, 0.15])
        
        for t in range(1, seq_len + pred_horizon):
            # Absorption kinetics
            meal_effect = 0
            if t > 18:
                elapsed = (t - 18) * 5  # minutes
                meal_effect = (carb_intake * 1.8) * (elapsed / 45.0) * np.exp(1 - elapsed / 45.0)
            
            # Insulin decay / clearance
            clearance = (cgm_full[t-1] - baseline_glucose) * 0.05
            cgm_full[t] = cgm_full[t-1] + meal_effect - clearance + noise[t]
            
        cgm_full = cgm_full.clip(45, 380)
        
        # Sensor channels: [Glucose, Heart Rate, Step Count]
        cgm_history = cgm_full[:seq_len]
        hr_history = 72 + (cgm_history - 100) * 0.12 + np.random.normal(0, 4, seq_len)
        step_history = np.random.poisson(15, seq_len)
        
        sensor_data[i, :, 0] = cgm_history
        sensor_data[i, :, 1] = hr_history.clip(55, 140)
        sensor_data[i, :, 2] = step_history
        
        # Future 2-hour trajectory (subsampled every 15 mins = 8 points)
        future_indices = np.linspace(seq_len, seq_len + pred_horizon - 1, pred_horizon, dtype=int)
        y_future[i, :] = cgm_full[future_indices]
        
        # Alert classification
        max_future = np.max(y_future[i, :])
        min_future = np.min(y_future[i, :])
        if max_future > 180:
            y_alert[i] = 1  # Hyperglycemic risk
        elif min_future < 70:
            y_alert[i] = 2  # Hypoglycemic risk
        else:
            y_alert[i] = 0  # Normal target
            
    # Save as compressed NumPy archive
    np.savez_compressed(
        "synthetic_digital_twin_data.npz",
        ehr=ehr_data,
        sensor=sensor_data,
        y_future=y_future,
        y_alert=y_alert
    )
    print(f"✅ Generated {n_patients} synthetic patient records successfully saved to 'synthetic_digital_twin_data.npz'")

if __name__ == "__main__":
    generate_digital_twin_dataset()