import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function RealisticSun({ onBodyFocus }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      // Pulse effect
      const scale = 1.2 + Math.sin(t * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
      // Rotate slowly
      glowRef.current.rotation.z -= 0.002;
    }
  });

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onBodyFocus('Sun'); }}>
      {/* 1. CORE STAR (Bright White-Yellow Center) */}
      <mesh>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial color="#FFD700" toneMapped={false} />
      </mesh>

      {/* 2. INNER CORONA (Orange Glow) */}
      <mesh>
        <sphereGeometry args={[5.2, 64, 64]} />
        <meshBasicMaterial 
          color="#FF8C00" 
          transparent 
          opacity={0.4} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 3. OUTER ATMOSPHERE (Pulsing Red-Orange Halo) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial 
          color="#FF4500" 
          transparent 
          opacity={0.2} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 4. LIGHT SOURCE */}
      <pointLight intensity={2.5} distance={10000} decay={0} color="#FFFACD" />
      <ambientLight intensity={0.1} />
    </group>
  );
}