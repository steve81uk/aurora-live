/**
 * SKÖLL-TRACK GEN-2 - ML TYPE DEFINITIONS
 * Neural forecasting types for space weather prediction
 * @author steve81uk (Systems Architect)
 */

export interface SpaceWeatherSnapshot {
  timestamp: Date;
  solarWind: {
    speed: number;      // km/s
    density: number;    // particles/cm³
    temperature: number; // Kelvin
  };
  magneticField: {
    bt: number;         // nT (total)
    bz: number;         // nT (north-south component)
    by: number;         // nT
    bx: number;         // nT
  };
  xrayFlux: {
    longWave: number;   // W/m²
    shortWave: number;  // W/m²
    flareClass: 'A' | 'B' | 'C' | 'M' | 'X' | 'Quiet';
  };
  indices: {
    kpIndex: number;    // 0-9
    dstIndex: number;   // nT
  };
  calculated: {
    newellCoupling: number;     // kW
    alfvenVelocity: number;     // km/s
    wolfFormula: number;        // Ψ - Infrastructure Fatigue
    plasmaBeta: number;         // Dimensionless
  };
}

export interface PlanetaryAlignment {
  timestamp: Date;
  syzygyProbability: number;  // 0-1 (how aligned planets are)
  sunEarthMoonAngle: number;  // degrees
  jupiterSaturnAngle: number; // degrees (giant planets affect solar mag field)
  mercuryTransit: boolean;    // Near-Sun gravitational effects
}

export interface HistoricalEvent {
  date: Date;
  name: string;
  severity: 'Minor' | 'Moderate' | 'Strong' | 'Severe' | 'Extreme';
  peakKp: number;
  maxBz: number;              // Most negative value
  auroras: string[];          // Locations where auroras were visible
  infrastructureDamage: string[];
}

export interface NeuralForecast {
  generatedAt: Date;
  predictions: {
    sixHour: PredictionWindow;
    twelveHour: PredictionWindow;
    twentyFourHour: PredictionWindow;
  };
  confidence: {
    overall: number;          // 0-1
    modelAgreement: number;   // 0-1 (ensemble consensus)
    dataQuality: number;      // 0-1 (how fresh/complete input data is)
  };
  alerts: ForecastAlert[];
}

export interface PredictionWindow {
  timestamp: Date;              // When this prediction is for
  predictedKp: number;          // Expected Kp Index
  predictedBz: number;          // Expected IMF Bz
  predictedPsi: number;         // Infrastructure Fatigue Coefficient
  stormProbability: number;     // 0-1 (chance of Kp >= 5)
  confidenceInterval: {
    lower: number;              // 95% CI lower bound
    upper: number;              // 95% CI upper bound
  };
}

export interface ForecastAlert {
  severity: 'Info' | 'Watch' | 'Warning' | 'Critical';
  message: string;
  probability: number;          // 0-1
  timeWindow: {
    start: Date;
    end: Date;
  };
  affectedRegions: string[];    // Geographic areas at risk
}

export interface TrainingConfig {
  modelName: string;
  architecture: 'LSTM' | 'GRU' | 'Transformer' | 'Ensemble';
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  earlyStoppingPatience: number;
}

export interface ModelWeights {
  version: string;
  trainedOn: Date;
  eventSignatures: {
    carrington1859: number[];   // Weights tuned for Carrington-level events
    halloween2003: number[];    // Halloween Storm
    bastilleDay2000: number[];  // Bastille Day Event
  };
  architecture: {
    inputShape: number[];
    lstmUnits: number[];
    denseUnits: number[];
    dropout: number;
  };
}

export interface GroundTruth {
  predicted: SpaceWeatherSnapshot;
  actual: SpaceWeatherSnapshot;
  error: {
    kpError: number;
    bzError: number;
    psiError: number;
  };
  timestamp: Date;
}

/**
 * Feature vector for LSTM input (normalized)
 */
export interface FeatureVector {
  // Time series features (24h history, 1-hour intervals = 24 values each)
  solarWindSpeed: number[];      // Last 24 hours
  solarWindDensity: number[];
  magneticFieldBz: number[];
  magneticFieldBt: number[];
  
  // Derived physics features
  newellCouplingHistory: number[];
  alfvenVelocityHistory: number[];
  
  // Planetary alignment features (current snapshot)
  syzygyIndex: number;           // 0-1
  jupiterSaturnAngle: number;    // Normalized 0-1
  
  // Temporal features
  solarRotationPhase: number;    // 0-1 (27-day cycle)
  solarCyclePhase: number;       // 0-1 (11-year cycle)
  timeOfYear: number;            // 0-1 (seasonal Earth-Sun distance)
}

/**
 * SDK Response format for /api/forecast endpoint
 */
export interface ForecastAPIResponse {
  success: boolean;
  timestamp: Date;
  forecast: NeuralForecast;
  currentConditions: SpaceWeatherSnapshot;
  metadata: {
    model: string;
    version: string;
    dataSource: string[];
    generationTimeMs: number;
  };
}
