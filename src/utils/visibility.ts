import type { Location, AuroraVisibility } from '../types/aurora';

/**
 * Calculates aurora visibility percentage based on Kp index and magnetic latitude.
 * 
 * The auroral oval is centered around ~66° magnetic latitude at quiet conditions (Kp=0).
 * As geomagnetic activity increases, the oval expands equatorward by approximately
 * 2° per Kp index point.
 * 
 * Formula: Auroral boundary = 66° - (Kp × 2°)
 * 
 * @param kp - Planetary Kp index (0-9)
 * @param magneticLat - Observer's magnetic latitude in degrees (positive for north)
 * @returns Visibility percentage (0-100)
 * 
 * @example
 * // At Kp=5, aurora visible down to 56° magnetic latitude
 * calculateAuroraVisibility(5, 58) // Returns high percentage (well within oval)
 * calculateAuroraVisibility(5, 50) // Returns 0 (too far south)
 */
export function calculateAuroraVisibility(kp: number, magneticLat: number): number {
  // Use absolute value to handle both hemispheres
  const absLat = Math.abs(magneticLat);
  
  // Calculate the equatorward boundary of the auroral oval
  const auroralBoundary = 66 - (kp * 2);
  
  // If observer is equatorward of the boundary, no visibility
  if (absLat < auroralBoundary) {
    return 0;
  }
  
  // Calculate how far poleward of the boundary the observer is
  const distanceIntoBand = absLat - auroralBoundary;
  
  // The auroral oval has a width of roughly 6-10 degrees
  // Peak visibility is within the band, declining at edges
  const optimalBandWidth = 8;
  
  // Calculate percentage: 100% at center, declining linearly outside
  let percentage: number;
  if (distanceIntoBand <= optimalBandWidth) {
    // Within or near the optimal band
    percentage = Math.min(100, 50 + (distanceIntoBand / optimalBandWidth) * 50);
  } else {
    // Too far poleward (overhead aurora, less dramatic)
    const excessDistance = distanceIntoBand - optimalBandWidth;
    percentage = Math.max(30, 100 - (excessDistance * 5));
  }
  
  // Boost percentage for higher Kp values (brighter, more active)
  const kpBonus = Math.min(20, kp * 2);
  percentage = Math.min(100, percentage + kpBonus);
  
  return Math.round(percentage);
}

/**
 * Converts visibility percentage to a human-readable quality rating.
 * 
 * @param percentage - Visibility percentage (0-100)
 * @returns Quality rating string
 */
export function getVisibilityQuality(percentage: number): string {
  if (percentage >= 75) return 'Excellent';
  if (percentage >= 50) return 'Good';
  if (percentage >= 25) return 'Possible';
  return 'Unlikely';
}

/**
 * Calculates the optimal viewing time for aurora at a given location.
 * 
 * Aurora is typically most visible around local magnetic midnight, when the
 * observer is on the night side of Earth facing the auroral oval. This function
 * uses local midnight as a proxy for magnetic midnight.
 * 
 * In reality, magnetic midnight can differ from local midnight by up to ±2 hours
 * depending on longitude and magnetic declination, but local midnight provides
 * a reasonable approximation for planning purposes.
 * 
 * @param location - Observer's location with lat/lon
 * @param date - Target date for viewing
 * @returns Optimal viewing time (approximately local midnight)
 */
export function getOptimalViewingTime(_location: Location, date: Date): Date {
  // Create a new date at local midnight for the given date
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  
  // Advance to next midnight if current time is past midnight today
  if (date.getTime() > midnight.getTime()) {
    midnight.setDate(midnight.getDate() + 1);
  }
  
  // Optimal viewing is typically 22:00 to 02:00, centered around midnight
  // Return midnight as the peak time
  return midnight;
}

/**
 * Returns the equatorward boundary of the auroral oval in geomagnetic latitude degrees.
 * Based on NOAA Kp-to-latitude mapping: boundary ≈ 66° - (Kp × 2°)
 *
 * @param kp - Planetary Kp index (0-9)
 * @returns Equatorward boundary latitude in degrees
 */
export function getAuroraEquatorwardBoundary(kp: number): number {
  return Math.max(50, 66 - kp * 2);
}


/**
 * Combines Kp and magnetic latitude to produce a complete visibility assessment.
 * 
 * @param kp - Planetary Kp index (0-9)
 * @param magneticLat - Observer's magnetic latitude in degrees
 * @returns Complete aurora visibility information
 */
export function getAuroraVisibility(kp: number, magneticLat: number): AuroraVisibility {
  const percentage = calculateAuroraVisibility(kp, magneticLat);
  const quality = getVisibilityQuality(percentage);
  
  let text: string;
  if (percentage === 0) {
    text = 'Aurora not visible from your location at current activity levels.';
  } else if (percentage < 25) {
    text = 'Aurora may be visible on the horizon under ideal conditions.';
  } else if (percentage < 50) {
    text = 'Aurora likely visible with some color and movement.';
  } else if (percentage < 75) {
    text = 'Strong aurora activity expected with vivid colors and dancing lights.';
  } else {
    text = 'Excellent aurora conditions! Expect spectacular displays overhead.';
  }
  
  return {
    percentage,
    quality,
    text
  };
}
