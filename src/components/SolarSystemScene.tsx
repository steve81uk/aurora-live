import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// --- CONSTANTS ---

// Coordinate conversion for Screen Units (40 = 1 AU)
const AU_TO_SCREEN_UNITS = 40;

// Locations for Teleport (Simple Array)
const CITIES = [
  { name: 'Anchorage', lat: 61.2181, lon: -149.9003, color: '#22d3ee' },
  { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, color: '#22d3ee' },
  { name: 'Tromsø', lat: 69.6492, lon: 18.9553, color: '#22d3ee' },
  { name: 'Yellowknife', lat: 62.4540, lon: -114.3718, color: '#22d3ee' },
  { name: 'Abisko', lat: 68.3495, lon: 18.8312, color: '#22d3ee' },
  { name: 'Tasmania', lat: -41.4545, lon: 145.9707, color: '#ff00ff' }, // Aurora Australis
];

// Helper to place dots on sphere
function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
}

// --- INTERFACES ---

interface SolarSystemSceneProps {
  kpValue: number;
  solarWindSpeed: number;
  currentDate?: Date;
  focusedBody?: string | null;
  onBodyFocus?: (body: string | null) => void;
  controlsRef?: React.RefObject<OrbitControlsImpl | null>;
  surfaceMode?: boolean;
  surfaceLocation?: any;
  mythicTheme?: any;
  showSatellites?: boolean;
  onLocationClick?: (location: { lat: number; lon: number; name: string }) => void;
}

interface PlanetConfig {
  name: string;
  body: Astronomy.Body;
  radius: number;
  color: string;
  emissive?: string;
  axialTilt?: number;
}

const PLANETS: PlanetConfig[] = [
  { name: 'Mercury', body: Astronomy.Body.Mercury, radius: 0.4, color: '#8C7853', axialTilt: 0.034 },
  { name: 'Venus', body: Astronomy.Body.Venus, radius: 0.9, color: '#FFC649', axialTilt: 177.4 },
  { name: 'Earth', body: Astronomy.Body.Earth, radius: 1.0, color: '#0d47a1', axialTilt: 23.4 },
  { name: 'Mars', body: Astronomy.Body.Mars, radius: 0.5, color: '#CD5C5C', axialTilt: 25.2 },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter, radius: 4.0, color: '#C88B3A', axialTilt: 3.1 },
  { name: 'Saturn', body: Astronomy.Body.Saturn, radius: 3.5, color: '#FAD5A5', axialTilt: 26.7 },
  { name: 'Uranus', body: Astronomy.Body.Uranus, radius: 2.0, color: '#4FD0E7', axialTilt: 97.8 },
  { name: 'Neptune', body: Astronomy.Body.Neptune, radius: 2.0, color: '#4169E1', axialTilt: 28.3 },
  { name: 'Pluto', body: Astronomy.Body.Pluto, radius: 0.2, color: '#8B7355', axialTilt: 122.5 }
];

// --- COMPONENTS ---

