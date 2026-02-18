import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarProminenceLoopsProps {
  active: boolean;
  intensity?: number;
  sunRadius?: number;
  loopCount?: number;
}

/**
 * Solar Prominence 3D Loops using CatmullRomCurve3
 * Creates realistic coronal mass ejection arcs on the Sun's surface
 */
export function SolarProminenceLoops({ 
  active, 
  intensity = 1.0, 
  sunRadius = 5,
  loopCount = 8 
}: SolarProminenceLoopsProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate multiple prominence loops
  const loops = useMemo(() => {
    const loopMeshes: THREE.Mesh[] = [];
    
    for (let i = 0; i < loopCount; i++) {
      // Random position on Sun's surface
      const theta = (Math.PI * 2 * i) / loopCount + Math.random() * 0.3;
      const phi = Math.PI * 0.3 + Math.random() * 0.4; // Equatorial bias
      
      // Base point on surface
      const baseX = sunRadius * Math.sin(phi) * Math.cos(theta);
      const baseY = sunRadius * Math.sin(phi) * Math.sin(theta);
      const baseZ = sunRadius * Math.cos(phi);
      
      // Create arc control points
      const height = sunRadius * (0.8 + Math.random() * 1.2); // Loop height
      const spread = sunRadius * 0.3; // Loop width
      
      const points = [
        new THREE.Vector3(baseX, baseY, baseZ), // Start on surface
        new THREE.Vector3(
          baseX * 1.3,
          baseY * 1.3,
          baseZ * 1.3 + height * 0.5
        ), // Mid-rise
        new THREE.Vector3(
          baseX * 1.5,
          baseY * 1.5,
          baseZ * 1.5 + height
        ), // Peak
        new THREE.Vector3(
          baseX * 1.3 + spread,
          baseY * 1.3,
          baseZ * 1.3 + height * 0.5
        ), // Descend
        new THREE.Vector3(
          baseX + spread,
          baseY,
          baseZ
        ) // Land on surface
      ];
      
      // Create smooth curve
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        64, // segments
        0.08, // radius
        8, // radial segments
        false
      );
      
      // Plasma material (red-orange glow) - removed emissive as MeshBasicMaterial doesn't support it
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(1.0, 0.5 + Math.random() * 0.3, 0.0),
        transparent: true,
        opacity: 0.0,
      });
      
      const mesh = new THREE.Mesh(tubeGeometry, material);
      mesh.userData.baseOpacity = 0.6 + Math.random() * 0.3;
      mesh.userData.pulseOffset = Math.random() * Math.PI * 2;
      
      loopMeshes.push(mesh);
    }
    
    return loopMeshes;
  }, [sunRadius, loopCount]);
  
  // Animate loops
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    loops.forEach((mesh, idx) => {
      const material = mesh.material as THREE.MeshBasicMaterial;
      const pulseOffset = mesh.userData.pulseOffset;
      const baseOpacity = mesh.userData.baseOpacity;
      
      if (active) {
        // Pulse animation
        const pulse = Math.sin(time * 2.0 + pulseOffset) * 0.5 + 0.5;
        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          baseOpacity * pulse * intensity,
          0.1
        );
        
        // Slight rotation
        mesh.rotation.z += 0.001;
      } else {
        // Fade out
        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          0.0,
          0.05
        );
      }
    });
    
    // Rotate entire group slowly
    groupRef.current.rotation.y += 0.0005;
  });
  
  return (
    <group ref={groupRef}>
      {loops.map((mesh, idx) => (
        <primitive key={idx} object={mesh} />
      ))}
    </group>
  );
}
