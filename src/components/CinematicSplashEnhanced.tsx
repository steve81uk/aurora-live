/**
 * SKÖLL-TRACK - Enhanced Cinematic Splash Screen
 * Animated aurora ring with shader effects + diamond eclipse
 */

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicSplashProps {
  onComplete: () => void;
}

// Aurora Ring with undulating shader effect
function AuroraRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Custom aurora shader
  const vertexShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Undulating wave effect
      float wave = sin(pos.x * 3.0 + uTime) * 0.1 + sin(pos.y * 2.0 + uTime * 0.5) * 0.15;
      pos.z += wave;
      vDisplacement = wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;
  
  const fragmentShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    uniform float uTime;
    
    void main() {
      // Aurora colors (green #4ade80 to purple #a855f7 gradient)
      vec3 color1 = vec3(0.29, 0.87, 0.50); // #4ade80 green
      vec3 color2 = vec3(0.66, 0.33, 0.97); // #a855f7 purple
      
      // Animate color gradient
      float mixValue = sin(vUv.x * 3.14159 + uTime * 0.5) * 0.5 + 0.5;
      vec3 finalColor = mix(color1, color2, mixValue);
      
      // Add glow based on displacement
      float glow = abs(vDisplacement) * 2.0;
      finalColor += glow * 0.3;
      
      // Fade at edges
      float alpha = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
      alpha *= 0.6 + sin(uTime * 2.0) * 0.2; // Pulsing opacity
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    
    if (ringRef.current) {
      // Slow rotation
      ringRef.current.rotation.z += 0.001;
    }
  });
  
  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[3.5, 0.4, 32, 100]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 }
        }}
      />
    </mesh>
  );
}

// Earth Silhouette
function EarthSilhouette() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

// Enhanced Sun with flares
function EclipseSun() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
      groupRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      
      {/* Corona layers */}
      {[2.1, 2.5, 3, 4].map((radius, i) => (
        <mesh key={i}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshBasicMaterial 
            color={i < 2 ? "#ff9500" : "#ffcc00"} 
            transparent 
            opacity={0.3 / (i + 1)}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Solar flares */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 2.5;
        return (
          <mesh 
            key={`flare-${i}`}
            position={[
              Math.cos(angle) * distance,
              Math.sin(angle) * distance,
              0
            ]}
          >
            <coneGeometry args={[0.2, 1.5, 8]} />
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent 
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Animated sparkles
function Sparkles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 50;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 3 + Math.random() * 1.5;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export function CinematicSplashEnhanced({ onComplete }: CinematicSplashProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    // Preload fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;500;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  const handleBeginMission = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      });
    }
    
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 3,
        opacity: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          onComplete();
        }
      });
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at center, rgba(10,10,30,0.9) 0%, rgba(0,0,0,1) 100%)'
      }}
    >
      {/* 3D Eclipse Scene with Aurora Ring */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <EclipseSun />
          <EarthSilhouette />
          <AuroraRing />
          <Sparkles />
          <ambientLight intensity={0.2} />
        </Canvas>
      </div>
      
      {/* Title and Button Overlay - Centered in the ring */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-12">
        {/* Project Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 aurora-text">
          SKÖLL-TRACK
        </h1>
        
        {/* Begin Mission Button */}
        <button
          ref={buttonRef}
          onClick={handleBeginMission}
          disabled={isAnimating}
          className="px-8 py-4 text-lg font-bold tracking-widest neon-amber aurora-border rounded-lg hover:scale-105 transition-transform bg-black/80 backdrop-blur-sm animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
        >
          BEGIN MISSION
        </button>
        
        {/* Version & Credits - optional footer */}
        <div className="text-center space-y-2 mt-8">
          <p 
            className="text-sm text-gray-500 font-light"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              letterSpacing: '0.3em'
            }}
          >
            v3.1.0-NAVIGATION • POWERED BY NASA & NOAA DATA
          </p>
          <p className="text-xs text-gray-600 font-mono">
            ML FORECASTING • 5K PARTICLE PHYSICS • PWA ENABLED
          </p>
        </div>
      </div>
      
      {/* Enhanced starfield */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: Math.random() > 0.5 ? '0 0 4px rgba(6,182,212,0.8)' : '0 0 4px rgba(168,85,247,0.6)'
            }}
          />
        ))}
      </div>
      
      {/* Add twinkle animation to CSS */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
