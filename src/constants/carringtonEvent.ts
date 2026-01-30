/**
 * Carrington Event (1859) Extreme Storm Preset
 * The most powerful geomagnetic storm in recorded history
 */

export interface CarringtonPreset {
  date: Date;
  solarWindSpeed: number; // km/s
  bzValue: number; // nT
  density: number; // p/cm³
  kpValue: number;
  dstValue: number; // nT
  description: string;
  visuals: {
    auroraRedDominance: number; // 0-1 (1 = 100% red)
    auroraIntensity: number; // Multiplier (normal = 1.0)
    auroraLatitudeExtent: number; // degrees (normal ~66°, Carrington ~18°)
    globalRedGlow: boolean;
    particleDensity: number; // Multiplier for solar wind particles
  };
  historicalContext: {
    witnesses: string[];
    impacts: string[];
    modernEquivalent: string;
    uniqueFeatures: string[];
  };
}

export const CARRINGTON_1859: CarringtonPreset = {
  date: new Date('1859-09-02T04:00:00Z'), // Peak of main phase
  solarWindSpeed: 2200, // Estimated from arrival time (17 hours after flare)
  bzValue: -90, // Extreme southward IMF
  density: 35, // High proton density
  kpValue: 9.5, // Off the scale
  dstValue: -1760, // Strongest ever measured (estimated)
  description: 'The most powerful geomagnetic storm in recorded history. Aurora visible in tropical regions, telegraph systems worldwide failed, and people could read newspapers by auroral light.',
  
  visuals: {
    auroraRedDominance: 0.85, // 85% red (630 nm oxygen emission at high altitude)
    auroraIntensity: 8.0, // 8x normal brightness
    auroraLatitudeExtent: 18, // Auroras seen at ~18° geomagnetic latitude (Havana, Honolulu)
    globalRedGlow: true, // Entire night side glows crimson
    particleDensity: 5.0, // 5x normal particle count for visual impact
  },
  
  historicalContext: {
    witnesses: [
      'Richard Carrington observed white-light solar flare on Sep 1, 1859 at 11:18 UT',
      'Auroras visible in Cuba (~23°N), Hawaii (~21°N), Colombia (~4°N)',
      'Rocky Mountain gold miners woke thinking it was dawn',
      'Telegraph operators received electric shocks, papers caught fire',
      'Compass needles swung wildly, navigation impossible',
      'People in Boston read newspapers by auroral light at 1 AM'
    ],
    
    impacts: [
      'Telegraph systems worldwide failed - sparks flew from equipment',
      'Some telegraph operators continued sending messages on "auroral power" alone',
      'Transformers (if they existed) would have melted instantly',
      'Modern power grid would suffer $2.6 trillion damage',
      'All satellites would be disabled or destroyed',
      'Global internet infrastructure would collapse',
      'Recovery time: 4-10 years for full restoration'
    ],
    
    modernEquivalent: 'If Carrington happened today: Power grids fail across continents, GPS stops working, airlines grounded, banking systems offline, satellites destroyed, $2.6 trillion economic damage, decades of recovery.',
    
    uniqueFeatures: [
      'First recorded "white-light" solar flare (visible to naked eye)',
      'Fastest CME ever: 17-hour Sun-to-Earth transit (normal: 3-4 days)',
      'Auroras bright enough to read by in middle of night',
      'Crimson/red auroras dominated (not typical green)',
      'Visible at geomagnetic equator (unprecedented)',
      'Telegraph "phantom messages" sent by induced currents',
      'Compass deviation up to 1° at equator',
      'Aurora borealis met aurora australis at equator'
    ]
  }
};

/**
 * Apply Carrington preset to current state
 */
export function applyCarringtonPreset() {
  return {
    ...CARRINGTON_1859,
    appliedAt: new Date(),
    mode: 'carrington-simulation',
    warnings: [
      'This is a SIMULATION of extreme historical event',
      'Actual values are estimates based on historical records',
      'Modern measurement systems did not exist in 1859'
    ]
  };
}

/**
 * Calculate derived extreme metrics for Carrington Event
 */
export function calculateCarringtonMetrics() {
  const { solarWindSpeed, bzValue, density } = CARRINGTON_1859;
  
  return {
    // Dynamic Pressure (ram pressure on magnetosphere)
    dynamicPressure: density * Math.pow(solarWindSpeed, 2) * 1.67e-6, // nPa
    
    // Electric Field (interplanetary)
    electricField: (solarWindSpeed * Math.abs(bzValue)) / 1000, // mV/m
    
    // Newell Coupling (energy transfer)
    newellCoupling: Math.pow(solarWindSpeed, 4/3) * Math.pow(Math.abs(bzValue), 2/3) * Math.pow(Math.sin(Math.PI/4), 8), // Extreme
    
    // Estimated Dst (ring current)
    estimatedDst: CARRINGTON_1859.dstValue, // -1760 nT
    
    // Aurora Oval Extent (geomagnetic latitude)
    auroraOvalBoundary: CARRINGTON_1859.visuals.auroraLatitudeExtent, // 18°
    
    // Magnetopause Compression (Earth radii from center)
    magnetopauseDistance: 8.0 / Math.pow(CARRINGTON_1859.visuals.particleDensity, 1/6), // ~4.7 RE (extreme compression)
    
    // Power Grid Risk (% of transformers at risk)
    powerGridRisk: 100, // Total collapse
    
    // Satellite Risk
    satelliteRisk: 100, // Complete loss of LEO and GEO assets
    
    // Aviation Radiation Dose (mSv at 35,000 ft)
    aviationDose: 12.0, // Annual limit in single flight
    
    // HF Radio Blackout Duration (hours)
    radioBlackout: 48, // Days of complete blackout
  };
}

