import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

// Scaling constant from SolarSystemScene
const AU_TO_SCREEN_UNITS = 40;

/**
 * Gets the 3D position of a celestial body at a given date
 * @param bodyName - Name of the body (e.g., 'Sun', 'Earth', 'Moon', 'Parker Solar Probe', 'UFO')
 * @param date - JavaScript Date object
 * @returns THREE.Vector3 position in screen units
 */
export function getBodyPosition(bodyName: string, date: Date): THREE.Vector3 {
  const astroTime = Astronomy.MakeTime(date);

  // Special case: Sun is always at origin
  if (bodyName === 'Sun') {
    return new THREE.Vector3(0, 0, 0);
  }

  // Special case: Moon (relative to Earth)
  if (bodyName === 'Moon') {
    // First get Earth's position
    const earthHelio = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
    const earthPos = new THREE.Vector3(
      earthHelio.x * AU_TO_SCREEN_UNITS,
      earthHelio.y * AU_TO_SCREEN_UNITS,
      earthHelio.z * AU_TO_SCREEN_UNITS
    );

    // Then get Moon's position relative to Earth (simplified orbit for visual purposes)
    // In production, we'd use Astronomy.GeoVector, but for now use simplified circular orbit
    const t = date.getTime() * 0.0001;
    const moonOffset = new THREE.Vector3(
      Math.cos(t) * 6,
      0,
      Math.sin(t) * 6
    );

    return earthPos.add(moonOffset);
  }

  // Special case: Parker Solar Probe (hardcoded elliptical orbit)
  if (bodyName === 'Parker Solar Probe') {
    const t = date.getTime() * 0.0008; // Fast orbit
    return new THREE.Vector3(
      Math.cos(t) * 8,
      0,
      Math.sin(t) * 4
    );
  }

  // Special case: ISS (orbits Earth, position calculated separately)
  if (bodyName === 'ISS') {
    // ISS position is handled by the ISS component itself
    // Return Earth position as placeholder (ISS adds offset)
    const earthHelio = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
    return new THREE.Vector3(
      earthHelio.x * AU_TO_SCREEN_UNITS,
      earthHelio.y * AU_TO_SCREEN_UNITS,
      earthHelio.z * AU_TO_SCREEN_UNITS
    );
  }

  // Special case: UFO (hidden behind Mercury)
  if (bodyName === 'UFO') {
    const mercury = Astronomy.HelioVector(Astronomy.Body.Mercury, astroTime);
    const earthHelio = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
    const toEarth = new THREE.Vector3(
      earthHelio.x - mercury.x,
      earthHelio.y - mercury.y,
      earthHelio.z - mercury.z
    ).normalize();
    const offset = toEarth.multiplyScalar(-1.5 / AU_TO_SCREEN_UNITS);
    
    return new THREE.Vector3(
      (mercury.x + offset.x) * AU_TO_SCREEN_UNITS,
      (mercury.y + offset.y) * AU_TO_SCREEN_UNITS,
      (mercury.z + offset.z) * AU_TO_SCREEN_UNITS
    );
  }

  // Planets: Use astronomy-engine
  const bodyMap: { [key: string]: Astronomy.Body } = {
    'Mercury': Astronomy.Body.Mercury,
    'Venus': Astronomy.Body.Venus,
    'Earth': Astronomy.Body.Earth,
    'Mars': Astronomy.Body.Mars,
    'Jupiter': Astronomy.Body.Jupiter,
    'Saturn': Astronomy.Body.Saturn,
    'Uranus': Astronomy.Body.Uranus,
    'Neptune': Astronomy.Body.Neptune,
    'Pluto': Astronomy.Body.Pluto
  };

  const astroBody = bodyMap[bodyName];
  if (!astroBody) {
    console.warn(`Unknown body: ${bodyName}, returning origin`);
    return new THREE.Vector3(0, 0, 0);
  }

  const helio = Astronomy.HelioVector(astroBody, astroTime);
  return new THREE.Vector3(
    helio.x * AU_TO_SCREEN_UNITS,
    helio.y * AU_TO_SCREEN_UNITS,
    helio.z * AU_TO_SCREEN_UNITS
  );
}

/**
 * Gets the optimal camera distance for viewing a body
 * @param bodyName - Name of the body
 * @returns Distance in screen units
 */
export function getOptimalViewDistance(bodyName: string): number {
  const distances: { [key: string]: number } = {
    'Sun': 35,
    'Mercury': 5,
    'Venus': 6,
    'Earth': 8,
    'Mars': 5,
    'Jupiter': 18,
    'Saturn': 18,
    'Uranus': 12,
    'Neptune': 12,
    'Pluto': 3,
    'Moon': 3,
    'Parker Solar Probe': 2,
    'ISS': 2,
    'UFO': 1 // Get close to the alien spacecraft!
  };

  return distances[bodyName] || 10; // Default to 10 if unknown
}

/**
 * Calculates camera position for viewing a body
 * Positions camera slightly above and in front of the body
 * @param bodyPosition - Position of the body
 * @param distance - Viewing distance
 * @returns Camera position as THREE.Vector3
 */
export function calculateCameraPosition(
  bodyPosition: THREE.Vector3,
  distance: number
): THREE.Vector3 {
  // Position camera at an angle: slightly above and offset
  const offset = new THREE.Vector3(0, distance * 0.3, distance);
  return bodyPosition.clone().add(offset);
}
