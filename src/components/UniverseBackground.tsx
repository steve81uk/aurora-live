import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

/**
 * UniverseBackground - Milky Way galaxy texture sphere
 * Renders a huge sphere with the galaxy texture on the INSIDE
 * This creates an immersive space environment
 */
export function UniverseBackground() {
  let texture: THREE.Texture | null = null;
  
  try {
    texture = useLoader(TextureLoader, '/textures/2k_stars_milky_way.jpg');
  } catch (error) {
    console.warn('Milky Way texture not found, using fallback starfield');
  }

  return (
    <mesh>
      {/* Huge sphere that surrounds everything */}
      <sphereGeometry args={[4000, 64, 64]} />
      <meshBasicMaterial 
        map={texture}
        side={THREE.BackSide} // Paint on the INSIDE
        transparent={true}
        opacity={0.6} // Adjust brightness
        toneMapped={false}
      />
    </mesh>
  );
}
