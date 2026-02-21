/**
 * RightOverlayDock — Starboard data panel
 * Tabs: Neural LSTM Forecast | Telemetry | Exo-Physics Engine
 */

import React, { useState } from 'react';
import { Brain, Activity, Globe2, TrendingUp, AlertTriangle } from 'lucide-react';
import { NeuralForecastCard } from './NeuralForecastCard';
import { useLiveFeatureVector } from '../hooks/useLiveFeatureVector';
import { useONNXForecast } from '../ml/ONNXForecaster';
import { useSpaceState } from '../services/DataBridge';
import { useSWPC } from '../services/SWPCDataService';
import { useDONKI, type DONKIEvent } from '../services/DONKIService';
import { ExoPhysicsPanel } from './ExoPhysicsPanel';
import { TelemetryDeck } from './TelemetryDeck';
import { useAuroraWindows } from '../services/AuroraWindowService';
import type { AuroraWindow } from '../services/AuroraWindowService';

type Tab = 'forecast' | 'telemetry' | 'sat' | 'events' | 'exo';

export default function RightOverlayDock() {
  const [activeTab, setActiveTab] = useState<Tab>('forecast');
  const featureVector = useLiveFeatureVector();
  const onnxPred = useONNXForecast(featureVector);
  const { spaceState } = useSpaceState();
  const { events } = useDONKI();

  const tabs = [
    { id: 'forecast'  as Tab, icon: <Brain size={14} />,    label: 'LSTM' },
    { id: 'telemetry' as Tab, icon: <Activity size={14} />, label: 'TELEM' },
    { id: 'sat'       as Tab, icon: <Globe2 size={14} />,   label: 'SAT' },
    { id: 'events'    as Tab, icon: <AlertTriangle size={14} />, label: 'LOG' },
    { id: 'exo'       as Tab, icon: <Globe2 size={14} />,   label: 'EXO-Φ' },
  ];

  return (
    <div className="absolute top-4 right-4 z-60 pointer-events-auto w-88 max-h-[92vh] flex flex-col" style={{ width: '22rem' }}>
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168,85,247,0.2)',
          boxShadow: '0 0 60px rgba(168,85,247,0.06), 0 25px 50px rgba(0,0,0,0.7)'
        }}
      >
        {/* Tab strip */}
        <div className="flex border-b border-purple-500/10 bg-black/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[10px]
                transition-all border-b-2
                ${activeTab === tab.id
                  ? 'border-purple-400 text-purple-400 bg-purple-500/5'
                  : 'border-transparent text-gray-600 hover:text-purple-400/70'
                }
              `}
            >
              {tab.icon}
              <span className="tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto wolf-scroll" style={{ maxHeight: 'calc(92vh - 44px)' }}>

          {/* ── LSTM Neural Forecast ────────────────────────── */}
          {activeTab === 'forecast' && (
            <div className="p-3 space-y-3">
              {/* Live data status banner */}
              <div className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-900/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${featureVector ? 'bg-green-400 animate-pulse' : 'bg-amber-400 animate-bounce'}`} />
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                    {featureVector ? 'Live Data Wired' : 'Awaiting Live Data...'}
                  </span>
                </div>
                {featureVector && (
                  <span className="text-[9px] font-mono text-green-400">
                    {featureVector.solarWindSpeed.length}h history
                  </span>
                )}
              </div>

              {/* The Neural Forecast Card */}
              <NeuralForecastCard liveData={featureVector} />

              {/* ONNX model forecast (MC dropout) */}
              {onnxPred && (
                <div className="rounded-xl border border-blue-500/15 bg-black/30 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp size={11} className="text-blue-400" />
                    <span className="text-[9px] font-mono text-blue-400/70 uppercase tracking-widest">ONNX FORECAST</span>
                  </div>
                  <div className="space-y-1">
                    {['+6h', '+12h', '+24h'].map((lbl, i) => (
                      <div key={lbl} className="flex justify-between items-center text-[10px]">
                        <span>{lbl}</span>
                        <span className="font-bold" style={{ color: '#60a5fa' }}>
                          {onnxPred.kp[i].toFixed(1)} ± {onnxPred.uncertainty[i].toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 24H prediction mini-bars */}
              {spaceState?.ml?.predictedKp && (
                <div className="rounded-xl border border-purple-500/15 bg-black/30 p-3">
                  <div className="flex items-center gap-1.5 mb-3">
                    <TrendingUp size={11} className="text-purple-400" />
                    <span className="text-[9px] font-mono text-purple-400/70 uppercase tracking-widest">24H KP FORECAST</span>
                  </div>
                  <div className="flex items-end gap-0.5 h-14">
                    {spaceState.ml.predictedKp.map((kp: number, i: number) => {
                      const h = Math.max(4, Math.min(100, (kp / 9) * 100));
                      const col = kp >= 7 ? '#ef4444' : kp >= 5 ? '#f59e0b' : kp >= 3 ? '#8b5cf6' : '#06b6d4';
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t transition-all duration-500"
                          style={{ height: `${h}%`, backgroundColor: col, boxShadow: `0 0 3px ${col}` }}
                          title={`+${i + 1}h: Kp ${kp.toFixed(1)}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-600 font-mono mt-1">
                    <span>NOW</span>
                    <span>+24H</span>
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: 'CURRENT',
                    val: (spaceState?.solar?.kpIndex ?? 0).toFixed(1),
                    color: '#06b6d4',
                    desc: 'Kp'
                  },
                  {
                    label: 'PEAK 24H',
                    val: spaceState?.ml?.predictedKp
                      ? Math.max(...spaceState.ml.predictedKp).toFixed(1)
                      : 'N/A',
                    color: '#f59e0b',
                    desc: 'Kp'
                  },
                  {
                    label: 'CONFIDENCE',
                    val: `${spaceState?.ml?.confidence ?? 0}%`,
                    color: '#10b981',
                    desc: 'model'
                  },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-white/5 bg-black/30 p-2 text-center">
                    <div className="text-[8px] text-gray-500 font-mono mb-1">{s.label}</div>
                    <div className="text-base font-black font-mono" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[7px] text-gray-600 font-mono">{s.desc}</div>
                  </div>
                ))}
              </div>

              {/* Anomaly alert */}
              {spaceState?.ml?.anomalyDetected && (
                <div className="rounded-lg border border-red-500/40 bg-red-900/15 px-3 py-2.5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <div>
                    <div className="text-[9px] text-red-400 font-mono font-bold">⚡ ANOMALY DETECTED</div>
                    <div className="text-[8px] text-gray-500 font-mono">Unusual IMF pattern flagged by LSTM</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Telemetry ───────────────────────────────────── */}
          {activeTab === 'telemetry' && (
            <div className="p-3">
              <LiveTelemetryPanel />
            </div>
          )}

          {/* ── Satellite List ───────────────────────────────── */}
          {activeTab === 'sat' && (
            <div className="p-3">
              <p className="text-[9px] font-mono text-gray-400">Satellites tracked in scene.</p>
            </div>
          )}

          {/* ── Event Log ───────────────────────────────────── */}
          {activeTab === 'events' && (
            <div className="p-3 space-y-2">
              {events.slice(0, 20).map((ev: DONKIEvent) => (
                <div key={ev.id} className="text-[9px] font-mono">
                  <span className="font-bold">[{new Date(ev.time).toUTCString()}]</span> {ev.message}
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-[10px] text-gray-600">No recent events</div>
              )}
            </div>
          )}

          {/* ── Exo-Physics ─────────────────────────────────── */}
          {activeTab === 'exo' && (
            <div className="p-3">
              <ExoPhysicsPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Compact live telemetry panel ─────────────────────────────────────── */
function LiveTelemetryPanel() {
  const { spaceState } = useSpaceState();
  const { data: swpc } = useSWPC();
  const windows = useAuroraWindows();

  if (!spaceState) {
    return <div className="text-cyan-400/40 font-mono text-xs text-center py-6">Loading telemetry...</div>;
  }

  const sw = spaceState.solar?.solarWind;
  const sat = spaceState.satellites;
  const protonFlux = swpc?.proton?.flux_10MeV ?? 0;
  const issDose = protonFlux * 0.0001; // arbitrary scaling to mSv/hr
  const dragMult = 1 + (spaceState.solar?.kpIndex ?? 0) * 0.1;

  const params = [
    { label: 'KP INDEX',       val: (spaceState.solar?.kpIndex ?? 0).toFixed(1), unit: '',       color: '#06b6d4' },
    { label: 'SOLAR WIND',     val: (sw?.speed ?? 0).toFixed(0),                  unit: 'km/s',   color: '#8b5cf6' },
    { label: 'IMF Bz',         val: (sw?.bz ?? 0).toFixed(2),                     unit: 'nT',     color: sw?.bz ?? 0 < -5 ? '#ef4444' : '#10b981' },
    { label: 'IMF Bt',         val: (sw?.bt ?? 0).toFixed(2),                     unit: 'nT',     color: '#f59e0b' },
    { label: 'DENSITY',        val: (sw?.density ?? 0).toFixed(1),                unit: 'p/cc',   color: '#06b6d4' },
    { label: 'TEMPERATURE',    val: ((sw?.temperature ?? 100000) / 1000).toFixed(0), unit: 'kK', color: '#f97316' },
    { label: 'X-RAY FLUX',     val: spaceState.solar?.xrayFlux ?? '--',           unit: '',       color: '#fbbf24' },
    { label: 'SUNSPOT No',     val: (spaceState.solar?.sunspotNumber ?? 0).toString(), unit: '',  color: '#fb923c' },
    { label: 'F10.7',          val: (spaceState.solar?.solarFluxF107 ?? 0).toString(), unit: 'sfu', color: '#f59e0b' },
    { label: 'ISS ALT',        val: (sat?.iss?.altitude ?? 408).toFixed(0),       unit: 'km',     color: '#22d3ee' },
    { label: 'ISS VEL',        val: (sat?.iss?.velocity ?? 7.66).toFixed(2),      unit: 'km/s',   color: '#22d3ee' },
    { label: 'JWST DIST',      val: (sat?.jwst?.distance ?? 1.5).toFixed(2),      unit: 'AU',     color: '#a78bfa' },
    { label: 'VOYAGER 1',      val: (sat?.voyager1?.distance ?? 164).toFixed(1),  unit: 'AU',     color: '#818cf8' },
    { label: 'V1 SIGNAL',      val: (sat?.voyager1?.signalDelay ?? 22).toFixed(1), unit: 'h',     color: '#818cf8' },
    { label: 'STORM LEVEL',    val: spaceState.solar?.geomagneticStorm?.level ?? 'G0', unit: '',  color: '#f59e0b' },
    { label: 'PROTON FLUX',    val: protonFlux.toFixed(0),             unit: 'pfu', color: '#ef4444' },
    { label: 'ISS DOSE',        val: issDose.toFixed(2),                unit: 'mSv/h', color: '#f59e0b' },
    { label: 'DRAG ×',          val: dragMult.toFixed(2),                 unit: '',      color: '#8b5cf6' },
    { label: 'STORM PROB',      val: (spaceState.solar?.geomagneticStorm?.probability ?? 0).toString(), unit: '%', color: '#ef4444' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]" />
        <span className="text-[9px] font-mono text-green-400/70 uppercase tracking-widest">LIVE · NOAA SWPC</span>
      </div>
      <div className="divide-y divide-white/5 rounded-lg border border-white/5 overflow-hidden">
        {params.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-1.5 bg-black/20 hover:bg-black/40 transition-colors"
          >
            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">{p.label}</span>
            <span className="text-sm font-bold font-mono" style={{ color: p.color }}>
              {p.val}<span className="text-[8px] text-gray-600 ml-0.5">{p.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* city aurora windows */}
      {windows && windows.length > 0 && (
        <div className="mt-3 px-3">
          <div className="text-[9px] font-mono text-gray-400 uppercase tracking-widest mb-1">City Aurora Windows</div>
          <ul className="text-[8px]">
            {windows.map((w: AuroraWindow) => (
              <li key={w.city.name} className="flex justify-between">
                <span>{w.city.name}</span>
                <span>{w.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-[7px] text-gray-700 font-mono text-center pt-1">
        Last update: {new Date().toLocaleTimeString('en-GB')}
      </div>
    </div>
  );
}
