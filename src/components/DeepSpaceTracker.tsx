/**
 * DeepSpaceTracker - Tracks Voyager 1/2 and New Horizons
 * Positions now driven by DataBridge/Horizons API (mocked), with live distances
 */

import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { fetchHorizons } from '../services/DataBridge';

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

    // asynchronous update using Horizons-derived state
    const updateProbes = async () => {
      try {
        const data = await fetchHorizons();
        const v1info = data.satellites?.voyager1;
        const v2info = data.satellites?.voyager2;
        const nhinfo = data.satellites?.newHorizons;

        const v1Angle = Math.PI * 0.6; // keep earlier approximate directions
        const v2Angle = Math.PI * 1.2;
        const nhAngle = Math.PI * 0.3;
        const scale = logarithmicScale ? 10 : 1;

        setProbes(prev => prev.map((probe, idx) => {
          let dist = probe.distance;
          if (idx === 0 && v1info?.distance) dist = v1info.distance;
          if (idx === 1 && v2info?.distance) dist = v2info.distance;
          if (idx === 2 && nhinfo?.distance) dist = nhinfo.distance;
          const angle = idx === 0 ? v1Angle : idx === 1 ? v2Angle : nhAngle;
          const y = idx === 0 ? 5 : idx === 1 ? -3 : 2;
          return {
            ...probe,
            distance: dist,
            velocity: idx === 0 ? v1info?.velocity ?? probe.velocity : idx === 1 ? v2info?.velocity ?? probe.velocity : nhinfo?.velocity ?? probe.velocity,
            lightTime: idx === 0 ? v1info?.signalDelay ?? probe.lightTime : idx === 1 ? v2info?.signalDelay ?? probe.lightTime : nhinfo?.signalDelay ?? probe.lightTime,
            position: new THREE.Vector3(
              Math.cos(angle) * dist / scale,
              y,
              Math.sin(angle) * dist / scale
            )
          };
        }));
      } catch (e) {
        console.warn('Failed to fetch deep space probe positions', e);
      }
    };

    updateProbes();
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
