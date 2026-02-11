import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';

const AU_TO_SCREEN_UNITS = 40;

interface UFOProps {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
  currentDate: Date;
  onVehicleBoard?: (vehicle: string) => void;
}

/**
 * Secret UFO hidden behind Mercury
 * Always stays on opposite side from Earth's perspective
 */
export default function UFO({ onBodyFocus, focusedBody, currentDate, onVehicleBoard }: UFOProps) {
  const ufoRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [discovered, setDiscovered] = useState(false);

  useFrame(() => {
    if (ufoRef.current) {
      // Get Mercury's position
      const astroTime = Astronomy.MakeTime(currentDate);
      const mercury = Astronomy.HelioVector(Astronomy.Body.Mercury, astroTime);
      const earth = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
      
      // Calculate direction from Mercury to Earth
      const toEarth = new THREE.Vector3(
        earth.x - mercury.x,
        earth.y - mercury.y,
        earth.z - mercury.z
      ).normalize();
      
      // Position UFO on opposite side of Mercury (away from Earth)
      const offset = toEarth.multiplyScalar(-1.5); // 1.5 units behind Mercury
      
      ufoRef.current.position.set(
        (mercury.x + offset.x) * AU_TO_SCREEN_UNITS,
        (mercury.y + offset.y) * AU_TO_SCREEN_UNITS,
        (mercury.z + offset.z) * AU_TO_SCREEN_UNITS
      );
      
      // Slow rotation for mystery
      ufoRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={ufoRef}>
      {/* UFO Body */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          setDiscovered(true);
          onBodyFocus('UFO');
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
        {/* Saucer Top */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#444444" metalness={0.9} roughness={0.1} emissive="#00ff00" emissiveIntensity={0.3} />
        </mesh>
        
        {/* Saucer Bottom */}
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Center Ring */}
        <mesh>
          <torusGeometry args={[0.12, 0.03, 8, 24]} />
          <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.1} emissive="#00ff00" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Cockpit */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#00ff00" transparent opacity={0.6} emissive="#00ff00" emissiveIntensity={0.8} />
        </mesh>
        
        {/* Glowing Lights */}
        <pointLight position={[0, -0.1, 0]} intensity={0.5} distance={2} color="#00ff00" />
        <pointLight position={[0, 0.15, 0]} intensity={0.3} distance={1} color="#00ff00" />
      </group>

      {/* Hover/Discovery Label */}
      {(hovered || (discovered && focusedBody === 'UFO')) && (
        <Html position={[0, 0.3, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-green-400 rounded-lg p-3 text-sm font-mono text-green-300 min-w-[200px] shadow-[0_0_30px_rgba(0,255,0,0.6)]">
            <h3 className="text-xl text-white font-bold mb-2 animate-pulse">👽 UFO DETECTED</h3>
            <div className="text-xs text-gray-300 mb-2">
              <div className="text-green-400 font-bold">CLASSIFIED: TOP SECRET</div>
              <div className="mt-1">ORIGIN: Unknown</div>
              <div>STATUS: Observing Mercury</div>
              <div>VISIBILITY: Hidden from Earth</div>
            </div>
            {discovered && (
              <div className="mt-2 text-center bg-green-900/50 py-1 rounded text-white text-xs font-bold">
                ⚠️ FIRST CONTACT ACHIEVED ⚠️
              </div>
            )}
            {!discovered && hovered && (
              <div className="mt-2 text-center bg-green-900/50 py-1 rounded text-white text-xs animate-pulse">
                CLICK TO INVESTIGATE
              </div>
            )}
          </div>
        </Html>
      )}
      
      {/* Achievement Badge */}
      {discovered && focusedBody !== 'UFO' && (
        <Html position={[0, 0.25, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="text-2xl animate-bounce">
            🛸
          </div>
        </Html>
      )}
      
      {/* BOARD BUTTON when focused */}
      {focusedBody === 'UFO' && discovered && onVehicleBoard && (
        <Html position={[0, -0.5, 0]} center>
          <button
            className="pointer-events-auto px-3 py-2 bg-green-600 hover:bg-green-500 border-2 border-green-400 rounded-lg text-white font-bold text-xs transition-all hover:scale-110 shadow-[0_0_15px_lime] flex items-center gap-1 animate-pulse"
            onClick={(e) => {
              e.stopPropagation();
              onVehicleBoard('UFO');
            }}
          >
            👽 BOARD UFO
          </button>
        </Html>
      )}
    </group>
  );
}
