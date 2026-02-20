/**
 * BridgeModule - Unified Bridge Tactical HUD
 * 3-Column Grid: Left (Metrics) | Center (Earth-Focused 3D) | Right (Charts + ML)
 * NASA Competition Ready - Elite Mission Control
 */

import { useState } from 'react';
import { Activity, Wind, Zap, TrendingUp, Radio, Eye } from 'lucide-react';
import GridResilience from './GridResilience';
import { NeuralForecasterCard } from './NeuralForecastCard';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface BridgeModuleProps {
  focusedBody: string | null;
  kpValue: number;
  solarWindSpeed: number;
  density: number;
  currentDate: Date;
  onBodyFocus?: (body: string) => void;
  cameraDistance?: number;
  bzValue?: number;
  btValue?: number;
  children?: React.ReactNode; // For 3D Scene
}

export function BridgeModule({
  focusedBody,
  kpValue,
  solarWindSpeed,
  density,
  currentDate,
  onBodyFocus,
  cameraDistance = 0,
  bzValue = 0,
  btValue = 5,
  children
}: BridgeModuleProps) {
  const [showCinematic, setShowCinematic] = useState(false);

  // Generate Fourier harmonics data
  const fourierData = [];
  for (let i = 0; i < 50; i++) {
    const freq = i * 0.05;
    const amplitude = Math.exp(-freq / 2) * (1 + Math.sin(freq * 3) * 0.3);
    fourierData.push({
      frequency: freq.toFixed(2),
      amplitude: amplitude * 100
    });
  }

  // Generate Vector Flux data (Bz vs Kp relationship)
  const vectorFluxData = [];
  for (let i = -12; i <= 12; i += 0.5) {
    vectorFluxData.push({
      bz: 5 * Math.sin(i * 0.5) + Math.random() * 4 - 2,
      kp: Math.max(0, Math.min(9, 3 + Math.abs(5 * Math.sin(i * 0.5)) / 2))
    });
  }

  // Cinematic Mode - Hide all HUD, show only 3D scene
  if (showCinematic) {
    return (
      <div className="fixed inset-0 z-20 pointer-events-none">
        <button
          onClick={() => setShowCinematic(false)}
          className="absolute top-4 right-4 z-50 pointer-events-auto backdrop-blur-md bg-black/60 border border-cyan-500/50 rounded px-4 py-2 text-cyan-400 hover:text-white transition-colors font-['Rajdhani'] text-sm uppercase tracking-wider"
        >
          <Eye className="inline w-4 h-4 mr-2" />
          Exit Cinematic
        </button>
        {children}
      </div>
    );
  }

  // UNIFIED BRIDGE - 3-Column Tactical Grid
  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
      <div className="w-full h-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 pointer-events-none max-w-[1920px] mx-auto items-start">
        
        {/* LEFT COLUMN - Primary Metrics */}
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-3rem)] pointer-events-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          
          {/* Cinematic Mode Toggle */}
          <button
            onClick={() => setShowCinematic(true)}
            className="w-full backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-lg p-3 text-purple-400 hover:text-white transition-colors font-['Rajdhani'] text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Cinematic Mode
          </button>

          {/* Kp Index Card */}
          <div className="backdrop-blur-md bg-black/40 border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-['Rajdhani']">Kp Index</h3>
            </div>
            <div className={`text-4xl font-black mb-2 font-['Inter'] ${
              kpValue >= 7 ? 'text-red-400' : kpValue >= 5 ? 'text-orange-400' : kpValue >= 4 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {kpValue.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400 font-['Inter']">
              {kpValue >= 7 ? 'Extreme Storm' : kpValue >= 5 ? 'Major Storm' : kpValue >= 4 ? 'Moderate Storm' : 'Calm Conditions'}
            </div>
          </div>

          {/* IMF Magnetic Field (Bz) */}
          <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider font-['Rajdhani']">IMF Bz</h3>
            </div>
            <div className={`text-4xl font-black mb-2 font-['Inter'] ${bzValue < -5 ? 'text-red-400' : 'text-gray-400'}`}>
              {bzValue.toFixed(1)} <span className="text-lg text-white/50">nT</span>
            </div>
            <div className="text-xs text-gray-400 font-['Inter']">
              {bzValue < 0 ? 'Southward (Storm Risk)' : 'Northward (Stable)'}
            </div>
          </div>

          {/* Solar Wind Speed */}
          <div className="backdrop-blur-md bg-black/40 border border-amber-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider font-['Rajdhani']">Solar Wind</h3>
            </div>
            <div className={`text-4xl font-black mb-2 font-['Inter'] ${
              solarWindSpeed >= 600 ? 'text-red-400' : solarWindSpeed >= 500 ? 'text-orange-400' : 'text-green-400'
            }`}>
              {solarWindSpeed.toFixed(0)} <span className="text-lg text-white/50">km/s</span>
            </div>
            <div className="text-xs text-gray-400 font-['Inter']">
              Density: {density.toFixed(1)} p/cm³
            </div>
          </div>

          {/* Grid Resilience (max-width: 250px already set) */}
          <GridResilience
            solarWindSpeed={solarWindSpeed}
            bz={bzValue}
            bt={btValue}
          />
        </div>

        {/* CENTER COLUMN - Earth-Focused 3D Scene (pointer-events: none — canvas handles its own) */}
        <div className="relative min-h-[500px] pointer-events-none">
          {children}
        </div>

        {/* RIGHT COLUMN - Neural Forecaster + Charts */}
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-3rem)] pointer-events-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          
          {/* Neural Forecaster - LSTM ML Predictions (TOP PRIORITY) */}
          <NeuralForecasterCard />

          {/* Fourier Harmonics */}
          <div className="backdrop-blur-md bg-black/40 border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
            <h3 className="text-sm font-bold text-cyan-400 font-['Rajdhani'] mb-3 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} />
              Fourier Harmonics
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={fourierData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="frequency" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #06b6d4', fontSize: 12 }} />
                <Line type="monotone" dataKey="amplitude" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-[10px] text-gray-400 font-['Inter'] italic">
              Solar wind oscillation spectrum
            </div>
          </div>

          {/* Vector Flux (Bz vs Kp) */}
          <div className="backdrop-blur-md bg-black/40 border border-amber-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
            <h3 className="text-sm font-bold text-amber-400 font-['Rajdhani'] mb-3 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} />
              Vector Flux Field
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" dataKey="bz" name="Bz (nT)" stroke="#6b7280" tick={{ fontSize: 10 }} domain={[-15, 15]} />
                <YAxis type="number" dataKey="kp" name="Kp" stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 9]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #f59e0b', fontSize: 12 }} />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
                <Scatter name="Bz-Kp" data={vectorFluxData} fill="#f59e0b" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-2 text-[10px] text-gray-400 font-['Inter'] italic">
              Bz component vs geomagnetic activity
            </div>
          </div>

          {/* Mission Status */}
          <div className="backdrop-blur-md bg-black/40 border border-green-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <h3 className="text-sm font-bold text-green-400 font-['Rajdhani'] mb-3 uppercase tracking-wider">Mission Status</h3>
            <div className="space-y-2 text-xs font-['Inter']">
              <div className="flex justify-between">
                <span className="text-gray-400">Focused Body:</span>
                <span className="text-cyan-400 font-bold">{focusedBody || 'Earth'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Camera Distance:</span>
                <span className="text-amber-400 font-bold">{cameraDistance.toFixed(1)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-white font-bold">{currentDate.toLocaleTimeString('en-GB')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
