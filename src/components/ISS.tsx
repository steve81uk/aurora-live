import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ISSProps {
  onBodyFocus: (name: string | null) => void;
  focusedBody: string | null;
}

export default function ISS({ onBodyFocus, focusedBody }: ISSProps) {
  const issRef = useRef<THREE.Group>(null);
  const [issPosition, setIssPosition] = useState({ lat: 0, lon: 0, alt: 420 }); // Default orbit
  const [hovered, setHovered] = useState(false);
  const [velocity, setVelocity] = useState(7.66); // km/s orbital velocity

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
      issRef.current.position.copy(pos);
      issRef.current.lookAt(0, 0, 0); // Always face Earth
      issRef.current.rotation.z += 0.01; // Slow rotation for visual effect
    }
  });

  return (
    <group ref={issRef}>
      {/* ISS Model (simplified) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onBodyFocus('ISS');
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
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.08, 0.08]} />
          <meshStandardMaterial color="#dddddd" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Solar Panels (Left) */}
        <mesh position={[-0.15, 0, 0]}>
          <boxGeometry args={[0.25, 0.15, 0.01]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.3} />
        </mesh>

        {/* Solar Panels (Right) */}
        <mesh position={[0.15, 0, 0]}>
          <boxGeometry args={[0.25, 0.15, 0.01]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.3} />
        </mesh>

        {/* Radiator */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.05]} />
          <meshStandardMaterial color="#888888" />
        </mesh>

        {/* Point Light (Simulates reflection) */}
        <pointLight position={[0, 0.1, 0]} intensity={0.5} distance={2} color="#ffffff" />
      </group>

      {/* Hover Label */}
      {hovered && focusedBody !== 'ISS' && (
        <Html position={[0, 0.15, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="bg-black/95 backdrop-blur-xl border border-blue-400 rounded-lg p-3 text-sm font-mono text-blue-300 min-w-[200px] shadow-[0_0_25px_rgba(59,130,246,0.4)]">
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