// 1. Earth with Textures, Cities & Aurora
function EarthGroup({ config, kpValue, onLocationClick }: { config: PlanetConfig, kpValue: number, onLocationClick: any }) {
  const [hoveredLoc, setHoveredLoc] = useState<string | null>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load textures with error handling
  let textures: [THREE.Texture, THREE.Texture, THREE.Texture] | null = null;
  try {
    textures = useTexture([
      '/textures/8k_earth_daymap.jpg',
      '/textures/8k_earth_nightmap.jpg',
      '/textures/8k_earth_clouds.jpg'
    ]) as [THREE.Texture, THREE.Texture, THREE.Texture];
  } catch (error) {
    console.warn('Earth textures not found, using fallback colors');
  }

  const [dayMap, nightMap, cloudsMap] = textures || [null, null, null];

  useFrame(() => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0003;
  });

  return (
    <group>
      {/* SOLID EARTH */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[config.radius, 128, 128]} />
        {dayMap && nightMap ? (
          <meshStandardMaterial 
            map={dayMap}
            emissiveMap={nightMap}
            emissive="#ffffff"
            emissiveIntensity={0.5}
            roughness={0.7}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial 
            color="#0d47a1"
            emissive="#1e88e5"
            emissiveIntensity={0.2}
            roughness={0.7}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* CLOUDS LAYER */}
      {cloudsMap && (
        <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[config.radius, 64, 64]} />
          <meshStandardMaterial 
            map={cloudsMap}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* AURORA SHELL */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshBasicMaterial 
          color={kpValue > 5 ? "#ff0044" : "#4ade80"} 
          transparent
          opacity={kpValue > 5 ? 0.2 : 0.08}
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* CLICKABLE CITIES */}
      {CITIES.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, config.radius * 1.015);
        return (
          <group key={city.name} position={pos}>
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onLocationClick(city);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                setHoveredLoc(city.name);
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
                setHoveredLoc(null);
              }}
            >
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshBasicMaterial color={city.color} toneMapped={false} />
            </mesh>
            
            {/* Simple Hover Label */}
            {hoveredLoc === city.name && (
               <Html distanceFactor={1.5} position={[0, 0.05, 0]}>
                 <div className="bg-black/90 px-2 py-1 text-xs text-cyan-400 font-mono border border-cyan-500/50 rounded whitespace-nowrap">
                   {city.name.toUpperCase()} <span className="text-white">| CLICK TO TELEPORT</span>
                 </div>
               </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// 1b. The Moon
function Moon({ earthGroupRef }: { earthGroupRef: React.RefObject<THREE.Group | null> }) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (moonRef.current && earthGroupRef.current) {
      // Simple circular orbit around Earth
      const time = clock.getElapsedTime() * 0.2; // Slow orbit
      const radius = 2.5; // Distance from Earth
      
      const x = Math.cos(time) * radius;
      const z = Math.sin(time) * radius;
      
      // Position relative to Earth's group
      moonRef.current.position.set(x, 0, z);
      moonRef.current.rotation.y += 0.01; // Slow rotation
    }
  });

  return (
    <mesh ref={moonRef} castShadow receiveShadow>
      <sphereGeometry args={[0.27, 32, 32]} />
      <meshStandardMaterial 
        color="#cccccc"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

// 2. Generic Planet Wrapper
function Planet({ config, currentDate, focusedBody, onBodyFocus, onLocationClick, kpValue }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Simplified - no textures, use colors from config
  
  useFrame(() => {
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      groupRef.current.position.set(
        helio.x * AU_TO_SCREEN_UNITS,
        helio.y * AU_TO_SCREEN_UNITS,
        helio.z * AU_TO_SCREEN_UNITS
      );
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[(config.axialTilt || 0) * (Math.PI / 180), 0, 0]}>
        
        {/* Render Earth differently than other planets */}
        {config.name === 'Earth' ? (
          <>
            <EarthGroup config={config} kpValue={kpValue} onLocationClick={onLocationClick} />
            <Moon earthGroupRef={groupRef} />
          </>
        ) : (
          <mesh 
            onClick={(e) => { e.stopPropagation(); onBodyFocus(config.name); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <sphereGeometry args={[config.radius, 32, 32]} />
            <meshStandardMaterial 
              color={config.color}
              emissive={config.emissive || config.color}
              emissiveIntensity={0.2}
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>
        )}

        {/* Planet Label (When not Earth) */}
        {focusedBody !== config.name && config.name !== 'Earth' && (
          <Html distanceFactor={10} position={[0, config.radius + 0.5, 0]}>
            <div className="text-white/50 text-[10px] font-mono">{config.name}</div>
          </Html>
        )}
      </group>
    </group>
  );
}

// 3. The Sun (No Exhaust)
function Sun({ onBodyFocus }: any) {
  return (
    <group onClick={() => onBodyFocus(null)}>
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#FDB813" toneMapped={false} />
      </mesh>
      {/* Glow Layer */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#FF8800" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
      <pointLight intensity={1000} distance={5000} decay={2} color="#FDB813" />
    </group>
  );
}

// 4. Orbit Trails
function OrbitTrail({ body, color }: any) {
  const points = useMemo(() => {
    const p = [];
    const now = new Date();
    for (let i = 0; i < 365; i += 2) { // Less points for performance
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const vec = Astronomy.HelioVector(body, Astronomy.MakeTime(date));
      p.push(new THREE.Vector3(vec.x * AU_TO_SCREEN_UNITS, vec.y * AU_TO_SCREEN_UNITS, vec.z * AU_TO_SCREEN_UNITS));
    }
    return p;
  }, [body]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  return (
    <primitive object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 }))} />
  );
}

// --- MAIN EXPORT ---

export default function SolarSystemScene({ 
  kpValue, 
  currentDate = new Date(), 
  focusedBody, 
  onBodyFocus, 
  controlsRef,
  onLocationClick 
}: SolarSystemSceneProps) {
  
  const { camera } = useThree();

  // Camera Chase Logic
  useFrame((_state, delta) => {
    if (focusedBody && controlsRef?.current) {
      // Find the planet object in the scene to get its real-time world position
      // For now, we approximate by calculating it again (simpler than ref passing)
      const planet = PLANETS.find(p => p.name === focusedBody);
      if (planet) {
        const vec = Astronomy.HelioVector(planet.body, Astronomy.MakeTime(currentDate));
        const x = vec.x * AU_TO_SCREEN_UNITS;
        const y = vec.y * AU_TO_SCREEN_UNITS;
        const z = vec.z * AU_TO_SCREEN_UNITS;
        
        // Smoothly move the controls target to the planet
        controlsRef.current.target.lerp(new THREE.Vector3(x, y, z), delta * 2);
        
        // If we are far away, zoom in automatically
        if (camera.position.distanceTo(new THREE.Vector3(x,y,z)) > 100) {
           // This is a simple helper to "fly" to the planet
           camera.position.lerp(new THREE.Vector3(x, y + 5, z + 15), delta * 0.5);
        }
      }
    } else if (controlsRef?.current) {
      // Reset to Sun center
      controlsRef.current.target.lerp(new THREE.Vector3(0,0,0), delta * 2);
    }
    controlsRef?.current?.update();
  });

  return (
    <>
      <ambientLight intensity={0.1} />
      <Sun onBodyFocus={onBodyFocus} />
      
      {PLANETS.map(planet => (
        <group key={planet.name}>
          <Planet 
            config={planet} 
            currentDate={currentDate} 
            focusedBody={focusedBody} 
            onBodyFocus={onBodyFocus}
            onLocationClick={onLocationClick}
            kpValue={kpValue}
          />
          <OrbitTrail body={planet.body} color={planet.color} />
        </group>
      ))}
    </>
  );
}