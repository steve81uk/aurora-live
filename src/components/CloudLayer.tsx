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
    // TODO: Fetch live cloud data from NASA GIBS or OpenWeatherMap VPR API
    // For now, use the static texture
    setCloudTexture(defaultClouds);
    
    // Future implementation:
    // const fetchLiveClouds = async () => {
    //   try {
    //     const response = await fetch('https://api.openweathermap.org/vpr/...');
    //     const data = await response.json();
    //     // Convert raster data to texture
    //     const texture = generateTextureFromRaster(data);
    //     setCloudTexture(texture);
    //   } catch (error) {
    //     console.warn('Failed to fetch live clouds, using default');
    //     setCloudTexture(defaultClouds);
    //   }
    // };
    // fetchLiveClouds();
    // const interval = setInterval(fetchLiveClouds, 10 * 60 * 1000); // 10 min
    // return () => clearInterval(interval);
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
