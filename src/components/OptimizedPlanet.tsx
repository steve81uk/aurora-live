/**
 * OptimizedPlanet — Textured 3D planet sphere with LOD
 * Real-time astronomical position driven from parent.
 */

import { useRef, useState, Suspense } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Planet } from '../data/celestial';

// Planet colours as fallback when texture path missing
const FALLBACK_COLORS: Record<string, string> = {
  Mercury: '#b5b5b5',
  Venus: '#e8cda0',
  Earth: '#1a6b8a',
  Mars: '#c1440e',
  Jupiter: '#c88b3a',
  Saturn: '#e4d191',
  Uranus: '#7de8e8',
  Neptune: '#3f54ba',
};

interface OptimizedPlanetProps {
  config: Planet;
  position: [number, number, number];
  onBodyFocus?: (name: string) => void;
}

function PlanetMesh({ config, position, onBodyFocus }: OptimizedPlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Slow axial rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  // Try to load texture; fallback to colour material
  let texture: THREE.Texture | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    texture = useLoader(THREE.TextureLoader, `/${config.texture}`);
  } catch {
    texture = null;
  }

  const radius = config.radius * 1.2; // Visual scale
  const color = FALLBACK_COLORS[config.name] ?? '#888888';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onBodyFocus?.(config.name)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
        )}
      </mesh>

      {/* Saturn rings */}
      {config.name === 'Saturn' && (
        <mesh rotation={[Math.PI / 3.5, 0, 0]}>
          <ringGeometry args={[radius * 1.3, radius * 2.1, 64]} />
          <meshBasicMaterial color="#c8b070" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Orbital label */}
      {hovered && (
        <Html distanceFactor={40}>
          <div className="text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap
            text-cyan-300 bg-black/70 border-cyan-500/40 uppercase tracking-widest">
            {config.name}
            {config.distance && <span className="text-gray-400 ml-1">· {config.distance}</span>}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function OptimizedPlanet(props: OptimizedPlanetProps) {
  return (
    <Suspense fallback={null}>
      <PlanetMesh {...props} />
    </Suspense>
  );
}
