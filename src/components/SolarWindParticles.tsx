import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
  const particlesRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  // Create particle geometry
  const { positions, velocities } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spawn in a cone from Sun toward outer solar system
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 + 5;
      const spread = Math.random() * 10 - 5;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius + spread;
      positions[i3 + 2] = spread;
      
      // Velocity toward +X (outward from Sun)
      velocities[i3] = 0.05 + Math.random() * 0.1;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
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

      // Reset particles that go too far
      if (array[i] > 100) {
        array[i] = -20;
        array[i + 1] = (Math.random() - 0.5) * 20;
        array[i + 2] = (Math.random() - 0.5) * 20;
      }
    }

    positionsAttr.needsUpdate = true;

    // Color transition based on solar wind speed
    // 300-400 km/s = white (normal)
    // 400-600 km/s = yellow-orange (elevated)
    // 600-800 km/s = orange-red (high)
    // 800+ km/s = angry red (extreme)
    
    let r = 1.0, g = 1.0, b = 1.0;
    
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
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
