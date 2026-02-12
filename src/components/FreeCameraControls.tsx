import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * FreeCameraControls - WASD/Arrow key movement for free-floating camera
 * Hold Shift to move faster
 */
export default function FreeCameraControls({ enabled = true, speed = 0.5 }: { enabled?: boolean, speed?: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!enabled) return;

    const keys: { [key: string]: boolean } = {};
    const moveSpeed = speed;
    const fastSpeed = speed * 3;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    const updateCamera = () => {
      if (!enabled) return;

      const currentSpeed = keys['shift'] ? fastSpeed : moveSpeed;
      const direction = new THREE.Vector3();
      
      // Get camera direction vectors
      camera.getWorldDirection(direction);
      const right = new THREE.Vector3();
      right.crossVectors(camera.up, direction).normalize();

      // WASD / Arrow Keys movement
      if (keys['w'] || keys['arrowup']) {
        camera.position.addScaledVector(direction, currentSpeed);
      }
      if (keys['s'] || keys['arrowdown']) {
        camera.position.addScaledVector(direction, -currentSpeed);
      }
      if (keys['a'] || keys['arrowleft']) {
        camera.position.addScaledVector(right, currentSpeed);
      }
      if (keys['d'] || keys['arrowright']) {
        camera.position.addScaledVector(right, -currentSpeed);
      }

      // Up/Down (Q/E)
      if (keys['q']) {
        camera.position.y -= currentSpeed;
      }
      if (keys['e']) {
        camera.position.y += currentSpeed;
      }
    };

    // Animation loop
    const interval = setInterval(updateCamera, 16); // ~60fps

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, enabled, speed]);

  return null;
}
