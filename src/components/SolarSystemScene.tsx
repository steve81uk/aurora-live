import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarSystemSceneProps {
  kpValue: number;
  solarWindSpeed: number;
}

function CoronalRing({ radius, speed }: { radius: number; speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 1, -15]}>
      <torusGeometry args={[radius, 0.1, 16, 100]} />
      <meshBasicMaterial color="#FF8C00" transparent opacity={0.3} />
    </mesh>
  );
}

function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sunRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2 + 1;
      sunRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={sunRef} position={[0, 1, -15]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color="#FDB813"
          emissive="#FF8C00"
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight position={[0, 1, -15]} intensity={3} distance={30} color="#FDB813" castShadow />
      
      <CoronalRing radius={3.5} speed={0.2} />
      <CoronalRing radius={4.2} speed={-0.15} />
      <CoronalRing radius={5} speed={0.1} />
    </group>
  );
}

function SolarWindParticles({ speed }: { speed: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  const particlesGeometry = useMemo(() => {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 2;

      positions[i * 3] = (Math.cos(angle) * spread);
      positions[i * 3 + 1] = 1 + (Math.sin(angle) * spread);
      positions[i * 3 + 2] = -15 + t * 15;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const speedFactor = speed / 400;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += speedFactor * 0.05;

        if (positions[i + 2] > 2) {
          const angle = Math.random() * Math.PI * 2;
          const spread = Math.random() * 2;
          positions[i] = Math.cos(angle) * spread;
          positions[i + 1] = 1 + Math.sin(angle) * spread;
          positions[i + 2] = -15;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial size={0.04} color="#FFA500" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function AuroraRing({ kpValue }: { kpValue: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (ringRef.current && materialRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 3) * 0.2 + 0.8;
      ringRef.current.scale.setScalar(1 + pulse * 0.1);
      materialRef.current.opacity = pulse * 0.9;
    }
  });

  const getAuroraColor = (kp: number): string => {
    if (kp < 5) return '#00ff88';
    if (kp < 7) return '#ffaa00';
    return '#ff0044';
  };

  const auroraColor = getAuroraColor(kpValue);

  return (
    <mesh ref={ringRef} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.7, 0.12, 16, 100]} />
      <meshStandardMaterial
        ref={materialRef}
        color={auroraColor}
        transparent
        opacity={0.9}
        emissive={auroraColor}
        emissiveIntensity={kpValue / 3}
      />
    </mesh>
  );
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      <mesh ref={earthRef} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial color="#0d47a1" roughness={0.6} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0, 0]} scale={1.08}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#4dd0e1" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function Mars() {
  const marsRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (marsRef.current) {
      const angle = state.clock.getElapsedTime() * 0.1;
      marsRef.current.position.x = Math.cos(angle) * 10;
      marsRef.current.position.z = Math.sin(angle) * 10;
      marsRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={marsRef} position={[10, 0, 0]}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial color="#cd5c5c" roughness={0.8} />
    </mesh>
  );
}

function Venus() {
  const venusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (venusRef.current) {
      const angle = state.clock.getElapsedTime() * 0.15;
      venusRef.current.position.x = Math.cos(angle) * 7;
      venusRef.current.position.z = Math.sin(angle) * 7;
      venusRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={venusRef} position={[7, 0, 0]}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color="#f5deb3" roughness={0.4} />
    </mesh>
  );
}

export default function SolarSystemScene({ kpValue, solarWindSpeed }: SolarSystemSceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 1, -15]} intensity={2} castShadow />

      <Sun />
      <Earth />
      <AuroraRing kpValue={kpValue} />
      <SolarWindParticles speed={solarWindSpeed} />
      <Mars />
      <Venus />
    </>
  );
}
