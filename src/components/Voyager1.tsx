import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

interface Voyager1Props {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
}

/**
 * Voyager 1 - Interstellar Space Probe
 * Launched 1977, now 24 billion km from Earth
 * The farthest human-made object
 */
export default function Voyager1({ onBodyFocus, focusedBody }: Voyager1Props) {
  const voyagerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load Voyager sprite texture
  const voyagerTexture = useLoader(TextureLoader, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Voyager_spacecraft_model.png/800px-Voyager_spacecraft_model.png');

  // Voyager 1 is approximately 159 AU from Sun (as of 2026)
  const AU_TO_SCREEN_UNITS = 40;
  const distance = 159 * AU_TO_SCREEN_UNITS; // Way out there!

  // Position in interstellar space (roughly in direction of constellation Ophiuchus)
  const position = new THREE.Vector3(distance * 0.7, distance * 0.3, distance * 0.6);

  return (
    <group ref={voyagerRef} position={position}>
      {/* Voyager Sprite */}
      <sprite
        scale={[2, 2, 2]}
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('Voyager 1');
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
        <spriteMaterial map={voyagerTexture} transparent />
      </sprite>

      {/* Hover Label */}
      {(hovered || focusedBody === 'Voyager 1') && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-amber-400 rounded-lg p-3 text-sm font-mono text-amber-300 min-w-[260px] shadow-[0_0_25px_rgba(251,191,36,0.4)]">
            <h3 className="text-xl text-white font-bold mb-2">🚀 VOYAGER 1</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">DISTANCE:</span>
              <span className="text-amber-200">159 AU</span>
              <span className="font-bold">SPEED:</span>
              <span className="text-amber-200">17 km/s</span>
              <span className="font-bold">LAUNCHED:</span>
              <span className="text-amber-200">Sept 5, 1977</span>
              <span className="font-bold">STATUS:</span>
              <span className="text-green-400">INTERSTELLAR</span>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              Farthest human-made object 🌌
            </div>
            <div className="mt-1 text-center text-xs text-amber-200">
              Carrying Golden Record for aliens
            </div>
            {hovered && !focusedBody && (
              <div className="mt-2 text-center bg-amber-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
                CLICK TO TRACK
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
