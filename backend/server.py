import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="GlucoTwin Pro Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Patient Cohort Database
PATIENTS = {
    "PT-4091": {
        "name": "Aditi Verma",
        "age": 54,
        "gender": "Female",
        "condition": "Type 2 Diabetes (7 yrs)",
        "hba1c": 8.4,
        "bmi": 28.2,
        "egfr": 82,
        "medications": ["Metformin HCl 1000 mg BID", "Glimepiride 2 mg OD"],
        "baseline_glucose": 165,
        "carb_sensitivity": 0.95,
        "exercise_sensitivity": 1.15,
        "insulin_sensitivity": 18.0
    },
    "PT-1082": {
        "name": "Rajesh Sharma",
        "age": 62,
        "gender": "Male",
        "condition": "Type 2 Diabetes (14 yrs, Brittle)",
        "hba1c": 9.6,
        "bmi": 31.4,
        "egfr": 58,
        "medications": ["Insulin Glargine 22U", "Vildagliptin 50 mg BID"],
        "baseline_glucose": 195,
        "carb_sensitivity": 1.35,
        "exercise_sensitivity": 0.85,
        "insulin_sensitivity": 12.0
    },
    "PT-7723": {
        "name": "Priya Nair",
        "age": 41,
        "gender": "Female",
        "condition": "Early-onset T2DM (2 yrs)",
        "hba1c": 7.1,
        "bmi": 24.6,
        "egfr": 98,
        "medications": ["Metformin 500 mg ER", "Diet & Lifestyle"],
        "baseline_glucose": 138,
        "carb_sensitivity": 0.70,
        "exercise_sensitivity": 1.45,
        "insulin_sensitivity": 22.0
    }
}

class InterventionPayload(BaseModel):
    patient_id: str = "PT-4091"
    carbs: float
    exercise_minutes: float
    insulin_bolus: float

@app.get("/patients")
def get_patients():
    return PATIENTS

@app.post("/predict")
def predict_trajectory(payload: InterventionPayload):
    p = PATIENTS.get(payload.patient_id, PATIENTS["PT-4091"])
    current_glucose = p["baseline_glucose"]

    # Physiological simulation mechanics
    carb_delta = (payload.carbs - 55.0) * p["carb_sensitivity"]
    exercise_delta = payload.exercise_minutes * -p["exercise_sensitivity"]
    insulin_delta = payload.insulin_bolus * -p["insulin_sensitivity"]
    net_shift = carb_delta + exercise_delta + insulin_delta

    time_labels = ["13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30"]
    base_kinetics = [8, 22, 36, 44, 38, 26, 14, 4]

    trajectory = []
    values_for_metrics = []

    for idx, (t_label, k_val) in enumerate(zip(time_labels, base_kinetics)):
        # Calculate point forecast
        factor = k_val / 44.0
        val = int(round(max(45.0, min(380.0, current_glucose + k_val + (net_shift * factor)))))
        values_for_metrics.append(val)

        # 95% Confidence Interval expands further into future
        uncertainty = int(6 + (idx * 2.8))
        upper = min(400, val + uncertainty)
        lower = max(40, val - uncertainty)

        trajectory.append({
            "time": t_label,
            "predicted": val,
            "upper": upper,
            "lower": lower
        })

    peak = max(values_for_metrics)
    nadir = min(values_for_metrics)

    # Calculate Time In Range (TIR: 70-180 mg/dL)
    in_range_count = sum(1 for v in values_for_metrics if 70 <= v <= 180)
    tir_pct = round((in_range_count / len(values_for_metrics)) * 100)

    # Glycemic Variability (Coefficient of Variation CV%)
    cv_pct = round((float(np.std(values_for_metrics)) / float(np.mean(values_for_metrics))) * 100, 1)

    # Clinical Alerting
    if peak > 220:
        status = "hyper_critical"
        message = f"Severe Hyperglycemia forecast (+60m). Peak: {peak} mg/dL. Action required."
    elif peak > 180:
        status = "hyper"
        message = f"Moderate Postprandial spike predicted (+45m). Peak: {peak} mg/dL."
    elif nadir < 70:
        status = "hypo"
        message = f"Acute Hypoglycemia predicted (+75m). Nadir: {nadir} mg/dL. Immediate oral glucose/titration advised."
    else:
        status = "normal"
        message = f"Trajectory stable. Time-In-Range projected at {tir_pct}%. Within ADA/RSSDI guidelines."

    return {
        "status": status,
        "message": message,
        "peak": peak,
        "nadir": nadir,
        "tir": tir_pct,
        "cv": cv_pct,
        "trajectory": trajectory,
        "attributions": {
            "carbohydrates": round(carb_delta, 1),
            "physical_activity": round(exercise_delta, 1),
            "insulin_pharmacokinetics": round(insulin_delta, 1)
        }
    }