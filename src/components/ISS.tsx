import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useOcclusionDetection } from '../hooks/useOcclusionDetection';
import { useSmartLabelPosition, useLabelDistanceFade } from '../hooks/useSmartLabelPosition';

interface ISSProps {
  onBodyFocus: (name: string | null) => void;
  focusedBody: string | null;
  earthPosition: THREE.Vector3;
  onVehicleBoard?: (vehicle: string) => void;
}

export default function ISS({ onBodyFocus, focusedBody, earthPosition, onVehicleBoard }: ISSProps) {
  const issRef = useRef<THREE.Group>(null);
  const [issPosition, setIssPosition] = useState({ lat: 0, lon: 0, alt: 420 }); // Default orbit
  const [hovered, setHovered] = useState(false);
  const [velocity, setVelocity] = useState(7.66); // km/s orbital velocity
  const positionRef = useRef(new THREE.Vector3());
  
  // Occlusion detection (hide when behind Earth)
  const isVisible = useOcclusionDetection(positionRef.current, [
    { position: earthPosition, radius: 1.0 } // Earth radius
  ]);
  
  // Smart label positioning (avoid overlaps)
  const labelOffset = useSmartLabelPosition('ISS', positionRef.current, hovered && isVisible, 8);
  
  // Distance-based fade
  const labelOpacity = useLabelDistanceFade(positionRef.current, 5, 50);
  
  // Create a simple canvas-based texture as fallback
  const issTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a simple ISS icon
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 28, 44, 8); // Main body
      ctx.fillRect(20, 20, 24, 24); // Central module
      ctx.fillRect(0, 30, 64, 4); // Solar panels
      ctx.fillStyle = '#4A9EFF';
      ctx.fillRect(22, 22, 20, 20); // Highlight
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Fetch real ISS position from API
  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();
        setIssPosition({
          lat: data.latitude,
          lon: data.longitude,
          alt: data.altitude,
        });
        setVelocity(data.velocity);
      } catch (error) {
        console.warn('ISS API failed, using simulated orbit');
      }
    };

    fetchISSPosition();
    const interval = setInterval(fetchISSPosition, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Convert lat/lon to 3D position
  const latLonToVector3 = (lat: number, lon: number, altitude: number) => {
    const earthRadius = 1.0; // Match Earth radius in scene
    const radius = earthRadius + altitude * 0.0001; // Scale altitude

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  useFrame(() => {
    if (issRef.current) {
      const pos = latLonToVector3(issPosition.lat, issPosition.lon, issPosition.alt);
      // Position relative to Earth
      issRef.current.position.copy(earthPosition).add(pos);
      positionRef.current.copy(issRef.current.position);
      issRef.current.lookAt(earthPosition); // Always face Earth center
      issRef.current.rotation.z += 0.01; // Slow rotation for visual effect
    }
  });

  return (
    <group ref={issRef}>
      {/* ISS Sprite (Much smaller, non-clickable) */}
      <sprite
        scale={[0.3, 0.3, 0.3]}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'default';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <spriteMaterial map={issTexture} transparent />
      </sprite>

      {/* Hover Label - Only show if visible and not occluded */}
      {hovered && focusedBody !== 'ISS' && isVisible && labelOpacity > 0.1 && (
        <Html position={labelOffset} center style={{ pointerEvents: 'none', opacity: labelOpacity }}>
          <div className="bg-black/95 backdrop-blur-xl border border-blue-400 rounded-lg p-3 text-sm font-mono text-blue-300 min-w-[200px] shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-opacity duration-300">
            <h3 className="text-xl text-white font-bold mb-2">ISS</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <span className="font-bold">LAT:</span>
              <span className="text-blue-200">{issPosition.lat.toFixed(2)}°</span>
              <span className="font-bold">LON:</span>
              <span className="text-blue-200">{issPosition.lon.toFixed(2)}°</span>
              <span className="font-bold">ALT:</span>
              <span className="text-blue-200">{issPosition.alt.toFixed(1)} km</span>
              <span className="font-bold">SPEED:</span>
              <span className="text-blue-200">{velocity.toFixed(2)} km/s</span>
            </div>
            <div className="mt-2 text-center bg-blue-900/50 py-1 rounded text-white text-xs animate-pulse font-bold">
              CLICK TO TRACK
            </div>
          </div>
        </Html>
      )}

      {/* Focused View */}
      {focusedBody === 'ISS' && (
        <Html position={[0.2, 0, 0]} center>
          <div className="flex flex-col gap-2">
            {onVehicleBoard && (
              <button
                className="pointer-events-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 rounded-lg text-white font-bold text-sm transition-all hover:scale-110 shadow-[0_0_15px_cyan] flex items-center gap-2 animate-pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  onVehicleBoard('ISS');
                }}
              >
                🚀 BOARD ISS
              </button>
            )}
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded border border-blue-400 shadow-[0_0_20px_blue] transition-all text-sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.heavens-above.com/PassSummary.aspx?satid=25544`, '_blank');
              }}
            >
              📡 VIEW PASS TIMES
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded border border-gray-500 transition-all text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onBodyFocus(null);
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
