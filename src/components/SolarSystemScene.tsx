import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { TextureLoader } from 'three';
import RealisticSun from './RealisticSun';

// --- CONFIGURATION ---
const AU_TO_SCREEN_UNITS = 40;

const MOONS = [
  { parent: 'Earth', name: 'Moon', radius: 0.27, dist: 3, speed: 0.5, color: '#ccc' },
  { parent: 'Mars', name: 'Phobos', radius: 0.1, dist: 1.2, speed: 2, color: '#888' },
  { parent: 'Jupiter', name: 'Io', radius: 0.2, dist: 5, speed: 1.5, color: '#ffaa00' },
  { parent: 'Jupiter', name: 'Europa', radius: 0.18, dist: 6, speed: 1.2, color: '#aaffff' },
  { parent: 'Saturn', name: 'Titan', radius: 0.3, dist: 7, speed: 0.8, color: '#ffcc00' },
];

export const PLANETS = [
  // CRITICAL FIX: All paths now have leading '/' and lowercase 'textures/'
  { name: 'Mercury', body: Astronomy.Body.Mercury, radius: 0.4, texture: '/textures/2k_mercury.jpg', type: 'Rocky', temp: '430°C' },
  { name: 'Venus', body: Astronomy.Body.Venus, radius: 0.9, texture: '/textures/2k_venus_surface.jpg', type: 'Rocky', temp: '462°C' },
  { name: 'Earth', body: Astronomy.Body.Earth, radius: 1.0, texture: '/textures/8k_earth_daymap.jpg', type: 'Habitable', temp: '15°C' },
  { name: 'Mars', body: Astronomy.Body.Mars, radius: 0.5, texture: '/textures/2k_mars.jpg', type: 'Rocky', temp: '-63°C' },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter, radius: 4.0, texture: '/textures/2k_jupiter.jpg', type: 'Gas Giant', temp: '-108°C' },
  { name: 'Saturn', body: Astronomy.Body.Saturn, radius: 3.5, texture: '/textures/2k_saturn.jpg', type: 'Gas Giant', temp: '-139°C' },
  { name: 'Uranus', body: Astronomy.Body.Uranus, radius: 2.0, texture: '/textures/2k_uranus.jpg', type: 'Ice Giant', temp: '-197°C' },
  { name: 'Neptune', body: Astronomy.Body.Neptune, radius: 2.0, texture: '/textures/2k_neptune.jpg', type: 'Ice Giant', temp: '-201°C' },
  { name: 'Pluto', body: Astronomy.Body.Pluto, radius: 0.2, texture: '/textures/2k_mercury.jpg', type: 'Dwarf', temp: '-232°C' }
];

export const CITIES = [
  { name: 'Anchorage', lat: 61.2181, lon: -149.9003, color: '#22d3ee' },
  { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, color: '#22d3ee' },
  { name: 'Tromsø', lat: 69.6492, lon: 18.9553, color: '#22d3ee' },
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

function MoonSystem({ parentName }: any) {
  const myMoons = MOONS.filter(m => m.parent === parentName);
  return (
    <group>
      {myMoons.map((moon, i) => (
        <OrbitingMoon key={i} moon={moon} />
      ))}
    </group>
  );
}

function OrbitingMoon({ moon }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * moon.speed * 0.3;
      ref.current.position.set(Math.cos(t) * moon.dist, 0, Math.sin(t) * moon.dist);
    }
  });
  return (
    <group ref={ref}>
      {/* HITBOX FOR MOON */}
      <mesh visible={false} onClick={(e) => { e.stopPropagation(); alert(`Targeting Moon: ${moon.name}`); }}>
         <sphereGeometry args={[moon.radius * 3, 16, 16]} /> 
      </mesh>
      {/* VISIBLE MOON */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[moon.radius, 16, 16]} />
        <meshStandardMaterial color={moon.color} />
      </mesh>
    </group>
  );
}

function EarthGroup({ config, kpValue, onLocationClick, onBodyFocus }: any) {
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // FIX: Loading ALL Earth textures with leading '/'
  const [day, night, clouds] = useLoader(TextureLoader, [
    '/textures/8k_earth_daymap.jpg',
    '/textures/8k_earth_nightmap.jpg',
    '/textures/8k_earth_clouds.jpg'
  ]);

  useFrame(() => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0003;
  });

  return (
    <group>
      {/* HITBOX (Invisible click target) */}
      <mesh visible={false} onClick={(e) => { e.stopPropagation(); onBodyFocus('Earth'); }}>
         <sphereGeometry args={[config.radius * 1.4, 32, 32]} />
      </mesh>

      {/* EARTH SURFACE - CLICKABLE */}
      <mesh 
        castShadow receiveShadow 
        onClick={(e) => { e.stopPropagation(); onBodyFocus('Earth'); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial map={day} emissiveMap={night} emissiveIntensity={0.5} transparent={false} />
      </mesh>

      {/* CLOUDS - RAYCAST NULL (Clicks pass through this layer!) */}
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial map={clouds} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* AURORA - RAYCAST NULL (Clicks pass through this layer!) */}
      <mesh scale={[1.15, 1.15, 1.15]} raycast={() => null}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshBasicMaterial color={kpValue > 5 ? "#ff0044" : "#4ade80"} transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* CITIES */}
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

      <MoonSystem parentName="Earth" />
    </group>
  );
}

function TexturedPlanet({ config, focusedBody, onBodyFocus }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, config.texture) as THREE.Texture;

  useFrame(() => {
    if (groupRef.current) {
      const astroTime = Astronomy.MakeTime(new Date());
      const helio = Astronomy.HelioVector(config.body, astroTime);
      groupRef.current.position.set(helio.x * AU_TO_SCREEN_UNITS, helio.y * AU_TO_SCREEN_UNITS, helio.z * AU_TO_SCREEN_UNITS);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Hitbox */}
      <mesh visible={false} onClick={(e) => { e.stopPropagation(); onBodyFocus(config.name); }}>
         <sphereGeometry args={[config.radius * 1.5, 32, 32]} />
      </mesh>

      <mesh castShadow receiveShadow>
        <sphereGeometry args={[config.radius, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Hover Label */}
      {focusedBody === config.name && (
        <Html distanceFactor={15} position={[0, config.radius + 1, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/90 border border-cyan-500 p-2 text-xs font-mono text-cyan-400 w-32">
            <div>{config.name}</div>
            <div>{config.temp}</div>
          </div>
        </Html>
      )}

      <MoonSystem parentName={config.name} />
    </group>
  );
}

export default function SolarSystemScene({ kpValue, focusedBody, onBodyFocus, onLocationClick }: any) {
  return (
    <>
      <ambientLight intensity={0.2} />
      
      {/* Realistic Sun with corona and glow layers */}
      <group onClick={() => onBodyFocus(null)}>
        <RealisticSun />
      </group>

      {PLANETS.map(planet => (
        <group key={planet.name}>
          {planet.name === 'Earth' ? (
            <EarthGroup config={planet} kpValue={kpValue} onLocationClick={onLocationClick} onBodyFocus={onBodyFocus} />
          ) : (
            <TexturedPlanet config={planet} focusedBody={focusedBody} onBodyFocus={onBodyFocus} />
          )}
        </group>
      ))}
    </>
  );
}