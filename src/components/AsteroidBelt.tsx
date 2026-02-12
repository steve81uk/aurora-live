import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  visible?: boolean;
}

/**
 * Asteroid Belt & Kuiper Belt
 * Main Belt: 2000 asteroids between Mars and Jupiter
 * Kuiper Belt: Sparse icy bodies past Neptune
 */
export default function AsteroidBelt({ visible = true }: AsteroidBeltProps) {
  const mainBeltRef = useRef<THREE.InstancedMesh>(null);
  const kuiperBeltRef = useRef<THREE.InstancedMesh>(null);

  const AU_TO_SCREEN_UNITS = 40;

  // Main Belt asteroids (between Mars and Jupiter: 2.2 - 3.3 AU)
  const mainBeltData = useMemo(() => {
    const count = 500; // REDUCED from 2000 for performance
    const data: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (2.2 + Math.random() * 1.1) * AU_TO_SCREEN_UNITS; // 2.2-3.3 AU
      const yOffset = (Math.random() - 0.5) * 0.3 * AU_TO_SCREEN_UNITS; // Vertical spread
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      data.push({
        position: new THREE.Vector3(x, yOffset, z),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.02 + Math.random() * 0.05, // Small rocks
      });
    }
    
    return data;
  }, [AU_TO_SCREEN_UNITS]);

  // Kuiper Belt (past Neptune: 30 - 50 AU)
  const kuiperBeltData = useMemo(() => {
    const count = 300; // REDUCED from 1500 for performance
    const data: { position: THREE.Vector3; rotation: THREE.Euler; scale: number }[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (30 + Math.random() * 20) * AU_TO_SCREEN_UNITS; // 30-50 AU
      const yOffset = (Math.random() - 0.5) * 1.5 * AU_TO_SCREEN_UNITS; // Thicker disk
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      data.push({
        position: new THREE.Vector3(x, yOffset, z),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.03 + Math.random() * 0.08, // Slightly larger (icy)
      });
    }
    
    return data;
  }, [AU_TO_SCREEN_UNITS]);

  // Set up instanced meshes
  useMemo(() => {
    if (mainBeltRef.current) {
      const dummy = new THREE.Object3D();
      mainBeltData.forEach((data, i) => {
        dummy.position.copy(data.position);
        dummy.rotation.copy(data.rotation);
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        mainBeltRef.current!.setMatrixAt(i, dummy.matrix);
      });
      mainBeltRef.current.instanceMatrix.needsUpdate = true;
    }
    
    if (kuiperBeltRef.current) {
      const dummy = new THREE.Object3D();
      kuiperBeltData.forEach((data, i) => {
        dummy.position.copy(data.position);
        dummy.rotation.copy(data.rotation);
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        kuiperBeltRef.current!.setMatrixAt(i, dummy.matrix);
      });
      kuiperBeltRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [mainBeltData, kuiperBeltData]);

  // Slow rotation animation
  useFrame(({ clock }) => {
    if (mainBeltRef.current) {
      mainBeltRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
    if (kuiperBeltRef.current) {
      kuiperBeltRef.current.rotation.y = clock.getElapsedTime() * 0.01; // Slower
    }
  });

  if (!visible) return null;

  return (
    <>
      {/* Main Asteroid Belt */}
      <instancedMesh 
        ref={mainBeltRef} 
        args={[undefined, undefined, mainBeltData.length]}
        frustumCulled={false}
        raycast={() => null}
        castShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#888888"
          roughness={0.8}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Kuiper Belt */}
      <instancedMesh 
        ref={kuiperBeltRef} 
        args={[undefined, undefined, kuiperBeltData.length]}
        frustumCulled={false}
        raycast={() => null}
        castShadow
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#AABBCC"
          roughness={0.7}
          metalness={0.2}
        />
      </instancedMesh>
    </>
  );
}
