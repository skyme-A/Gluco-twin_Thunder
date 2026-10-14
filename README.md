# GlucoTwin AI — Proactive Digital Twin for Type 2 Diabetes

[![Live Demo](https://img.shields.io/badge/Vercel-Live_App-black?logo=vercel)](https://gluco-twin-thunder.vercel.app)
[![API Backend](https://img.shields.io/badge/Render-FastAPI_Live-46E3B7?logo=render)](https://gluco-twin-thunder.onrender.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 👥 Team Details
- **Team Name:** Thunder
- **Lead / Member(s):** Aditi Raj[cite: 7]
- **Contact / GitHub:** [@skyme-A](https://github.com/skyme-A)

## 🏫 College / Incubator Information
- **Institution:** Dr. D. Y. Patil Institute of Technology, Pimpri, Pune
- **Affiliation:** Savitribai Phule Pune University (SPPU)
- **Challenge:** Digital Twin Challenge 2026 (Happiest Health Summit)[cite: 8]

## 📌 Project Title
**GlucoTwin AI: Multimodal Physiological Digital Twin for Real-Time Glycemic Trajectory Forecasting and Clinical Decision Support**[cite: 8]

## 🎯 Problem Statement
Patients living with Type 2 Diabetes Mellitus (T2DM) experience postprandial glucose volatility that frequently goes unnoticed until acute hyperglycemic or nocturnal hypoglycemic spikes manifest. Conventional therapeutic management relies on retrospective HbA1c reviews (every 3 months) or static finger-prick checks. There is an urgent clinical need for prospective, personalized digital twins capable of simulating real-time physiological responses to meals, exercise, and insulin titration prior to execution.

## 🩺 Healthcare Use Case
- **Condition:** Type 2 Diabetes Mellitus (T2DM) postprandial metabolic regulation.
- **Target Population:** Outpatients on combination therapy (oral secretagogues/metformin and basal/bolus insulin) and endocrinologists seeking proactive lifestyle titration.
- **Clinical Endpoints:** 2-hour forward glucose trajectory forecasting (15-minute resolution), live Time-in-Range (TIR %) optimization (ADA/RSSDI standard 70–180 mg/dL), Glycemic Variability (CV %) minimization, and instant WhatsApp clinical consultation dispatches[cite: 3].

## 🛠️ Technical Stack
- **Frontend Dashboard:** React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons (Deployed on Vercel)[cite: 2]
- **Backend API & Microservices:** FastAPI, Uvicorn, Pydantic, Python 3.11 (Deployed on Render)
- **Machine Learning & Simulation:** PyTorch, NumPy, Pandas, SciPy (Kinetic Minimal Modeling)
- **Deployment & Hosting:** Vercel (Frontend SPA), Render (RESTful API Inference Engine), GitHub

## 🧠 AI/ML Model & Framework Details
- **Architecture:** Dual-Branch Deep Fusion Neural Network (`GlucoTwinDualBranch`).
  - **Static EHR Branch:** Multilayer Dense Perceptron encoding baseline patient covariates (Age, BMI, HbA1c, Duration of Diabetes, Medication Regimen Intensity).
  - **Dynamic Wearables Branch:** 2-layer Bidirectional/Sequential Gated Recurrent Unit (GRU) processing sequential Continuous Glucose Monitoring (CGM), Wearable Heart Rate (HR), and Step-count telemetry.
  - **Fusion & Kinetics Layer:** Concatenates static and latent dynamic embeddings with Bergman Minimal Model glucose-insulin clearance dynamics.
- **Prediction Outputs:**
  1. Regression vector of 8 future glycemic steps ($t+15\text{m}$ to $t+120\text{m}$) with $95\%$ statistical confidence intervals.
  2. Multi-class risk logits classifying forecasted trajectory into Normal, Hyperglycemic ($>180\text{ mg/dL}$), or Hypoglycemic ($<70\text{ mg/dL}$) states.
  3. Dynamic Explainable AI (XAI) feature attribution quantifying point-shift deltas for carbohydrates, exercise exertion, and insulin units.

## 🎥 15-20 Minute Demo Video
- **YouTube Link (Unlisted):** [https://youtu.be/lcUPb9fvmdg](https://youtu.be/lcUPb9fvmdg)[cite: 8]
*(Walkthrough demonstrating clinical motivation, physiological modeling, PyTorch backend, live Vercel dashboard interactions, meal presets, and clinician WhatsApp dispatch).*[cite: 2, 3]

## 📄 Open-Source License Details
Distributed under the **MIT License**. Full permissions granted for academic and clinical research inspection. See the [LICENSE](LICENSE) file for complete legal text.

## 📐 Architecture Diagram
- Available as a PDF document: [`docs/architecture_diagram.pdf`](docs/architecture_diagram.pdf)[cite: 4]
- Visualizes real-time wearable ingestion, preprocessing, dual-branch PyTorch inference, FastAPI endpoints, and glassmorphic UI state binding.

## 📊 Presentation Deck
- Available as a PDF document: [`docs/presentation_deck.pdf`](docs/presentation_deck.pdf)[cite: 4]
- Comprehensive slide deck covering clinical rationale, mathematical modeling, benchmark outcomes, usability testing, and regulatory alignment.

## 🌐 Public Accessibility Guarantee
All project repositories, deployed endpoints, documentation PDFs, and demonstration videos associated with this submission are publicly accessible without authentication barriers or elevated permissions:
- **GitHub Repository:** [https://github.com/skyme-A/Gluco-twin_Thunder](https://github.com/skyme-A/Gluco-twin_Thunder)[cite: 4]
- **Live Application:** [https://gluco-twin-thunder.vercel.app](https://gluco-twin-thunder.vercel.app)
- **API Documentation:** [https://gluco-twin-thunder.onrender.com/docs](https://gluco-twin-thunder.onrender.com/docs)
