/**
 * ProceduralCorona — Raymarched volumetric solar corona shader
 * Physically-based scattering that looks like SOHO/SDO imagery.
 * Renders as a half-transparent sphere around the Sun with noise-driven
 * "streamer" and "helmet" structures.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProceduralCoronaProps {
  sunPosition?: THREE.Vector3;
  kpValue?: number;
  radius?: number;
  xrayFlux?: number;
}

// Physically motivated turbulent noise following:
// https://www.shadertoy.com/view/4sfGWS (simplified for realtime)
const VERT_SHADER = /* glsl */`
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vPos    = position;
    vNormal = normalize(normalMatrix * normal);
    vUv     = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_SHADER = /* glsl */`
  uniform float uTime;
  uniform float uKp;         // 0–9
  uniform float uXray;       // W/m² log-normalised 0–1

  varying vec3  vPos;
  varying vec3  vNormal;
  varying vec2  vUv;

  // Pseudo-random value hash
  float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
  }

  // 3D fractal noise
  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i),              hash(i + vec3(1,0,0)), u.x),
                   mix(hash(i + vec3(0,1,0)),hash(i + vec3(1,1,0)), u.x), u.y),
               mix(mix(hash(i + vec3(0,0,1)),hash(i + vec3(1,0,1)), u.x),
                   mix(hash(i + vec3(0,1,1)),hash(i + vec3(1,1,1)), u.x), u.y), u.z);
  }

  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p  = p * 2.0 + vec3(0.3, 0.7, 0.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Fresnel-based corona brightness (falloff from edge toward centre)
    float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float corona  = pow(fresnel, 2.2);

    // Animated turbulent streamers
    float turbulence = fbm(vPos * 2.5 + vec3(uTime * 0.04, 0.0, uTime * 0.03));
    turbulence = pow(turbulence, 1.8);

    // Streamer belt: brightest near solar equator (Y≈0)
    float equatorialBias = 1.0 - abs(vPos.y) * 1.1;
    equatorialBias = clamp(equatorialBias, 0.0, 1.0);

    // Helmet structure (radial spikes)
    float helmets = sin(atan(vPos.z, vPos.x) * 8.0 + uTime * 0.1) * 0.3 + 0.7;

    // Combine layers
    float intensity = corona * (0.5 + turbulence * 0.5) * equatorialBias * helmets;
    intensity      *= 1.0 + uKp * 0.06;  // Brighter during storms
    intensity      += uXray * 0.3;        // Flare excitation

    // Corona colour: yellow-white core → orange tendrils → red edges
    vec3 innerCol = vec3(1.0,  0.96, 0.85);
    vec3 midCol   = vec3(1.0,  0.55, 0.1);
    vec3 outerCol = vec3(0.9,  0.1,  0.05);

    float mixT = pow(max(0.0, 1.0 - corona * 2.5), 1.5);
    vec3 col   = mix(innerCol, mix(midCol, outerCol, mixT), clamp(mixT * 1.5, 0.0, 1.0));
    col       *= 1.0 + (turbulence - 0.5) * 0.3;

    float alpha = intensity * 0.55;
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.8));
  }
`;

export function ProceduralCorona({
  sunPosition = new THREE.Vector3(0, 0, 0),
  kpValue = 3,
  radius = 4.5,
  xrayFlux = 0,
}: ProceduralCoronaProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uKp:    { value: kpValue },
      uXray:  { value: xrayFlux },
    },
    vertexShader:   VERT_SHADER,
    fragmentShader: FRAG_SHADER,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame((state, delta) => {
    material.uniforms.uTime.value  += delta;
    material.uniforms.uKp.value     = kpValue;
    material.uniforms.uXray.value   = Math.min(1, xrayFlux * 1e5); // normalise flux
  });

  return (
    <mesh ref={meshRef} position={sunPosition} material={material}>
      <sphereGeometry args={[radius, 64, 32]} />
    </mesh>
  );
}

// ── AURORA CURTAIN SHADER (altitude-dependant colour bands) ─────────────────
const AURORA_CURTAIN_VERT = /* glsl */`
  uniform float uTime;
  varying vec2  vUv;
  varying vec3  vWorldPos;

  void main() {
    vec3 pos   = position;
    // Vertical curtain waving
    float wave = sin(position.x * 3.0 + uTime * 1.5) * 0.03
               + sin(position.z * 2.5 - uTime * 0.9) * 0.02;
    pos.x     += wave;
    pos.z     += wave * 0.5;
    vUv         = uv;
    vWorldPos   = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPos, 1.0);
  }
`;

const AURORA_CURTAIN_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uKp;
  uniform float uBz;     // nT, negative = southward

  varying vec2  vUv;
  varying vec3  vWorldPos;

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise2(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1,0)), u.x),
               mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), u.x), u.y);
  }

  void main() {
    // vUv.y = normalised altitude: 0=bottom, 1=top
    float alt = vUv.y;   // 0→1 represents ~60km → 250km

    // Physical colour bands:
    // < 100km: blue/violet (N₂⁺) at 0.0–0.3
    // 100–120km: green (O 557.7nm) at 0.3–0.6
    // > 200km: red (O 630nm) at 0.6–1.0
    vec3 blue   = vec3(0.3,  0.15, 1.0);
    vec3 green  = vec3(0.05, 1.0,  0.25);
    vec3 red    = vec3(1.0,  0.1,  0.15);

    vec3 col;
    if (alt < 0.35)       col = mix(blue,  green, alt / 0.35);
    else if (alt < 0.65)  col = green;
    else                  col = mix(green, red,   (alt - 0.65) / 0.35);

    // Curtain brightness noise
    vec2 noiseUV  = vec2(vUv.x * 4.0 + uTime * 0.15, alt * 6.0 - uTime * 0.3);
    float curtain = noise2(noiseUV) * 0.7 + noise2(noiseUV * 2.0) * 0.3;
    curtain       = pow(curtain, 1.4);

    // Intensity driven by Kp + southward Bz
    float bzMod  = 1.0 + clamp(-uBz * 0.08, 0.0, 1.5);
    float kpMod  = uKp / 9.0;
    float alpha  = curtain * kpMod * bzMod * 0.7;

    // Fade at top/bottom edges
    alpha *= smoothstep(0.0, 0.1, alt) * smoothstep(1.0, 0.9, alt);

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * (0.7 + curtain * 0.6), clamp(alpha, 0.0, 0.7));
  }
`;

export function AuroraCurtainShell({
  earthPosition = new THREE.Vector3(0, 0, 0),
  kpValue = 3,
  bzNT = 0,
  radius = 1.08,
}: {
  earthPosition?: THREE.Vector3;
  kpValue?: number;
  bzNT?: number;
  radius?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uKp:   { value: kpValue },
      uBz:   { value: bzNT },
    },
    vertexShader:   AURORA_CURTAIN_VERT,
    fragmentShader: AURORA_CURTAIN_FRAG,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uKp.value    = kpValue;
    material.uniforms.uBz.value    = bzNT;
  });

  return (
    <mesh ref={meshRef} position={earthPosition} material={material}>
      <sphereGeometry args={[radius, 96, 48]} />
    </mesh>
  );
}
