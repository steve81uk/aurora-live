import * as THREE from 'three';

/**
 * Calculates the distance between two 3D positions
 * @param pos1 - First position (THREE.Vector3)
 * @param pos2 - Second position (THREE.Vector3)
 * @returns Object with distance in km, miles, and AU
 */
export function calculateDistance(pos1: THREE.Vector3, pos2: THREE.Vector3) {
  // Calculate Euclidean distance
  const distanceInScreenUnits = pos1.distanceTo(pos2);
  
  // Convert screen units back to AU (reverse of AU_TO_SCREEN_UNITS = 40)
  const distanceInAU = distanceInScreenUnits / 40;
  
  // Convert AU to kilometers (1 AU = 149,597,870.7 km)
  const distanceInKm = distanceInAU * 149597870.7;
  
  // Convert km to miles (1 km = 0.621371 miles)
  const distanceInMiles = distanceInKm * 0.621371;
  
  return {
    km: distanceInKm,
    miles: distanceInMiles,
    au: distanceInAU,
    screenUnits: distanceInScreenUnits
  };
}

/**
 * Formats a distance value with appropriate units and commas
 * @param value - Numeric value to format
 * @param unit - Unit string ('km', 'mi', 'AU')
 * @returns Formatted string (e.g., "1,234,567 km")
 */
export function formatDistance(value: number, unit: 'km' | 'mi' | 'AU'): string {
  if (value < 1000 && unit !== 'AU') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  if (unit === 'AU') {
    return `${value.toFixed(3)} AU`;
  }
  
  // For large numbers, use millions
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${millions.toFixed(2)}M ${unit}`;
  }
  
  // For thousands, use commas
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${unit}`;
}

/**
 * Calculates light travel time between two positions
 * @param distanceInKm - Distance in kilometers
 * @returns Object with time in various units
 */
export function calculateLightTravelTime(distanceInKm: number) {
  // Speed of light: ~299,792 km/s
  const speedOfLight = 299792;
  const timeInSeconds = distanceInKm / speedOfLight;
  
  if (timeInSeconds < 60) {
    return { value: timeInSeconds, unit: 'sec' };
  }
  
  const timeInMinutes = timeInSeconds / 60;
  if (timeInMinutes < 60) {
    return { value: timeInMinutes, unit: 'min' };
  }
  
  const timeInHours = timeInMinutes / 60;
  if (timeInHours < 24) {
    return { value: timeInHours, unit: 'hr' };
  }
  
  const timeInDays = timeInHours / 24;
  return { value: timeInDays, unit: 'days' };
}

/**
 * Estimates spacecraft travel time between two positions
 * @param distanceInKm - Distance in kilometers
 * @param probeType - Type of spacecraft ('parker' | 'voyager' | 'standard')
 * @returns Object with time in appropriate units
 */
export function calculateProbeTravelTime(
  distanceInKm: number,
  probeType: 'parker' | 'voyager' | 'standard' = 'standard'
) {
  // Average speeds (km/h)
  const speeds = {
    parker: 692000, // Parker Solar Probe (fastest, ~192 km/s at perihelion)
    voyager: 61200, // Voyager probes (~17 km/s)
    standard: 40000 // Typical deep space probe (~11 km/s)
  };
  
  const speed = speeds[probeType];
  const timeInHours = distanceInKm / speed;
  
  if (timeInHours < 24) {
    return { value: timeInHours, unit: 'hr', probeName: probeType };
  }
  
  const timeInDays = timeInHours / 24;
  if (timeInDays < 365) {
    return { value: timeInDays, unit: 'days', probeName: probeType };
  }
  
  const timeInYears = timeInDays / 365;
  return { value: timeInYears, unit: 'years', probeName: probeType };
}

/**
 * Generates a fun fact about the distance
 * @param distanceData - Distance object from calculateDistance
 * @param body1Name - Name of first body
 * @param body2Name - Name of second body
 * @returns Fun fact string
 */
export function getDistanceFunFact(
  distanceData: { km: number; miles: number; au: number },
  body1Name: string,
  body2Name: string
): string {
  const { km, au } = distanceData;
  
  // Earth circumference: 40,075 km
  const earthCircumferences = km / 40075;
  if (earthCircumferences >= 1) {
    return `${earthCircumferences.toFixed(1)}× Earth's circumference`;
  }
  
  // Distance to Moon: 384,400 km
  const moonDistances = km / 384400;
  if (moonDistances >= 0.1) {
    return `${moonDistances.toFixed(2)}× Earth-Moon distance`;
  }
  
  // For very close distances
  if (km < 10000) {
    return `About ${(km / 6371).toFixed(1)} Earth radii`;
  }
  
  // Default: Show AU comparison
  if (au > 0.1) {
    const percentOfAU = (au / 1.0) * 100;
    return `${percentOfAU.toFixed(1)}% of 1 AU`;
  }
  
  return `Very close in cosmic terms!`;
}
