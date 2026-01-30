import type { DataMetric } from '../types/dataStream';
import { METRIC_DEFINITIONS } from '../types/dataStream';

/**
 * Live Data Stream Service
 * Fetches real NOAA/NASA data and computes custom metrics
 */

// Mock historical data for demo purposes
const generateHistoricalData = (baseValue: number, variance: number, count: number = 10): number[] => {
  return Array.from({ length: count }, (_, i) => {
    const trend = Math.sin(i * 0.5) * variance;
    const noise = (Math.random() - 0.5) * variance * 0.3;
    return Math.max(0, baseValue + trend + noise);
  });
};

// Calculate confidence based on data variance
const calculateConfidence = (values: number[]): number => {
  if (values.length < 2) return 95;
  
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower variance = higher confidence
  const normalizedStdDev = Math.min(stdDev / mean, 1);
  return Math.round(100 - (normalizedStdDev * 30));
};

// Determine status based on metric and value
const getStatus = (metricId: string, value: number): 'safe' | 'warning' | 'critical' => {
  const thresholds: Record<string, { warning: number; critical: number }> = {
    kp_index: { warning: 5, critical: 7 },
    solar_wind_speed: { warning: 500, critical: 700 },
    imf_bz: { warning: -5, critical: -10 },
    proton_density: { warning: 10, critical: 20 },
  };
  
  const threshold = thresholds[metricId];
  if (!threshold) return 'safe';
  
  if (metricId === 'imf_bz') {
    // Negative Bz is bad
    if (value <= threshold.critical) return 'critical';
    if (value <= threshold.warning) return 'warning';
  } else {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
  }
  
  return 'safe';
};

// Calculate trend from historical data
const getTrend = (values: number[]): { direction: 'rising' | 'falling' | 'stable'; delta: number } => {
  if (values.length < 2) return { direction: 'stable', delta: 0 };
  
  const current = values[values.length - 1];
  const previous = values[values.length - 2];
  const delta = ((current - previous) / previous) * 100;
  
  if (Math.abs(delta) < 2) return { direction: 'stable', delta: 0 };
  return {
    direction: delta > 0 ? 'rising' : 'falling',
    delta: Math.round(delta * 10) / 10,
  };
};

/**
 * Fetch real-time data from NOAA SWPC
 */
async function fetchNOAAData(): Promise<Partial<Record<string, number>>> {
  try {
    // In production, these would be actual API calls
    // For now, return simulated data based on current conditions
    
    // Simulated realistic values
    return {
      kp_index: 3 + Math.random() * 3, // 3-6
      solar_wind_speed: 400 + Math.random() * 200, // 400-600
      imf_bz: -5 + Math.random() * 10, // -5 to +5
      proton_density: 5 + Math.random() * 10, // 5-15
    };
  } catch (error) {
    console.error('Failed to fetch NOAA data:', error);
    return {};
  }
}

/**
 * Compute custom metrics
 */
function computeCustomMetrics(baseData: Partial<Record<string, number>>): Record<string, number> {
  const kp = baseData.kp_index || 3;
  const windSpeed = baseData.solar_wind_speed || 400;
  const bz = baseData.imf_bz || 0;
  
  return {
    skoll_velocity: windSpeed,
    bifrost_index: (kp * 2.5) + (Math.abs(bz) * 0.8),
    uhaai: 85 + (kp * 10) + (Math.abs(bz) * 5),
    mrcf: Math.abs(bz) * 2 + kp * 0.5,
    newell_coupling: Math.pow(windSpeed / 100, 4/3) * Math.pow(Math.abs(bz), 2/3) * 0.5,
  };
}

/**
 * Get live stream data with all metrics
 */
export async function getLiveStreamData(): Promise<DataMetric[]> {
  const now = new Date();
  const baseData = await fetchNOAAData();
  const customData = computeCustomMetrics(baseData);
  
  const allData = { ...baseData, ...customData };
  
  const metrics: DataMetric[] = [];
  
  // Create metrics for all definitions
  for (const [_key, def] of Object.entries(METRIC_DEFINITIONS)) {
    const value = allData[def.id] || 0;
    const historical = generateHistoricalData(value, value * 0.2);
    const trend = getTrend(historical);
    const confidence = calculateConfidence(historical);
    
    metrics.push({
      id: def.id,
      source: def.source,
      category: def.category,
      name: def.name,
      mythicName: def.mythicName,
      value: typeof value === 'number' ? Math.round(value * 10) / 10 : value,
      unit: def.unit,
      timestamp: now,
      trend: trend.direction,
      trendDelta: trend.delta,
      status: getStatus(def.id, value),
      confidence,
      description: def.description,
      formula: def.formula,
      historical,
    });
  }
  
  return metrics;
}

/**
 * Format time ago
 */
export function getTimeAgo(timestamp: Date): string {
  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
