import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * VolumetricAtmosphere - Fresnel-based atmospheric glow for Earth
 * Creates a soft, ghostly blue 'Atmospheric Limb' that glows only at the edges
 */

interface VolumetricAtmosphereProps {
  radius?: number;
  color?: string;
  intensity?: number;
}

export function VolumetricAtmosphere({ 
  radius = 1.1, 
  color = '#4A9EFF',
  intensity = 0.8
}: VolumetricAtmosphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Fresnel Shader - glows at edges (grazing angles)
  const fresnelShader = {
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPositionW;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vPositionW = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float intensity;
      
      varying vec3 vNormal;
      varying vec3 vPositionW;
      
      void main() {
        // Fresnel effect: stronger at edges (when normal is perpendicular to view)
        vec3 viewDirection = normalize(cameraPosition - vPositionW);
        float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
        
        // Atmospheric limb glow
        float glow = fresnel * intensity;
        
        gl_FragColor = vec4(glowColor, glow);
      }
    `,
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity }
    }
  };

  // Create shader material
  const material = new THREE.ShaderMaterial({
    vertexShader: fresnelShader.vertexShader,
    fragmentShader: fresnelShader.fragmentShader,
    uniforms: fresnelShader.uniforms,
    transparent: true,
    side: THREE.BackSide, // Render from inside
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  // Subtle pulsing animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.1 + 0.9;
      material.uniforms.intensity.value = intensity * pulse;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
