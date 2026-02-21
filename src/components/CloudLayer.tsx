/**
 * CloudLayer - Real-time dynamic cloud coverage on Earth
 * Uses NASA GIBS or OpenWeatherMap VPR API for live data
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { TextureLoader } from 'three';

interface CloudLayerProps {
  earthRadius: number;
  sunPosition: THREE.Vector3;
  visible?: boolean;
  opacity?: number;
}

export function CloudLayer({ 
  earthRadius, 
  sunPosition,
  visible = true,
  opacity = 0.35 
}: CloudLayerProps) {
  const cloudRef = useRef<THREE.Mesh>(null);
  const [cloudTexture, setCloudTexture] = useState<THREE.Texture | null>(null);
  
  // Load default cloud texture
  const defaultClouds = useLoader(TextureLoader, '/textures/8k_earth_clouds.jpg');

  useEffect(() => {
    // Try loading a live cloud tile from OpenWeather if API key is present
    const loadLiveClouds = async () => {
      const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (key) {
        try {
          const zoom = 2;
          const x = 1;
          const y = 1;
          const url = `https://tile.openweathermap.org/map/clouds_new/${zoom}/${x}/${y}.png?appid=${key}`;
          const loader = new TextureLoader();
          const tex = await loader.loadAsync(url);
          setCloudTexture(tex);
          return;
        } catch (err) {
          console.warn('Failed to fetch OpenWeather cloud tile, falling back', err);
        }
      }
      // fallback to static
      setCloudTexture(defaultClouds);
    };

    loadLiveClouds();
    const interval = setInterval(loadLiveClouds, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(interval);
  }, [defaultClouds]);

  // Rotate clouds slightly faster than Earth for realism
  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.02;
    }
  });

  if (!visible || !cloudTexture) return null;

  return (
    <mesh 
      ref={cloudRef}
      scale={[1.01, 1.01, 1.01]} // Just above Earth surface
      raycast={() => null} // Don't intercept clicks
    >
      <sphereGeometry args={[earthRadius, 64, 64]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent
        opacity={opacity}
        alphaMap={cloudTexture} // Use same texture for alpha
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
      
      {/* Fresnel atmosphere glow on cloud edges */}
      <mesh scale={[1.002, 1.002, 1.002]}>
        <sphereGeometry args={[earthRadius, 32, 32]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.3;
            }
          `}
        />
      </mesh>
    </mesh>
  );
}
