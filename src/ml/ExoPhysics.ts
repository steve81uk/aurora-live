/**
 * EXO-PHYSICS ENGINE
 * Scales 1 AU (Earth) space weather data to outer planets.
 * @author steve81uk
 */

export interface ExoplanetTelemetry {
  distanceAU: number;
  solarWindDensity: number;
  solarWindSpeed: number;
  magneticFieldBt: number;
  dominantGas: string;
  auroraColour: string;
}

const PLANET_CONSTANTS = {
  Mars: { distanceAU: 1.52, gas: 'CO2 / Oxygen', colour: '#4169E1' }, // Patchy UV/Blue
  Jupiter: { distanceAU: 5.20, gas: 'Hydrogen / Helium', colour: '#FF00FF' }, // Balmer Pink/Purple
  Saturn: { distanceAU: 9.58, gas: 'Hydrogen', colour: '#DA70D6' }, // Orchid/Purple
  Uranus: { distanceAU: 19.20, gas: 'Hydrogen / Methane', colour: '#E0B0FF' }, // UV/Mauve
};

/**
 * Calculates local space weather telemetry based on Earth's current data
 */
export function calculateExoTelemetry(
  planetName: keyof typeof PLANET_CONSTANTS, 
  earthDensity: number, 
  earthSpeed: number, 
  earthBt: number
): ExoplanetTelemetry {
  const planet = PLANET_CONSTANTS[planetName];
  const r = planet.distanceAU;

  // 1. Density follows the Inverse Square Law
  const localDensity = earthDensity * (1 / Math.pow(r, 2));

  // 2. Speed remains roughly constant in the supersonic solar wind
  const localSpeed = earthSpeed; 

  // 3. Magnetic Field (Parker Spiral Approximation)
  // Radial field drops by 1/r^2, azimuthal drops by 1/r. 
  // Simplified magnitude scaling:
  const localBt = earthBt * Math.sqrt(Math.pow(1/(r*r), 2) + Math.pow(1/r, 2));

  return {
    distanceAU: r,
    solarWindDensity: localDensity,
    solarWindSpeed: localSpeed,
    magneticFieldBt: localBt,
    dominantGas: planet.gas,
    auroraColour: planet.colour
  };
}