import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SolarWindProps {
  speed: number;
}

function SolarWind({ speed }: SolarWindProps) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const count = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 0.3;
      
      positions[i * 3] = -15 + t * 18 + Math.cos(angle) * spread;
      positions[i * 3 + 1] = Math.sin(angle) * spread;
      positions[i * 3 + 2] = Math.cos(angle) * spread;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const speedFactor = speed / 500;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += speedFactor * 0.05;
        
        if (positions[i] > 3) {
          positions[i] = -15;
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 0.3;
          positions[i + 1] = Math.sin(angle) * spread;
          positions[i + 2] = Math.cos(angle) * spread;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.05}
        color="#ffaa00"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface AuroraRingProps {
  kpValue: number;
}

function AuroraRing({ kpValue }: AuroraRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (ringRef.current && materialRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 2) * 0.3 + 0.7;
      ringRef.current.scale.setScalar(1 + pulse * 0.1);
      materialRef.current.opacity = pulse * 0.8;
    }
  });

  const getAuroraColor = (kp: number): string => {
    if (kp < 5) return '#00ff88';
    if (kp < 7) return '#ffaa00';
    return '#ff0044';
  };

  const auroraColor = getAuroraColor(kpValue);

  return (
    <mesh ref={ringRef} position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.6, 0.15, 16, 100]} />
      <meshStandardMaterial
        ref={materialRef}
        color={auroraColor}
        transparent
        opacity={0.8}
        emissive={auroraColor}
        emissiveIntensity={kpValue / 5}
      />
    </mesh>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1 + 0.9;
      sunRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={sunRef} position={[-20, 5, -10]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#ffdd00" />
      <pointLight color="#ffdd00" intensity={2} distance={50} />
    </mesh>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#1e40af"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      <mesh ref={atmosphereRef} scale={1.05}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          color="#4dd0e1"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

interface Globe3DProps {
  kpValue: number;
  solarWindSpeed: number;
}

export default function Globe3D({ kpValue, solarWindSpeed }: Globe3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[-20, 5, -10]} intensity={1.5} color="#ffffff" />
        
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        <Sun />
        <Earth />
        <AuroraRing kpValue={kpValue} />
        <SolarWind speed={solarWindSpeed} />
        
        <OrbitControls
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
    </div>
  );
}
