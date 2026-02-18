/**
 * SolarLighting - Realistic directional light from the Sun
 * Provides day/night terminator and realistic shading
 */

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SolarLightingProps {
  sunPosition?: THREE.Vector3;
  intensity?: number;
  enableShadows?: boolean;
}

export function SolarLighting({ 
  sunPosition = new THREE.Vector3(0, 0, 0), 
  intensity = 3.5,
  enableShadows = true 
}: SolarLightingProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  
  useFrame(() => {
    if (lightRef.current) {
      // Always point from Sun position toward origin (planets orbit around Sun)
      lightRef.current.position.copy(sunPosition);
      lightRef.current.target.position.set(0, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  useEffect(() => {
    if (lightRef.current && enableShadows) {
      // Configure shadow camera for better quality
      lightRef.current.shadow.camera.left = -50;
      lightRef.current.shadow.camera.right = 50;
      lightRef.current.shadow.camera.top = 50;
      lightRef.current.shadow.camera.bottom = -50;
      lightRef.current.shadow.camera.near = 0.5;
      lightRef.current.shadow.camera.far = 500;
      lightRef.current.shadow.mapSize.width = 2048;
      lightRef.current.shadow.mapSize.height = 2048;
      lightRef.current.shadow.bias = -0.0001;
    }
  }, [enableShadows]);

  return (
    <>
      {/* Main sunlight */}
      <directionalLight
        ref={lightRef}
        intensity={intensity}
        castShadow={enableShadows}
        color="#ffffff"
      />
      
      {/* Ambient fill light (simulates scattered starlight) */}
      <ambientLight intensity={0.15} color="#a5b4fc" />
      
      {/* Subtle back-rim light (simulates reflected light from planets) */}
      <hemisphereLight
        intensity={0.3}
        color="#4a5568"
        groundColor="#1a1a2e"
      />
    </>
  );
}
