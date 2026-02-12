/**
 * CME Particle System
 * Simulates coronal mass ejection particles traveling from Sun to Earth
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CMEParticleSystemProps {
  active: boolean;
  solarWindSpeed: number; // km/s
}

export function CMEParticleSystem({ active, solarWindSpeed }: CMEParticleSystemProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  
  // Calculate travel time from Sun to Earth (1 AU ≈ 150 million km)
  // Travel time in hours = 150,000,000 km / (speed km/s) / 3600 s/h
  const travelTimeHours = 150000000 / solarWindSpeed / 3600;
  
  // Create particles
  const { positions, velocities, sizes, colors } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    // Sun position (origin)
    const sunPos = new THREE.Vector3(0, 0, 0);
    // Earth position (40 units away based on AU_TO_SCREEN_UNITS)
    const earthPos = new THREE.Vector3(40, 0, 0);
    
    const direction = new THREE.Vector3().subVectors(earthPos, sunPos).normalize();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Start all particles at Sun with small random spread
      const spread = 2;
      positions[i3] = sunPos.x + (Math.random() - 0.5) * spread;
      positions[i3 + 1] = sunPos.y + (Math.random() - 0.5) * spread;
      positions[i3 + 2] = sunPos.z + (Math.random() - 0.5) * spread;
      
      // Velocity toward Earth with variation
      const speedVariation = 0.8 + Math.random() * 0.4; // 80-120% of base speed
      velocities[i3] = direction.x * speedVariation;
      velocities[i3 + 1] = direction.y * speedVariation;
      velocities[i3 + 2] = direction.z * speedVariation;
      
      // Particle size
      sizes[i] = Math.random() * 0.3 + 0.1;
      
      // Color: orange to yellow (CME glow)
      const colorMix = Math.random();
      colors[i3] = 1.0; // R
      colors[i3 + 1] = 0.4 + colorMix * 0.4; // G
      colors[i3 + 2] = 0.1; // B
    }
    
    return { positions, velocities, sizes, colors };
  }, []);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current || !active) return;
    
    timeRef.current += delta;
    
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const count = posArray.length / 3;
    
    // Speed factor (scaled for visual effect)
    const speedFactor = solarWindSpeed / 400; // Normalize to typical 400 km/s
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move particle along velocity vector
      posArray[i3] += velocities[i3] * delta * speedFactor * 0.5;
      posArray[i3 + 1] += velocities[i3 + 1] * delta * speedFactor * 0.5;
      posArray[i3 + 2] += velocities[i3 + 2] * delta * speedFactor * 0.5;
      
      // Reset particle if it passes Earth or goes too far
      const distance = Math.sqrt(
        posArray[i3] ** 2 + posArray[i3 + 1] ** 2 + posArray[i3 + 2] ** 2
      );
      
      if (distance > 45 || posArray[i3] > 42) {
        // Reset to Sun position
        const spread = 2;
        posArray[i3] = (Math.random() - 0.5) * spread;
        posArray[i3 + 1] = (Math.random() - 0.5) * spread;
        posArray[i3 + 2] = (Math.random() - 0.5) * spread;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (!active) return null;
  
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
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
