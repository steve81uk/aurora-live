import * as THREE from 'three';

export interface SunShaderUniforms {
  uTime: { value: number };
  uFlareActive: { value: boolean };
  uFlareIntensity: { value: number };
  uColorCore: { value: THREE.Color };
  uColorCorona: { value: THREE.Color };
  uColorFlare: { value: THREE.Color };
  uSunspotDensity: { value: number };
  uXRayIntensity: { value: number };
  uCoronaVisible: { value: boolean };
  uProminenceActive: { value: boolean };
}

export const EnhancedSunShader = {
  uniforms: {
    uTime: { value: 0 },
    uFlareActive: { value: false },
    uFlareIntensity: { value: 0.0 },
    uColorCore: { value: new THREE.Color('#FDB813') },      // Deep amber core
    uColorCorona: { value: new THREE.Color('#FFA500') },    // Orange corona
    uColorFlare: { value: new THREE.Color('#FF4500') },     // Red-orange flare
    uSunspotDensity: { value: 0.5 },                        // Sunspot coverage (0-1)
    uXRayIntensity: { value: 0.0 },                         // X-ray flare intensity (0-1)
    uCoronaVisible: { value: true },                        // Corona visibility
    uProminenceActive: { value: false }                     // Prominence flag
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
    uniform bool uFlareActive;
    uniform float uFlareIntensity;
    uniform vec3 uColorCore;
    uniform vec3 uColorCorona;
    uniform vec3 uColorFlare;
    uniform float uSunspotDensity;
    uniform float uXRayIntensity;
    uniform bool uCoronaVisible;
    uniform bool uProminenceActive;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Simple noise function for solar surface turbulence
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
    }
    
    // Enhanced noise for sunspots
    float sunspotNoise(vec3 p) {
      float n = noise(p * 10.0);
      n += noise(p * 20.0) * 0.5;
      n += noise(p * 40.0) * 0.25;
      return n / 1.75;
    }
    
    // Sunspot generation
    float sunspots(vec3 pos) {
      float spots = sunspotNoise(pos + vec3(uTime * 0.01));
      float threshold = 1.0 - uSunspotDensity * 0.5;
      return smoothstep(threshold - 0.1, threshold, spots);
    }
    
    // Fractal Brownian Motion for detailed surface
    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      // Animated surface turbulence (solar granulation)
      vec3 turbulence = vPosition * 2.0 + vec3(uTime * 0.1);
      float surface = fbm(turbulence);
      
      // Radial gradient (brighter at center, darker at edges)
      float radial = 1.0 - length(vUv - 0.5) * 1.4;
      radial = clamp(radial, 0.0, 1.0);
      
      // Solar swirls (rotating convection cells)
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float swirl = sin(angle * 8.0 + uTime * 0.5 + surface * 3.0) * 0.3 + 0.7;
      
      // Combine surface details
      float detail = surface * 0.4 + swirl * 0.6;
      
      // Color blending: core to corona
      vec3 baseColor = mix(uColorCorona, uColorCore, radial * detail);
      
      // Calculate sunspot darkening
      float sunspotMask = sunspots(vPosition);
      float sunspotDarkening = 1.0 - (sunspotMask * 0.6);
      
      // Apply sunspots to base color
      baseColor *= sunspotDarkening;
      
      // Add solar flare effect when active
      float flarePulse = sin(uTime * 3.0) * 0.5 + 0.5;
      if (uFlareActive) {
        float flareEffect = uFlareIntensity * flarePulse * (1.0 - radial);
        baseColor = mix(baseColor, uColorFlare, flareEffect * 0.7);
      }
      
      // Add X-ray flare brightening
      if (uXRayIntensity > 0.3) {
        float xrayGlow = uXRayIntensity * (1.0 - radial) * flarePulse;
        baseColor += uColorFlare * xrayGlow * 0.5;
      }
      
      // Increase brightness
      baseColor *= 1.5 + (surface * 0.3);
      
      // Edge glow (limb darkening simulation)
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      vec3 glowColor = uColorCorona * 1.2;
      vec3 finalColor = mix(baseColor, glowColor, fresnel * 0.3);
      
      // Corona (outer glow) when visible
      if (uCoronaVisible) {
        float coronaGlow = pow(fresnel, 2.0) * 0.8;
        finalColor += uColorCorona * coronaGlow * (1.0 + uXRayIntensity);
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
