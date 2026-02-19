/**
 * NEURAL FORECASTER CARD
 * Real-time ML predictions with confidence scoring
 * Glows RED when 90%+ certainty of incoming storm
 * 
 * @author steve81uk
 */

import React, { useState, useEffect } from 'react';
import { neuralForecaster } from '../ml/LSTMForecaster';
import { useSpaceState } from '../services/DataBridge';
import type { NeuralForecast, FeatureVector } from '../ml/types';

export function NeuralForecasterCard() {
  const { spaceState } = useSpaceState();
  const [forecast, setForecast] = useState<NeuralForecast | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Update forecast every 5 minutes
  useEffect(() => {
    const runForecast = async () => {
      if (!spaceState?.solar) return;
      
      setIsProcessing(true);
      
      try {
        // Build feature vector from current state + simulated history
        const features = buildFeatureVector(spaceState);
        
        // Run neural prediction
        const prediction = await neuralForecaster.predict(features);
        setForecast(prediction);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('❌ Neural forecast error:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Initial forecast
    runForecast();
    
    // Update every 5 minutes
    const interval = setInterval(runForecast, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [spaceState]);
  
  if (!forecast) {
    return (
      <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="flex items-center justify-center gap-2 text-purple-400 font-['Rajdhani'] text-sm">
          <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          <span>INITIALISING NEURAL FORECASTER...</span>
        </div>
      </div>
    );
  }
  
  const { sixHour, twelveHour, twentyFourHour } = forecast.predictions;
  const { overall, modelAgreement, dataQuality } = forecast.confidence;
  
  // Determine alert color based on highest storm probability
  const maxProbability = Math.max(
    sixHour.stormProbability,
    twelveHour.stormProbability,
    twentyFourHour.stormProbability
  );
  
  const alertColor = getAlertColor(maxProbability);
  const borderColor = getBorderColor(maxProbability);
  const glowIntensity = maxProbability >= 0.9 ? 'animate-pulse' : '';
  
  return (
    <div className={`backdrop-blur-md bg-black/40 border ${borderColor} rounded-lg p-4 shadow-[0_0_20px_${alertColor}] ${glowIntensity}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <h3 className="font-['Rajdhani'] uppercase tracking-wider text-sm text-white">
            Neural Forecaster
          </h3>
        </div>
        
        {/* Confidence Badge */}
        <div className={`px-2 py-1 rounded text-[10px] font-mono ${getConfidenceBadge(overall)}`}>
          {(overall * 100).toFixed(0)}% CONFIDENCE
        </div>
      </div>
      
      {/* Critical Alert Banner */}
      {maxProbability >= 0.90 && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs font-mono animate-pulse">
          🚨 EXTREME STORM ALERT - {(maxProbability * 100).toFixed(0)}% CERTAINTY
        </div>
      )}
      
      {/* Prediction Windows */}
      <div className="space-y-2 mb-3">
        <PredictionRow
          label="6 HR"
          kp={sixHour.predictedKp}
          bz={sixHour.predictedBz}
          probability={sixHour.stormProbability}
        />
        <PredictionRow
          label="12 HR"
          kp={twelveHour.predictedKp}
          bz={twelveHour.predictedBz}
          probability={twelveHour.stormProbability}
        />
        <PredictionRow
          label="24 HR"
          kp={twentyFourHour.predictedKp}
          bz={twentyFourHour.predictedBz}
          probability={twentyFourHour.stormProbability}
        />
      </div>
      
      {/* Alerts */}
      {forecast.alerts.length > 0 && (
        <div className="space-y-1 mb-3">
          {forecast.alerts.slice(0, 2).map((alert, i) => (
            <div
              key={i}
              className={`p-2 rounded text-[10px] font-mono ${getAlertStyle(alert.severity)}`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}
      
      {/* Model Stats */}
      <div className="flex justify-between text-[9px] font-mono text-gray-500">
        <span>Model: LSTM-64x32</span>
        <span>Data: {(dataQuality * 100).toFixed(0)}%</span>
        <span>Ensemble: {(modelAgreement * 100).toFixed(0)}%</span>
      </div>
      
      {lastUpdate && (
        <div className="text-[8px] text-gray-600 font-mono mt-1 text-center">
          Last updated: {lastUpdate.toLocaleTimeString('en-GB')}
        </div>
      )}
    </div>
  );
}

/**
 * Single prediction row component
 */
function PredictionRow({ label, kp, bz, probability }: {
  label: string;
  kp: number;
  bz: number;
  probability: number;
}) {
  const kpColor = getKpColor(kp);
  const probColor = getProbabilityColor(probability);
  
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="font-['Rajdhani'] text-purple-400 w-12">{label}</span>
      
      <div className="flex items-center gap-3 flex-1">
        {/* Kp Prediction */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Kp:</span>
          <span className={`font-mono font-bold ${kpColor}`}>
            {kp.toFixed(1)}
          </span>
        </div>
        
        {/* Bz Prediction */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Bz:</span>
          <span className="font-mono text-cyan-400">
            {bz.toFixed(1)} nT
          </span>
        </div>
        
        {/* Storm Probability */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-12 h-1.5 bg-black/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${probColor} transition-all duration-500`}
              style={{ width: `${probability * 100}%` }}
            />
          </div>
          <span className={`font-mono text-[10px] ${probColor}`}>
            {(probability * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Build feature vector from current space state
 * In production, this would use real 24h historical data
 */
function buildFeatureVector(spaceState: any): FeatureVector {
  const current = {
    speed: spaceState.solar.solarWind.speed,
    density: spaceState.solar.solarWind.density,
    bz: spaceState.solar.magneticField.bz,
    bt: spaceState.solar.magneticField.bt,
    newell: spaceState.calculated?.newellCoupling || 0,
    alfven: spaceState.calculated?.alfvenVelocity || 0,
  };
  
  // Simulate 24h history with realistic variance
  // TODO: Replace with actual DataBridge historical storage
  const generateHistory = (value: number, variance: number) => {
    return Array.from({ length: 24 }, (_, i) => {
      const trend = Math.sin(i / 4) * variance * 0.3;
      const noise = (Math.random() - 0.5) * variance * 0.5;
      return value + trend + noise;
    });
  };
  
  return {
    solarWindSpeed: generateHistory(current.speed, 100),
    solarWindDensity: generateHistory(current.density, 3),
    magneticFieldBz: generateHistory(current.bz, 4),
    magneticFieldBt: generateHistory(current.bt, 2),
    newellCouplingHistory: generateHistory(current.newell, 3000),
    alfvenVelocityHistory: generateHistory(current.alfven, 20),
    syzygyIndex: 0.3,  // TODO: Calculate from planetary positions
    jupiterSaturnAngle: 0.5,
    solarRotationPhase: (Date.now() / (27 * 24 * 60 * 60 * 1000)) % 1,
    solarCyclePhase: 0.6,  // We're in solar cycle 25
    timeOfYear: (new Date().getMonth() / 12),
  };
}

/**
 * Styling helpers
 */
function getAlertColor(probability: number): string {
  if (probability >= 0.9) return 'rgba(239,68,68,0.3)';
  if (probability >= 0.7) return 'rgba(251,146,60,0.2)';
  if (probability >= 0.5) return 'rgba(234,179,8,0.15)';
  return 'rgba(168,85,247,0.1)';
}

function getBorderColor(probability: number): string {
  if (probability >= 0.9) return 'border-red-500/50';
  if (probability >= 0.7) return 'border-orange-500/40';
  if (probability >= 0.5) return 'border-yellow-500/30';
  return 'border-purple-500/30';
}

function getConfidenceBadge(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  return 'bg-red-500/20 text-red-400 border border-red-500/30';
}

function getKpColor(kp: number): string {
  if (kp >= 7) return 'text-red-500';
  if (kp >= 5) return 'text-orange-400';
  if (kp >= 3) return 'text-yellow-400';
  return 'text-green-400';
}

function getProbabilityColor(prob: number): string {
  if (prob >= 0.9) return 'bg-red-500';
  if (prob >= 0.7) return 'bg-orange-500';
  if (prob >= 0.5) return 'bg-yellow-500';
  return 'bg-cyan-500';
}

function getAlertStyle(severity: string): string {
  switch (severity) {
    case 'Critical': return 'bg-red-500/20 border border-red-500/50 text-red-400';
    case 'Warning': return 'bg-orange-500/20 border border-orange-500/50 text-orange-400';
    case 'Watch': return 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400';
    default: return 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400';
  }
}