/**
 * Get tropical locations that saw aurora during Carrington Event
 */
export function getCarringtonAuroraLocations() {
  return [
    { name: 'Havana, Cuba', lat: 23.1136, lon: -82.3666, report: 'Crimson auroras visible at zenith' },
    { name: 'Honolulu, Hawaii', lat: 21.3099, lon: -157.8581, report: 'Red glow filled northern sky' },
    { name: 'Cartagena, Colombia', lat: 10.3910, lon: -75.4794, report: 'Aurora seen near horizon' },
    { name: 'Panama City', lat: 8.9824, lon: -79.5199, report: 'Red light reported in north' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, report: 'Unusual red glow (disputed)' },
    { name: 'Queensland, Australia', lat: -27.4698, lon: 153.0251, report: 'Aurora australis to horizon' },
    { name: 'Santiago, Chile', lat: -33.4489, lon: -70.6693, report: 'Bright southern lights' },
    { name: 'Mexico City', lat: 19.4326, lon: -99.1332, report: 'Dawn-like glow at midnight' },
    { name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357, report: 'Red sky observed (unconfirmed)' },
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777, report: 'Reddish haze reported' }
  ];
}

/**
 * Get timeline of Carrington Event (Sep 1-3, 1859)
 */
export function getCarringtonTimeline() {
  return [
    {
      time: '1859-09-01T11:18:00Z',
      event: 'White-Light Solar Flare',
      description: 'Richard Carrington observes unprecedented solar flare visible to naked eye',
      type: 'FLARE',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-01T11:30:00Z',
      event: 'CME Launch',
      description: 'Massive coronal mass ejection launched toward Earth (estimated)',
      type: 'CME',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-01T17:00:00Z',
      event: 'Minor Aurora',
      description: 'First aurora sightings in northern US - precursor event',
      type: 'AURORA',
      severity: 'MODERATE'
    },
    {
      time: '1859-09-02T04:00:00Z',
      event: 'CME Impact',
      description: 'Main CME shock hits magnetosphere - 17 hour transit (normally 3-4 days)',
      type: 'IMPACT',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-02T05:00:00Z',
      event: 'Global Aurora Begins',
      description: 'Auroras erupt worldwide - visible from both poles to tropics',
      type: 'AURORA',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-02T06:00:00Z',
      event: 'Telegraph Failures Begin',
      description: 'Telegraph systems fail across North America and Europe',
      type: 'IMPACT',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-02T12:00:00Z',
      event: 'Peak Intensity',
      description: 'Aurora reaches maximum brightness - readable by its light',
      type: 'AURORA',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-03T02:00:00Z',
      event: 'Aurora Continues',
      description: 'Second night of extreme auroras - still visible in tropics',
      type: 'AURORA',
      severity: 'EXTREME'
    },
    {
      time: '1859-09-03T12:00:00Z',
      event: 'Gradual Recovery',
      description: 'Storm intensity begins to decrease',
      type: 'RECOVERY',
      severity: 'MODERATE'
    },
    {
      time: '1859-09-04T00:00:00Z',
      event: 'Storm Ends',
      description: 'Aurora returns to polar regions, telegraph service resumes',
      type: 'END',
      severity: 'LOW'
    }
  ];
}

/**
 * Educational facts about Carrington Event
 */
export function getCarringtonFacts() {
  return [
    '⚡ The Carrington Event is the strongest geomagnetic storm in recorded history (1859)',
    '🌟 Auroras were visible in Cuba, Hawaii, and near the equator',
    '📰 People in Boston read newspapers by auroral light at 1 AM',
    '⚙️ Telegraph systems failed worldwide - some operators received electric shocks',
    '🧭 Compass needles swung erratically, making navigation impossible',
    '💰 Modern equivalent: $2.6 trillion in economic damage',
    '🛰️ If it happened today, most satellites would be destroyed',
    '⚡ Power grids would fail across continents for months or years',
    '🔴 Dominant color was crimson/red (not typical green)',
    '⏱️ CME took only 17 hours to reach Earth (normally 3-4 days)',
    '🔬 First "white-light" solar flare ever observed',
    '🌍 Aurora borealis and aurora australis met at the equator',
    '📡 Modern GPS, internet, and banking would completely collapse',
    '✈️ All aircraft would be grounded due to navigation failures',
    '🏥 Hospital equipment dependent on power would fail',
    '🚰 Water pumps and treatment facilities would stop',
    '🔥 Transformers would catch fire from induced currents',
    '📱 Cell phone networks would be destroyed',
    '💾 Data centers would lose power - cloud data at risk',
    '🌡️ Estimated Dst index: -1760 nT (10x typical extreme storm)'
  ];
}
