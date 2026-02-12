import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { UniverseBackground } from './UniverseBackground';

interface SurfaceViewProps {
  location?: { name: string; lat: number; lon: number };
  kpValue: number;
  currentDate: Date;
  onExit: () => void;
}

/**
 * SurfaceView - First-person view from planet surface
 * Look up at stars, aurora, and atmosphere
 */
export default function SurfaceView({ location, kpValue, currentDate, onExit }: SurfaceViewProps) {
  const auroraRef = useRef<THREE.Mesh>(null);

  // Animate aurora waves
  useFrame(({ clock }) => {
    if (auroraRef.current) {
      const time = clock.getElapsedTime();
      auroraRef.current.position.y = 50 + Math.sin(time * 0.5) * 5;
      auroraRef.current.rotation.z = Math.sin(time * 0.3) * 0.2;
    }
  });

  return (
    <>
      {/* Sky (Universe Background) */}
      <UniverseBackground />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={['#0a0a15', 10, 300]} />

      {/* Ambient Light */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[50, 100, 50]} intensity={0.5} />

      {/* Ground Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[200, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          roughness={0.9} 
          metalness={0.1}
        />
      </mesh>

      {/* Aurora in Sky (if Kp > 3) */}
      {kpValue > 3 && (
        <mesh ref={auroraRef} position={[0, 50, -100]}>
          <planeGeometry args={[150, 40, 32, 16]} />
          <meshBasicMaterial
            color={kpValue > 6 ? "#ff00ff" : "#00ff88"}
            transparent
            opacity={0.4 + (kpValue - 3) * 0.1}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Distant Mountains/Horizon */}
      <mesh position={[0, -2, -150]}>
        <cylinderGeometry args={[250, 250, 5, 32, 1, true]} />
        <meshBasicMaterial color="#0d0d1a" side={THREE.BackSide} />
      </mesh>

      {/* First-Person Controls */}
      <PointerLockControls makeDefault />

      {/* HUD Welcome Message */}
      <Html
        position={[0, 0, -5]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center">
          <div className="text-cyan-400 text-3xl font-bold mb-2 animate-pulse">
            {location ? `WELCOME TO ${location.name.toUpperCase()}` : 'SURFACE VIEW'}
          </div>
          <div className="text-white text-sm opacity-70">
            Lat: {location?.lat.toFixed(2)}° | Lon: {location?.lon.toFixed(2)}°
          </div>
          <div className="text-green-400 text-lg mt-4">
            Kp Index: {kpValue.toFixed(1)} | {kpValue > 5 ? 'AURORA VISIBLE!' : 'Clear Sky'}
          </div>
        </div>
      </Html>

      {/* Launch Button (Top Right) */}
      <Html position={[8, 5, -10]}>
        <button
          onClick={onExit}
          className="pointer-events-auto px-6 py-3 bg-cyan-600/80 hover:bg-cyan-500 border-2 border-cyan-400 rounded-lg text-white font-bold text-lg transition-all hover:scale-110 shadow-[0_0_20px_cyan] flex items-center gap-2"
        >
          🚀 LAUNCH TO ORBIT
        </button>
      </Html>

      {/* Instructions (Bottom Center) */}
      <Html position={[0, -4, -10]} center>
        <div className="pointer-events-none text-center text-white/50 text-sm space-y-1">
          <div>MOVE MOUSE to look around</div>
          <div>ESC to unlock pointer</div>
        </div>
      </Html>
    </>
  );
}
