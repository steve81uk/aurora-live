/**
 * Solar Flare Particle System
 * Epic particle emitter for M-class and X-class solar flares
 * Shoots 5,000 cyan-glowing particles from Sun to Earth using GSAP
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface SolarFlareParticlesProps {
  sunPosition: THREE.Vector3;
  earthPosition: THREE.Vector3;
  xrayFlux: number; // W/m²
  isActive: boolean; // Trigger for M-class or above
  onImpact?: () => void;
}

export function SolarFlareParticles({
  sunPosition,
  earthPosition,
  xrayFlux,
  isActive,
  onImpact
}: SolarFlareParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array>(new Float32Array(5000 * 3));
  const lifetimesRef = useRef<Float32Array>(new Float32Array(5000));
  const activeRef = useRef(false);
  const impactTriggeredRef = useRef(false);

  // Particle count
  const PARTICLE_COUNT = 5000;

  // Create particle geometry and material
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    // Initialize all particles at Sun position
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Start at Sun
      positions[i3] = sunPosition.x;
      positions[i3 + 1] = sunPosition.y;
      positions[i3 + 2] = sunPosition.z;

      // Sun-like radiation color (orange/yellow like actual solar particles)
      const intensity = 0.8 + Math.random() * 0.2;
      colors[i3] = 1.0 * intensity;     // R (orange/yellow)
      colors[i3 + 1] = 0.6 * intensity; // G
      colors[i3 + 2] = 0.0 * intensity; // B (sun-colored radiation)

      // Random sizes
      sizes[i] = 0.5 + Math.random() * 1.5;

      // Initialize velocities (will be set when triggered)
      velocitiesRef.current[i3] = 0;
      velocitiesRef.current[i3 + 1] = 0;
      velocitiesRef.current[i3 + 2] = 0;

      // Lifetimes
      lifetimesRef.current[i] = 0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    return { geometry: geo, material: mat };
  }, [sunPosition.x, sunPosition.y, sunPosition.z]);

  // Trigger particle emission when flare becomes active
  useEffect(() => {
    if (isActive && !activeRef.current) {
      activeRef.current = true;
      impactTriggeredRef.current = false;
      emitParticles();
    } else if (!isActive && activeRef.current) {
      activeRef.current = false;
    }
  }, [isActive]);

  // Emit particles from Sun toward Earth
  const emitParticles = () => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const direction = new THREE.Vector3()
      .subVectors(earthPosition, sunPosition)
      .normalize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Reset to Sun position with slight random spread
      const spreadAngle = (Math.random() - 0.5) * 0.3; // 30 degree cone
      const spreadDir = direction.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), spreadAngle)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * 0.3);

      positions[i3] = sunPosition.x + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = sunPosition.y + (Math.random() - 0.5) * 2;
      positions[i3 + 2] = sunPosition.z + (Math.random() - 0.5) * 2;

      // Set velocities toward Earth with variation
      const speed = 0.3 + Math.random() * 0.2; // Vary speed
      velocitiesRef.current[i3] = spreadDir.x * speed;
      velocitiesRef.current[i3 + 1] = spreadDir.y * speed;
      velocitiesRef.current[i3 + 2] = spreadDir.z * speed;

      // Reset lifetime
      lifetimesRef.current[i] = Math.random() * 2; // Staggered start
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Animate with GSAP for smooth deceleration
    gsap.to(material, {
      opacity: 0.9,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(material, {
          opacity: 0.0,
          duration: 8,
          delay: 2,
          ease: 'power2.in'
        });
      }
    });
  };

  // Update particles every frame
  useFrame((state, delta) => {
    if (!particlesRef.current || !activeRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;

    let particlesNearEarth = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] += delta;

      // Only update if particle is alive (lifetime < 10s)
      if (lifetimes[i] < 10) {
        // Update position
        positions[i3] += velocities[i3] * delta * 60;
        positions[i3 + 1] += velocities[i3 + 1] * delta * 60;
        positions[i3 + 2] += velocities[i3 + 2] * delta * 60;

        // Check distance to Earth
        const particlePos = new THREE.Vector3(
          positions[i3],
          positions[i3 + 1],
          positions[i3 + 2]
        );
        const distToEarth = particlePos.distanceTo(earthPosition);

        if (distToEarth < 3) {
          particlesNearEarth++;
          // Particle reached Earth, fade it out
          lifetimes[i] = 10;
        }
      } else {
        // Reset dead particles
        positions[i3] = sunPosition.x;
        positions[i3 + 1] = sunPosition.y;
        positions[i3 + 2] = sunPosition.z;
        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Trigger impact event when significant particles reach Earth
    if (particlesNearEarth > 100 && !impactTriggeredRef.current) {
      impactTriggeredRef.current = true;
      if (onImpact) {
        onImpact();
      }
    }
  });

  if (!isActive && !activeRef.current) {
    return null; // Don't render when inactive
  }

  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
}
