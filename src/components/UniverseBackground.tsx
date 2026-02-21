import { useLoader } from '@react-three/fiber';
import { TextureLoader, BackSide } from 'three';

export function UniverseBackground() {
  let texture = null;
  try {
    texture = useLoader(TextureLoader, 'textures/2k_stars_milky_way.jpg');
  } catch (e) {
    console.warn("Milky Way texture failed.");
  }

  return (
    <group>
      {/* 1. Milky Way Sphere (Massive) */}
      <mesh>
        <sphereGeometry args={[90000, 64, 64]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={BackSide} depthWrite={false} />
        ) : (
          <meshBasicMaterial color="#020205" side={BackSide} depthWrite={false} />
        )}
      </mesh>

      {/* 2. Procedural Starfield (Spheres instead of Points to avoid "Squares") */}
      <StarField count={1500} radius={60000} />
    </group>
  );
}

function StarField({ count, radius }: { count: number, radius: number }) {
  const stars = new Array(count).fill(0).map(() => {
    const r = radius * (0.5 + Math.random() * 0.5);
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    return { pos: [x, y, z], size: Math.random() * 150 + 50 }; // Random sizes
  });

  return (
    <group>
      {stars.map((star, i) => (
        <mesh key={i} position={star.pos as any}>
          <sphereGeometry args={[star.size, 4, 4]} />
          <meshBasicMaterial color="white" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}