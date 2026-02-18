import * as THREE from 'three';

/**
 * Photorealistic Sun Shader
 * Features:
 * - Layered surface detail (granulation, convection cells)
 * - Dynamic sunspots with umbra/penumbra
 * - Chromosphere atmosphere
 * - Limb darkening (realistic brightness falloff at edges)
 * - Coronal loops and prominences
 * - Flare effects
 */

export const PhotorealisticSunShader = {
  uniforms: {
    uTime: { value: 0 },
    uFlareActive: { value: false },
    uFlareIntensity: { value: 0.0 },
    uSunspotDensity: { value: 0.5 },
    uXRayIntensity: { value: 0.0 },
    uRotationSpeed: { value: 0.02 }, // Sun rotates slowly
  },
  
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    uniform float uTime;
    uniform bool uFlareActive;
    uniform float uFlareIntensity;
    uniform float uSunspotDensity;
    uniform float uXRayIntensity;
    uniform float uRotationSpeed;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    // ============================================
    // NOISE FUNCTIONS
    // ============================================
    
    // Hash function for pseudo-random numbers
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + 0.1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    
    // 3D Noise
    float noise3D(vec3 x) {
      vec3 p = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = p.x + p.y * 157.0 + 113.0 * p.z;
      
      return mix(
        mix(
          mix(hash(p + vec3(0, 0, 0)), hash(p + vec3(1, 0, 0)), f.x),
          mix(hash(p + vec3(0, 1, 0)), hash(p + vec3(1, 1, 0)), f.x),
          f.y
        ),
        mix(
          mix(hash(p + vec3(0, 0, 1)), hash(p + vec3(1, 0, 1)), f.x),
          mix(hash(p + vec3(0, 1, 1)), hash(p + vec3(1, 1, 1)), f.x),
          f.y
        ),
        f.z
      );
    }
    
    // Fractal Brownian Motion (multi-octave noise)
    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * noise3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    // Voronoi cells for granulation
    vec2 voronoi(vec3 p) {
      vec3 n = floor(p);
      vec3 f = fract(p);
      
      float minDist = 1.0;
      float secondMinDist = 1.0;
      
      for (int k = -1; k <= 1; k++) {
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec3 g = vec3(float(i), float(j), float(k));
            vec3 o = hash(n + g) * vec3(1.0);
            vec3 r = g + o - f;
            float d = length(r);
            
            if (d < minDist) {
              secondMinDist = minDist;
              minDist = d;
            } else if (d < secondMinDist) {
              secondMinDist = d;
            }
          }
        }
      }
      
      return vec2(minDist, secondMinDist);
    }
    
    // ============================================
    // SUN SURFACE FEATURES
    // ============================================
    
    // Solar granulation (convection cells)
    float granulation(vec3 pos) {
      vec2 cells = voronoi(pos * 20.0 + vec3(uTime * 0.5, 0.0, 0.0));
      float pattern = cells.y - cells.x;
      return smoothstep(0.0, 0.2, pattern);
    }
    
    // Sunspots (dark magnetic regions)
    float sunspots(vec3 pos) {
      // Rotating sunspot pattern
      vec3 rotatedPos = pos + vec3(uTime * uRotationSpeed, 0.0, 0.0);
      
      float spots = fbm(rotatedPos * 5.0, 4);
      float threshold = 0.65 + uSunspotDensity * 0.2;
      
      // Umbra (dark core)
      float umbra = smoothstep(threshold + 0.1, threshold + 0.15, spots);
      
      // Penumbra (lighter surrounding area)
      float penumbra = smoothstep(threshold, threshold + 0.1, spots) * 0.5;
      
      return umbra + penumbra;
    }
    
    // Supergranulation (large-scale convection)
    float supergranulation(vec3 pos) {
      float large = fbm(pos * 3.0 + vec3(uTime * 0.1, 0.0, 0.0), 3);
      return large * 0.3;
    }
    
    // Magnetic field lines (subtle swirls)
    float magneticField(vec3 pos) {
      float angle = atan(pos.y, pos.x);
      float field = sin(angle * 8.0 + uTime * 0.3 + fbm(pos * 4.0, 2) * 3.0);
      return field * 0.1;
    }
    
    // ============================================
    // LIGHTING & ATMOSPHERE
    // ============================================
    
    // Limb darkening (edges darker than center)
    float limbDarkening(vec3 normal, vec3 viewDir) {
      float fresnel = dot(normal, viewDir);
      // More sophisticated limb darkening formula
      float u = sqrt(1.0 - fresnel * fresnel);
      float limb = 1.0 - 0.6 * u - 0.4 * u * u;
      return clamp(limb, 0.3, 1.0);
    }
    
    // Chromosphere glow (reddish atmosphere at edge)
    float chromosphere(vec3 normal, vec3 viewDir) {
      float fresnel = 1.0 - dot(normal, viewDir);
      return pow(fresnel, 3.0) * 0.8;
    }
    
    // ============================================
    // MAIN SHADER
    // ============================================
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Base spherical coordinates for texture mapping
      float theta = atan(vPosition.z, vPosition.x);
      float phi = acos(vPosition.y / length(vPosition));
      vec3 spherePos = vec3(theta, phi, length(vPosition));
      
      // ===== SURFACE LAYERS =====
      
      // 1. Granulation (small convection cells)
      float gran = granulation(vPosition);
      
      // 2. Supergranulation (large-scale pattern)
      float superGran = supergranulation(vPosition);
      
      // 3. Sunspots (dark magnetic regions)
      float spots = sunspots(vPosition);
      
      // 4. Magnetic field swirls
      float magnetic = magneticField(vPosition);
      
      // 5. Limb darkening
      float limb = limbDarkening(normal, viewDir);
      
      // 6. Chromosphere (red edge glow)
      float chromo = chromosphere(normal, viewDir);
      
      // ===== COLOR COMPOSITION =====
      
      // Core color (deep yellow-orange)
      vec3 coreColor = vec3(1.0, 0.85, 0.3); // #FFD94D
      
      // Surface color (bright orange-yellow)
      vec3 surfaceColor = vec3(1.0, 0.95, 0.6); // #FFF299
      
      // Hot regions (whitish-yellow)
      vec3 hotColor = vec3(1.0, 1.0, 0.95);
      
      // Cool regions (orange-red)
      vec3 coolColor = vec3(1.0, 0.6, 0.2); // #FF9933
      
      // Sunspot color (dark brown-red)
      vec3 spotColor = vec3(0.2, 0.1, 0.05); // #332211
      
      // Chromosphere color (deep red)
      vec3 chromoColor = vec3(1.0, 0.2, 0.1); // #FF3319
      
      // Blend surface details
      vec3 surfaceDetail = mix(coolColor, hotColor, gran);
      surfaceDetail = mix(surfaceDetail, surfaceColor, superGran);
      surfaceDetail += magnetic * vec3(0.1, 0.05, 0.0);
      
      // Apply sunspots
      vec3 finalColor = mix(surfaceDetail, spotColor, spots);
      
      // Apply limb darkening
      finalColor *= limb;
      
      // Add chromosphere glow at edges
      finalColor = mix(finalColor, chromoColor, chromo);
      
      // ===== FLARE EFFECTS =====
      
      if (uFlareActive) {
        // Hot white flare regions
        float flare = fbm(vPosition * 8.0 + vec3(uTime * 2.0, 0.0, 0.0), 3);
        flare = smoothstep(0.6, 0.8, flare) * uFlareIntensity;
        
        vec3 flareColor = vec3(1.0, 0.95, 0.8);
        finalColor = mix(finalColor, flareColor, flare * 0.8);
        
        // Brightness boost
        finalColor += flare * vec3(0.3, 0.2, 0.1);
      }
      
      // X-ray intensity (bright white patches)
      if (uXRayIntensity > 0.1) {
        float xray = fbm(vPosition * 12.0 + vec3(uTime, 0.0, 0.0), 2);
        xray = smoothstep(0.7, 0.9, xray) * uXRayIntensity;
        finalColor += xray * vec3(0.5, 0.4, 0.3);
      }
      
      // ===== FINAL OUTPUT =====
      
      // Boost overall brightness
      finalColor *= 1.2;
      
      // Subtle glow
      float glow = pow(1.0 - dot(normal, viewDir), 2.0) * 0.3;
      finalColor += glow * vec3(1.0, 0.8, 0.4);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
