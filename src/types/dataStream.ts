// Live Data Stream Types & Interfaces

export interface DataMetric {
  id: string;
  source: 'NOAA' | 'NASA' | 'DSCOVR' | 'GOES' | 'HEIMDALL' | 'COMPUTED';
  category: 'solar' | 'geomagnetic' | 'plasma' | 'radiation' | 'custom';
  name: string;
  mythicName?: {
    norse?: string;
    sheikah?: string;
  };
  value: number | string;
  unit: string;
  timestamp: Date;
  trend: 'rising' | 'falling' | 'stable';
  trendDelta: number; // % change from previous value
  status: 'safe' | 'warning' | 'critical';
  confidence: number; // 0-100
  description: string;
  formula?: string;
  historical?: number[]; // Last 5-10 values for sparkline
}

export interface DataStreamConfig {
  refreshInterval: number; // milliseconds
  maxCards: number;
  enableNotifications: boolean;
  alertThresholds: Record<string, number>;
}

export const METRIC_DEFINITIONS = {
  // Real NOAA/NASA Metrics
  KP_INDEX: {
    id: 'kp_index',
    name: 'Kp Index',
    unit: '',
    source: 'NOAA' as const,
    category: 'geomagnetic' as const,
    description: 'Planetary geomagnetic activity index (0-9)',
    formula: 'Average of 8 ground magnetometer stations',
    mythicName: { norse: 'Yggdrasil Tremor Index', sheikah: 'Shrine Network Resonance' },
  },
  SOLAR_WIND_SPEED: {
    id: 'solar_wind_speed',
    name: 'Solar Wind Speed',
    unit: 'km/s',
    source: 'DSCOVR' as const,
    category: 'plasma' as const,
    description: 'Velocity of solar wind plasma',
    formula: 'Direct measurement from DSCOVR L1',
    mythicName: { norse: 'Sköll Velocity', sheikah: 'Malice Current Speed' },
  },
  IMF_BZ: {
    id: 'imf_bz',
    name: 'IMF Bz',
    unit: 'nT',
    source: 'DSCOVR' as const,
    category: 'geomagnetic' as const,
    description: 'North-South magnetic field component',
    formula: 'Critical for aurora coupling (negative = storm)',
    mythicName: { norse: 'Bifröst Polarity', sheikah: 'Divine Field Alignment' },
  },
  PROTON_DENSITY: {
    id: 'proton_density',
    name: 'Proton Density',
    unit: 'p/cm³',
    source: 'DSCOVR' as const,
    category: 'plasma' as const,
    description: 'Solar wind particle density',
    formula: 'Direct measurement',
    mythicName: { norse: 'Aether Density', sheikah: 'Spirit Particle Count' },
  },
  
  // Novel Custom Metrics
  SKOLL_VELOCITY: {
    id: 'skoll_velocity',
    name: 'Sköll Hunt Status',
    unit: 'km/s',
    source: 'COMPUTED' as const,
    category: 'custom' as const,
    description: 'Mythic representation of solar wind',
    formula: 'Solar wind speed with threshold interpretation',
    mythicName: { norse: 'Sköll Velocity', sheikah: 'Wolf Spirit Speed' },
  },
  BIFROST_INDEX: {
    id: 'bifrost_index',
    name: 'Bifröst Power Index',
    unit: 'GW',
    source: 'COMPUTED' as const,
    category: 'custom' as const,
    description: 'Aurora energy input to magnetosphere',
    formula: 'Hemispheric Power × 1.2 + (Kp × 0.8)',
    mythicName: { norse: 'Bifröst Index', sheikah: 'Rainbow Bridge Energy' },
  },
  UHAAI: {
    id: 'uhaai',
    name: 'Upper Hemisphere Aurora Altitude',
    unit: 'km',
    source: 'COMPUTED' as const,
    category: 'custom' as const,
    description: 'Estimated altitude of aurora curtains',
    formula: 'Base(85km) + (Kp × 10km) + (|Bz| × 5km)',
    mythicName: { norse: 'Valhalla Height', sheikah: 'Spirit Curtain Altitude' },
  },
  MRCF: {
    id: 'mrcf',
    name: 'Magnetospheric Chaos Factor',
    unit: '',
    source: 'COMPUTED' as const,
    category: 'custom' as const,
    description: 'Turbulence in magnetic field',
    formula: 'StdDev(Bz[5min]) × 10 + Kp',
    mythicName: { norse: 'Midgard Serpent Stir', sheikah: 'Malice Turbulence' },
  },
  NEWELL_COUPLING: {
    id: 'newell_coupling',
    name: 'Newell Coupling Function',
    unit: 'kV',
    source: 'COMPUTED' as const,
    category: 'geomagnetic' as const,
    description: 'Energy transfer to magnetosphere',
    formula: 'v^(4/3) × Bt^(2/3) × sin^8(θ/2)',
    mythicName: { norse: 'Energy Channeling', sheikah: 'Power Conduit Efficiency' },
  },
};
