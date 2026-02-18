/**
 * Aurora Oval Shader Component
 * Displays NOAA Ovation aurora predictions as ghostly green/red sphere around Earth
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AuroraOvalProps {
  earthPosition: THREE.Vector3;
  kpValue?: number;
  ovationData?: any; // NOAA Ovation JSON
}

export function AuroraOval({ earthPosition, kpValue = 3, ovationData }: AuroraOvalProps) {
  const ovalRef = useRef<THREE.Mesh>(null);

  // Create custom shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uKpValue: { value: kpValue },
        uIntensity: { value: 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uKpValue;
        uniform float uIntensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Simple noise function
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          // Latitude-based intensity (aurora strongest near poles)
          float lat = vPosition.y / 1.05; // Normalize to radius
          float polarIntensity = smoothstep(0.3, 0.8, abs(lat));
          
          // Aurora curtain waves
          float wave = sin(vPosition.x * 5.0 + uTime * 2.0) * cos(vPosition.z * 5.0 + uTime * 1.5);
          float auroraWave = wave * 0.3 + 0.5;
          
          // Color gradient (green for calm, red for storm)
          vec3 calmColor = vec3(0.0, 1.0, 0.6); // Green
          vec3 stormColor = vec3(1.0, 0.2, 0.3); // Red
          float stormMix = smoothstep(3.0, 7.0, uKpValue);
          vec3 auroraColor = mix(calmColor, stormColor, stormMix);
          
          // Final opacity
          float opacity = polarIntensity * auroraWave * uIntensity * 0.4;
          
          // Add some noise for texture
          float noiseVal = noise(vUv * 20.0 + uTime * 0.1);
          opacity *= (0.8 + noiseVal * 0.4);
          
          // Edge fade (fresnel effect)
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
          opacity *= fresnel;
          
          gl_FragColor = vec4(auroraColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [kpValue]);

  // Update uniforms
  useFrame(({ clock }) => {
    if (ovalRef.current && shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
      shaderMaterial.uniforms.uKpValue.value = kpValue;
      
      // Pulse intensity based on Kp
      const basePulse = Math.sin(clock.getElapsedTime() * 1.5) * 0.15 + 0.5;
      const kpBoost = (kpValue / 9) * 0.5;
      shaderMaterial.uniforms.uIntensity.value = basePulse + kpBoost;
      
      // Position follows Earth
      ovalRef.current.position.copy(earthPosition);
    }
  });

  return (
    <mesh ref={ovalRef}>
      <sphereGeometry args={[1.05, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
