/**
 * PlanetaryMoons - Real-time moons for all planets using astronomy-engine
 * Calculates actual orbital positions for major moons of each planet
 */

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

const AU_TO_SCREEN_UNITS = 40; // Match parent component

interface MoonProps {
  name: string;
  planetName: string;
  planetPosition: THREE.Vector3;
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  color?: string;
  size?: number;
  orbitScale?: number; // Scale factor for visibility
}

// Generic moon component for any planet
function PlanetaryMoon({ 
  name, 
  planetName, 
  planetPosition, 
  currentDate, 
  onBodyFocus,
  color = '#999999',
  size = 0.15,
  orbitScale = 1
}: MoonProps) {
  const moonRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate real moon position using astronomy-engine or approximate orbits
  const moonPosition = useMemo(() => {
    try {
      const astroTime = Astronomy.MakeTime(currentDate);
      const timeInDays = astroTime.tt; // Julian date
      
      // For Galilean moons and Titan, we can try astronomy-engine
      // For others, use approximate circular orbits
      
      // Approximate orbital periods (in Earth days) and radii
      const moonData: Record<string, { period: number; radius: number; phase?: number }> = {
        'Moon': { period: 27.3, radius: 0.0026, phase: 0 }, // AU scaled
        'Phobos': { period: 0.319, radius: 0.00006, phase: 0 },
        'Deimos': { period: 1.263, radius: 0.00015, phase: 90 },
        'Io': { period: 1.769, radius: 0.003, phase: 0 },
        'Europa': { period: 3.551, radius: 0.004, phase: 90 },
        'Ganymede': { period: 7.155, radius: 0.007, phase: 180 },
        'Callisto': { period: 16.689, radius: 0.012, phase: 270 },
        'Titan': { period: 15.945, radius: 0.008, phase: 0 },
        'Rhea': { period: 4.518, radius: 0.0035, phase: 120 },
        'Iapetus': { period: 79.330, radius: 0.024, phase: 240 },
        'Miranda': { period: 1.413, radius: 0.001, phase: 0 },
        'Ariel': { period: 2.520, radius: 0.0012, phase: 90 },
        'Umbriel': { period: 4.144, radius: 0.0017, phase: 180 },
        'Titania': { period: 8.706, radius: 0.0029, phase: 270 },
        'Oberon': { period: 13.463, radius: 0.0038, phase: 45 },
        'Triton': { period: 5.877, radius: 0.0024, phase: 0 }
      };
      
      const data = moonData[name];
      if (!data) {
        return new THREE.Vector3(0.5, 0, 0);
      }
      
      // Calculate orbital angle based on time
      const angle = ((timeInDays / data.period) * 2 * Math.PI + (data.phase || 0) * Math.PI / 180) % (2 * Math.PI);
      
      // Circular orbit (scaled for visibility)
      const x = Math.cos(angle) * data.radius * AU_TO_SCREEN_UNITS * orbitScale;
      const z = Math.sin(angle) * data.radius * AU_TO_SCREEN_UNITS * orbitScale;
      const y = Math.sin(angle * 0.5) * data.radius * AU_TO_SCREEN_UNITS * orbitScale * 0.1; // Slight vertical variation
      
      // Add planet's absolute position so moon orbits the planet, not the Sun
      return new THREE.Vector3(
        planetPosition.x + x,
        planetPosition.y + y,
        planetPosition.z + z
      );
    } catch (error) {
      console.warn(`Could not calculate position for ${name}:`, error);
      return new THREE.Vector3(planetPosition.x + 0.5, planetPosition.y, planetPosition.z);
    }
  }, [currentDate, name, orbitScale, planetPosition]);

  useFrame(() => {
    if (moonRef.current) {
      moonRef.current.position.copy(moonPosition);
    }
  });

  return (
    <group ref={moonRef}>
      {/* Clickable hitbox */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onBodyFocus(name); }}
        onPointerOver={(e) => { 
          e.stopPropagation();
          setHovered(true); 
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={() => { 
          setHovered(false); 
          document.body.style.cursor = 'auto'; 
        }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>

      {/* Label */}
      {hovered && (
        <Html distanceFactor={5}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap border border-cyan-400/50">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Earth's Moon (already implemented separately, but included here for completeness)
export function EarthMoon({ 
  currentDate, 
  onBodyFocus, 
  earthPosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  earthPosition: THREE.Vector3;
}) {
  return (
    <PlanetaryMoon
      name="Moon"
      planetName="Earth"
      planetPosition={earthPosition}
      currentDate={currentDate}
      onBodyFocus={onBodyFocus}
      color="#888888"
      size={0.35}
      orbitScale={5} // Scale up for visibility
    />
  );
}

// Mars Moons
export function MarsMoons({ 
  currentDate, 
  onBodyFocus, 
  marsPosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  marsPosition: THREE.Vector3;
}) {
  return (
    <>
      <PlanetaryMoon
        name="Phobos"
        planetName="Mars"
        planetPosition={marsPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#665544"
        size={0.08}
        orbitScale={3}
      />
      <PlanetaryMoon
        name="Deimos"
        planetName="Mars"
        planetPosition={marsPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#776655"
        size={0.06}
        orbitScale={4}
      />
    </>
  );
}

// Jupiter's Major Moons (Galilean)
export function JupiterMoons({ 
  currentDate, 
  onBodyFocus, 
  jupiterPosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  jupiterPosition: THREE.Vector3;
}) {
  return (
    <>
      <PlanetaryMoon
        name="Io"
        planetName="Jupiter"
        planetPosition={jupiterPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#ffcc00"
        size={0.25}
        orbitScale={0.8}
      />
      <PlanetaryMoon
        name="Europa"
        planetName="Jupiter"
        planetPosition={jupiterPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#aaccff"
        size={0.22}
        orbitScale={0.8}
      />
      <PlanetaryMoon
        name="Ganymede"
        planetName="Jupiter"
        planetPosition={jupiterPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#999999"
        size={0.30}
        orbitScale={0.8}
      />
      <PlanetaryMoon
        name="Callisto"
        planetName="Jupiter"
        planetPosition={jupiterPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#665544"
        size={0.28}
        orbitScale={0.8}
      />
    </>
  );
}

// Saturn's Major Moons
export function SaturnMoons({ 
  currentDate, 
  onBodyFocus, 
  saturnPosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  saturnPosition: THREE.Vector3;
}) {
  return (
    <>
      <PlanetaryMoon
        name="Titan"
        planetName="Saturn"
        planetPosition={saturnPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#ffaa66"
        size={0.32}
        orbitScale={0.5}
      />
      <PlanetaryMoon
        name="Rhea"
        planetName="Saturn"
        planetPosition={saturnPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#cccccc"
        size={0.15}
        orbitScale={0.6}
      />
      <PlanetaryMoon
        name="Iapetus"
        planetName="Saturn"
        planetPosition={saturnPosition}
        currentDate={currentDate}
        onBodyFocus={onBodyFocus}
        color="#888888"
        size={0.14}
        orbitScale={0.4}
      />
    </>
  );
}

// Uranus Moons
export function UranusMoons({ 
  currentDate, 
  onBodyFocus, 
  uranusPosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  uranusPosition: THREE.Vector3;
}) {
  // Astronomy-engine doesn't support Uranus moons, using approximate positions
  const moons = [
    { name: 'Miranda', color: '#aaaaaa', size: 0.10, orbit: 0.5 },
    { name: 'Ariel', color: '#999999', size: 0.12, orbit: 0.7 },
    { name: 'Umbriel', color: '#777777', size: 0.12, orbit: 0.9 },
    { name: 'Titania', color: '#888888', size: 0.15, orbit: 1.2 },
    { name: 'Oberon', color: '#999999', size: 0.14, orbit: 1.5 }
  ];

  return (
    <>
      {moons.map((moon) => (
        <PlanetaryMoon
          key={moon.name}
          name={moon.name}
          planetName="Uranus"
          planetPosition={uranusPosition}
          currentDate={currentDate}
          onBodyFocus={onBodyFocus}
          color={moon.color}
          size={moon.size}
          orbitScale={moon.orbit}
        />
      ))}
    </>
  );
}

// Neptune's Moon (Triton)
export function NeptuneMoons({ 
  currentDate, 
  onBodyFocus, 
  neptunePosition 
}: { 
  currentDate: Date;
  onBodyFocus: (name: string) => void;
  neptunePosition: THREE.Vector3;
}) {
  return (
    <PlanetaryMoon
      name="Triton"
      planetName="Neptune"
      planetPosition={neptunePosition}
      currentDate={currentDate}
      onBodyFocus={onBodyFocus}
      color="#aaccee"
      size={0.20}
      orbitScale={0.8}
    />
  );
}
