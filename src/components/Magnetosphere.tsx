import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagnetosphereProps {
  earthPosition: THREE.Vector3;
  solarWindSpeed?: number; // km/s
  sunPosition?: THREE.Vector3;
}

/**
 * Magnetosphere Visualization
 * Shows Earth's magnetic field lines and how they compress under solar wind
 */
export default function Magnetosphere({ 
  earthPosition, 
  solarWindSpeed = 400, 
  sunPosition = new THREE.Vector3(0, 0, 0) 
}: MagnetosphereProps) {
  const fieldLinesRef = useRef<THREE.Group>(null);

  // Calculate compression factor based on solar wind speed
  const compressionFactor = useMemo(() => {
    // Normal speed: 400 km/s → factor 1.0
    // High speed: 800 km/s → factor 0.6 (compressed)
    return Math.max(0.5, 1.0 - (solarWindSpeed - 400) / 800);
  }, [solarWindSpeed]);

  // Generate magnetic field lines
  const fieldLines = useMemo(() => {
    const lines: THREE.Line[] = [];
    const numLines = 16; // Number of field lines
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      
      // Generate dipole field line path
      for (let t = 0; t <= Math.PI; t += 0.1) {
        const r = 2 * Math.sin(t) * Math.sin(t); // Dipole equation
        const x = r * Math.sin(t) * Math.cos(angle);
        const y = r * Math.cos(t);
        const z = r * Math.sin(t) * Math.sin(angle);
        
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: '#4A9EFF',
        opacity: 0.05, // Ghost-like effect
        transparent: true,
        blending: THREE.AdditiveBlending
      });
        transparent: true,
        opacity: 0.05,
        linewidth: 1,
      });
      
      const line = new THREE.Line(geometry, material);
      lines.push(line);
    }
    
    return lines;
  }, []);

  // Animate field lines (pulsing and solar wind compression)
  useFrame(({ clock }) => {
    if (fieldLinesRef.current) {
      const time = clock.getElapsedTime();
      
      // Pulsing effect
      const pulse = Math.sin(time * 2) * 0.1 + 1.0;
      
      // Apply compression on sun-facing side
      const sunDirection = new THREE.Vector3()
        .subVectors(sunPosition, earthPosition)
        .normalize();
      
      fieldLinesRef.current.children.forEach((line, index) => {
        const material = (line as THREE.Line).material as THREE.LineBasicMaterial;
        material.opacity = 0.03 + Math.sin(time + index) * 0.02; // Faint magnetic ghosts
        
        // Compress towards sun
        line.scale.set(
          compressionFactor,
          1.0,
          compressionFactor
        );
      });
    }
  });

  return (
    <group ref={fieldLinesRef} position={earthPosition}>
      {fieldLines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
      
      {/* Magnetopause boundary (compressed teardrop shape) */}
      <mesh position={[compressionFactor * 1.5, 0, 0]} scale={[compressionFactor, 1, 1]} raycast={() => null}>
        <sphereGeometry args={[3, 32, 32, 0, Math.PI]} />
        <meshBasicMaterial 
          color="#00FFFF" 
          transparent 
          opacity={0.05} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Magnetotail (elongated on night side) */}
      <mesh position={[-5, 0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={() => null}>
        <coneGeometry args={[1.5, 8, 16]} />
        <meshBasicMaterial 
          color="#4A9EFF" 
          transparent 
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
        <meshBasicMaterial 
          color="#0088FF" 
          transparent 
          opacity={0.08} 
          wireframe
        />
      </mesh>
    </group>
  );
}
