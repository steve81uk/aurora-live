/**
 * Probability Matrix - AI Aurora Prediction UI
 * Displays 7d/30d/1yr aurora probability forecasts with confidence intervals
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Percent, AlertTriangle, Sparkles } from 'lucide-react';
import { predictiveEngine } from '../engines/PredictiveEngine';

interface ProbabilityMatrixProps {
  latitude?: number;
  currentKp?: number;
  sunspotNumber?: number;
}

interface PredictionData {
  timeframe: string;
  probability: number;
  confidence: number;
  description: string;
  highestDate?: string;
  factors: {
    sunspot: number;
    coronalHole: number;
    solarCycle: number;
    historical: number;
  };
}

export function ProbabilityMatrix({ 
  latitude = 52.2053, 
  currentKp = 3,
  sunspotNumber = 150 
}: ProbabilityMatrixProps) {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [showFactors, setShowFactors] = useState(false);

  useEffect(() => {
    // Calculate predictions for all timeframes
    const pred7d = predictiveEngine.calculateProbability(7, currentKp, sunspotNumber, latitude);
    const pred30d = predictiveEngine.calculateProbability(30, currentKp, sunspotNumber, latitude);
    const pred1yr = predictiveEngine.calculateProbability(365, currentKp, sunspotNumber, latitude);

    setPredictions([
      {
        timeframe: '7d',
        probability: pred7d.probability,
        confidence: pred7d.confidence,
        description: 'High-precision tracking via active sunspot regions',
        highestDate: pred7d.peakDate,
        factors: pred7d.factors
      },
      {
        timeframe: '30d',
        probability: pred30d.probability,
        confidence: pred30d.confidence,
        description: 'Medium-precision based on 27-day solar rotation',
        highestDate: pred30d.peakDate,
        factors: pred30d.factors
      },
      {
        timeframe: '1yr',
        probability: pred1yr.probability,
        confidence: pred1yr.confidence,
        description: 'Macro-trend analysis approaching Solar Maximum 2025',
        highestDate: pred1yr.peakDate,
        factors: pred1yr.factors
      }
    ]);
  }, [currentKp, sunspotNumber, latitude]);

  const selectedPrediction = predictions.find(p => p.timeframe === selectedTimeframe);

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-green-400';
    if (prob >= 50) return 'text-yellow-400';
    if (prob >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-cyan-400';
    if (conf >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="holo-card p-6 relative overflow-hidden">
      {/* Neural Grid Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-cyan-500/20" />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold aurora-text flex items-center gap-2">
            <Sparkles size={24} className="text-purple-400" />
            PROBABILITY MATRIX
          </h3>
          <button
            onClick={() => setShowFactors(!showFactors)}
            className="px-3 py-1 text-xs border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors"
          >
            {showFactors ? 'HIDE' : 'SHOW'} FACTORS
          </button>
        </div>
        <p className="text-cyan-400/70 text-sm font-mono">
          AI-Powered Aurora Forecast • Cambridge, UK (52.2°N)
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="relative z-10 flex gap-2 mb-6">
        {predictions.map((pred) => (
          <button
            key={pred.timeframe}
            onClick={() => setSelectedTimeframe(pred.timeframe)}
            className={`
              flex-1 px-4 py-3 rounded-lg border-2 transition-all font-mono font-bold
              ${selectedTimeframe === pred.timeframe
                ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/50'
                : 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400/70 hover:border-cyan-500/50'
              }
            `}
          >
            {pred.timeframe === '7d' && '7 DAYS'}
            {pred.timeframe === '30d' && '30 DAYS'}
            {pred.timeframe === '1yr' && '1 YEAR'}
          </button>
        ))}
      </div>

      {/* Main Probability Display */}
      <AnimatePresence mode="wait">
        {selectedPrediction && (
          <motion.div
            key={selectedTimeframe}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 space-y-6"
          >
            {/* Probability Gauge */}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono text-cyan-400/70">AURORA PROBABILITY</span>
                <span className={`text-sm font-mono font-bold ${getProbabilityColor(selectedPrediction.probability)}`}>
                  {selectedPrediction.probability.toFixed(1)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-8 bg-gray-900/50 rounded-lg overflow-hidden border border-cyan-500/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedPrediction.probability}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`
                    h-full relative
                    ${selectedPrediction.probability >= 70 ? 'bg-gradient-to-r from-green-500/50 to-green-400/50' :
                      selectedPrediction.probability >= 50 ? 'bg-gradient-to-r from-yellow-500/50 to-yellow-400/50' :
                      selectedPrediction.probability >= 30 ? 'bg-gradient-to-r from-orange-500/50 to-orange-400/50' :
                      'bg-gradient-to-r from-red-500/50 to-red-400/50'
                    }
                  `}
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 153, 0.3)'
                  }}
                />
                {/* Animated glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Confidence Interval */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs font-mono text-gray-500">CONFIDENCE INTERVAL</span>
                <span className={`text-xs font-mono font-bold ${getConfidenceColor(selectedPrediction.confidence)}`}>
                  {selectedPrediction.confidence}% CERTAIN
                </span>
              </div>
            </div>

            {/* Peak Date Prediction */}
            {selectedPrediction.highestDate && (
              <div className="metric-panel holo-card border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-cyan-400/70 font-mono mb-1">HIGHEST PROBABILITY DATE</div>
                    <div className="text-lg font-bold text-purple-400 font-mono">
                      {selectedPrediction.highestDate}
                    </div>
                  </div>
                  <Calendar size={32} className="text-purple-400/50" />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-gray-400 font-mono italic">
              {selectedPrediction.description}
            </div>

            {/* Factor Breakdown */}
            <AnimatePresence>
              {showFactors && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 border-t border-cyan-500/20 pt-4"
                >
                  <div className="text-xs font-mono text-cyan-400/70 uppercase tracking-wider">
                    Contributing Factors
                  </div>

                  {/* Sunspot Activity */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-mono">Sunspot Activity</span>
                      <span className="text-amber-400 font-mono">{(selectedPrediction.factors.sunspot * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPrediction.factors.sunspot * 100}%` }}
                        className="h-full bg-gradient-to-r from-amber-500/50 to-amber-400/50"
                      />
                    </div>
                  </div>

                  {/* Coronal Hole Rotation */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-mono">Coronal Hole (27-day)</span>
                      <span className="text-cyan-400 font-mono">{(selectedPrediction.factors.coronalHole * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPrediction.factors.coronalHole * 100}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400/50"
                      />
                    </div>
                  </div>

                  {/* Solar Cycle Phase */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-mono">Solar Cycle Phase</span>
                      <span className="text-purple-400 font-mono">{(selectedPrediction.factors.solarCycle * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPrediction.factors.solarCycle * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500/50 to-purple-400/50"
                      />
                    </div>
                  </div>

                  {/* Historical Patterns */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-mono">Historical Patterns</span>
                      <span className="text-green-400 font-mono">{(selectedPrediction.factors.historical * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedPrediction.factors.historical * 100}%` }}
                        className="h-full bg-gradient-to-r from-green-500/50 to-green-400/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alert Banner */}
            {selectedPrediction.probability >= 70 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4"
              >
                <TrendingUp size={24} className="text-green-400" />
                <div>
                  <div className="font-bold text-green-400">HIGH PROBABILITY ALERT</div>
                  <div className="text-xs text-gray-400 font-mono">
                    Prime aurora hunting window detected for Cambridge latitude
                  </div>
                </div>
              </motion.div>
            )}

            {selectedPrediction.confidence < 60 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
              >
                <AlertTriangle size={24} className="text-yellow-400" />
                <div>
                  <div className="font-bold text-yellow-400">LOW CONFIDENCE WARNING</div>
                  <div className="text-xs text-gray-400 font-mono">
                    Long-range prediction based on limited satellite data
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Attribution */}
      <div className="relative z-10 mt-6 pt-4 border-t border-cyan-500/20">
        <div className="text-xs text-gray-500 font-mono text-center">
          Powered by Weighted Decay Model • NOAA 27-Day Outlook • Solar Cycle 25 Progression
        </div>
      </div>
    </div>
  );
}
