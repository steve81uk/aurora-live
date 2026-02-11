import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RealisticSun() {
  const sunRef = useRef<THREE.Group>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Rotate sun slowly
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.0002;
    }
    
    // Pulsing corona effect (subtle solar activity)
    if (coronaRef.current) {
      const pulse = Math.sin(time * 0.5) * 0.05 + 1;
      coronaRef.current.scale.setScalar(pulse);
      const material = coronaRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 0.3) * 0.1;
    }
    
    // Outer glow pulsing
    if (glowRef.current) {
      const glowPulse = Math.sin(time * 0.3) * 0.03 + 1;
      glowRef.current.scale.setScalar(glowPulse);
    }
  });

  return (
    <group ref={sunRef} position={[0, 0, 0]}>
      {/* Core Sun Body - Bright yellow-orange */}
      <mesh castShadow>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial 
          color="#FFAA00"
          toneMapped={false}
        />
      </mesh>

      {/* Inner Corona Layer - Orange glow */}
      <mesh ref={coronaRef} scale={1.15}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Middle Glow Layer - Deep orange */}
      <mesh scale={1.35}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#FF6600"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Glow Layer - Orange-red */}
      <mesh ref={glowRef} scale={1.6}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#FF4500"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Extreme Outer Glow - Reddish fade */}
      <mesh scale={2.0}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial
          color="#FF2200"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Point Light for illumination */}
      <pointLight
        intensity={2.5}
        decay={0}
        color="#FDB813"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Lens Flare effect (bright center bloom) */}
      <sprite scale={[15, 15, 1]} position={[0, 0, 0]}>
        <spriteMaterial
          color="#FFFF88"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}
