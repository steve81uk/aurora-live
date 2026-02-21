/**
 * OvationAuroraShell — Real NOAA OVATION aurora oval mapped to a 3D sphere
 * Uses ShaderMaterial with a CanvasTexture built from live OVATION probability data.
 * Updates every 5 minutes automatically.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fetchOvationAurora } from '../services/OvationAuroraService';
import type { OvationDataset } from '../services/OvationAuroraService';

interface OvationAuroraShellProps {
  earthPosition: THREE.Vector3;
  kpValue?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function OvationAuroraShell({
  earthPosition,
  kpValue = 3,
  innerRadius = 1.06,
  outerRadius = 1.18,
}: OvationAuroraShellProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [dataset, setDataset] = useState<OvationDataset | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  // Fetch live OVATION data on mount + every 5 minutes
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchOvationAurora();
      if (data?.texture) {
        if (textureRef.current) textureRef.current.dispose();
        const tex = new THREE.CanvasTexture(data.texture as HTMLCanvasElement);
        tex.wrapS = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        textureRef.current = tex;
        setDataset(data);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => {
      clearInterval(interval);
      textureRef.current?.dispose();
    };
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:       { value: 0 },
      uKp:         { value: kpValue },
      uOvation:    { value: null as THREE.Texture | null },
      uHasOvation: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv    = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uKp;
      uniform sampler2D uOvation;
      uniform float uHasOvation;

      varying vec2 vUv;
      varying vec3 vNormal;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        // Edge (Fresnel) transparency so shells look like real curtains
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);

        // Curtain wave animation
        float wave = sin(vUv.x * 18.0 + uTime * 1.2) * cos(vUv.y * 12.0 + uTime * 0.8) * 0.5 + 0.5;

        vec3 col;
        float alpha;

        if (uHasOvation > 0.5) {
          // --- REAL OVATION NOWCAST ---
          vec4 ovation = texture2D(uOvation, vUv);
          float prob = ovation.g; // green channel = aurora probability
          if (prob < 0.02) discard;

          // Altitude-banded colour: green 100–120km → red/purple 60–80km → blue 200km
          float height = vUv.y; // proxy for altitude band using UV
          vec3 green  = vec3(0.08, 1.0, 0.35);
          vec3 red    = vec3(1.0,  0.15, 0.2);
          vec3 blue   = vec3(0.35, 0.55, 1.0);
          col   = mix(green, blue, smoothstep(0.4, 0.8, height));
          col   = mix(col, red, smoothstep(0.1, 0.3, 1.0 - height));

          // Modulate brightness by OVATION probability
          col  *= (0.6 + prob * 0.8);
          alpha = prob * wave * fresnel * 0.85 * (0.7 + uKp * 0.04);
        } else {
          // --- Fallback: Kp-driven oval ---
          float lat = vUv.y; // 0=south, 1=north
          float ovalCentre = 0.5 + (1.0 - uKp / 9.0) * 0.35; // N hemisphere
          float ovalWidth  = 0.06 + uKp * 0.012;
          float ovalS      = 1.0 - ovalCentre;
          float bandN = smoothstep(ovalCentre - ovalWidth, ovalCentre, lat) *
                        smoothstep(ovalCentre + ovalWidth, ovalCentre, lat);
          float bandS = smoothstep(ovalS - ovalWidth, ovalS, lat) *
                        smoothstep(ovalS + ovalWidth, ovalS, lat);
          float band = max(bandN, bandS);
          if (band < 0.01) discard;

          float stormMix = smoothstep(3.0, 7.0, uKp);
          col   = mix(vec3(0.08, 1.0, 0.35), vec3(1.0, 0.2, 0.3), stormMix);
          alpha = band * wave * fresnel * 0.7;
        }

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Update uniforms every frame
  useFrame(state => {
    if (!meshRef.current) return;
    const mat = material;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uKp.value   = kpValue;
    if (textureRef.current) {
      mat.uniforms.uOvation.value    = textureRef.current;
      mat.uniforms.uHasOvation.value = 1.0;
    }
  });

  return (
    <mesh ref={meshRef} position={earthPosition} material={material}>
      <sphereGeometry args={[(innerRadius + outerRadius) / 2, 96, 48]} />
    </mesh>
  );
}
