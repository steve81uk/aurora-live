/**
 * SolarSystemScene — 3D Solar System Renderer
 * Real-time planetary positions via astronomy-engine.
 * Lazy-loaded heavy components for performance.
 */

import React, { useRef, useMemo, useState, Suspense, lazy } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import OptimizedPlanet from './OptimizedPlanet';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';
import { useDONKI } from '../services/DONKIService';
import { useSpaceState } from '../services/DataBridge';
import { SatelliteTracker } from './SatelliteTracker';
import { OvationAuroraShell } from './OvationAuroraShell';
import { SolarLighting } from './SolarLighting';
import { DeepSpaceTracker } from './DeepSpaceTracker';
import { PLANETS as PLANET_LIST } from '../data/celestial';
import { getBodyPosition } from '../utils/astronomy';

// Lazy-load heavy visual components
const RealisticSun  = lazy(() => import('./RealisticSun').then(m => ({ default: m.RealisticSun })));
const AsteroidBelt  = lazy(() => import('./AsteroidBelt'));
const TeslaRoadster = lazy(() => import('./TeslaRoadster'));
const UFO           = lazy(() => import('./UFO'));

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
     (radius * Math.cos(phi)),
     (radius * Math.sin(phi) * Math.sin(theta))
  );
}

export default function SolarSystemScene({
  kpValue,
  currentDate = new Date(),
  focusedBody,
  onBodyFocus,
  userLocation,
  onEarthClick,
  showDeepSpace = false,
  deepSpaceLogScale = false,
}: any) {
  const liveData = useLiveSpaceWeather();
  const [magnetopauseImpact, setMagnetopauseImpact] = useState(false);
  const { events } = useDONKI();
  const gicRisk = useSpaceState().spaceState?.derived?.gicRisk ?? 0;
  const lastFlareTime = useRef<number>(0);
  const flareScaleRef = useRef(1);

  const _astroTime = useMemo(() => Astronomy.MakeTime(currentDate), [currentDate]);

  const userInImpactedHemisphere = useMemo(() => {
    if (!userLocation) return false;
    return userLocation.lat > -60;
  }, [userLocation]);

  // effect: sun flare pulse based on DONKI events
  useFrame((state) => {
    const now = Date.now();
    const latestFlare = events.find(e => e.type === 'FLR');
    if (latestFlare) {
      const tms = new Date(latestFlare.time).getTime();
      if (tms > lastFlareTime.current) {
        lastFlareTime.current = tms;
        flareScaleRef.current = 1.5;
      }
    }
    // decay back towards 1
    flareScaleRef.current = THREE.MathUtils.lerp(flareScaleRef.current, 1, 0.02);
  });

  return (
    <>
      <SolarLighting sunPosition={new THREE.Vector3(0, 0, 0)} intensity={3.5} />

      <group scale={[flareScaleRef.current, flareScaleRef.current, flareScaleRef.current]}>
        <Suspense fallback={null}>
          <RealisticSun onBodyFocus={onBodyFocus} kpValue={kpValue} />
        </Suspense>
      </group>

      {PLANET_LIST.map((planet: any) => {
        const pos3 = getBodyPosition(planet.name, currentDate);
        const pos: [number, number, number] = [pos3.x, pos3.y, pos3.z];
        return (
          <OptimizedPlanet
            key={planet.name}
            config={planet}
            position={pos}
            onBodyFocus={onBodyFocus}
          />
        );
      })}

      {userLocation && (() => {
        const earthPos = getBodyPosition('Earth', currentDate);
        return (
          <UserBeacon
            lat={userLocation.lat}
            lon={userLocation.lon}
            radius={2.0}
            earthPosition={earthPos}
            pulse={magnetopauseImpact && userInImpactedHemisphere}
            name={userLocation.name}
          />
        );
      })()}

      {/* satellites around Earth */}
      {(() => {
        const earthPos = getBodyPosition('Earth', currentDate);
        return (
          <>
            <SatelliteTracker earthPosition={earthPos} earthRadius={2} />
            <OvationAuroraShell earthPosition={earthPos} kpValue={kpValue} />
            {showDeepSpace && (
              <DeepSpaceTracker enabled={showDeepSpace} logarithmicScale={deepSpaceLogScale} />
            )}
          </>
        );
      })()}

      {/* GIC risk overlay (red sphere) */}
      {gicRisk > 0 && (
        <mesh>
          <sphereGeometry args={[2.05, 32, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={Math.min(0.6, gicRisk * 0.6)} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Suspense fallback={null}>
        <UFO onBodyFocus={onBodyFocus} currentDate={currentDate} focusedBody={focusedBody} />
        <TeslaRoadster currentDate={currentDate} onBodyFocus={onBodyFocus} focusedBody={focusedBody} />
        <AsteroidBelt visible={true} />
      </Suspense>
    </>
  );
}

function UserBeacon({ lat, lon, radius, earthPosition, pulse, name }: any) {
  const meshRef    = useRef<THREE.Mesh>(null!);
  const outerRef   = useRef<THREE.Mesh>(null!);
  const frameCount = useRef(0);

  const localOffset = useMemo(() => latLonToVector3(lat, lon, radius * 1.02), [lat, lon, radius]);
  const worldPos    = useMemo(
    () => new THREE.Vector3(
      earthPosition.x + localOffset.x,
      earthPosition.y + localOffset.y,
      earthPosition.z + localOffset.z
    ),
    [earthPosition, localOffset]
  );

  useFrame(state => {
    if (++frameCount.current % 3 !== 0) return;
    if (!meshRef.current) return;
    const t   = state.clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.min(1, 0.6 + Math.sin(t * 1.5) * 0.2 + (pulse ? 0.4 + Math.abs(Math.sin(t * 8)) * 0.6 : 0));
    if (outerRef.current) {
      outerRef.current.scale.setScalar(pulse ? 1 + Math.abs(Math.sin(t * 4)) * 0.6 : 1);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = pulse ? 0.3 + Math.abs(Math.sin(t * 4)) * 0.4 : 0.15;
    }
  });

  return (
    <group position={worldPos}>
      <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.14, 0.18, 48]} />
        <meshBasicMaterial color={pulse ? '#ff6600' : '#00ffff'} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.10, 48]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <Html distanceFactor={10}>
        <div className={`text-[10px] font-mono px-2 py-1 rounded border whitespace-nowrap uppercase tracking-widest
          ${pulse ? 'text-orange-300 bg-orange-900/60 border-orange-500/50 animate-pulse' : 'text-cyan-400 bg-black/50 border-cyan-500/30'}`}>
          {pulse ? '⚠ CME IMPACT DETECTED' : `⊕ ${name ?? 'Ground Station'}`}
        </div>
      </Html>
    </group>
  );
}

