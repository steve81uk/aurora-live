import { useMemo } from 'react';
import * as THREE from 'three';

interface AtmosphereShaderProps {
  planetRadius: number;
  atmosphereColor: string; // e.g., "#87CEEB" for Earth
  atmosphereIntensity?: number;
  planetName: string;
}

/**
 * Reusable Atmospheric Shader using Rayleigh Scattering
 * Creates realistic glow around planets
 */
export default function AtmosphereShader({ 
  planetRadius, 
  atmosphereColor, 
  atmosphereIntensity = 1.0,
  planetName 
}: AtmosphereShaderProps) {
  
  const atmosphereMaterial = useMemo(() => {
    const color = new THREE.Color(atmosphereColor);
    
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: color },
        intensity: { value: atmosphereIntensity },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Rayleigh scattering approximation
          // Glow is strongest at the edges (limb)
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - dot(vNormal, viewDirection);
          
          // Apply power to make edge glow sharper
          fresnel = pow(fresnel, 3.0);
          
          // Scattering color (blue for Earth, red for Mars, etc.)
          vec3 color = atmosphereColor * fresnel * intensity;
          
          // Alpha falloff
          float alpha = fresnel * 0.8;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [atmosphereColor, atmosphereIntensity]);

  // Scale factor (atmosphere extends slightly beyond planet)
  const atmosphereScale = 1.15;

  return (
    <mesh scale={[atmosphereScale, atmosphereScale, atmosphereScale]}>
      <sphereGeometry args={[planetRadius, 64, 64]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  );
}

/**
 * Preset Atmospheres for each planet
 */

export function EarthAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#87CEEB" // Blue sky
      atmosphereIntensity={1.2}
      planetName="Earth"
    />
  );
}

export function VenusAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#FFFACD" // Pale yellow
      atmosphereIntensity={1.5}
      planetName="Venus"
    />
  );
}

export function MarsAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#CD853F" // Red-brown dust
      atmosphereIntensity={0.6}
      planetName="Mars"
    />
  );
}

export function JupiterAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#DAA520" // Golden
      atmosphereIntensity={0.8}
      planetName="Jupiter"
    />
  );
}

export function SaturnAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#F0E68C" // Pale gold
      atmosphereIntensity={0.7}
      planetName="Saturn"
    />
  );
}

export function UranusAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#4FE0E0" // Cyan
      atmosphereIntensity={0.9}
      planetName="Uranus"
    />
  );
}

export function NeptuneAtmosphere({ planetRadius }: { planetRadius: number }) {
  return (
    <AtmosphereShader 
      planetRadius={planetRadius}
      atmosphereColor="#4169E1" // Deep blue
      atmosphereIntensity={1.0}
      planetName="Neptune"
    />
  );
}
