import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as React from 'react';
import { useSimpleOcclusion } from '../hooks/useOcclusionDetection';

/**
 * ParkerSolarProbe - NASA's Parker Solar Probe
 * Orbits very close to the Sun in an elliptical path
 * The real probe is the fastest human-made object
 */
export function ParkerSolarProbe() {
  const probeRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const positionRef = useRef(new THREE.Vector3());

  // Sun occlusion detection
  const isVisible = useSimpleOcclusion(
    positionRef.current,
    new THREE.Vector3(0, 0, 0), // Sun center
    5 // Sun radius
  );

  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime() * 0.08; // MUCH SLOWER - realistic 88-day orbit
      
      // Elliptical orbit parameters (perihelion ~0.04 AU, aphelion ~0.7 AU)
      // Using proper ellipse equation to avoid center intersection
      const a = 8; // Increased semi-major axis - orbit further out
      const e = 0.88; // Very high eccentricity (extremely elliptical)
      
      // Polar coordinates for ellipse: r = a(1-e²)/(1+e*cos(θ))
      const theta = t;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
      
      // Convert to Cartesian with inclination
      const inclination = 7 * (Math.PI / 180); // 7° orbit inclination
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta) * Math.sin(inclination);
      const z = r * Math.sin(theta) * Math.cos(inclination);
      
      // CRITICAL: Ensure minimum distance from Sun center (never closer than Sun radius)
      const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
      const MIN_DISTANCE = 6.0; // Sun radius is 5, add 1.0 safety margin (more clearance)
      
      if (distanceFromCenter < MIN_DISTANCE) {
        // If too close, push outward to safe distance
        const scale = MIN_DISTANCE / distanceFromCenter;
        probeRef.current.position.set(x * scale, y * scale, z * scale);
      } else {
        probeRef.current.position.set(x, y, z);
      }
      
      positionRef.current.copy(probeRef.current.position);
      
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

      {/* Hover Info Card - Only show if visible and not occluded */}
      {isHovered && isVisible && (
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
