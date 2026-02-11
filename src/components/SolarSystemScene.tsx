import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { TextureLoader } from 'three';
import { RealisticSun } from './RealisticSun';
import ISS from './ISS';
import UFO from './UFO';
import { calculateDistance, formatDistance, calculateLightTravelTime, calculateProbeTravelTime, getDistanceFunFact } from '../utils/distance';
import { CITIES } from '../constants/cities';

// --- CONFIGURATION ---
const AU_TO_SCREEN_UNITS = 40;

// Export PLANETS for external use
export const PLANETS = [
  { name: 'Mercury', body: Astronomy.Body.Mercury, radius: 0.4, color: '#A5A5A5', texture: 'textures/2k_mercury.jpg', type: 'Rocky', temp: '430°C', distance: '0.39 AU' },
  { name: 'Venus', body: Astronomy.Body.Venus, radius: 0.9, color: '#E3BB76', texture: 'textures/2k_venus_surface.jpg', type: 'Rocky', temp: '462°C', distance: '0.72 AU' },
  { name: 'Earth', body: Astronomy.Body.Earth, radius: 1.0, color: '#2233FF', texture: 'textures/8k_earth_daymap.jpg', type: 'Habitable', temp: '15°C', distance: '1.00 AU' },
  { name: 'Mars', body: Astronomy.Body.Mars, radius: 0.5, color: '#E27B58', texture: 'textures/2k_mars.jpg', type: 'Rocky', temp: '-63°C', distance: '1.52 AU' },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter, radius: 4.0, color: '#C88B3A', texture: 'textures/2k_jupiter.jpg', type: 'Gas Giant', temp: '-108°C', distance: '5.20 AU' },
  { name: 'Saturn', body: Astronomy.Body.Saturn, radius: 3.5, color: '#C5AB6E', texture: 'textures/2k_saturn.jpg', type: 'Gas Giant', temp: '-139°C', distance: '9.58 AU' },
  { name: 'Uranus', body: Astronomy.Body.Uranus, radius: 2.0, color: '#4FD0E7', texture: 'textures/2k_uranus.jpg', type: 'Ice Giant', temp: '-197°C', distance: '19.22 AU' },
  { name: 'Neptune', body: Astronomy.Body.Neptune, radius: 2.0, color: '#4169E1', texture: 'textures/2k_neptune.jpg', type: 'Ice Giant', temp: '-201°C', distance: '30.05 AU' },
  { name: 'Pluto', body: Astronomy.Body.Pluto, radius: 0.2, color: '#968570', texture: 'textures/2k_mercury.jpg', type: 'Dwarf', temp: '-232°C', distance: '39.48 AU' } 
];

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

// --- SUB-COMPONENTS ---

function ParkerSolarProbe({ onBodyFocus, focusedBody, onVehicleBoard }: { onBodyFocus: (name: string) => void, focusedBody: string | null, onVehicleBoard: (vehicle: string) => void }) {
  const probeRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime() * 0.8; // Fast!
      // Highly elliptical orbit
      const x = Math.cos(t) * 8; 
      const z = Math.sin(t) * 4; 
      probeRef.current.position.set(x, 0, z);
      probeRef.current.rotation.y = -t;
    }
  });

  return (
    <group ref={probeRef}>
      {/* Clickable hitbox */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onBodyFocus('Parker Solar Probe'); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Heat Shield */}
      <mesh position={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Label */}
      <Html distanceFactor={15} position={[0, 1, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`text-[8px] font-mono whitespace-nowrap ${hovered ? 'text-white' : 'text-yellow-500'}`}>
          PARKER PROBE
          {hovered && !focusedBody && <div className="text-[7px] text-cyan-400">CLICK TO FOCUS</div>}
        </div>
      </Html>
      
      {/* BOARD BUTTON when focused */}
      {focusedBody === 'Parker Solar Probe' && (
        <Html position={[0, -1.5, 0]} center>
          <button
            className="pointer-events-auto px-3 py-2 bg-orange-600 hover:bg-orange-500 border-2 border-orange-400 rounded-lg text-white font-bold text-xs transition-all hover:scale-110 shadow-[0_0_15px_orange] flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onVehicleBoard('Parker Solar Probe');
            }}
          >
            🚀 BOARD PROBE
          </button>
        </Html>
      )}
    </group>
  );
}

