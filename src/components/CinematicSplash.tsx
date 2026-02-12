/**
 * AETHERIS - Cinematic Splash Screen
 * Epic diamond ring eclipse effect with GSAP camera zoom
 */

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface CinematicSplashProps {
  onComplete: () => void;
}

// Earth Silhouette Component
function EarthSilhouette() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation
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

// Sun Glow Behind Earth (Diamond Ring Effect)
function EclipseSun() {
  const sunRef = useRef<THREE.Mesh>(null);
  
  return (
    <group position={[0, 0, -3]}>
      {/* Core sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Outer corona glow */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Secondary glow */}
      <mesh>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial 
          color="#ff6600" 
          transparent 
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outermost corona */}
      <mesh>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial 
          color="#ffdd00" 
          transparent 
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Main Scene
function EclipseScene() {
  return (
    <>
      {/* Ambient light for subtle illumination */}
      <ambientLight intensity={0.2} />
      
      {/* Sun behind Earth */}
      <EclipseSun />
      
      {/* Earth silhouette in front */}
      <EarthSilhouette />
      
      {/* Particles around eclipse */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(
              Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 20)
            )}
            itemSize={3}
            args={[new Float32Array(
              Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 20)
            ), 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.02} 
          color="#ffffff" 
          transparent 
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export function CinematicSplash({ onComplete }: CinematicSplashProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Handle BEGIN MISSION click
  const handleBeginMission = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Animate title and button out
    if (titleRef.current && buttonRef.current) {
      gsap.to([titleRef.current, buttonRef.current], {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: 'power2.in'
      });
    }
    
    // Zoom camera into Earth
    if (canvasRef.current) {
      gsap.to(canvasRef.current, {
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
  
  // Auto-fade in on mount
  useEffect(() => {
    if (titleRef.current && buttonRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 2,
        delay: 0.5,
        ease: 'power2.out'
      });
      
      gsap.from(buttonRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        delay: 2,
        ease: 'back.out(1.7)'
      });
    }
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Radial gradient background */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,1) 100%)'
        }}
      />
      
      {/* 3D Eclipse Scene */}
      <div ref={canvasRef} className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <EclipseScene />
        </Canvas>
      </div>
      
      {/* Title and Button Overlay */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* AETHERIS Title */}
        <div 
          ref={titleRef}
          className="text-center"
        >
          <h1 
            className="text-8xl font-thin tracking-[0.5em] text-white mb-4"
            style={{ 
              fontFamily: 'Rajdhani, sans-serif',
              textShadow: '0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,170,0,0.3)'
            }}
          >
            AETHERIS
          </h1>
          <p 
            className="text-sm tracking-[0.3em] text-gray-400 font-light"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            AURORA • LIVE • REAL-TIME SPACE WEATHER
          </p>
        </div>
        
        {/* BEGIN MISSION Button */}
        <button
          ref={buttonRef}
          onClick={handleBeginMission}
          disabled={isAnimating}
          className="group relative px-12 py-4 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Button background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
          
          {/* Button border */}
          <div className="absolute inset-0 border border-white/30 group-hover:border-white/60 transition-all duration-300" 
            style={{
              boxShadow: '0 0 20px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.05)'
            }}
          />
          
          {/* Button text */}
          <span 
            className="relative text-lg tracking-[0.3em] text-white font-light group-hover:text-cyan-300 transition-colors duration-300"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            BEGIN MISSION
          </span>
        </button>
      </div>
      
      {/* Diamond ring sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${45 + Math.cos((i / 20) * Math.PI * 2) * 15 + Math.random() * 5}%`,
              top: `${45 + Math.sin((i / 20) * Math.PI * 2) * 15 + Math.random() * 5}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 4px rgba(255,255,255,0.8)'
            }}
          />
        ))}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
