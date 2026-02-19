import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { TextureLoader } from 'three';
import { RealisticSun } from './RealisticSun';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { SolarFlareParticles } from './SolarFlareParticles';
// ... [Maintain all original imports JWST, Voyager1, TeslaRoadster, etc.] ...

const AU_TO_SCREEN_UNITS = 40;

// --- UPDATED GEOGRAPHIC MATH ---
// This ensures your UserBeacon and city markers sit precisely on the 3D surface
function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

export default function SolarSystemScene({ 
  kpValue, 
  currentDate = new Date(), 
  focusedBody, 
  focusedBodyPosition, 
  onBodyFocus, 
  userLocation, // New Prop for Personal Mission Control
  onVehicleBoard,
  onEarthClick,  // Callback for Drop-a-Beacon
}: any) {
  const liveData = useLiveSpaceWeather();
  const [magnetopauseImpact, setMagnetopauseImpact] = useState(false);
  
  // --- CHRONOS ENGINE: INTERNAL LOOP UPDATE ---
  // We move MakeTime out of the loop and use useMemo to prevent re-calculations
  const astroTime = useMemo(() => Astronomy.MakeTime(currentDate), [currentDate]);

  // Is the userLocation in the hemisphere currently facing the Sun?
  // Approximate: positive lon means day side during solar noon.
  const userInImpactedHemisphere = useMemo(() => {
    if (!userLocation) return false;
    // Northern hemisphere (lat > 0) is roughly sunward during CME events originating on the equatorial plane
    return userLocation.lat > -60; // most latitudes are impacted — exclude deep south
  }, [userLocation]);

  return (
    <>
      <SolarLighting sunPosition={new THREE.Vector3(0, 0, 0)} intensity={3.5} />
      <RealisticSun onBodyFocus={onBodyFocus} kpValue={kpValue} />

      {/* ELECTRONIC HANDSHAKE: Linking Flare Emitter to Ripple Receiver */}
      <SolarFlareParticles
        sunPosition={new THREE.Vector3(0, 0, 0)}
        earthPosition={new THREE.Vector3(40, 0, 0)}
        isActive={
          liveData.data?.xray.fluxClass?.startsWith('M') ||
          liveData.data?.xray.fluxClass?.startsWith('X') || false
        }
        onImpact={() => {
          setMagnetopauseImpact(true);
          setTimeout(() => setMagnetopauseImpact(false), 5000); // 5s ripple duration
        }}
      />

      {PLANETS.map((planet: any) => (
        <group key={planet.name}>
          <OrbitTrail body={planet.body} color={planet.name === 'Earth' ? '#22d3ee' : 'gray'} />
          
          {planet.name === 'Earth' ? (
            <EarthGroup 
               config={planet} 
               kpValue={kpValue} 
               currentDate={currentDate} 
               magnetopauseImpact={magnetopauseImpact} // Pass the handshake signal
               userLocation={userLocation} // Pass personal ground station
               onClick={onEarthClick}     // Beacon drop callback
            />
          ) : (
            <TexturedPlanet 
               config={planet} 
               currentDate={currentDate} 
               onBodyFocus={onBodyFocus} 
            />
          )}
          
          {/* REAL-TIME MOONS: Calculated in place based on astroTime */}
          <PlanetMoonsGroup planetName={planet.name} currentDate={currentDate} onBodyFocus={onBodyFocus} />
        </group>
      ))}

      {/* PERSONAL GROUND STATION BEACON — rendered at Earth's position */}
      {userLocation && (
        <UserBeacon
          lat={userLocation.lat}
          lon={userLocation.lon}
          radius={2.0}              // Earth display radius (approx)
          earthPosition={new THREE.Vector3(40, 0, 0)}
          pulse={magnetopauseImpact && userInImpactedHemisphere}
          name={userLocation.name}
        />
      )}

      {/* Maintain all original high-fidelity assets */}
      <UFO onBodyFocus={onBodyFocus} currentDate={currentDate} />
      <TeslaRoadster currentDate={currentDate} />
      <AsteroidBelt visible={true} />
    </>
  );
}

// --- PERSONAL GROUND STATION BEACON ---
// A cyan ring that pulses when a CME impact reaches the user's hemisphere.
function UserBeacon({ lat, lon, radius, earthPosition, pulse, name }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const outerRef = useRef<THREE.Mesh>(null!);
  const localOffset = useMemo(() => latLonToVector3(lat, lon, radius * 1.02), [lat, lon, radius]);
  // World position = Earth position + local surface offset
  const worldPos = useMemo(
    () => new THREE.Vector3(earthPosition.x + localOffset.x, earthPosition.y + localOffset.y, earthPosition.z + localOffset.z),
    [earthPosition, localOffset]
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // Constant gentle breathe
    const base = 0.6 + Math.sin(t * 1.5) * 0.2;
    // Extra pulse when impact detected
    const impact = pulse ? 0.4 + Math.abs(Math.sin(t * 8)) * 0.6 : 0;
    meshRef.current.material.opacity = Math.min(1, base + impact);

    if (outerRef.current) {
      const scale = pulse ? 1 + Math.abs(Math.sin(t * 4)) * 0.6 : 1;
      outerRef.current.scale.setScalar(scale);
      outerRef.current.material.opacity = pulse ? 0.3 + Math.abs(Math.sin(t * 4)) * 0.4 : 0.15;
    }
  });

  return (
    <group position={worldPos}>
      {/* Outer expanding ring — extra pulse on impact */}
      <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.18, 48]} />
        <meshBasicMaterial color={pulse ? '#ff6600' : '#00ffff'} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Core ring */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.10, 48]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Html distanceFactor={10}>
        <div className={`text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap uppercase tracking-widest ${pulse ? 'text-orange-300 bg-orange-900/60 border-orange-500/50 animate-pulse' : 'text-cyan-400 bg-black/50 border-cyan-500/30'}`}>
          {pulse ? '⚠ CME IMPACT DETECTED' : `⊕ ${name ?? 'Ground Station'}`}
        </div>
      </Html>
    </group>
  );
}