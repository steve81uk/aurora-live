import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TextureLoader, BackSide } from 'three';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import ConstellationLines from './ConstellationLines';

export function UniverseBackground() {
  let texture = null;
  try {
    texture = useLoader(TextureLoader, '/textures/2k_stars_milky_way.jpg');
  } catch (e) {
    console.warn("Milky Way texture failed.");
  }

  return (
    <group>
      {/* 1. Milky Way Sphere (Massive) */}
      <mesh>
        <sphereGeometry args={[90000, 64, 64]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={BackSide} depthWrite={false} />
        ) : (
          <meshBasicMaterial color="#020205" side={BackSide} depthWrite={false} />
        )}
      </mesh>

      {/* 2. Optimized Starfield (Points with Shader) */}
      <StarField count={5000} radius={60000} />
      
      {/* 3. Constellation Lines */}
      <ConstellationLines />
    </group>
  );
}

function StarField({ count, radius }: { count: number, radius: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate star positions, sizes, and blink speeds
  const { positions, sizes, blinkSpeeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const blinkSpeeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Random position in sphere
      const r = radius * (0.5 + Math.random() * 0.5);
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Random size (50-150)
      sizes[i] = 50 + Math.random() * 100;
      
      // 90% static stars, 10% blinking (period 3-5 seconds)
      blinkSpeeds[i] = Math.random() > 0.9 
        ? 0.2 + Math.random() * 0.15  // Slow blink (3-5 sec period)
        : 0;  // Static
    }
    
    return { positions, sizes, blinkSpeeds };
  }, [count, radius]);

  // Custom shader material for stars
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float blinkSpeed;
        varying float vBlinkSpeed;
        
        void main() {
          vBlinkSpeed = blinkSpeed;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying float vBlinkSpeed;
        
        void main() {
          // Circular point shape
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Star color (white with slight blue tint)
          vec3 color = vec3(0.9, 0.95, 1.0);
          
          // Blinking effect
          float blink = 1.0;
          if (vBlinkSpeed > 0.0) {
            blink = 0.5 + 0.5 * sin(uTime * vBlinkSpeed);
          }
          
          // Soft edges
          float alpha = 1.0 - (dist / 0.5);
          alpha *= blink;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Animate time uniform
  useFrame(({ clock }) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points ref={pointsRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-blinkSpeed"
          count={count}
          array={blinkSpeeds}
          itemSize={1}
          args={[blinkSpeeds, 1]}
        />
      </bufferGeometry>
    </points>
  );
}