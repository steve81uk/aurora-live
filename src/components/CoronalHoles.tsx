/**
 * CoronalHoles - Dark regions on Sun emitting high-speed solar wind
 * Particles flow from noise-masked regions, speed linked to DSCOVR data
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoronalHolesProps {
  sunPosition: THREE.Vector3;
  sunRadius: number;
  solarWindSpeed: number; // km/s from DSCOVR
  visible?: boolean;
}

export function CoronalHoles({
  sunPosition,
  sunRadius,
  solarWindSpeed,
  visible = true
}: CoronalHolesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Generate hole positions (simplified: poles and random equatorial)
  const holePositions = useMemo(() => {
    const holes: THREE.Vector3[] = [];
    
    // North pole hole
    holes.push(new THREE.Vector3(0, sunRadius, 0));
    
    // South pole hole
    holes.push(new THREE.Vector3(0, -sunRadius, 0));
    
    // 2-4 random equatorial holes
    const equatorialCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < equatorialCount; i++) {
      const angle = (i / equatorialCount) * Math.PI * 2;
      const latitude = (Math.random() - 0.5) * 0.6; // Near equator
      const x = sunRadius * Math.cos(angle) * Math.cos(latitude);
      const y = sunRadius * Math.sin(latitude);
      const z = sunRadius * Math.sin(angle) * Math.cos(latitude);
      holes.push(new THREE.Vector3(x, y, z));
    }
    
    return holes;
  }, [sunRadius]);

  // Create streaming particles
  const [positions, colors, velocities, ages] = useMemo(() => {
    const particleCount = 2000;
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const age = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start at a random hole
      const hole = holePositions[Math.floor(Math.random() * holePositions.length)];
      pos[i3] = sunPosition.x + hole.x;
      pos[i3 + 1] = sunPosition.y + hole.y;
      pos[i3 + 2] = sunPosition.z + hole.z;
      
      // Direction: radial outward from Sun
      const dir = hole.clone().normalize();
      const speed = 0.5 + Math.random() * 0.5; // Base speed
      vel[i3] = dir.x * speed;
      vel[i3 + 1] = dir.y * speed;
      vel[i3 + 2] = dir.z * speed;
      
      // Dim cyan-white color (high-speed wind)
      col[i3] = 0.7 + Math.random() * 0.3;
      col[i3 + 1] = 0.9 + Math.random() * 0.1;
      col[i3 + 2] = 1.0;
      
      age[i] = Math.random(); // Random starting age
    }

    return [pos, col, vel, age];
  }, [holePositions, sunPosition]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('age', new THREE.BufferAttribute(ages, 1));
    return geo;
  }, [positions, colors, ages]);

  // Animate streamers
  useFrame((state, delta) => {
    if (!particlesRef.current || !visible) return;

    timeRef.current += delta;

    // Speed multiplier based on DSCOVR data (400-800 km/s typical)
    const speedMultiplier = solarWindSpeed > 500 ? 1.5 : 1.0;

    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;
      
      // Update position
      positions[i3] += velocities[i3] * delta * speedMultiplier;
      positions[i3 + 1] += velocities[i3 + 1] * delta * speedMultiplier;
      positions[i3 + 2] += velocities[i3 + 2] * delta * speedMultiplier;
      
      // Age particle
      ages[i] += delta * 0.2;
      
      // Reset if too old or too far
      const distFromSun = Math.sqrt(
        (positions[i3] - sunPosition.x) ** 2 +
        (positions[i3 + 1] - sunPosition.y) ** 2 +
        (positions[i3 + 2] - sunPosition.z) ** 2
      );
      
      if (ages[i] > 1.0 || distFromSun > 30) {
        // Respawn at hole
        const hole = holePositions[Math.floor(Math.random() * holePositions.length)];
        positions[i3] = sunPosition.x + hole.x;
        positions[i3 + 1] = sunPosition.y + hole.y;
        positions[i3 + 2] = sunPosition.z + hole.z;
        
        const dir = hole.clone().normalize();
        const speed = 0.5 + Math.random() * 0.5;
        velocities[i3] = dir.x * speed;
        velocities[i3 + 1] = dir.y * speed;
        velocities[i3 + 2] = dir.z * speed;
        
        ages[i] = 0;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.age.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
