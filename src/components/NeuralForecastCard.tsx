/**
 * SKÖLL-TRACK GEN-2: NEURAL FORECAST CARD
 * High-fidelity HUD component with dynamic Sigma-Glow
 * @author steve81uk (Systems Architect)
 */
import React from 'react';
import { useSkollForecast } from '../hooks/useSkollForecast';
import type { FeatureVector } from '../ml/types';

interface NeuralForecastCardProps {
  liveData: FeatureVector | null;
}

export const NeuralForecastCard: React.FC<NeuralForecastCardProps> = ({ liveData }) => {
  const { forecast, isLoading } = useSkollForecast(liveData);

  if (isLoading || !forecast) {
    return (
      <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="flex flex-col items-center gap-4 text-purple-400 font-['Rajdhani']">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full shadow-[0_0_10px_#a855f7]" />
          <span className="tracking-widest text-xs uppercase">Syncing Neural Paths...</span>
        </div>
      </div>
    );
  }

  const { sixHour, twelveHour } = forecast.predictions;
  const isSevere = twelveHour.stormProbability >= 0.7;
  const intensityColor = isSevere ? '#ef4444' : '#06b6d4'; // Red vs Cyan
  const glowClass = isSevere ? 'animate-pulse shadow-[0_0_30px_#ef4444]' : 'shadow-[0_0_15px_#06b6d4]';

  return (
    <div className={`backdrop-blur-xl bg-black/60 border rounded-xl p-6 transition-all duration-1000 ${glowClass}`}
         style={{ borderColor: `${intensityColor}66` }}>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-['Rajdhani'] font-bold text-white tracking-widest uppercase text-sm">Sköll-Track Gen-2</h3>
          <p className="text-[10px] text-gray-400 font-mono">Neural Lookahead: 12H</p>
        </div>
        <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-gray-300">
          CONFIDENCE: {(forecast.confidence.overall * 100).toFixed(0)}%
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* The Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
            <circle 
              cx="64" cy="64" r="58" stroke={intensityColor} strokeWidth="4" fill="transparent" 
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * (twelveHour.predictedKp / 9))}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-black text-white">{twelveHour.predictedKp.toFixed(1)}</span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Kp Index</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-tighter" style={{ color: intensityColor }}>
            {isSevere ? '⚠️ Magnetosphere Breach Predicted' : '✓ Magnetic Stability Forecast'}
          </p>
          <p className="text-[10px] text-gray-500 font-mono mt-1">
            Bz: {twelveHour.predictedBz.toFixed(1)} nT | Storm Prob: {(twelveHour.stormProbability * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Mini 6H Trend */}
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
        <span className="text-gray-400">NEXT 6H IMPACT:</span>
        <span className={sixHour.predictedKp >= 5 ? 'text-red-400' : 'text-cyan-400'}>
          Kp {sixHour.predictedKp.toFixed(1)}
        </span>
      </div>
    </div>
  );
};