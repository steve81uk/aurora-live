/**
 * AdvancedCMEParticles - High-velocity coronal mass ejection system
 * Triggers on G1+ storms, 5000 particles burst from Sun to Earth
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AdvancedCMEParticlesProps {
  sunPosition: THREE.Vector3;
  earthPosition: THREE.Vector3;
  earthRadius: number;
  solarFlareActive: boolean;
  flareIntensity?: number; // 1-10 scale
  onEarthImpact?: () => void;
}

export function AdvancedCMEParticles({
  sunPosition,
  earthPosition,
  solarFlareActive,
  flareIntensity = 5,
  earthRadius,
  onEarthImpact
}: AdvancedCMEParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const burstRef = useRef({ active: false, time: 0, triggered: false });
  const impactNotifiedRef = useRef(false);

  // Create particle system
  const [positions, colors, velocities, lifetimes] = useMemo(() => {
    const count = 5000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);

    // Initialize at Sun position
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = sunPosition.x;
      pos[i3 + 1] = sunPosition.y;
      pos[i3 + 2] = sunPosition.z;
      
      // Orange-white plasma colors
      col[i3] = 1.0;
      col[i3 + 1] = 0.6 + Math.random() * 0.4;
      col[i3 + 2] = 0.1 + Math.random() * 0.3;
      
      // Velocities (will be set on burst)
      vel[i3] = 0;
      vel[i3 + 1] = 0;
      vel[i3 + 2] = 0;
      
      life[i] = 1.0; // Full life
    }

    return [pos, col, vel, life];
  }, [sunPosition]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    return geo;
  }, [positions, colors, lifetimes]);

  // Trigger burst when flare becomes active
  useEffect(() => {
    if (solarFlareActive && !burstRef.current.triggered) {
      // Initiate CME burst
      burstRef.current.active = true;
      burstRef.current.time = 0;
      burstRef.current.triggered = true;
      impactNotifiedRef.current = false;

      // Set particle velocities toward Earth
      const direction = new THREE.Vector3()
        .subVectors(earthPosition, sunPosition)
        .normalize();

      for (let i = 0; i < 5000; i++) {
        const i3 = i * 3;
        
        // Add spread cone (CME isn't perfectly directed)
        const spreadAngle = (Math.random() - 0.5) * 0.3; // ±0.3 radians
        const spreadX = Math.cos(spreadAngle) * direction.x - Math.sin(spreadAngle) * direction.z;
        const spreadZ = Math.sin(spreadAngle) * direction.x + Math.cos(spreadAngle) * direction.z;
        
        // Velocity based on flare intensity (500-1500 km/s simulated as units/sec)
        const speed = (0.5 + Math.random() * 0.5) * (flareIntensity / 5) * 2.0;
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        velocities[i3] = spreadX * speed;
        velocities[i3 + 1] = direction.y * speed;
        velocities[i3 + 2] = spreadZ * speed;
        
        // Reset lifetime
        lifetimes[i] = 1.0;
        
        // Reset position to Sun
        positions[i3] = sunPosition.x;
        positions[i3 + 1] = sunPosition.y;
        positions[i3 + 2] = sunPosition.z;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.lifetime.needsUpdate = true;
    }

    // Reset trigger when flare ends
    if (!solarFlareActive) {
      burstRef.current.triggered = false;
    }
  }, [solarFlareActive, earthPosition, sunPosition, flareIntensity, geometry, velocities, lifetimes, positions]);

  // Animate particles
  useFrame((state, delta) => {
    if (!burstRef.current.active) return;

    burstRef.current.time += delta;
    let anyActive = false;

    for (let i = 0; i < 5000; i++) {
      const i3 = i * 3;
      
      if (lifetimes[i] <= 0) continue;
      
      anyActive = true;

      // Update position
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      // Check distance from Sun (auto-dispose past Mars orbit = ~1.5 AU = ~60 units)
      const distFromSun = Math.sqrt(
        (positions[i3] - sunPosition.x) ** 2 +
        (positions[i3 + 1] - sunPosition.y) ** 2 +
        (positions[i3 + 2] - sunPosition.z) ** 2
      );

      if (distFromSun > 60) {
        lifetimes[i] = 0; // Dispose
        continue;
      }

      // Check Earth impact
      const distFromEarth = Math.sqrt(
        (positions[i3] - earthPosition.x) ** 2 +
        (positions[i3 + 1] - earthPosition.y) ** 2 +
        (positions[i3 + 2] - earthPosition.z) ** 2
      );

      if (distFromEarth < earthRadius * 2.5) {
        // Impact! Trigger magnetosphere wobble
        if (!impactNotifiedRef.current && onEarthImpact) {
          onEarthImpact();
          impactNotifiedRef.current = true;
        }
        lifetimes[i] = 0; // Particle absorbed
      } else {
        // Fade over time
        lifetimes[i] -= delta * 0.15;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.lifetime.needsUpdate = true;

    // Deactivate burst if all particles dead
    if (!anyActive) {
      burstRef.current.active = false;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
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
