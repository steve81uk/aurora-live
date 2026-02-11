import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { TextureLoader } from 'three';
import { RealisticSun } from './RealisticSun';

// --- CONFIGURATION ---
const AU_TO_SCREEN_UNITS = 40;

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

export const CITIES = [
  { name: 'Anchorage', lat: 61.2181, lon: -149.9003, color: '#00ffcc' },
  { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, color: '#00ffcc' },
  { name: 'Tromsø', lat: 69.6492, lon: 18.9553, color: '#00ffcc' },
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

function ParkerSolarProbe() {
  const probeRef = useRef<THREE.Group>(null);
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
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.4]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Heat Shield */}
      <mesh position={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Html distanceFactor={15} position={[0, 1, 0]}>
        <div className="text-[8px] text-yellow-500 font-mono whitespace-nowrap">PARKER PROBE</div>
      </Html>
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

function EarthGroup({ config, kpValue, currentDate, onLocationClick, onBodyFocus }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  const [day, night, clouds] = useLoader(TextureLoader, [
    'textures/8k_earth_daymap.jpg',
    'textures/8k_earth_nightmap.jpg',
    'textures/8k_earth_clouds.jpg'
  ]);

  useFrame(() => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0003;
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      groupRef.current.position.set(helio.x * AU_TO_SCREEN_UNITS, helio.y * AU_TO_SCREEN_UNITS, helio.z * AU_TO_SCREEN_UNITS);
    }
  });

  return (
    <group ref={groupRef}>
      {/* CLICKABLE HITBOX (Transparent, NOT invisible) */}
      <mesh onClick={(e) => { e.stopPropagation(); onBodyFocus('Earth'); }}>
         <sphereGeometry args={[config.radius * 1.15, 32, 32]} />
         <meshBasicMaterial transparent opacity={0} /> 
      </mesh>

      <mesh castShadow receiveShadow>
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
            <mesh onClick={(e) => { e.stopPropagation(); onLocationClick(city); }}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color="#00ffcc" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function TexturedPlanet({ config, currentDate, focusedBody, onBodyFocus }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, config.texture || 'textures/2k_mercury.jpg');
  const [hovered, setHovered] = useState(false);

  useFrame(({clock}) => {
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      groupRef.current.position.set(helio.x * AU_TO_SCREEN_UNITS, helio.y * AU_TO_SCREEN_UNITS, helio.z * AU_TO_SCREEN_UNITS);
    }
  });

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

      {/* R.U.M. (Really Useful Metrics) HOVER CARD */}
      {hovered && focusedBody !== config.name && (
        <Html distanceFactor={20} position={[0, config.radius + 1, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 p-3 rounded-lg text-cyan-400 w-40 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <div className="text-sm font-bold text-white mb-1">{config.name.toUpperCase()}</div>
            <div className="text-[10px] grid grid-cols-2 gap-1 text-gray-300">
               <span>TEMP:</span> <span className="text-right text-cyan-200">{config.temp}</span>
               <span>DIST:</span> <span className="text-right text-cyan-200">{config.distance}</span>
               <span>TYPE:</span> <span className="text-right text-cyan-200">{config.type}</span>
            </div>
            <div className="text-[9px] text-center mt-2 text-cyan-500 animate-pulse">CLICK TO FOCUS</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SolarSystemScene({ kpValue, currentDate = new Date(), focusedBody, onBodyFocus, controlsRef, onLocationClick }: any) {
  return (
    <>
      <RealisticSun onBodyFocus={onBodyFocus} />
      <ParkerSolarProbe />

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
            />
          ) : (
            <TexturedPlanet 
               config={planet} 
               currentDate={currentDate} 
               focusedBody={focusedBody} 
               onBodyFocus={onBodyFocus} 
            />
          )}
        </group>
      ))}
    </>
  );
}