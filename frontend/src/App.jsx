import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  User,
  ShieldAlert,
  Clock,
  Pill,
  TrendingUp,
  Utensils,
  Footprints,
  Sparkles,
  Stethoscope,
  Smile,
  Zap,
  Info,
  Share2,
  Send,
  Printer,
  Palette,
  Droplets,
  Flame,
  CheckCircle
} from 'lucide-react';

const MEAL_PRESETS = [
  { name: '2 Rotis + Dal + Sabzi', carbs: 45, label: 'Standard Indian Meal', icon: '🫓' },
  { name: 'Masala Dosa + Sambar', carbs: 72, label: 'High Glycemic Load', icon: '🥞' },
  { name: 'Paneer Tikka + Salad', carbs: 24, label: 'Low-Carb Protein Rich', icon: '🥗' },
  { name: 'Biryani Bowl + Raita', carbs: 88, label: 'Elevated Postprandial Risk', icon: '🍚' }
];

const HISTORICAL_STREAM = [
  { time: '08:00', actual: 96, label: 'Fasting' },
  { time: '09:00', actual: 134, label: 'Post-Breakfast' },
  { time: '10:00', actual: 148, label: null },
  { time: '11:00', actual: 122, label: null },
  { time: '12:00', actual: 108, label: 'Pre-Lunch' },
  { time: '13:00', actual: 142, label: 'Lunch Intake' },
  { time: '13:30', actual: 164, label: 'Current Telemetry' }
];

