import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TiangongProps {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
  earthPosition: THREE.Vector3;
  onVehicleBoard?: (vehicle: string) => void;
}

/**
 * Tiangong Space Station (Chinese)
 * Orbits Earth at ~400 km altitude, 41.5° inclination
 * Operational since 2021
 */
export default function Tiangong({ onBodyFocus, focusedBody, earthPosition, onVehicleBoard }: TiangongProps) {
  const tiangongRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [velocity, setVelocity] = useState(7.7); // km/s orbital velocity

  // Tiangong orbital parameters
  const orbitalRadius = 1.0 + 0.04; // Earth radius + 400 km (scaled)
  const orbitalSpeed = (2 * Math.PI) / 92; // ~92 minutes per orbit
  const inclination = (41.5 * Math.PI) / 180; // 41.5° inclination

  useFrame(({ clock }) => {
    if (tiangongRef.current) {
      const t = clock.getElapsedTime() * orbitalSpeed;
      
      // Orbital position with inclination
      const x = Math.cos(t) * orbitalRadius;
      const y = Math.sin(t) * orbitalRadius * Math.sin(inclination);
      const z = Math.sin(t) * orbitalRadius * Math.cos(inclination);
      
      // Position relative to Earth
      tiangongRef.current.position.copy(earthPosition).add(new THREE.Vector3(x, y, z));
      
      // Orient along velocity vector
      tiangongRef.current.lookAt(
        earthPosition.x + x * 1.1,
        earthPosition.y + y * 1.1,
        earthPosition.z + z * 1.1
      );
    }
  });

  return (
    <group ref={tiangongRef}>
      {/* Tiangong Station Model */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('Tiangong');
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
        {/* Core Module (Tianhe) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 16]} />
          <meshStandardMaterial color="#cc0000" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Lab Module 1 (Wentian - Left) */}
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
          <meshStandardMaterial color="#bb0000" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Lab Module 2 (Mengtian - Right) */}
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
          <meshStandardMaterial color="#bb0000" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Solar Panels (Left side) */}
        <group position={[-0.22, 0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.12]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.12]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
        
        {/* Solar Panels (Right side) */}
        <group position={[0.22, 0, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.12]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.12]} />
            <meshStandardMaterial 
              color="#1e3a8a" 
              emissive="#1e40af" 
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
        
        {/* Docking Port (front) */}
        <mesh position={[0, 0, 0.13]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* Chinese Flag Decal (simulated with emissive box) */}
        <mesh position={[0, 0.065, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.001]} />
          <meshStandardMaterial 
            color="#cc0000" 
            emissive="#ffff00" 
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Status Lights */}
        <pointLight position={[0, 0, 0.15]} intensity={0.3} distance={1} color="#ffff00" />
        <pointLight position={[-0.22, 0, 0]} intensity={0.2} distance={1} color="#ff0000" />
        <pointLight position={[0.22, 0, 0]} intensity={0.2} distance={1} color="#ff0000" />
      </group>

      {/* Hover Label */}
      {hovered && focusedBody !== 'Tiangong' && (
        <Html position={[0, 0.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-red-400 rounded-lg p-3 text-sm font-mono text-red-300 min-w-[240px] shadow-[0_0_25px_rgba(239,68,68,0.4)]">
            <h3 className="text-xl text-white font-bold mb-2">🇨🇳 TIANGONG SPACE STATION</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">ALTITUDE:</span>
              <span className="text-red-200">~400 km</span>
              <span className="font-bold">INCLINATION:</span>
              <span className="text-red-200">41.5°</span>
              <span className="font-bold">OPERATIONAL:</span>
              <span className="text-red-200">2021-present</span>
              <span className="font-bold">CREW:</span>
              <span className="text-green-400">3 astronauts</span>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              China's modular space station
            </div>
            <div className="mt-2 text-center bg-red-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
              CLICK TO TRACK
            </div>
          </div>
        </Html>
      )}

      {/* Focused View */}
      {focusedBody === 'Tiangong' && (
        <Html position={[0.3, 0, 0]} center>
          <div className="flex flex-col gap-2">
            {onVehicleBoard && (
              <button
                className="pointer-events-auto px-4 py-2 bg-red-600 hover:bg-red-500 border-2 border-red-400 rounded-lg text-white font-bold text-sm transition-all hover:scale-110 shadow-[0_0_15px_red] flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onVehicleBoard('Tiangong');
                }}
              >
                🚀 BOARD TIANGONG
              </button>
            )}
            <button
              className="pointer-events-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded border border-gray-500 transition-all text-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://www.n2yo.com/satellite/?s=48274', '_blank');
              }}
            >
              📡 LIVE TRACKING
            </button>
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
