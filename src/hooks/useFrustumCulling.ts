/**
 * FrustumCulling - Performance optimization for rendering 5000+ objects
 * Only renders objects within camera's field of view
 */

import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FrustumCullingProps {
  enabled: boolean;
  objects: THREE.Object3D[];
  aggressiveMode?: boolean; // More aggressive culling for performance
}

export function useFrustumCulling(
  enabled: boolean,
  objectsRef: React.RefObject<THREE.Group>,
  aggressiveMode = false
) {
  const { camera } = useThree();
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();

  useFrame(() => {
    if (!enabled || !objectsRef.current) return;

    // Update frustum from camera
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);

    let culledCount = 0;
    let visibleCount = 0;

    // Check each child object
    objectsRef.current.children.forEach((obj) => {
      if (!obj.position) return;

      // Aggressive mode: Use simple distance check first
      if (aggressiveMode) {
        const distance = camera.position.distanceTo(obj.position);
        const maxDistance = 200; // Units

        if (distance > maxDistance) {
          obj.visible = false;
          culledCount++;
          return;
        }
      }

      // Frustum check
      const inFrustum = frustum.containsPoint(obj.position);
      obj.visible = inFrustum;

      if (inFrustum) {
        visibleCount++;
      } else {
        culledCount++;
      }
    });

    // Optional: Log performance metrics
    // console.log(`Frustum Culling: ${visibleCount} visible, ${culledCount} culled`);
  });
}

/**
 * Example usage in a component:
 * 
 * const satellitesRef = useRef<THREE.Group>(null);
 * useFrustumCulling(true, satellitesRef, true);
 * 
 * return (
 *   <group ref={satellitesRef}>
 *     {satellites.map(sat => <Satellite key={sat.id} {...sat} />)}
 *   </group>
 * );
 */
