import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SatGroup, SatelliteState } from '../services/CelesTrakService';
import { useConstellation } from '../services/CelesTrakService';

interface SatelliteTrackerProps {
  earthPosition: { x: number; y: number; z: number };
  earthRadius?: number; // scene units
}

function latLonAltToVector(lat: number, lon: number, altKm: number, earthRadius: number) {
  const r = earthRadius * (1 + altKm / 6371);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
     (r * Math.cos(phi)),
     (r * Math.sin(phi) * Math.sin(theta))
  );
}

// simple color palette per group
const GROUP_COLORS: Record<SatGroup, string> = {
  crewed:   '#66ff66',
  starlink: '#66ccff',
  gps:      '#ffcc66',
  weather:  '#ff66cc',
  science:  '#cc66ff',
  debris:   '#aaaaaa',
  military: '#ff6666',
};

export function SatelliteTracker({ earthPosition, earthRadius = 1 }: SatelliteTrackerProps) {
  const groups: SatGroup[] = ['crewed','starlink','gps','weather','science','debris','military'];
  const allSats = useMemo(() => groups.map(g => ({ group: g, hook: useConstellation(g, 100) })), []);

  // keep previous positions for simple animation
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);

  useFrame(() => {
    allSats.forEach(({ group, hook }) => {
      const data = hook.data;
      if (!data) return;
      data.satellites.forEach(sat => {
        const key = `${group}-${sat.catNum}`;
        // try existing mesh
        let mesh = meshRefs.current.get(key);
        const pos = latLonAltToVector(sat.lat, sat.lon, sat.alt, earthRadius);
        if (!mesh) {
          const geom = new THREE.SphereGeometry(0.005, 6, 6);
          const mat = new THREE.MeshBasicMaterial({ color: GROUP_COLORS[group] || '#fff' });
          const newMesh = new THREE.Mesh(geom, mat);
          newMesh.position.copy(pos).add(new THREE.Vector3(earthPosition.x, earthPosition.y, earthPosition.z));
          meshRefs.current.set(key, newMesh);
          setMeshes(prev => [...prev, newMesh]);
        } else {
          mesh.position.lerp(new THREE.Vector3(pos.x + earthPosition.x, pos.y + earthPosition.y, pos.z + earthPosition.z), 0.2);
        }
      });
    });
  });

  return (
    <group>
      {meshes.map(m => (
        <primitive key={m.uuid} object={m} />
      ))}
    </group>
  );
}
