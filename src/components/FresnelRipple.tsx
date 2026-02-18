import { useRef, useEffect, useMemo } from 'react'; // Add useMemo here
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface FresnelRippleProps {
  earthPosition: THREE.Vector3;
  radius: number;
  isImpacting: boolean;
  color?: string;
}

export function FresnelRipple({ earthPosition, radius, isImpacting, color = '#00ffff' }: FresnelRippleProps) {
  // uniforms are now correctly memoised
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    rippleTime: { value: 0 },
    color: { value: new THREE.Color(color) },
    rippleIntensity: { value: 0.0 }
  }), [color]);

  useEffect(() => {
    if (isImpacting) {
      gsap.fromTo(uniforms.rippleIntensity, 
        { value: 0 }, 
        { value: 1.0, duration: 0.4, ease: "expo.out", 
          onComplete: () => {
            gsap.to(uniforms.rippleIntensity, { value: 0, duration: 2.5, ease: "power2.inOut" });
          }
        }
      );
    }
  }, [isImpacting, uniforms]);

  useFrame((state, delta) => {
    uniforms.time.value += delta;
    if (uniforms.rippleIntensity.value > 0) uniforms.rippleTime.value += delta;
  });

  return (
    <mesh position={earthPosition}>
      <sphereGeometry args={[radius * 1.05, 64, 64]} />
      <shaderMaterial
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float rippleTime;
          uniform vec3 color;
          uniform float rippleIntensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
            float wave = sin(fresnel * 15.0 - rippleTime * 10.0) * rippleIntensity;
            gl_FragColor = vec4(color, (fresnel + wave * 0.5) * 0.4);
          }
        `}
      />
    </mesh>
  );
}