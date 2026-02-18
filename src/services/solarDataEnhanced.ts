/**
 * Enhanced Solar Data Service
 * Additional NASA/NOAA APIs for advanced solar visualization
 */

export interface XRayFluxData {
  time: string;
  flux: number;
  flareClass: 'A' | 'B' | 'C' | 'M' | 'X';
  intensity: number; // 0-1 scale for shader
}

export interface SunspotData {
  date: string;
  sunspotNumber: number;
  f107Flux: number;
  surfaceDetailLevel: number; // 0-1 scale
}

/**
 * Fetch real-time X-ray flux for flare intensity
 */
export async function fetchXRayFlux(): Promise<XRayFluxData | null> {
  try {
    const response = await fetch(
      'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json'
    );
    if (!response.ok) throw new Error('X-ray API failed');
    
    const data = await response.json();
    const latest = data[data.length - 1];
    
    // Parse flux value (e.g., "C1.5" -> class C, intensity 1.5)
    const fluxStr = latest?.max_class || 'B1.0';
    const flareClass = fluxStr[0];
    const intensity = parseFloat(fluxStr.substring(1)) || 1.0;
    
    // Convert to 0-1 scale (A=0, B=0.2, C=0.4, M=0.6, X=0.8+)
    const classMap: Record<string, number> = {
      A: 0.0, B: 0.2, C: 0.4, M: 0.6, X: 0.8
    };
    const baseLevel = classMap[flareClass] || 0.2;
    const normalizedIntensity = Math.min(baseLevel + (intensity / 10), 1.0);
    
    return {
      time: latest?.time_tag || new Date().toISOString(),
      flux: latest?.max_xrlong || 0,
      flareClass: flareClass as any,
      intensity: normalizedIntensity
    };
  } catch (error) {
    console.warn('X-ray flux fetch failed:', error);
    return null;
  }
}

/**
 * Fetch sunspot number for surface detail
 */
export async function fetchSunspotData(): Promise<SunspotData | null> {
  try {
    const response = await fetch(
      'https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json'
    );
    if (!response.ok) throw new Error('Sunspot API failed');
    
    const data = await response.json();
    const latest = data[data.length - 1];
    
    const sunspotNumber = parseFloat(latest?.['ssn']) || 50;
    const f107Flux = parseFloat(latest?.['f10.7']) || 120;
    
    // Map sunspot count to surface detail level (0-1)
    // Typical range: 0-200 sunspots
    const surfaceDetailLevel = Math.min(sunspotNumber / 200, 1.0);
    
    return {
      date: latest?.['time-tag'] || new Date().toISOString(),
      sunspotNumber,
      f107Flux,
      surfaceDetailLevel
    };
  } catch (error) {
    console.warn('Sunspot data fetch failed:', error);
    return null;
  }
}
