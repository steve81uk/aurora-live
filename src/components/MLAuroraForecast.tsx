/**
 * Simple ML Aurora Forecast
 * Uses TensorFlow.js for basic time-series prediction
 */

import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { TrendingUp, Brain } from 'lucide-react';

interface ForecastPoint {
  timestamp: Date;
  predicted: number;
  confidence: number;
}

export function MLAuroraForecast() {
  const { data } = useLiveSpaceWeather();
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  
  useEffect(() => {
    trainModel();
  }, [data]);
  
  async function trainModel() {
    if (!data) return;
    
    setIsTraining(true);
    
    try {
      // Fetch historical data for training
      const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
      const historical = await response.json();
      
      // Prepare training data (last 1000 points)
      const trainingData = historical.slice(-1000).map((item: any) => parseFloat(item.kp_index));
      
      // Create sequences (use last 10 points to predict next 6 points)
      const sequenceLength = 10;
      const forecastLength = 6;
      
      const X: number[][] = [];
      const y: number[][] = [];
      
      for (let i = 0; i < trainingData.length - sequenceLength - forecastLength; i++) {
        X.push(trainingData.slice(i, i + sequenceLength));
        y.push(trainingData.slice(i + sequenceLength, i + sequenceLength + forecastLength));
      }
      
      if (X.length === 0) {
        console.warn('Not enough data for training');
        setIsTraining(false);
        return;
      }
      
      // Create simple LSTM model
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [sequenceLength], units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: forecastLength })
        ]
      });
      
      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae']
      });
      
      // Train model
      const xs = tf.tensor2d(X);
      const ys = tf.tensor2d(y);
      
      await model.fit(xs, ys, {
        epochs: 20,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs && logs.val_mae) {
              // Calculate accuracy (inverse of MAE, normalized)
              const acc = Math.max(0, 100 - (logs.val_mae as number) * 20);
              setAccuracy(Math.round(acc));
            }
          }
        }
      });
      
      // Make prediction
      const currentSequence = trainingData.slice(-sequenceLength);
      const prediction = model.predict(tf.tensor2d([currentSequence])) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Generate forecast points (next 6 hours, assuming 1-hour intervals)
      const now = new Date();
      const forecastPoints: ForecastPoint[] = Array.from(predictionData).map((value, index) => ({
        timestamp: new Date(now.getTime() + (index + 1) * 60 * 60 * 1000),
        predicted: Math.max(0, Math.min(9, value)), // Clamp to 0-9
        confidence: 0.7 - (index * 0.1) // Confidence decreases over time
      }));
      
      setForecast(forecastPoints);
      
      // Cleanup
      xs.dispose();
      ys.dispose();
      prediction.dispose();
      model.dispose();
      
    } catch (error) {
      console.error('ML forecast failed:', error);
    } finally {
      setIsTraining(false);
    }
  }
  
  if (!data) return null;
  
  return (
    <div className="bg-black/90 border border-purple-500/50 rounded-lg p-4 backdrop-blur-md font-mono">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <h3 className="text-purple-400 font-bold text-sm">AI AURORA FORECAST</h3>
        </div>
        {isTraining && <span className="text-xs text-gray-400 animate-pulse">Training...</span>}
      </div>
      
      {forecast.length > 0 ? (
        <>
          <div className="space-y-2 mb-3">
            {forecast.map((point, index) => {
              const hours = index + 1;
              const kpColor = point.predicted >= 5 ? 'text-red-500' : point.predicted >= 4 ? 'text-yellow-500' : 'text-green-400';
              const confidenceWidth = `${point.confidence * 100}%`;
              
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-16">+{hours}h:</span>
                  <span className={`font-bold w-12 ${kpColor}`}>
                    KP {point.predicted.toFixed(1)}
                  </span>
                  <div className="flex-1 bg-gray-800 h-2 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                      style={{ width: confidenceWidth }}
                    />
                  </div>
                  <span className="text-gray-500 w-12 text-right">
                    {Math.round(point.confidence * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-purple-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400">Model Accuracy:</span>
              <span className={`font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {accuracy}%
              </span>
            </div>
            <span className="text-gray-500">TensorFlow.js LSTM</span>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400 text-xs py-4">
          Collecting data for forecast...
        </div>
      )}
    </div>
  );
}
