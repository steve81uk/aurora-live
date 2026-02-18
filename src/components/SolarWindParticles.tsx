import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointsMaterial, AdditiveBlending } from 'three';

interface SolarWindParticlesProps {
  solarWindSpeed: number;
  kpValue: number;
}

/**
 * SolarWindParticles - Dynamic particle system
 * Color changes from white → red as solar wind speed increases
 * Inspired by NASA real-time data visualization
 */
export default function SolarWindParticles({ solarWindSpeed, kpValue }: SolarWindParticlesProps) {
  const particlesRef = useRef<Points>(null);
  const materialRef = useRef<PointsMaterial>(null);

  // Create particle geometry - RADIAL from Sun center
  const { positions, velocities } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spawn in spherical shell around Sun (radial distribution)
      const theta = Math.random() * Math.PI * 2; // Azimuthal angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform sphere)
      const radius = 5 + Math.random() * 30; // Distance from Sun center
      
      // Convert spherical to Cartesian
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Velocity RADIALLY OUTWARD from Sun (normalize direction)
      const length = Math.sqrt(x * x + y * y + z * z);
      const speed = 0.05 + Math.random() * 0.08;
      velocities[i3] = (x / length) * speed;
      velocities[i3 + 1] = (y / length) * speed;
      velocities[i3 + 2] = (z / length) * speed;
    }

    return { positions, velocities };
  }, []);

  useFrame(() => {
    if (!particlesRef.current || !materialRef.current) return;

    const positionsAttr = particlesRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    // Update particle positions
    for (let i = 0; i < array.length; i += 3) {
      // Move particles
      array[i] += velocities[i] * (solarWindSpeed / 400); // Speed factor
      array[i + 1] += velocities[i + 1];
      array[i + 2] += velocities[i + 2];

      // Reset particles that go too far (distance check from origin)
      const distance = Math.sqrt(array[i] * array[i] + array[i + 1] * array[i + 1] + array[i + 2] * array[i + 2]);
      if (distance > 120) {
        // Respawn near Sun center with random spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const spawnRadius = 5 + Math.random() * 3;
        
        const x = spawnRadius * Math.sin(phi) * Math.cos(theta);
        const y = spawnRadius * Math.sin(phi) * Math.sin(theta);
        const z = spawnRadius * Math.cos(phi);
        
        array[i] = x;
        array[i + 1] = y;
        array[i + 2] = z;
        
        // Recalculate velocity (radially outward)
        const len = Math.sqrt(x * x + y * y + z * z);
        const speed = 0.05 + Math.random() * 0.08;
        velocities[i] = (x / len) * speed;
        velocities[i + 1] = (y / len) * speed;
        velocities[i + 2] = (z / len) * speed;
      }
    }

    positionsAttr.needsUpdate = true;

    // Color transition based on solar wind speed
    // 300-400 km/s = solar yellow (normal) - matches the Sun's corona
    // 400-600 km/s = yellow-orange (elevated)
    // 600-800 km/s = orange-red (high)
    // 800+ km/s = angry red (extreme)
    
    let r = 1.0, g = 0.75, b = 0.15; // Default: warm solar yellow
    
    if (solarWindSpeed > 800) {
      // Angry red
      r = 1.0;
      g = 0.1;
      b = 0.1;
    } else if (solarWindSpeed > 600) {
      // Orange-red
      const t = (solarWindSpeed - 600) / 200;
      r = 1.0;
      g = 0.3 + (0.2 - 0.3) * t;
      b = 0.0;
    } else if (solarWindSpeed > 400) {
      // Yellow-orange
      const t = (solarWindSpeed - 400) / 200;
      r = 1.0;
      g = 1.0 - (0.7 * t);
      b = 1.0 - t;
    }
    
    // Add Kp influence (high Kp = more red tint)
    if (kpValue > 5) {
      const kpFactor = (kpValue - 5) / 4; // 0 to 1 as Kp goes 5→9
      r = Math.min(1, r + kpFactor * 0.3);
      g = Math.max(0.1, g - kpFactor * 0.5);
    }

    materialRef.current.color.setRGB(r, g, b);
    
    // Size pulsing based on Kp
    // Fix typo in SolarWindParticles.tsx
    const baseSize = 0.05;
    const pulseSize = Math.sin(Date.now() * 0.003) * 0.02 * (kpValue / 9);
    materialRef.current.size = baseSize + pulseSize;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
