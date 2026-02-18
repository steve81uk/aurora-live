import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarProminenceProps {
  active: boolean;
  intensity?: number;
  sunRadius?: number;
}

/**
 * Solar Prominence / CME Particle System
 * Renders dynamic plasma ejections from the Sun's surface
 */
export function SolarProminence({ active, intensity = 1.0, sunRadius = 5 }: SolarProminenceProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  
  // Create particle geometry and material
  const { geometry, material, velocities } = useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const vels = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start particles on Sun's surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions[i3] = sunRadius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = sunRadius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = sunRadius * Math.cos(phi);
      
      // Random velocities for ejection
      vels[i3] = (Math.random() - 0.5) * 0.05;
      vels[i3 + 1] = (Math.random() - 0.5) * 0.05;
      vels[i3 + 2] = (Math.random() - 0.5) * 0.05;
      
      // Plasma colors (red-orange-yellow)
      const heat = Math.random();
      colors[i3] = 1.0; // R
      colors[i3 + 1] = 0.3 + heat * 0.5; // G
      colors[i3 + 2] = 0.0; // B
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const mat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    return { geometry: geo, material: mat, velocities: vels };
  }, [sunRadius]);
  
  velocitiesRef.current = velocities;
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current || !velocitiesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const vels = velocitiesRef.current;
    
    if (active) {
      // Update particle positions
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += vels[i] * intensity;
        positions[i + 1] += vels[i + 1] * intensity;
        positions[i + 2] += vels[i + 2] * intensity;
        
        // Reset particles that go too far
        const dist = Math.sqrt(
          positions[i] ** 2 +
          positions[i + 1] ** 2 +
          positions[i + 2] ** 2
        );
        
        if (dist > sunRadius * 3) {
          // Reset to Sun surface
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          positions[i] = sunRadius * Math.sin(phi) * Math.cos(theta);
          positions[i + 1] = sunRadius * Math.sin(phi) * Math.sin(theta);
          positions[i + 2] = sunRadius * Math.cos(phi);
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Fade in/out based on active state
    if (particlesRef.current.material) {
      const targetOpacity = active ? 0.8 : 0.0;
      const currentOpacity = (particlesRef.current.material as THREE.PointsMaterial).opacity;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = THREE.MathUtils.lerp(
        currentOpacity,
        targetOpacity,
        0.05
      );
    }
  });
  
  return (
    <points ref={particlesRef} geometry={geometry} material={material} />
  );
}
