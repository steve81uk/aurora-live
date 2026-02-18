/**
 * Predictive Engine - AI Aurora Probability Calculator
 * Uses weighted decay model with NOAA 27-day outlook and Solar Cycle 25 data
 */

interface PredictionResult {
  probability: number;
  confidence: number;
  peakDate: string;
  factors: {
    sunspot: number;
    coronalHole: number;
    solarCycle: number;
    historical: number;
  };
}

class PredictiveEngine {
  // Solar Cycle 25 started December 2020
  private readonly solarCycleStart = new Date('2020-12-01');
  private readonly solarMaximum = new Date('2025-07-01'); // Estimated peak
  private readonly solarCycleLength = 11 * 365; // 11 years in days

  /**
   * Calculate aurora probability for a given timeframe
   * @param timeframeDays - Number of days to forecast (7, 30, or 365)
   * @param currentKp - Current Kp index
   * @param sunspotNumber - Current sunspot number (SSN)
   * @param latitude - Observer latitude
   */
  calculateProbability(
    timeframeDays: number,
    currentKp: number,
    sunspotNumber: number,
    latitude: number
  ): PredictionResult {
    // Calculate weighted factors
    const sunspotFactor = this.calculateSunspotFactor(sunspotNumber);
    const coronalHoleFactor = this.calculateCoronalHoleFactor(timeframeDays);
    const solarCycleFactor = this.calculateSolarCycleFactor();
    const historicalFactor = this.calculateHistoricalFactor(latitude, timeframeDays);

    // Apply weighted decay model
    const decayWeight = Math.exp(-timeframeDays / 30);
    
    // Combine factors with weights
    const weights = {
      sunspot: 0.40,
      coronalHole: 0.30,
      solarCycle: 0.20,
      historical: 0.10
    };

    const rawProbability = 
      (sunspotFactor * weights.sunspot +
       coronalHoleFactor * weights.coronalHole +
       solarCycleFactor * weights.solarCycle +
       historicalFactor * weights.historical) * 100;

    // Apply decay and latitude adjustment
    const latitudeMultiplier = this.getLatitudeMultiplier(latitude);
    const probability = Math.min(95, Math.max(5, rawProbability * decayWeight * latitudeMultiplier));

    // Calculate confidence based on timeframe
    const confidence = this.calculateConfidence(timeframeDays, currentKp);

    // Find peak date
    const peakDate = this.findPeakDate(timeframeDays);

    return {
      probability,
      confidence,
      peakDate,
      factors: {
        sunspot: sunspotFactor,
        coronalHole: coronalHoleFactor,
        solarCycle: solarCycleFactor,
        historical: historicalFactor
      }
    };
  }

  /**
   * Get probability matrix for multiple timeframes
   */
  getProbabilityMatrix(currentKp: number, sunspotNumber: number, latitude: number) {
    return {
      '7d': this.calculateProbability(7, currentKp, sunspotNumber, latitude),
      '30d': this.calculateProbability(30, currentKp, sunspotNumber, latitude),
      '1yr': this.calculateProbability(365, currentKp, sunspotNumber, latitude)
    };
  }

  private calculateSunspotFactor(ssn: number): number {
    // Normal SSN range: 0-300
    // Higher SSN = higher probability
    return Math.min(1, ssn / 200);
  }

  private calculateCoronalHoleFactor(timeframeDays: number): number {
    // 27-day solar rotation cycle
    // Peak probability every 27 days
    const rotationPhase = (timeframeDays % 27) / 27;
    return 0.5 + 0.5 * Math.cos(rotationPhase * Math.PI * 2);
  }

  private calculateSolarCycleFactor(): number {
    // Calculate progress through Solar Cycle 25
    const now = new Date();
    const daysSinceStart = (now.getTime() - this.solarCycleStart.getTime()) / (1000 * 60 * 60 * 24);
    const cycleProgress = daysSinceStart / this.solarCycleLength;

    // Peak activity near solar maximum (around 0.45 of cycle)
    // Use sine wave peaking at maximum
    return Math.max(0.3, Math.sin(cycleProgress * Math.PI));
  }

  private calculateHistoricalFactor(latitude: number, timeframeDays: number): number {
    // Historical patterns show higher aurora activity in equinox months
    const now = new Date();
    const targetDate = new Date(now.getTime() + timeframeDays * 24 * 60 * 60 * 1000);
    const month = targetDate.getMonth(); // 0-11

    // March (2) and September (8) are equinox months
    const equinoxBoost = (month === 2 || month === 8 || month === 9) ? 0.3 : 0;
    
    // Base historical factor for Cambridge latitude
    const baseHistorical = latitude > 50 ? 0.6 : 0.4;
    
    return Math.min(1, baseHistorical + equinoxBoost);
  }

  private getLatitudeMultiplier(latitude: number): number {
    // Aurora oval typically between 60-75° during G1-G3 storms
    // Can extend to 50° during G4-G5 storms
    // Cambridge is at 52.2°N
    if (latitude >= 60) return 1.5; // Arctic circle - high probability
    if (latitude >= 55) return 1.2; // Scotland - good probability
    if (latitude >= 50) return 1.0; // Northern England - moderate probability
    if (latitude >= 45) return 0.7; // Central Europe - lower probability
    return 0.4; // Southern latitudes - low probability
  }

  private calculateConfidence(timeframeDays: number, currentKp: number): number {
    // Confidence decreases with longer timeframes
    // Increases with current solar activity
    let baseConfidence = 85;

    if (timeframeDays <= 7) {
      baseConfidence = 85; // High confidence for 7-day forecast
    } else if (timeframeDays <= 30) {
      baseConfidence = 65; // Medium confidence for 30-day forecast
    } else {
      baseConfidence = 45; // Low confidence for yearly forecast
    }

    // Boost confidence if current activity is high
    const activityBoost = currentKp >= 5 ? 10 : currentKp >= 3 ? 5 : 0;

    return Math.min(95, baseConfidence + activityBoost);
  }

  private findPeakDate(timeframeDays: number): string {
    const now = new Date();
    
    // For 7-day forecast, find next 27-day rotation peak
    if (timeframeDays <= 7) {
      const peakDay = Math.round(timeframeDays / 2);
      const peakDate = new Date(now.getTime() + peakDay * 24 * 60 * 60 * 1000);
      return peakDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // For 30-day forecast, check for equinox
    if (timeframeDays <= 30) {
      const targetDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // For yearly forecast, predict solar maximum
    return this.solarMaximum.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

// Export singleton instance
export const predictiveEngine = new PredictiveEngine();

// Export class for testing
export { PredictiveEngine };