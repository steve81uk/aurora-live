export interface KpIndexData {
  id: string;
  timestamp: string;
  kpValue: number;
  status: string;
}

export interface Location {
  name: string;
  lat: number;
  lon: number;
  magneticLat: number;
  hemisphere: 'north' | 'south';
}

export interface AuroraVisibility {
  percentage: number;
  quality: string;
  text: string;
}

export interface SolarWind {
  speed: number;
  density: number;
  bz: number;
}

export interface ForecastData {
  current: KpIndexData;
  prediction: KpIndexData[];
}
