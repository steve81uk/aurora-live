import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagnetopauseShieldProps {
  earthPosition: THREE.Vector3;
  solarWindStrength?: number;
  impactDetected?: boolean;
}

/**
 * Earth's Magnetopause Shield
 * Visualizes magnetic field boundary and wobbles on CME impact
 */
export function MagnetopauseShield({ 
  earthPosition, 
  solarWindStrength = 0.3,
  impactDetected = false 
}: MagnetopauseShieldProps) {
  const shieldRef = useRef<THREE.Mesh>(null);
  const [wobblePhase, setWobblePhase] = useState(0);
  
  // Wobble animation on impact
  useFrame((state, delta) => {
    if (!shieldRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    if (impactDetected) {
      // Trigger wobble
      setWobblePhase(prev => Math.min(prev + delta * 3, 1));
    } else {
      // Decay wobble
      setWobblePhase(prev => Math.max(prev - delta * 0.5, 0));
    }
    
    // Apply wobble deformation
    const wobble = Math.sin(wobblePhase * Math.PI) * 0.3;
    shieldRef.current.scale.set(
      1 + wobble * 0.1,
      1 + wobble * 0.15,
      1 + wobble * 0.1
    );
    
    // Pulse glow on impact
    const material = shieldRef.current.material as THREE.MeshBasicMaterial;
    const basePulse = Math.sin(time * 2.0) * 0.5 + 0.5;
    const impactPulse = wobblePhase * 0.5;
    material.opacity = 0.15 + basePulse * 0.05 + impactPulse * 0.3;
    
    // Compress shield based on solar wind
    const compression = 1.0 - solarWindStrength * 0.2;
    shieldRef.current.scale.z = compression;
  });
  
  return (
    <mesh ref={shieldRef} position={earthPosition}>
      {/* Ellipsoid shape (compressed by solar wind) */}
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
