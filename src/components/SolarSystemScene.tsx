import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { TextureLoader } from 'three';
import { RealisticSun } from './RealisticSun';
import ISS from './ISS';
import UFO from './UFO';
import Hubble from './Hubble';
import JWST from './JWST';
import Tiangong from './Tiangong';
import Voyager1 from './Voyager1';
import TeslaRoadster from './TeslaRoadster';
import AuroraBorealis from './AuroraBorealis';
import Magnetosphere from './Magnetosphere';
import AsteroidBelt from './AsteroidBelt';
import { EarthAtmosphere, MarsAtmosphere, VenusAtmosphere, JupiterAtmosphere } from './AtmosphereShader';
import { calculateDistance, formatDistance, calculateLightTravelTime, calculateProbeTravelTime, getDistanceFunFact } from '../utils/distance';
import { CITIES, PLANETS } from '../data/celestial';

// --- CONFIGURATION ---
const AU_TO_SCREEN_UNITS = 40;

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
    <line>
      <bufferGeometry attach="geometry" {...points} />
      <lineBasicMaterial attach="material" color={color || 'white'} opacity={0.15} transparent />
    </line>
  );
}

// ... MoonSystem & OrbitingMoon (Keep same as before, omitted for brevity but include in file) ...
// (I will assume you have the MoonSystem code from previous step, if not I can paste it)

function EarthGroup({ config, kpValue, currentDate, onLocationClick, onBodyFocus, focusedBody, onVehicleBoard }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [earthPosition, setEarthPosition] = useState(new THREE.Vector3());
  
  const [day, night, clouds] = useLoader(TextureLoader, [
    '/textures/8k_earth_daymap.jpg',  // Leading slash for absolute path
    '/textures/8k_earth_nightmap.jpg',
    '/textures/8k_earth_clouds.jpg'
  ]);

  // Memoize heavy calculations
  const earthPositionData = useMemo(() => {
    const astroTime = Astronomy.MakeTime(currentDate);
    const helio = Astronomy.HelioVector(config.body, astroTime);
    const pos = new THREE.Vector3(
      helio.x * AU_TO_SCREEN_UNITS,
      helio.y * AU_TO_SCREEN_UNITS,
      helio.z * AU_TO_SCREEN_UNITS
    );
    
    const utcHours = currentDate.getUTCHours();
    const utcMinutes = currentDate.getUTCMinutes();
    const utcSeconds = currentDate.getUTCSeconds();
    const utcTimeInHours = utcHours + utcMinutes / 60 + utcSeconds / 3600;
    const hoursFromNoon = utcTimeInHours - 12;
    const rotationDegrees = hoursFromNoon * 15;
    const orbitalAngle = Math.atan2(pos.z, pos.x);
    const finalRotation = (-orbitalAngle) + (rotationDegrees * Math.PI / 180);
    
    return { pos, finalRotation };
  }, [currentDate, config.body]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(earthPositionData.pos);
      setEarthPosition(earthPositionData.pos);
    }
    
    // Apply rotation
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y = earthPositionData.finalRotation;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = earthPositionData.finalRotation + 0.1;
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
        <sphereGeometry args={[config.radius, 48, 48]} />
        <meshStandardMaterial map={day} emissiveMap={night} emissiveIntensity={0.5} transparent={false} />
      </mesh>

      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 32, 32]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* AURORA GLOW SPHERE (Dynamic based on Kp) */}
      <mesh scale={[1.15, 1.15, 1.15]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshBasicMaterial 
          color={kpValue > 5 ? '#ff2255' : '#4ade80'}
          transparent 
          opacity={Math.min(kpValue * 0.05, 0.4)}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* CITY MARKERS (only render when zoomed in for performance) */}
      {focusedBody === 'Earth' && CITIES.slice(0, 50).map((city) => {
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
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={city.color} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      
      {/* MOON */}
      <Moon currentDate={currentDate} onBodyFocus={onBodyFocus} />
      
      </group> {/* Close axial tilt group */}
    </group>
    
    {/* AURORA & MAGNETOSPHERE (only when Earth focused for performance) */}
    {focusedBody === 'Earth' && (
      <>
        <AuroraBorealis kpValue={kpValue} earthPosition={earthPosition} intensity={1.0} />
        <Magnetosphere earthPosition={earthPosition} solarWindSpeed={500} sunPosition={new THREE.Vector3(0, 0, 0)} />
      </>
    )}
    
    {/* ASTEROID BELT & KUIPER BELT */}
    <AsteroidBelt visible={true} />
    
    {/* SPACE STATIONS & TELESCOPES */}
    <ISS onBodyFocus={onBodyFocus} focusedBody={focusedBody} earthPosition={earthPosition} onVehicleBoard={onVehicleBoard} />
    <Hubble onBodyFocus={onBodyFocus} focusedBody={focusedBody} earthPosition={earthPosition} onVehicleBoard={onVehicleBoard} />
    <Tiangong onBodyFocus={onBodyFocus} focusedBody={focusedBody} earthPosition={earthPosition} onVehicleBoard={onVehicleBoard} />
    <JWST onBodyFocus={onBodyFocus} focusedBody={focusedBody} currentDate={currentDate} onVehicleBoard={onVehicleBoard} />
    
    {/* INTERSTELLAR & MISC */}
    <Voyager1 onBodyFocus={onBodyFocus} focusedBody={focusedBody} />
    <TeslaRoadster onBodyFocus={onBodyFocus} focusedBody={focusedBody} currentDate={currentDate} />
  </>
  );
}

// Moon Component (orbits Earth)
function Moon({ currentDate, onBodyFocus }: { currentDate: Date, onBodyFocus: (name: string) => void }) {
  const moonRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate real Moon position using astronomy-engine
  const moonPosition = useMemo(() => {
    const astroTime = Astronomy.MakeTime(currentDate);
    // GeoVector gives Moon position relative to Earth center in kilometers
    const geoVec = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, true);
    
    // Scale down from km to scene units
    // Moon orbit radius is ~384,400 km, Earth radius in scene ~6,371 km
    const scale = 6; // Visual scale for scene (compressed for visibility)
    
    return new THREE.Vector3(
      geoVec.x / 64000 * scale,  // Convert km to scene units
      geoVec.y / 64000 * scale,
      geoVec.z / 64000 * scale
    );
  }, [currentDate]);
  
  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.position.copy(moonPosition);
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
        <sphereGeometry args={[0.27, 24, 24]} />
        <meshStandardMaterial map={useLoader(TextureLoader, '/textures/2k_moon.jpg')} roughness={0.9} />
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
  const texture = useLoader(TextureLoader, config.texture ? `/${config.texture}` : '/textures/2k_mercury.jpg');
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
         <sphereGeometry args={[config.radius * 1.2, 16, 16]} />
         <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh castShadow receiveShadow>
        <sphereGeometry args={[config.radius, 24, 24]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      
      {/* ATMOSPHERIC GLOW */}
      {config.name === 'Earth' && <EarthAtmosphere planetRadius={config.radius} />}
      {config.name === 'Mars' && <MarsAtmosphere planetRadius={config.radius} />}
      {config.name === 'Venus' && <VenusAtmosphere planetRadius={config.radius} />}
      {config.name === 'Jupiter' && <JupiterAtmosphere planetRadius={config.radius} />}
      
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
      <RealisticSun onBodyFocus={onBodyFocus} kpValue={kpValue} />
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
               onVehicleBoard={onVehicleBoard}
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