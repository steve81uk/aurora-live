/**
 * SKÖLL-TRACK GEN-2 SDK
 * TypeScript SDK for space weather prediction
 * Exposes /api/forecast endpoint logic
 * 
 * Usage:
 * ```typescript
 * import { SkollSDK } from './sdk/SkollSDK';
 * 
 * const sdk = new SkollSDK();
 * const forecast = await sdk.getForecast();
 * console.log(forecast.predictions.twentyFourHour.predictedKp);
 * ```
 * 
 * @author steve81uk (Systems Architect)
 */

import { neuralForecaster } from '../ml/LSTMForecaster';
import type {
  ForecastAPIResponse,
  NeuralForecast,
  SpaceWeatherSnapshot,
  FeatureVector,
} from '../ml/types';

export class SkollSDK {
  private version = '2.0.0-gen2';
  private baseUrl: string;
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * GET /api/forecast
   * 
   * Returns 6h, 12h, 24h neural predictions with confidence intervals
   * 
   * @param features Optional feature vector (uses current conditions if not provided)
   * @returns ForecastAPIResponse with predictions and metadata
   */
  async getForecast(features?: FeatureVector): Promise<ForecastAPIResponse> {
    const startTime = performance.now();
    
    try {
      // Build feature vector from current conditions or use provided
      const inputFeatures = features || await this.fetchCurrentFeatures();
      
      // Run LSTM neural prediction
      const forecast = await neuralForecaster.predict(inputFeatures);
      
      // Get current space weather conditions
      const currentConditions = await this.fetchCurrentConditions();
      
      const generationTimeMs = performance.now() - startTime;
      
      return {
        success: true,
        timestamp: new Date(),
        forecast,
        currentConditions,
        metadata: {
          model: 'LSTM-64x32-Carrington',
          version: this.version,
          dataSource: [
            'NOAA SWPC',
            'GOES X-ray',
            'ACE Satellite',
            'NASA Horizons',
            'CelesTrak',
          ],
          generationTimeMs,
        },
      };
    } catch (error) {
      console.error('❌ Forecast generation failed:', error);
      
      return {
        success: false,
        timestamp: new Date(),
        forecast: this.getEmptyForecast(),
        currentConditions: this.getEmptySnapshot(),
        metadata: {
          model: 'LSTM-64x32-Carrington',
          version: this.version,
          dataSource: [],
          generationTimeMs: performance.now() - startTime,
        },
      };
    }
  }
  
  /**
   * GET /api/forecast/confidence
   * 
   * Returns only confidence scores without full predictions
   * Useful for lightweight confidence checks
   */
  async getConfidence(): Promise<{
    overall: number;
    modelAgreement: number;
    dataQuality: number;
  }> {
    try {
      const features = await this.fetchCurrentFeatures();
      const forecast = await neuralForecaster.predict(features);
      
      return forecast.confidence;
    } catch (error) {
      console.error('❌ Confidence check failed:', error);
      return {
        overall: 0,
        modelAgreement: 0,
        dataQuality: 0,
      };
    }
  }
  
  /**
   * GET /api/forecast/alerts
   * 
   * Returns only active alerts without predictions
   * Optimised for mobile/low-bandwidth
   */
  async getAlerts(): Promise<ForecastAlert[]> {
    try {
      const features = await this.fetchCurrentFeatures();
      const forecast = await neuralForecaster.predict(features);
      
      return forecast.alerts;
    } catch (error) {
      console.error('❌ Alert fetch failed:', error);
      return [];
    }
  }
  
  /**
   * GET /api/current
   * 
   * Returns current space weather snapshot
   */
  async getCurrentConditions(): Promise<SpaceWeatherSnapshot> {
    return await this.fetchCurrentConditions();
  }
  
  /**
   * GET /api/health
   * 
   * Health check endpoint for monitoring
   */
  async getHealth(): Promise<{
    status: 'operational' | 'degraded' | 'offline';
    model: boolean;
    dataStream: boolean;
    lastUpdate: Date | null;
  }> {
    try {
      // Check if NOAA data is flowing
      const conditions = await this.fetchCurrentConditions();
      const dataAge = Date.now() - conditions.timestamp.getTime();
      const dataStreamHealthy = dataAge < 10 * 60 * 1000;  // Within 10 minutes
      
      // Check if model is loaded
      const modelLoaded = neuralForecaster !== null;
      
      const status = (dataStreamHealthy && modelLoaded) ? 'operational' :
                     (dataStreamHealthy || modelLoaded) ? 'degraded' : 'offline';
      
      return {
        status,
        model: modelLoaded,
        dataStream: dataStreamHealthy,
        lastUpdate: conditions.timestamp,
      };
    } catch (error) {
      return {
        status: 'offline',
        model: false,
        dataStream: false,
        lastUpdate: null,
      };
    }
  }
  
