import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TeslaRoadsterProps {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
  currentDate: Date;
}

/**
 * Starman (Tesla Roadster in Space)
 * Launched by SpaceX Falcon Heavy on Feb 6, 2018
 * Orbiting the Sun in an elliptical orbit
 */
export default function TeslaRoadster({ onBodyFocus, focusedBody, currentDate }: TeslaRoadsterProps) {
  const teslaRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Simplified orbit (between Earth and Mars)
  const AU_TO_SCREEN_UNITS = 40;
  
  useFrame(({ clock }) => {
    if (teslaRef.current) {
      // Elliptical orbit with period of ~557 days
      const t = clock.getElapsedTime() * 0.03; // Slow orbit
      const a = 1.3; // Semi-major axis (AU)
      const e = 0.26; // Eccentricity
      
      const r = a * (1 - e * e) / (1 + e * Math.cos(t));
      const x = r * Math.cos(t) * AU_TO_SCREEN_UNITS;
      const z = r * Math.sin(t) * AU_TO_SCREEN_UNITS;
      
      teslaRef.current.position.set(x, 0, z);
      teslaRef.current.rotation.y = t; // Slow tumble
    }
  });

  return (
    <group ref={teslaRef}>
      {/* Tesla Roadster Model (simplified) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('Starman');
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Car Body */}
        <mesh>
          <boxGeometry args={[0.25, 0.12, 0.5]} />
          <meshStandardMaterial 
            color="#8B0000" 
            metalness={0.9} 
            roughness={0.1}
          />
        </mesh>
        
        {/* Windshield */}
        <mesh position={[0, 0.08, 0.1]}>
          <boxGeometry args={[0.24, 0.08, 0.2]} />
          <meshStandardMaterial 
            color="#000033" 
            transparent 
            opacity={0.3}
            metalness={0.5}
          />
        </mesh>
        
        {/* Wheels */}
        {[-0.15, 0.15].map((x, i) => (
          <group key={i} position={[x, -0.08, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          </group>
        ))}
        
        {/* Starman (Driver) */}
        <group position={[0, 0.08, 0]}>
          {/* Helmet */}
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.7}
            />
          </mesh>
          {/* Body */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
            <meshStandardMaterial color="#EEEEEE" />
          </mesh>
        </group>
        
        {/* "DON'T PANIC" Sign */}
        <mesh position={[0, 0, -0.26]}>
          <planeGeometry args={[0.15, 0.08]} />
          <meshBasicMaterial color="#FF0000" />
        </mesh>
        
        {/* Subtle glow */}
        <pointLight position={[0, 0, 0]} intensity={0.2} distance={3} color="#8B0000" />
      </group>

      {/* Hover Label */}
      {(hovered || focusedBody === 'Starman') && (
        <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-red-400 rounded-lg p-3 text-sm font-mono text-red-300 min-w-[240px] shadow-[0_0_25px_rgba(239,68,68,0.4)]">
            <h3 className="text-xl text-white font-bold mb-2">🚗 STARMAN (TESLA ROADSTER)</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">LAUNCHED:</span>
              <span className="text-red-200">Feb 6, 2018</span>
              <span className="font-bold">ORBIT:</span>
              <span className="text-red-200">Earth-Mars</span>
              <span className="font-bold">PERIOD:</span>
              <span className="text-red-200">557 days</span>
              <span className="font-bold">MISSION:</span>
              <span className="text-green-400">Vibing 🎵</span>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              SpaceX Falcon Heavy test payload
            </div>
            <div className="mt-1 text-center text-xs text-red-200 italic">
              "DON'T PANIC" - Playing Bowie on repeat
            </div>
            {hovered && !focusedBody && (
              <div className="mt-2 text-center bg-red-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
                CLICK TO TRACK
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
