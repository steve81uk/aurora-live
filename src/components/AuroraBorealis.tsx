import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AuroraBorealisProps {
  kpValue: number;
  earthPosition: THREE.Vector3;
  intensity?: number;
}

/**
 * Aurora Borealis - 3D Volumetric Curtain Effect
 * Appears above Earth's North and South poles
 * Color and intensity driven by Kp index
 */
export default function AuroraBorealis({ kpValue, earthPosition, intensity = 1.0 }: AuroraBorealisProps) {
  const northAuroraRef = useRef<THREE.Mesh>(null);
  const southAuroraRef = useRef<THREE.Mesh>(null);

  // Aurora shader material
  const auroraMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        kpValue: { value: kpValue },
        intensity: { value: intensity },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Wave effect
          vec3 pos = position;
          float wave = sin(pos.x * 3.0 + time) * 0.1;
          wave += sin(pos.z * 2.5 + time * 1.2) * 0.08;
          pos.y += wave;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        uniform float kpValue;
        uniform float intensity;
        
        void main() {
          // Aurora curtain effect
          float curtain = abs(sin(vUv.y * 8.0 + time * 0.5)) * 0.8;
          curtain += abs(sin(vUv.x * 12.0 + time * 0.8)) * 0.2;
          
          // Color based on Kp value
          vec3 color;
          if (kpValue < 4.0) {
            // Low activity: Pale green
            color = mix(vec3(0.2, 0.8, 0.3), vec3(0.4, 1.0, 0.5), curtain);
          } else if (kpValue < 6.0) {
            // Medium activity: Bright green with purple
            color = mix(vec3(0.3, 1.0, 0.4), vec3(0.8, 0.3, 0.9), curtain);
          } else if (kpValue < 8.0) {
            // High activity: Purple and pink
            color = mix(vec3(0.9, 0.2, 0.8), vec3(1.0, 0.4, 0.5), curtain);
          } else {
            // Extreme activity: Red and white
            color = mix(vec3(1.0, 0.2, 0.2), vec3(1.0, 0.9, 0.9), curtain);
          }
          
          // Fade at edges
          float alpha = curtain * (1.0 - abs(vUv.x - 0.5) * 2.0) * intensity;
          alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
          
          gl_FragColor = vec4(color, alpha * 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  // Update uniforms
  useFrame(({ clock }) => {
    if (northAuroraRef.current && southAuroraRef.current) {
      const material = northAuroraRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = clock.getElapsedTime();
      material.uniforms.kpValue.value = kpValue;
      material.uniforms.intensity.value = intensity;
      
      // Copy to south aurora
      const southMaterial = southAuroraRef.current.material as THREE.ShaderMaterial;
      southMaterial.uniforms.time.value = clock.getElapsedTime();
      southMaterial.uniforms.kpValue.value = kpValue;
      southMaterial.uniforms.intensity.value = intensity;
    }
  });

  // Aurora curtain geometry (vertical plane with waves)
  const auroraGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(3, 2, 64, 32);
  }, []);

  return (
    <group position={earthPosition}>
      {/* Outer Aurora Glow Shell */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
          color={kpValue > 5 ? '#ff2255' : '#4ade80'} 
          transparent={true} 
          opacity={Math.min(kpValue * 0.05, 0.4)} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>
      
      {/* North Pole Aurora */}
      <mesh
        ref={northAuroraRef}
        geometry={auroraGeometry}
        material={auroraMaterial}
        position={[0, 1.3, 0]}
        rotation={[0, 0, 0]}
      />
      
      {/* South Pole Aurora (mirrored) */}
      <mesh
        ref={southAuroraRef}
        geometry={auroraGeometry}
        material={auroraMaterial.clone()}
        position={[0, -1.3, 0]}
        rotation={[Math.PI, 0, 0]}
      />
    </group>
  );
}