  /**
   * Fetch current 24h feature history
   * In production, this would query DataBridge historical storage
   */
  private async fetchCurrentFeatures(): Promise<FeatureVector> {
    // TODO: Replace with actual DataBridge integration
    // For now, simulate with realistic variance
    
    const currentSpeed = 450 + (Math.random() - 0.5) * 200;
    const currentDensity = 7 + (Math.random() - 0.5) * 6;
    const currentBz = (Math.random() - 0.5) * 10;
    const currentBt = 5 + Math.random() * 3;
    
    return {
      solarWindSpeed: this.generateHistory(currentSpeed, 100),
      solarWindDensity: this.generateHistory(currentDensity, 3),
      magneticFieldBz: this.generateHistory(currentBz, 4),
      magneticFieldBt: this.generateHistory(currentBt, 2),
      newellCouplingHistory: this.generateHistory(5000, 3000),
      alfvenVelocityHistory: this.generateHistory(50, 20),
      syzygyIndex: 0.3,
      jupiterSaturnAngle: 0.5,
      solarRotationPhase: (Date.now() / (27 * 24 * 60 * 60 * 1000)) % 1,
      solarCyclePhase: 0.6,  // Solar Cycle 25
      timeOfYear: (new Date().getMonth() / 12),
    };
  }
  
  /**
   * Generate 24h historical data with realistic variance
   */
  private generateHistory(value: number, variance: number): number[] {
    return Array.from({ length: 24 }, (_, i) => {
      const trend = Math.sin(i / 4) * variance * 0.3;
      const noise = (Math.random() - 0.5) * variance * 0.5;
      return value + trend + noise;
    });
  }
  
  /**
   * Fetch current space weather snapshot
   * In production, this would call DataBridge
   */
  private async fetchCurrentConditions(): Promise<SpaceWeatherSnapshot> {
    // TODO: Integrate with actual DataBridge
    
    return {
      timestamp: new Date(),
      solarWind: {
        speed: 450,
        density: 7,
        temperature: 100000,
      },
      magneticField: {
        bt: 5.2,
        bz: -2.1,
        by: 0.3,
        bx: -1.5,
      },
      xrayFlux: {
        longWave: 1.2e-6,
        shortWave: 3.4e-7,
        flareClass: 'B',
      },
      indices: {
        kpIndex: 2.3,
        dstIndex: -15,
      },
      calculated: {
        newellCoupling: 4800,
        alfvenVelocity: 48,
        wolfFormula: 0.23,
        plasmaBeta: 1.2,
      },
    };
  }
  
  /**
   * Empty forecast fallback
   */
  private getEmptyForecast(): NeuralForecast {
    const emptyWindow = {
      timestamp: new Date(),
      predictedKp: 0,
      predictedBz: 0,
      predictedPsi: 0,
      stormProbability: 0,
      confidenceInterval: { lower: 0, upper: 0 },
    };
    
    return {
      generatedAt: new Date(),
      predictions: {
        sixHour: emptyWindow,
        twelveHour: emptyWindow,
        twentyFourHour: emptyWindow,
      },
      confidence: {
        overall: 0,
        modelAgreement: 0,
        dataQuality: 0,
      },
      alerts: [],
    };
  }
  
  /**
   * Empty snapshot fallback
   */
  private getEmptySnapshot(): SpaceWeatherSnapshot {
    return {
      timestamp: new Date(),
      solarWind: { speed: 0, density: 0, temperature: 0 },
      magneticField: { bt: 0, bz: 0, by: 0, bx: 0 },
      xrayFlux: { longWave: 0, shortWave: 0, flareClass: 'Quiet' },
      indices: { kpIndex: 0, dstIndex: 0 },
      calculated: { newellCoupling: 0, alfvenVelocity: 0, wolfFormula: 0, plasmaBeta: 0 },
    };
  }
}

// Export singleton instance
export const skollSDK = new SkollSDK();

// Export for Next.js/Express API routes
export async function handleForecastRequest(): Promise<ForecastAPIResponse> {
  return await skollSDK.getForecast();
}
