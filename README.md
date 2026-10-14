# GlucoTwin AI — Proactive Digital Twin for Type 2 Diabetes

[![Live Frontend](https://img.shields.io/badge/Vercel-Live_Demo-black?logo=vercel)](https://YOUR-APP-NAME.vercel.app)
[![API Backend](https://img.shields.io/badge/Render-FastAPI_Live-46E3B7?logo=render)](https://gluco-twin-thunder.onrender.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An end-to-end clinical digital twin platform predicting 2-hour postprandial glucose trajectories using multi-modal physiological modeling, dynamic "What-If" intervention sandboxes, and glassmorphic UI analytics. Built for the Digital Twin Challenge 2026.

---

## 🔗 Live Deployments

- **Web Dashboard:** [https://YOUR-APP-NAME.vercel.app](https://YOUR-APP-NAME.vercel.app)
- **FastAPI Documentation:** [https://gluco-twin-thunder.onrender.com/docs](https://gluco-twin-thunder.onrender.com/docs)

---

## ⚡ Key Capabilities

- **Dual-Stream Neural Forecasting:** Integrates static EHR baselines (HbA1c, BMI, duration) with dynamic continuous glucose monitoring (CGM) and wearable telemetry to forecast 2-hour postprandial curves.
- **Interactive "What-If" Interventions:** Real-time simulations modulating carbohydrate load, post-meal activity, and corrective insulin titration.
- **Clinical CGM Biomarkers:** Live evaluation of Time-in-Range (TIR %), Glycemic Variability (CV %), and postprandial peak/nadir dynamics calibrated to ADA/RSSDI targets.
- **Dual Perspective Glassmorphic Interface:** Instant toggle between patient-centric lifestyle guidance and comprehensive clinician telemetry.
- **WhatsApp Dispatch & Clinical Summary:** Instant sharing of projected trajectories with endocrinologists alongside printable consultation slips.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons (Deployed via Vercel)
- **Backend:** FastAPI, PyTorch (Dual-Branch GRU + Dense Fusion), Uvicorn, NumPy, Pandas (Deployed via Render)
- **Physiological Model:** Bergman Minimal Model integration with carbohydrate absorption kinetics and physical exertion clearance

---

## 📁 Repository Structure

```text
├── backend/
│   ├── server.py               # Production FastAPI inference engine & patient cohort
│   ├── model.py                # PyTorch dual-stream architecture
│   ├── train.py                # Neural network training pipeline
│   ├── data_generator.py       # Multi-modal synthetic kinetic simulator
│   └── requirements.txt        # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Clinical dashboard & glassmorphic UI
│   │   ├── index.css           # Tailwind v4 configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture_diagram.pdf
│   └── presentation_deck.pdf
├── LICENSE
└── README.md
