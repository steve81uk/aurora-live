import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { useOcclusionDetection } from '../hooks/useOcclusionDetection';
import { useSmartLabelPosition, useLabelDistanceFade } from '../hooks/useSmartLabelPosition';

const AU_TO_SCREEN_UNITS = 40;

interface JWSTProps {
  onBodyFocus: (name: string) => void;
  focusedBody: string | null;
  currentDate: Date;
  onVehicleBoard?: (vehicle: string) => void;
}

/**
 * James Webb Space Telescope
 * Located at L2 Lagrange point (~1.5 million km from Earth, opposite Sun)
 */
export default function JWST({ onBodyFocus, focusedBody, currentDate, onVehicleBoard }: JWSTProps) {
  const jwstRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const positionRef = useRef(new THREE.Vector3());
  
  // Occlusion detection (can be hidden by Sun or Earth)
  const isVisible = useOcclusionDetection(positionRef.current, [
    { position: new THREE.Vector3(0, 0, 0), radius: 5 }, // Sun
    { position: new THREE.Vector3(0, 0, 0), radius: 1.0 } // Earth (will update dynamically)
  ]);
  
  // Smart label positioning
  const labelOffset = useSmartLabelPosition('JWST', positionRef.current, hovered && isVisible, 6);
  
  // Distance fade
  const labelOpacity = useLabelDistanceFade(positionRef.current, 10, 100);
  
  // Create a simple canvas-based texture as fallback
  const jwstTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw JWST hexagonal mirror
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = 32 + 20 * Math.cos(angle);
        const y = 32 + 20 * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#4A9EFF';
      ctx.fillRect(28, 50, 8, 10); // Support structure
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame(() => {
    if (jwstRef.current) {
      // Get Earth position
      const astroTime = Astronomy.MakeTime(currentDate);
      const earth = Astronomy.HelioVector(Astronomy.Body.Earth, astroTime);
      const sun = { x: 0, y: 0, z: 0 }; // Sun at origin
      
      // Calculate L2 position (1.5 million km beyond Earth, away from Sun)
      const earthToSun = new THREE.Vector3(
        sun.x - earth.x,
        sun.y - earth.y,
        sun.z - earth.z
      ).normalize();
      
      // L2 is 1.5 million km (0.01 AU) beyond Earth
      const l2Distance = 0.01; // AU
      const l2Offset = earthToSun.multiplyScalar(-l2Distance); // Opposite direction from Sun
      
      jwstRef.current.position.set(
        (earth.x + l2Offset.x) * AU_TO_SCREEN_UNITS,
        (earth.y + l2Offset.y) * AU_TO_SCREEN_UNITS,
        (earth.z + l2Offset.z) * AU_TO_SCREEN_UNITS
      );
      positionRef.current.copy(jwstRef.current.position);
      
      // JWST always faces away from Sun (sunshield pointing at Sun)
      jwstRef.current.lookAt(
        sun.x * AU_TO_SCREEN_UNITS,
        sun.y * AU_TO_SCREEN_UNITS,
        sun.z * AU_TO_SCREEN_UNITS
      );
    }
  });

  return (
    <group ref={jwstRef}>
      {/* JWST Sprite */}
      <sprite
        scale={[2, 2, 2]}
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('JWST');
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
        <spriteMaterial map={jwstTexture} transparent />
      </sprite>

      {/* Hover Label */}
      {hovered && focusedBody !== 'JWST' && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-yellow-400 rounded-lg p-3 text-sm font-mono text-yellow-300 min-w-[240px] shadow-[0_0_25px_rgba(250,204,21,0.4)]">
            <h3 className="text-xl text-white font-bold mb-2">🌌 JAMES WEBB SPACE TELESCOPE</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">LOCATION:</span>
              <span className="text-yellow-200">L2 Lagrange</span>
              <span className="font-bold">DISTANCE:</span>
              <span className="text-yellow-200">1.5M km</span>
              <span className="font-bold">LAUNCHED:</span>
              <span className="text-yellow-200">Dec 2021</span>
              <span className="font-bold">TEMP:</span>
              <span className="text-yellow-200">-223°C</span>
            </div>
            <div className="mt-2 text-center text-xs text-gray-400">
              Infrared observations of early universe
            </div>
            <div className="mt-2 text-center bg-yellow-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
              CLICK TO TRACK
            </div>
          </div>
        </Html>
      )}

      {/* Focused View */}
      {focusedBody === 'JWST' && (
        <Html position={[0.5, 0, 0]} center>
          <div className="flex flex-col gap-2">
            {onVehicleBoard && (
              <button
                className="pointer-events-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-500 border-2 border-yellow-400 rounded-lg text-white font-bold text-sm transition-all hover:scale-110 shadow-[0_0_15px_gold] flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onVehicleBoard('JWST');
                }}
              >
                🌌 VIEW THROUGH JWST
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
