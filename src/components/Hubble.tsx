import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';

interface HubbleProps {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
  earthPosition: THREE.Vector3;
  onVehicleBoard?: (vehicle: string) => void;
}

/**
 * Hubble Space Telescope
 * Orbits Earth at ~540 km altitude in Low Earth Orbit (LEO)
 * Orbital period: ~95 minutes
 */
export default function Hubble({ onBodyFocus, focusedBody, earthPosition, onVehicleBoard }: HubbleProps) {
  const hubbleRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load Hubble sprite texture with fallback
  const hubbleTexture = useLoader(
    TextureLoader, 
    'https://upload.wikimedia.org/wikipedia/commons/3/3f/HST-SM4.jpeg',
    undefined,
    (error) => {
      console.warn('Failed to load Hubble texture:', error);
    }
  );

  // Hubble orbital parameters (simplified circular orbit)
  const orbitalRadius = 1.0 + 0.054; // Earth radius + 540 km (scaled)
  const orbitalSpeed = (2 * Math.PI) / 95; // 95 minutes per orbit

  useFrame(({ clock }) => {
    if (hubbleRef.current) {
      const t = clock.getElapsedTime() * orbitalSpeed;
      
      // Circular orbit around Earth (inclined 28.5°)
      const inclination = (28.5 * Math.PI) / 180;
      const x = Math.cos(t) * orbitalRadius;
      const y = Math.sin(t) * orbitalRadius * Math.sin(inclination);
      const z = Math.sin(t) * orbitalRadius * Math.cos(inclination);
      
      // Position relative to Earth
      hubbleRef.current.position.copy(earthPosition).add(new THREE.Vector3(x, y, z));
      
      // Point aperture away from Earth (always looking into space)
      hubbleRef.current.lookAt(
        hubbleRef.current.position.x * 2,
        hubbleRef.current.position.y * 2,
        hubbleRef.current.position.z * 2
      );
    }
  });

  return (
    <group ref={hubbleRef}>
      {/* Hubble Sprite */}
      <sprite
        scale={[2, 2, 2]}
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('Hubble');
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
        <spriteMaterial map={hubbleTexture} transparent />
      </sprite>

      {/* Hover Label */}
      {hovered && focusedBody !== 'Hubble' && (
        <Html position={[0, 0.15, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-purple-400 rounded-lg p-3 text-sm font-mono text-purple-300 min-w-[220px] shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            <h3 className="text-xl text-white font-bold mb-2">🔭 HUBBLE SPACE TELESCOPE</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">ALTITUDE:</span>
              <span className="text-purple-200">540 km</span>
              <span className="font-bold">PERIOD:</span>
              <span className="text-purple-200">95 min</span>
              <span className="font-bold">LAUNCHED:</span>
              <span className="text-purple-200">1990</span>
              <span className="font-bold">STATUS:</span>
              <span className="text-green-400">OPERATIONAL</span>
            </div>
            <div className="mt-2 text-center bg-purple-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
              CLICK TO TRACK
            </div>
          </div>
        </Html>
      )}

      {/* Focused View */}
      {focusedBody === 'Hubble' && (
        <Html position={[0.2, 0, 0]} center>
          <div className="flex flex-col gap-2">
            {onVehicleBoard && (
              <button
                className="pointer-events-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 border-2 border-purple-400 rounded-lg text-white font-bold text-sm transition-all hover:scale-110 shadow-[0_0_15px_purple] flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onVehicleBoard('Hubble');
                }}
              >
                🔭 VIEW THROUGH HUBBLE
              </button>
            )}
            <button
              className="pointer-events-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded border border-gray-500 transition-all text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onBodyFocus('');
              }}
            >
              ✕ CLOSE
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
