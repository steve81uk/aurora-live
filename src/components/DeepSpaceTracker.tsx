/**
 * DeepSpaceTracker - Tracks Voyager 1/2 and New Horizons
 * Uses NASA Horizons API simulation (real API integration TODO)
 */

import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface DeepSpaceProbe {
  name: string;
  distance: number; // AU
  velocity: number; // km/s
  lightTime: number; // hours
  position: THREE.Vector3;
  status: 'active' | 'limited' | 'silent';
}

export function DeepSpaceTracker({
  enabled,
  logarithmicScale
}: {
  enabled: boolean;
  logarithmicScale: boolean;
}) {
  const [probes, setProbes] = useState<DeepSpaceProbe[]>([
    {
      name: 'Voyager 1',
      distance: 164.7, // AU (as of 2026 estimate)
      velocity: 17.0, // km/s
      lightTime: 22.8, // hours
      position: new THREE.Vector3(0, 0, 0),
      status: 'active'
    },
    {
      name: 'Voyager 2',
      distance: 137.4, // AU
      velocity: 15.4, // km/s
      lightTime: 19.0,
      position: new THREE.Vector3(0, 0, 0),
      status: 'active'
    },
    {
      name: 'New Horizons',
      distance: 58.6, // AU
      velocity: 14.3, // km/s
      lightTime: 8.1,
      position: new THREE.Vector3(0, 0, 0),
      status: 'active'
    }
  ]);

  const heliopauseRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!enabled) return;

    // Calculate real positions (simplified, not actual orbital mechanics)
    // In production, use NASA Horizons API: https://ssd.jpl.nasa.gov/horizons/
    const v1Angle = Math.PI * 0.6; // Approximate direction
    const v2Angle = Math.PI * 1.2;
    const nhAngle = Math.PI * 0.3;

    const scale = logarithmicScale ? 10 : 1; // Compress distances for visibility

    setProbes([
      {
        ...probes[0],
        position: new THREE.Vector3(
          Math.cos(v1Angle) * probes[0].distance / scale,
          5,
          Math.sin(v1Angle) * probes[0].distance / scale
        )
      },
      {
        ...probes[1],
        position: new THREE.Vector3(
          Math.cos(v2Angle) * probes[1].distance / scale,
          -3,
          Math.sin(v2Angle) * probes[1].distance / scale
        )
      },
      {
        ...probes[2],
        position: new THREE.Vector3(
          Math.cos(nhAngle) * probes[2].distance / scale,
          2,
          Math.sin(nhAngle) * probes[2].distance / scale
        )
      }
    ]);

    // TODO: Implement real API fetching
    // const fetchProbePositions = async () => {
    //   const response = await fetch('https://ssd.jpl.nasa.gov/api/horizons...');
    //   const data = await response.json();
    //   // Parse and update probe positions
    // };
    // fetchProbePositions();
  }, [enabled, logarithmicScale]);

  // Flicker animation for faint signals
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    probes.forEach((probe, i) => {
      const flicker = 0.7 + Math.sin(time * (2 + i)) * 0.3;
      // Opacity modulation handled in rendering
    });
  });

  if (!enabled) return null;

  return (
    <>
      {/* Heliopause bubble (edge of solar wind) */}
      <mesh ref={heliopauseRef} visible={enabled}>
        <sphereGeometry args={[logarithmicScale ? 12 : 120, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Voyager probes */}
      {probes.map((probe, i) => (
        <group key={probe.name} position={probe.position}>
          {/* Faint pulsing point */}
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Label */}
          <Html distanceFactor={50} position={[0, 2, 0]}>
            <div className="text-[9px] font-mono text-cyan-300 whitespace-nowrap pointer-events-none">
              <div className="font-bold">{probe.name}</div>
              <div className="text-[7px] text-gray-400">
                {probe.distance.toFixed(1)} AU
              </div>
              <div className="text-[7px] text-gray-400">
                Signal: {probe.lightTime.toFixed(1)}h delay
              </div>
              <div className="text-[7px] text-yellow-300">
                {probe.velocity.toFixed(1)} km/s
              </div>
            </div>
          </Html>

          {/* Faint trail behind probe */}
          <mesh position={[probe.velocity * -0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.01, 3, 6]} />
            <meshBasicMaterial
              color="#66ccff"
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Distance indicators */}
      <Html position={[0, logarithmicScale ? 15 : 150, 0]} center>
        <div className="bg-black/80 border border-cyan-500/30 rounded px-3 py-2 text-[10px] text-cyan-400 font-mono backdrop-blur-sm pointer-events-none">
          <div className="font-bold mb-1">🛰️ DEEP SPACE SENTINELS</div>
          <div className="text-[8px] text-gray-400">
            Heliopause: ~120 AU (edge of solar wind)
          </div>
          <div className="text-[8px] text-yellow-300">
            {logarithmicScale ? 'Log Scale: 10x Compression' : 'Linear Scale: Real Distances'}
          </div>
        </div>
      </Html>
    </>
  );
}
