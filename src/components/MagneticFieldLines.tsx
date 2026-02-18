/**
 * MagneticFieldLines - Visualization of Earth's magnetic field
 * Shows dipole → multipole → reversed dipole transition during solar maximum
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagneticFieldLinesProps {
  earthPosition: THREE.Vector3;
  earthRadius: number;
  magneticPhase: number; // 0 = dipole, 0.5 = chaos, 1 = reversed
  lineCount?: number;
  visible?: boolean;
}

export function MagneticFieldLines({
  earthPosition,
  earthRadius,
  magneticPhase,
  lineCount = 120,
  visible = true
}: MagneticFieldLinesProps) {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  // Generate field line geometry based on magnetic phase
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    
    // Helper: Create a dipole field line from pole
    const createFieldLine = (poleAngle: number, isNorth: boolean, chaos: number) => {
      const points = 50;
      const maxRadius = earthRadius * 4;
      const color = isNorth 
        ? new THREE.Color(0.8, 0.3, 1.0) // Purple for north
        : new THREE.Color(1.0, 0.5, 0.2); // Orange for south
      
      for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        
        // Base dipole mathematics (magnetic field line equation)
        const r = earthRadius * (1 + t * 3) * Math.sin(poleAngle) ** 2;
        const theta = poleAngle;
        
        // Add chaos during solar maximum (phase 0.5)
        const chaosFactor = Math.sin(magneticPhase * Math.PI) * chaos;
        const chaosX = (Math.random() - 0.5) * chaosFactor * earthRadius;
        const chaosY = (Math.random() - 0.5) * chaosFactor * earthRadius;
        const chaosZ = (Math.random() - 0.5) * chaosFactor * earthRadius;
        
        // Reverse polarity as phase approaches 1
        const polarityFlip = magneticPhase > 0.8 ? -1 : 1;
        const yDirection = isNorth ? polarityFlip : -polarityFlip;
        
        // Convert to cartesian
        const x = r * Math.sin(theta) * Math.cos(t * Math.PI * 2) + chaosX;
        const y = r * Math.cos(theta) * yDirection + chaosY;
        const z = r * Math.sin(theta) * Math.sin(t * Math.PI * 2) + chaosZ;
        
        positions.push(
          earthPosition.x + x,
          earthPosition.y + y,
          earthPosition.z + z
        );
        
        // Fade color with distance
        const fade = 1.0 - (t * 0.5);
        colors.push(color.r * fade, color.g * fade, color.b * fade);
      }
    };
    
    // Generate lines from north pole
    for (let i = 0; i < lineCount / 2; i++) {
      const angle = (i / (lineCount / 2)) * Math.PI * 0.8 + 0.1; // 0.1 to 0.9π
      const chaos = Math.random() * 2.0;
      createFieldLine(angle, true, chaos);
    }
    
    // Generate lines from south pole
    for (let i = 0; i < lineCount / 2; i++) {
      const angle = (i / (lineCount / 2)) * Math.PI * 0.8 + 0.1;
      const chaos = Math.random() * 2.0;
      createFieldLine(Math.PI - angle, false, chaos);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geo;
  }, [earthPosition, earthRadius, magneticPhase, lineCount]);
  
  // Animate flux pulse
  useFrame((state) => {
    if (linesRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Pulse opacity based on magnetic phase (more chaotic = more pulsing)
      const chaosPulse = Math.sin(magneticPhase * Math.PI) * 0.3;
      const pulse = Math.sin(time * 2) * 0.2 * (1 + chaosPulse);
      
      if (linesRef.current.material instanceof THREE.LineBasicMaterial) {
        linesRef.current.material.opacity = 0.4 + pulse;
      }
    }
  });

  if (!visible) return null;

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        linewidth={1}
        depthWrite={false}
      />
    </lineSegments>
  );
}
