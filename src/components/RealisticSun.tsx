import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RealisticSunProps {
  onBodyFocus: (name: string) => void;
  kpValue?: number; // NEW: React to space weather
}

export function RealisticSun({ onBodyFocus, kpValue = 3 }: RealisticSunProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const flareGroupRef = useRef<THREE.Group>(null);

  // Solar activity level based on Kp
  const activityLevel = useMemo(() => {
    if (kpValue >= 7) return 'extreme'; // G4-G5 storm
    if (kpValue >= 5) return 'high';    // G3 storm
    if (kpValue >= 4) return 'medium';  // G1-G2 storm
    return 'calm';                       // Quiet
  }, [kpValue]);

  // Color shift based on activity
  const coreColor = useMemo(() => {
    switch (activityLevel) {
      case 'extreme': return '#FF3333'; // Angry red
      case 'high': return '#FF6600';    // Hot orange
      case 'medium': return '#FFAA00';  // Warm orange
      default: return '#FFD700';         // Normal gold
    }
  }, [activityLevel]);

  const coronaColor = useMemo(() => {
    switch (activityLevel) {
      case 'extreme': return '#FF0000';
      case 'high': return '#FF4500';
      case 'medium': return '#FF8C00';
      default: return '#FF8C00';
    }
  }, [activityLevel]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    if (glowRef.current) {
      // Pulse intensity based on activity
      const pulseSpeed = activityLevel === 'extreme' ? 4 : activityLevel === 'high' ? 3 : 2;
      const pulseAmount = activityLevel === 'extreme' ? 0.15 : activityLevel === 'high' ? 0.1 : 0.05;
      const scale = 1.2 + Math.sin(t * pulseSpeed) * pulseAmount;
      glowRef.current.scale.set(scale, scale, scale);
      glowRef.current.rotation.z -= 0.002;
    }

    // Flare animation (if Kp > 5)
    if (flareGroupRef.current && kpValue > 5) {
      flareGroupRef.current.children.forEach((flare, index) => {
        flare.rotation.y = t + index;
        const flareScale = 1 + Math.sin(t * 5 + index) * 0.3;
        flare.scale.set(flareScale, flareScale, flareScale);
      });
    }
  });

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onBodyFocus('Sun'); }}>
      {/* 1. CORE STAR (Color changes with Kp) */}
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color={coreColor} toneMapped={false} />
      </mesh>

      {/* 2. INNER CORONA */}
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshBasicMaterial 
          color={coronaColor}
          transparent 
          opacity={activityLevel === 'extreme' ? 0.6 : 0.4} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 3. OUTER ATMOSPHERE (Pulsing) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial 
          color={activityLevel === 'extreme' ? '#FFFF00' : '#FF4500'}
          transparent 
          opacity={activityLevel === 'extreme' ? 0.3 : 0.2} 
          side={THREE.BackSide} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* 4. SOLAR FLARES (Kp > 5) */}
      {kpValue > 5 && (
        <group ref={flareGroupRef}>
          {[0, 1, 2].map((index) => (
            <mesh key={index} position={[
              Math.cos(index * 2) * 5.5,
              Math.sin(index * 2) * 5.5,
              0
            ]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial
                color="#FFFF00"
                transparent
                opacity={0.7}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. CME SHOCKWAVE (Kp >= 7) */}
      {kpValue >= 7 && (
        <mesh>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial
            color="#FF0000"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Point Light (brighter during storms) */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={activityLevel === 'extreme' ? 3 : 2} 
        decay={0}
        color={coreColor}
      />
    </group>
  );
}