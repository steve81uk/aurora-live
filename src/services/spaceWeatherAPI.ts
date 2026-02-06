// Real NOAA Space Weather API Integration

export interface SpaceWeatherData {
  solarWind: {
    speed: number;      // km/s
    density: number;    // particles/cm³
    temperature: number; // Kelvin
    bz: number;         // nanoTesla
  };
  kpIndex: number;      // 0-9 scale
  timestamp: Date;
}

export async function fetchRealSpaceWeather(): Promise<SpaceWeatherData> {
  try {
    // NOAA Real-time Solar Wind
    const windResponse = await fetch('https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json');
    const windData = await windResponse.json();
    const latest = windData[windData.length - 1];

    // NOAA KP Index
    const kpResponse = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
    const kpData = await kpResponse.json();
    const latestKp = kpData[kpData.length - 1];

    return {
      solarWind: {
        speed: parseFloat(latest.wind_speed) || 400,
        density: parseFloat(latest.density) || 5,
        temperature: parseFloat(latest.temperature) || 100000,
        bz: parseFloat(latest.bz) || 0,
      },
      kpIndex: parseFloat(latestKp.kp_index) || 2,
      timestamp: new Date(latest.time_tag),
    };
  } catch (error) {
    console.error('Failed to fetch real space weather:', error);
    // Return safe defaults if API fails
    return {
      solarWind: { speed: 400, density: 5, temperature: 100000, bz: 0 },
      kpIndex: 2,
      timestamp: new Date(),
    };
  }
}