export default function App() {
  // Perspective Mode
  const [viewMode, setViewMode] = useState('patient'); // 'patient' or 'clinician'

  // Theme Palettes: 'warm' (Sunset Peach / Terracotta), 'sage' (Mint/Earthy), 'berry' (Rose/Violet)
  const [palette, setPalette] = useState('warm');

  // "What-If" Interventions
  const [carbs, setCarbs] = useState(65);
  const [exerciseMinutes, setExerciseMinutes] = useState(20);
  const [insulinBolus, setInsulinBolus] = useState(0);
  const [activeMealPreset, setActiveMealPreset] = useState(-1);
  const [showShareModal, setShowShareModal] = useState(false);

  // Model Forecast Telemetry
  const [forecastState, setForecastState] = useState({
    status: 'normal',
    message: 'Digital Twin is calibrated to patient physiological baseline.',
    peak: 164,
    nadir: 164,
    tir: 88,
    cv: 16.4,
    trajectory: []
  });

  // Query Backend with Graceful Simulation Fallback
  useEffect(() => {
    let isMounted = true;
    async function fetchForecast() {
      try {
        const res = await fetch('https://gluco-twin-thunder.onrender.com/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: 'PT-4091',
            carbs: Number(carbs),
            exercise_minutes: Number(exerciseMinutes),
            insulin_bolus: Number(insulinBolus)
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setForecastState(data);
          return;
        }
      } catch (err) {
        // Fallback kinetic model
        const currentG = 164;
        const net = (carbs - 55) * 0.95 - exerciseMinutes * 1.15 - insulinBolus * 17.5;
        const times = ['13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30'];
        const deltas = [7, 19, 34, 42, 36, 24, 12, 3];

        const traj = times.map((t, idx) => {
          const val = Math.round(Math.max(48, Math.min(340, currentG + deltas[idx] + net * (deltas[idx] / 42))));
          return { time: t, predicted: val, upper: val + 12, lower: Math.max(45, val - 12) };
        });

        const p = Math.max(...traj.map(t => t.predicted));
        const n = Math.min(...traj.map(t => t.predicted));
        const inRange = traj.filter(t => t.predicted >= 70 && t.predicted <= 180).length;
        const tir = Math.round((inRange / traj.length) * 100);

        if (isMounted) {
          setForecastState({
            status: p > 180 ? 'hyper' : n < 70 ? 'hypo' : 'normal',
            message: p > 180
              ? 'Postprandial glycemic surge predicted above 180 mg/dL threshold.'
              : n < 70
                ? 'Nocturnal hypoglycemic vulnerability detected below 70 mg/dL.'
                : 'Target therapeutic equilibrium maintained (70–180 mg/dL).',
            peak: p,
            nadir: n,
            tir: tir,
            cv: 15.8,
            trajectory: traj
          });
        }
      }
    }
    fetchForecast();
    return () => { isMounted = false; };
  }, [carbs, exerciseMinutes, insulinBolus]);

  // Combine Recorded History with Twin Trajectory
  const combinedChartData = useMemo(() => {
    const data = HISTORICAL_STREAM.map(item => ({ ...item, predicted: null }));
    data[data.length - 1].predicted = 164; // Bridge point

    if (forecastState.trajectory && forecastState.trajectory.length > 0) {
      forecastState.trajectory.forEach(pt => {
        data.push({
          time: pt.time,
          actual: null,
          predicted: pt.predicted,
          upper: pt.upper,
          lower: pt.lower
        });
      });
    }
    return data;
  }, [forecastState]);

  // WhatsApp Dispatch Generator
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `🩺 *GlucoTwin AI - Patient Digital Twin Report*\n` +
      `-----------------------------------------\n` +
      `👤 *Patient:* Aditi Verma (54y, T2DM)\n` +
      `⏱️ *Time:* 13:30 Telemetry Sync\n` +
      `🩸 *Current CGM:* 164 mg/dL (+1.8 mg/dL/min)\n` +
      `📈 *Forecast 2h Peak:* ${forecastState.peak} mg/dL\n` +
      `🎯 *Projected Time In Range (TIR):* ${forecastState.tir}%\n` +
      `🥗 *Simulated Meal:* ${carbs}g Carbs\n` +
      `🚶 *Post-Meal Walk:* ${exerciseMinutes} mins\n` +
      `💉 *Bolus:* ${insulinBolus} Units\n\n` +
      `⚠️ *Twin Clinical Alert:* ${forecastState.message}\n` +
      `-----------------------------------------\n` +
      `Generated by GlucoTwin AI Platform • Happiest Health Summit 2026`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Dynamic Theme Styling Classes
  const themeClasses = useMemo(() => {
    if (palette === 'warm') {
      return {
        bg: 'from-amber-100/60 via-orange-50/50 to-rose-100/50 text-stone-900',
        ambient1: 'bg-amber-300/40',
        ambient2: 'bg-rose-300/35',
        card: 'bg-white/85 border-amber-200/80 shadow-orange-950/5',
        headerIcon: 'from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/25',
        accentBadge: 'bg-orange-100 text-orange-900 border-orange-300',
        primaryBtn: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/20 hover:from-orange-600 hover:to-amber-700',
        chartActual: '#d97706',
        chartPredict: '#e11d48',
        sliderCarb: 'accent-amber-600',
        sliderWalk: 'accent-emerald-600',
        sliderInsulin: 'accent-rose-600'
      };
    } else if (palette === 'sage') {
      return {
        bg: 'from-emerald-100/60 via-teal-50/40 to-slate-100 text-slate-900',
        ambient1: 'bg-emerald-300/40',
        ambient2: 'bg-teal-300/35',
        card: 'bg-white/85 border-emerald-200/80 shadow-emerald-950/5',
        headerIcon: 'from-emerald-500 via-teal-600 to-cyan-600 shadow-emerald-500/25',
        accentBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        primaryBtn: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800',
        chartActual: '#059669',
        chartPredict: '#0284c7',
        sliderCarb: 'accent-teal-600',
        sliderWalk: 'accent-emerald-600',
        sliderInsulin: 'accent-indigo-600'
      };
    } else {
      return {
        bg: 'from-sky-100/70 via-blue-50/40 to-indigo-100/50 text-slate-900',
        ambient1: 'bg-sky-300/40',
        ambient2: 'bg-indigo-300/35',
        card: 'bg-white/85 border-sky-200/80 shadow-sky-950/5',
        headerIcon: 'from-sky-500 via-blue-600 to-indigo-600 shadow-blue-500/25',
        accentBadge: 'bg-sky-100 text-sky-900 border-sky-300',
        primaryBtn: 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-sky-600/20 hover:from-sky-700 hover:to-blue-800',
        chartActual: '#0284c7',
        chartPredict: '#7c3aed',
        sliderCarb: 'accent-sky-600',
        sliderWalk: 'accent-emerald-600',
        sliderInsulin: 'accent-indigo-600'
      };
    }
  }, [palette]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeClasses.bg} font-sans selection:bg-orange-200`}>
      {/* Ambient Radial Color Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-24 -left-24 w-[34rem] h-[34rem] ${themeClasses.ambient1} rounded-full blur-3xl`} />
        <div className={`absolute top-1/3 -right-24 w-[36rem] h-[36rem] ${themeClasses.ambient2} rounded-full blur-3xl`} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Apple-style Glassmorphism Header */}
        <header className="sticky top-0 z-40 px-6 py-3.5 backdrop-blur-2xl bg-white/75 border-b border-white/80 shadow-xs flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${themeClasses.headerIcon} flex items-center justify-center text-white shadow-lg border border-white/90`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  GlucoTwin AI
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${themeClasses.accentBadge}`}>
                  Proactive Digital Twin
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Happiest Health Summit 2026 • Patient-Centric Predictive Health
              </p>
            </div>
          </div>

          {/* Palette Selector, Mode Toggle & Actions */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Theme Selector */}
            <div className="flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-2xl border border-stone-200 shadow-2xs text-xs">
              <Palette className="w-3.5 h-3.5 text-stone-500 ml-1" />
              <button
                onClick={() => setPalette('warm')}
                className={`px-2 py-1 rounded-xl font-semibold transition ${palette === 'warm' ? 'bg-amber-100 text-amber-900' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Sunset Warm
              </button>
              <button
                onClick={() => setPalette('sage')}
                className={`px-2 py-1 rounded-xl font-semibold transition ${palette === 'sage' ? 'bg-emerald-100 text-emerald-900' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Sage Mint
              </button>
              <button
                onClick={() => setPalette('ocean')}
                className={`px-2 py-1 rounded-xl font-semibold transition ${palette === 'ocean' ? 'bg-sky-100 text-sky-900' : 'text-stone-600 hover:text-stone-900'}`}
              >
                Ocean Blue
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="p-1 rounded-2xl bg-stone-200/70 backdrop-blur-md border border-white flex items-center text-xs shadow-inner">
              <button
                onClick={() => setViewMode('patient')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${viewMode === 'patient'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                Patient
              </button>
              <button
                onClick={() => setViewMode('clinician')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${viewMode === 'clinician'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-orange-600" />
                Clinician
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => { setCarbs(65); setExerciseMinutes(20); setInsulinBolus(0); setActiveMealPreset(-1); }}
              className="flex items-center gap-1.5 text-xs bg-white/90 hover:bg-white text-stone-700 px-3 py-2 rounded-xl border border-stone-200 shadow-2xs transition font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
              Reset
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Patient Profile & Static Records (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-lg space-y-4 ${themeClasses.card}`}>
              <div className="flex items-center gap-3.5 pb-2 border-b border-stone-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-300 border border-white flex items-center justify-center text-white shadow-md">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-sm">Aditi Verma</h2>
                  <p className="text-xs text-stone-500 font-medium">54 yrs • Female • T2DM (7 yrs)</p>
                </div>
              </div>

              {/* Dynamic Key Metric Pills */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <span className="text-stone-500 block text-[11px] font-semibold">Baseline HbA1c</span>
                  <span className="text-lg font-black text-amber-900">8.4%</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-200">
                  <span className="text-stone-500 block text-[11px] font-semibold">Body Mass Index</span>
                  <span className="text-lg font-black text-orange-950">28.2</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <span className="text-stone-500 block text-[11px] font-semibold">eGFR Renal</span>
                  <span className="text-lg font-black text-emerald-900">82 mL/m</span>
                </div>
                <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200">
                  <span className="text-stone-500 block text-[11px] font-semibold">Target Zone</span>
                  <span className="text-lg font-black text-sky-950">70–180</span>
                </div>
              </div>

              {/* Medication Card */}
              <div className="pt-2 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-orange-600" /> Prescribed Daily Regimen
                </span>
                <div className="p-3 rounded-2xl bg-stone-50/90 border border-stone-200 text-stone-800 text-xs space-y-1 font-medium">
                  <p>• Metformin HCl — 1000 mg BID (Post-meal)</p>
                  <p>• Glimepiride — 2 mg OD (Morning)</p>
                </div>
              </div>
            </div>

            {/* Dynamic Sensor Streams Card */}
            <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-lg space-y-3 ${themeClasses.card}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Dynamic Telemetry
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Sensor
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">Current Glucose</span>
                    <span className="text-lg font-black text-stone-900">164 mg/dL</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg">
                  +1.8 mg/dL/m
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 to-orange-500/10 border border-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">Heart Rate</span>
                    <span className="text-lg font-black text-stone-900">76 bpm</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-lg">
                  Resting Stable
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Horizon Chart, Metrics & Alerts (6 cols) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col">
            {/* Dynamic Status / Alert Banner */}
            <div
              className={`backdrop-blur-xl border-2 rounded-3xl p-4.5 shadow-md transition-all flex items-start gap-3.5 ${forecastState.status === 'hyper'
                ? 'bg-amber-100/95 border-amber-400 text-amber-950'
                : forecastState.status === 'hypo'
                  ? 'bg-rose-100/95 border-rose-400 text-rose-950'
                  : 'bg-emerald-100/95 border-emerald-400 text-emerald-950'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${forecastState.status === 'hyper'
                  ? 'bg-amber-500 text-white'
                  : forecastState.status === 'hypo'
                    ? 'bg-rose-500 text-white'
                    : 'bg-emerald-600 text-white'
                  }`}
              >
                {forecastState.status === 'hyper' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : forecastState.status === 'hypo' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-extrabold flex items-center justify-between">
                  <span>
                    {viewMode === 'patient'
                      ? forecastState.status === 'hyper'
                        ? 'Gentle Glucose Elevation Anticipated'
                        : forecastState.status === 'hypo'
                          ? 'Low Glucose Dip Predicted Ahead'
                          : 'Your Glycemic Rhythm is Balanced!'
                      : `Physiological State: ${forecastState.status.toUpperCase()} WARNING`}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 shadow-xs">
                    2h Twin Window
                  </span>
                </h3>
                <p className="text-xs mt-1 text-stone-700 leading-relaxed font-semibold">
                  {viewMode === 'patient'
                    ? forecastState.status === 'hyper'
                      ? `Your meal intake may elevate glucose toward ${forecastState.peak} mg/dL around 2:30 PM. Walking for ${exerciseMinutes > 15 ? exerciseMinutes : 20} minutes will blunt this rise.`
                      : forecastState.status === 'hypo'
                        ? `Hypoglycemic risk detected (nadir: ${forecastState.nadir} mg/dL). Have a 15g fast-acting carbohydrate snack ready.`
                        : 'You are spending over 88% of your time in the healthy zone. Great proactive management!'
                    : forecastState.message}
                </p>
              </div>
            </div>

            {/* Recharts Main Interactive Trajectory */}
            <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-lg flex-1 flex flex-col ${themeClasses.card}`}>
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    {viewMode === 'patient' ? 'Your Today & Future Glucose Wave' : 'Continuous CGM Stream & Multimodal Horizon'}
                  </h3>
                  <p className="text-xs text-stone-500 font-semibold">
                    Solid Line: Observed Wearable Data • Glowing Dotted Line: 2-Hour Digital Twin Projection
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-stone-800 bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeClasses.chartActual }} /> Observed
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-800 bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeClasses.chartPredict }} /> 2h Forecast
                  </span>
                </div>
              </div>

              {/* Chart Component with Crisp Colored Gradients */}
              <div className="flex-1 w-full min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeClasses.chartActual} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={themeClasses.chartActual} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeClasses.chartPredict} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={themeClasses.chartPredict} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[50, 260]} stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(16px)',
                        borderColor: '#cbd5e1',
                        borderRadius: '1rem',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    />

                    {/* Healthy Target Zone (70 - 180 mg/dL) */}
                    <ReferenceArea y1={70} y2={180} fill="#10b981" fillOpacity={0.12} />
                    <ReferenceLine
                      y={180}
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      label={{ value: 'Target Max (180)', fill: '#b45309', fontSize: 11, fontWeight: 700, position: 'right' }}
                    />
                    <ReferenceLine
                      y={70}
                      stroke="#e11d48"
                      strokeDasharray="4 4"
                      label={{ value: 'Hypo Threshold (70)', fill: '#be123c', fontSize: 11, fontWeight: 700, position: 'right' }}
                    />

                    {/* Observed Stream */}
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke={themeClasses.chartActual}
                      strokeWidth={3.5}
                      fill="url(#actualGrad)"
                      dot={{ r: 3.5, fill: themeClasses.chartActual, strokeWidth: 2, stroke: '#ffffff' }}
                      isAnimationActive={false}
                    />

                    {/* Predicted Digital Twin Horizon */}
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke={themeClasses.chartPredict}
                      strokeWidth={3.5}
                      strokeDasharray="5 5"
                      fill="url(#predictGrad)"
                      dot={{ r: 4.5, fill: themeClasses.chartPredict, strokeWidth: 2, stroke: '#ffffff' }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Clinical Metric Summary */}
              <div className="mt-3 pt-3 border-t border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-stone-100/80 rounded-2xl border border-stone-200">
                  <span className="text-stone-500 block text-[10px] font-bold">Predicted Peak</span>
                  <span className="text-base font-extrabold text-stone-900">{forecastState.peak} mg/dL</span>
                </div>
                <div className="p-2.5 bg-emerald-100/70 rounded-2xl border border-emerald-300">
                  <span className="text-emerald-800 block text-[10px] font-bold">Projected TIR</span>
                  <span className="text-base font-extrabold text-emerald-950">{forecastState.tir}%</span>
                </div>
                <div className="p-2.5 bg-amber-100/70 rounded-2xl border border-amber-300">
                  <span className="text-amber-800 block text-[10px] font-bold">Variability (CV)</span>
                  <span className="text-base font-extrabold text-amber-950">{forecastState.cv}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: "What-If" Interventions & Sharing (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Interactive "What-If" Sandbox */}
            <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-lg space-y-4 ${themeClasses.card}`}>
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${themeClasses.headerIcon} flex items-center justify-center text-white shadow-xs`}>
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">"What-If" Interventions</h3>
                  <p className="text-xs text-stone-500 font-semibold">Simulate biological responses</p>
                </div>
              </div>

              {/* Desi Meal Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" /> Quick Indian Meal Presets
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {MEAL_PRESETS.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveMealPreset(idx); setCarbs(m.carbs); }}
                      className={`text-left p-2.5 rounded-2xl text-[11px] font-bold border transition-all ${activeMealPreset === idx
                        ? 'bg-amber-200 border-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                    >
                      <div className="truncate flex items-center gap-1">
                        <span>{m.icon}</span> <span>{m.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-semibold">{m.carbs}g carbs</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Carbs */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-700">Carbohydrate Intake</span>
                  <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    {carbs} grams
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={carbs}
                  onChange={(e) => { setCarbs(Number(e.target.value)); setActiveMealPreset(-1); }}
                  className={`w-full ${themeClasses.sliderCarb} cursor-pointer bg-stone-200 rounded-lg h-2.5`}
                />
              </div>

              {/* Slider 2: Walking */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-700 flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-emerald-600" /> Post-Meal Walk
                  </span>
                  <span className="text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {exerciseMinutes} mins
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={exerciseMinutes}
                  onChange={(e) => setExerciseMinutes(Number(e.target.value))}
                  className={`w-full ${themeClasses.sliderWalk} cursor-pointer bg-stone-200 rounded-lg h-2.5`}
                />
              </div>

              {/* Slider 3: Insulin Bolus */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-700">Corrective Bolus</span>
                  <span className="text-rose-900 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                    {insulinBolus} Units
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="1"
                  value={insulinBolus}
                  onChange={(e) => setInsulinBolus(Number(e.target.value))}
                  className={`w-full ${themeClasses.sliderInsulin} cursor-pointer bg-stone-200 rounded-lg h-2.5`}
                />
              </div>
            </div>

            {/* Smart Clinical Action Recommendation */}
            <div className={`backdrop-blur-xl border rounded-3xl p-5 shadow-lg space-y-3.5 ${themeClasses.card}`}>
              <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Proactive Twin Advice
              </span>
              <p className="text-xs text-stone-600 font-semibold leading-relaxed">
                By walking for <strong className="text-emerald-800 font-bold">{exerciseMinutes} minutes</strong> post-meal, your digital twin models a{' '}
                <strong className="text-rose-700 font-bold">~{Math.round(exerciseMinutes * 1.15)} mg/dL reduction</strong> in glycemic peak, preserving healthy Time in Range.
              </p>

              <div className="space-y-2 pt-1">
                {/* Real WhatsApp Share Button */}
                <button
                  onClick={shareToWhatsApp}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Share via WhatsApp to Doctor
                </button>

                {/* Print / View PDF Modal Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full py-2.5 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-600" /> View Printable Clinical Slip
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Printable Clinical Slip Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">GlucoTwin AI Clinical Summary</h3>
                <p className="text-xs text-stone-500 font-semibold">Generated for Endocrine Consultation</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-stone-700 font-medium">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <p><strong>Patient:</strong> Aditi Verma (54y, F)</p>
                <p><strong>Diagnosis:</strong> Type 2 Diabetes Mellitus (HbA1c 8.4%)</p>
                <p><strong>Current Telemetry:</strong> 164 mg/dL at 13:30 (+1.8 mg/dL/min)</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <p><strong>Digital Twin 2h Forecast:</strong> Peak {forecastState.peak} mg/dL</p>
                <p><strong>Projected TIR:</strong> {forecastState.tir}% (Target &gt; 70%)</p>
                <p><strong>Simulation Parameters:</strong> {carbs}g Carbs, {exerciseMinutes}m Walk, {insulinBolus}U Bolus</p>
              </div>

              <p className="text-[11px] text-stone-500 italic">
                Calibrated under DPDP & HIPAA constraints using multi-modal Bergman glucose-insulin kinetics.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-800 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
              <button
                onClick={shareToWhatsApp}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
              >
                <Send className="w-3.5 h-3.5" /> Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}