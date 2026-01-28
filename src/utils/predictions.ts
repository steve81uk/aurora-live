import type { Location } from '../types/aurora';

export interface ViewingRecommendation {
  score: number; // 0-100
  rating: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT' | 'EXCEPTIONAL';
  reasons: string[];
  bestTime: string;
  confidence: number; // 0-100
}

export function analyzeViewingConditions(
  kpValue: number,
  visibility: number,
  location: Location,
  solarWindSpeed: number,
  solarWindBz: number
): ViewingRecommendation {
  let score = 0;
  const reasons: string[] = [];

  // KP Index Analysis (0-40 points)
  if (kpValue >= 7) {
    score += 40;
    reasons.push('🔥 Severe geomagnetic storm - exceptional aurora likely');
  } else if (kpValue >= 5) {
    score += 30;
    reasons.push('⚡ Strong geomagnetic activity detected');
  } else if (kpValue >= 3) {
    score += 20;
    reasons.push('✨ Moderate activity - aurora possible');
  } else {
    score += 5;
    reasons.push('💤 Low activity - aurora unlikely');
  }

  // Magnetic Latitude (0-25 points)
  const magLat = Math.abs(location.magneticLat);
  if (magLat >= 65) {
    score += 25;
    reasons.push('📍 Excellent magnetic latitude');
  } else if (magLat >= 60) {
    score += 20;
    reasons.push('📍 Good magnetic latitude');
  } else if (magLat >= 55) {
    score += 15;
    reasons.push('📍 Moderate magnetic latitude');
  } else {
    score += 5;
    reasons.push('📍 Low magnetic latitude - harder to see');
  }

  // Visibility (0-20 points)
  if (visibility >= 80) {
    score += 20;
    reasons.push('☁️ Clear skies expected');
  } else if (visibility >= 60) {
    score += 15;
    reasons.push('☁️ Mostly clear');
  } else if (visibility >= 40) {
    score += 10;
    reasons.push('☁️ Partly cloudy');
  } else {
    score += 0;
    reasons.push('☁️ Poor visibility conditions');
  }

  // Solar Wind (0-15 points)
  if (solarWindSpeed >= 600) {
    score += 15;
    reasons.push('💨 Very fast solar wind');
  } else if (solarWindSpeed >= 500) {
    score += 10;
    reasons.push('💨 Fast solar wind');
  } else if (solarWindSpeed >= 400) {
    score += 5;
    reasons.push('💨 Moderate solar wind');
  }

  // Bz Component (Southward is best for aurora)
  if (solarWindBz < -5) {
    score += 10;
    reasons.push('🧲 Strong southward IMF - excellent for aurora');
  } else if (solarWindBz < 0) {
    score += 5;
    reasons.push('🧲 Southward IMF detected');
  }

  // Determine best viewing time based on local time
  const now = new Date();
  const localHour = now.getHours();
  let bestTime = '22:00 - 02:00'; // Default
  
  if (localHour >= 6 && localHour < 18) {
    bestTime = 'Tonight 22:00 - 02:00';
  } else if (localHour >= 18 && localHour < 22) {
    bestTime = 'Soon (22:00 - 02:00)';
  } else {
    bestTime = 'Now - Best viewing window active';
    score += 10; // Bonus for current prime time
    reasons.push('🌙 Prime viewing hours - look now!');
  }

  // Calculate confidence based on data quality
  const confidence = Math.min(100, score + (kpValue > 0 ? 20 : 0));

  // Determine rating
  let rating: ViewingRecommendation['rating'];
  if (score >= 85) rating = 'EXCEPTIONAL';
  else if (score >= 70) rating = 'EXCELLENT';
  else if (score >= 50) rating = 'GOOD';
  else if (score >= 30) rating = 'FAIR';
  else rating = 'POOR';

  return {
    score: Math.min(100, score),
    rating,
    reasons,
    bestTime,
    confidence
  };
}

export function predictPeakActivity(predictions: any[]): { time: string; kp: number; likelihood: string } | null {
  if (!predictions || predictions.length === 0) return null;

  // Find highest Kp in next 24 hours
  let maxKp = 0;
  let maxTime = '';

  predictions.forEach(pred => {
    const predTime = new Date(pred.timestamp);
    const now = new Date();
    const hoursFromNow = (predTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursFromNow >= 0 && hoursFromNow <= 24 && pred.kpValue > maxKp) {
      maxKp = pred.kpValue;
      maxTime = pred.timestamp;
    }
  });

  if (maxKp === 0) return null;

  let likelihood = 'Low';
  if (maxKp >= 7) likelihood = 'Very High';
  else if (maxKp >= 5) likelihood = 'High';
  else if (maxKp >= 3) likelihood = 'Moderate';

  return {
    time: new Date(maxTime).toLocaleString(),
    kp: maxKp,
    likelihood
  };
}
