import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ParkerSolarProbe - NASA's Parker Solar Probe
 * Orbits very close to the Sun in an elliptical path
 * The real probe is the fastest human-made object
 */
export function ParkerSolarProbe() {
  const probeRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime() * 2; // Fast orbit (realistic speed would be even faster)
      
      // Elliptical orbit near sun (perihelion ~0.04 AU, aphelion ~0.7 AU)
      const a = 4; // Semi-major axis (screen units)
      const b = 2; // Semi-minor axis (makes it elliptical)
      
      probeRef.current.position.set(
        Math.cos(t) * a, 
        Math.sin(t * 1.5) * 1, // Slight inclination
        Math.sin(t) * b
      );
      
      // Rotate probe for visual effect
      probeRef.current.rotation.y += 0.05;
    }
  });

  return (
    <group 
      ref={probeRef}
      onPointerOver={(e) => { 
        e.stopPropagation(); 
        setIsHovered(true); 
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => { 
        setIsHovered(false); 
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Probe Body (small golden box) */}
      <mesh>
        <boxGeometry args={[0.08, 0.08, 0.15]} />
        <meshBasicMaterial color="#ffcc00" />
      </mesh>
      
      {/* Heat Shield (white circular shield) */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 8]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Solar Panels (simplified) */}
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.1]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.1]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Hover Info Card */}
      {isHovered && (
        <Html distanceFactor={8} position={[0, 0.3, 0]}>
          <div className="bg-black/95 backdrop-blur-xl border border-orange-500 rounded-lg p-3 text-[10px] min-w-[180px]">
            <div className="text-orange-400 font-bold text-xs">PARKER SOLAR PROBE</div>
            <div className="text-orange-300 text-[9px] mb-1">NASA HELIOPHYSICS MISSION</div>
            <div className="text-white mt-1">Launched: Aug 12, 2018</div>
            <div className="text-white">Speed: 430,000 mph (peak)</div>
            <div className="text-white">Perihelion: 3.8M miles</div>
            <div className="text-green-400 mt-1">Status: OPERATIONAL</div>
            <div className="text-orange-300 italic text-[8px] mt-1">"Touching the Sun"</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Need to import React at the top
import * as React from 'react';