function OrbitTrail({ body, color }: any) {
  const points = useMemo(() => {
    const p = [];
    const now = new Date();
    for (let i = 0; i < 365; i += 5) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const vec = Astronomy.HelioVector(body, Astronomy.MakeTime(date));
      p.push(new THREE.Vector3(vec.x * AU_TO_SCREEN_UNITS, vec.y * AU_TO_SCREEN_UNITS, vec.z * AU_TO_SCREEN_UNITS));
    }
    return new THREE.BufferGeometry().setFromPoints(p);
  }, [body]);

  return (
    <line geometry={points}>
      <lineBasicMaterial color={color || 'white'} opacity={0.15} transparent />
    </line>
  );
}

// ... MoonSystem & OrbitingMoon (Keep same as before, omitted for brevity but include in file) ...
// (I will assume you have the MoonSystem code from previous step, if not I can paste it)

function EarthGroup({ config, kpValue, currentDate, onLocationClick, onBodyFocus, focusedBody }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [earthPosition, setEarthPosition] = useState(new THREE.Vector3());
  
  const [day, night, clouds] = useLoader(TextureLoader, [
    'textures/8k_earth_daymap.jpg',
    'textures/8k_earth_nightmap.jpg',
    'textures/8k_earth_clouds.jpg'
  ]);

  useFrame(() => {
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      const pos = new THREE.Vector3(
        helio.x * AU_TO_SCREEN_UNITS,
        helio.y * AU_TO_SCREEN_UNITS,
        helio.z * AU_TO_SCREEN_UNITS
      );
      groupRef.current.position.copy(pos);
      setEarthPosition(pos);
    }
    
    // ACCURATE EARTH ROTATION based on real time
    if (earthMeshRef.current && groupRef.current) {
      // Calculate rotation to ensure correct day/night at current UTC time
      // The Sun is at origin [0,0,0], Earth orbits around it
      
      // Get Earth's current position relative to Sun
      const earthToSun = new THREE.Vector3(0, 0, 0).sub(groupRef.current.position).normalize();
      
      // Calculate the angle Earth needs to rotate so that noon (12:00 UTC) at Greenwich (0° lon) faces the Sun
      // At UTC noon, Greenwich should face the Sun
      const utcHours = currentDate.getUTCHours();
      const utcMinutes = currentDate.getUTCMinutes();
      const utcSeconds = currentDate.getUTCSeconds();
      const utcTimeInHours = utcHours + utcMinutes / 60 + utcSeconds / 3600;
      
      // Hours from noon (when Greenwich should face Sun)
      const hoursFromNoon = utcTimeInHours - 12;
      
      // Earth rotates 360° in 24 hours = 15° per hour
      const rotationDegrees = hoursFromNoon * 15;
      
      // Also need to account for Earth's orbital position
      // Calculate angle from Sun to Earth in XZ plane
      const earthPos = groupRef.current.position;
      const orbitalAngle = Math.atan2(earthPos.z, earthPos.x);
      
      // Combine rotation: base rotation + orbital position adjustment
      // The texture is oriented with Greenwich at 0° longitude facing +X initially
      // We need to rotate so Greenwich faces the Sun at noon UTC
      const finalRotation = (-orbitalAngle) + (rotationDegrees * Math.PI / 180);
      
      earthMeshRef.current.rotation.y = finalRotation;
      
      // Clouds rotate slightly faster (wind effect) but stay synchronized
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y = finalRotation + 0.1; // Slight offset for atmosphere drift
      }
    }
  });

  return (
    <>
      <group ref={groupRef}>
      {/* Apply Earth's axial tilt (23.4°) */}
      <group rotation={[0, 0, 23.4 * Math.PI / 180]}>
      
      {/* CLICKABLE HITBOX (Transparent, NOT invisible) */}
      <mesh onClick={(e) => { e.stopPropagation(); onBodyFocus('Earth'); }}>
         <sphereGeometry args={[config.radius * 1.15, 32, 32]} />
         <meshBasicMaterial transparent opacity={0} /> 
      </mesh>

      <mesh ref={earthMeshRef} castShadow receiveShadow>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial map={day} emissiveMap={night} emissiveIntensity={0.5} transparent={false} />
      </mesh>

      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <mesh scale={[1.15, 1.15, 1.15]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshBasicMaterial color={kpValue > 5 ? "#ff0044" : "#4ade80"} transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {CITIES.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, config.radius * 1.02);
        return (
          <group key={city.name} position={pos}>
            <mesh 
              onClick={(e) => { e.stopPropagation(); onLocationClick(city); }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color={city.color} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      
      {/* MOON */}
      <Moon currentDate={currentDate} onBodyFocus={onBodyFocus} />
      
      </group> {/* Close axial tilt group */}
    </group>
    
    {/* ISS - Orbits Earth */}
    <ISS onBodyFocus={onBodyFocus} focusedBody={focusedBody} earthPosition={earthPosition} onVehicleBoard={onVehicleBoard} />
  </>
  );
}

// Moon Component (orbits Earth)
function Moon({ currentDate, onBodyFocus }: { currentDate: Date, onBodyFocus: (name: string) => void }) {
  const moonRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (moonRef.current) {
      // Simplified lunar orbit (visual approximation)
      const t = currentDate.getTime() * 0.0001;
      moonRef.current.position.set(
        Math.cos(t) * 6,
        0,
        Math.sin(t) * 6
      );
    }
  });

  return (
    <group ref={moonRef}>
      {/* Clickable hitbox */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onBodyFocus('Moon'); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Moon surface */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.27, 32, 32]} />
        <meshStandardMaterial map={useLoader(TextureLoader, 'textures/2k_moon.jpg')} roughness={0.9} />
      </mesh>
      
      {/* Label */}
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 p-2 rounded text-xs font-mono text-cyan-400">
            <div className="font-bold text-white">MOON</div>
            <div className="text-[9px] text-cyan-300 mt-1">CLICK TO FOCUS</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function TexturedPlanet({ config, currentDate, focusedBody, focusedBodyPosition, onBodyFocus }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, config.texture || 'textures/2k_mercury.jpg');
  const [hovered, setHovered] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  
  // Load ring texture if it's Saturn
  const ringTexture = config.name === 'Saturn' 
    ? useLoader(TextureLoader, 'textures/2k_saturn_ring_alpha.png')
    : null;

  useFrame(({clock}) => {
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      const pos = new THREE.Vector3(
        helio.x * AU_TO_SCREEN_UNITS,
        helio.y * AU_TO_SCREEN_UNITS,
        helio.z * AU_TO_SCREEN_UNITS
      );
      groupRef.current.position.copy(pos);
      setCurrentPosition(pos);
    }
  });

  // Calculate distance if focused on another body
  const distanceInfo = focusedBody && focusedBodyPosition && focusedBody !== config.name
    ? calculateDistance(focusedBodyPosition, currentPosition)
    : null;
  
  const lightTime = distanceInfo ? calculateLightTravelTime(distanceInfo.km) : null;
  const probeTime = distanceInfo ? calculateProbeTravelTime(distanceInfo.km, 'standard') : null;
  const funFact = distanceInfo ? getDistanceFunFact(distanceInfo, focusedBody, config.name) : null;

  return (
    <group ref={groupRef}>
      {/* CLICKABLE HITBOX (Transparent = Interactive) */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onBodyFocus(config.name); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
         <sphereGeometry args={[config.radius * 1.2, 32, 32]} />
         <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh castShadow receiveShadow>
        <sphereGeometry args={[config.radius, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      
      {/* Saturn Rings */}
      {config.name === 'Saturn' && ringTexture && (
        <mesh rotation={[Math.PI / 2.3, 0, 0]} receiveShadow>
          <ringGeometry args={[config.radius * 1.2, config.radius * 2.2, 64]} />
          <meshStandardMaterial 
            map={ringTexture} 
            transparent 
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ENHANCED HOVER CARD with Distance Info - LARGER TEXT */}
      {hovered && focusedBody !== config.name && (
        <Html distanceFactor={12} position={[0, config.radius + 1.5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border-l-4 border-cyan-400 p-4 rounded-lg shadow-[0_0_40px_rgba(0,255,255,0.4)] min-w-[240px]">
            <div className="text-2xl font-bold text-white mb-3 tracking-wide">{config.name.toUpperCase()}</div>
            
            {/* Basic Info */}
            <div className="text-base grid grid-cols-2 gap-2 text-gray-300 mb-3">
               <span className="text-gray-400">TEMP:</span> <span className="text-right text-orange-300 font-semibold">{config.temp}</span>
               <span className="text-gray-400">FROM SUN:</span> <span className="text-right text-green-300 font-semibold">{config.distance}</span>
               <span className="text-gray-400">TYPE:</span> <span className="text-right text-cyan-300 font-semibold">{config.type}</span>
            </div>
            
            {/* Distance Info (if focused on another body) */}
            {distanceInfo && focusedBody && (
              <div className="border-t border-cyan-900/50 pt-3 mt-3">
                <div className="text-sm text-yellow-400 font-bold mb-2">
                  FROM {focusedBody.toUpperCase()}
                </div>
                <div className="text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance:</span>
                    <span className="text-white font-mono text-base">{formatDistance(distanceInfo.km, 'km')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400"></span>
                    <span className="text-gray-300 font-mono">{formatDistance(distanceInfo.miles, 'mi')}</span>
                  </div>
                  {lightTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Light Travel:</span>
                      <span className="text-green-400 font-mono">{lightTime.value.toFixed(1)} {lightTime.unit}</span>
                    </div>
                  )}
                  {probeTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Probe Travel:</span>
                      <span className="text-orange-400 font-mono">{probeTime.value.toFixed(1)} {probeTime.unit}</span>
                    </div>
                  )}
                </div>
                {funFact && <div className="text-xs text-gray-500 italic mt-2">{funFact}</div>}
              </div>
            )}
            
            <div className="mt-3 text-center bg-cyan-900/60 py-2 rounded-lg text-white text-base font-bold animate-pulse">
              ⭐ CLICK TO ORBIT ⭐
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SolarSystemScene({ kpValue, currentDate = new Date(), focusedBody, focusedBodyPosition, onBodyFocus, controlsRef, onLocationClick, onVehicleBoard }: any) {
  return (
    <>
      <RealisticSun onBodyFocus={onBodyFocus} />
      <ParkerSolarProbe onBodyFocus={onBodyFocus} focusedBody={focusedBody} onVehicleBoard={onVehicleBoard} />
      <UFO onBodyFocus={onBodyFocus} focusedBody={focusedBody} currentDate={currentDate} onVehicleBoard={onVehicleBoard} />

      {PLANETS.map(planet => (
        <group key={planet.name}>
          <OrbitTrail body={planet.body} color={planet.name === 'Earth' ? '#22d3ee' : 'gray'} />
          
          {planet.name === 'Earth' ? (
            <EarthGroup 
               config={planet} 
               kpValue={kpValue} 
               currentDate={currentDate} 
               onLocationClick={onLocationClick} 
               onBodyFocus={onBodyFocus}
               focusedBody={focusedBody}
            />
          ) : (
            <TexturedPlanet 
               config={planet} 
               currentDate={currentDate} 
               focusedBody={focusedBody}
               focusedBodyPosition={focusedBodyPosition}
               onBodyFocus={onBodyFocus} 
            />
          )}
        </group>
      ))}
    </>
  );
}