import { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * useOcclusionDetection
 * 
 * Detects if an object is occluded (hidden behind another object) from camera's view.
 * Used to hide labels when objects are behind planets/sun.
 * 
 * @param objectPosition - The position of the object to check
 * @param occluders - Array of objects that can occlude (e.g., Sun, planets)
 * @returns isVisible - Boolean indicating if the object is visible
 */
export function useOcclusionDetection(
  objectPosition: THREE.Vector3 | null,
  occluders: Array<{ position: THREE.Vector3; radius: number }> = []
): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const { camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());

  useFrame(() => {
    if (!objectPosition) {
      setIsVisible(false);
      return;
    }

    // Check if object is behind camera
    const toObject = new THREE.Vector3().subVectors(objectPosition, camera.position);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    const dotProduct = toObject.normalize().dot(cameraDirection);
    
    // If behind camera (dot < 0), hide
    if (dotProduct < 0) {
      setIsVisible(false);
      return;
    }

    // Check occlusion by each occluder
    let occluded = false;
    
    for (const occluder of occluders) {
      // Ray from camera to object
      const direction = new THREE.Vector3()
        .subVectors(objectPosition, camera.position)
        .normalize();
      
      const distanceToObject = camera.position.distanceTo(objectPosition);
      
      raycaster.current.set(camera.position, direction);
      raycaster.current.far = distanceToObject;

      // Check if ray intersects occluder sphere
      const occluderSphere = new THREE.Sphere(occluder.position, occluder.radius);
      const intersection = new THREE.Vector3();
      
      if (raycaster.current.ray.intersectSphere(occluderSphere, intersection)) {
        const distanceToOccluder = camera.position.distanceTo(intersection);
        
        // If occluder is closer than object, it's occluded
        if (distanceToOccluder < distanceToObject - 0.1) {
          occluded = true;
          break;
        }
      }
    }

    setIsVisible(!occluded);
  });

  return isVisible;
}

/**
 * Simple distance-based occlusion (faster but less accurate)
 */
export function useSimpleOcclusion(
  objectPosition: THREE.Vector3 | null,
  occluderPosition: THREE.Vector3,
  occluderRadius: number
): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const { camera } = useThree();

  useFrame(() => {
    if (!objectPosition) {
      setIsVisible(false);
      return;
    }

    // Check if object is behind camera
    const toObject = new THREE.Vector3().subVectors(objectPosition, camera.position);
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    if (toObject.normalize().dot(cameraDirection) < 0) {
      setIsVisible(false);
      return;
    }

    // Simple sphere check: if object is closer to occluder center than its radius,
    // and occluder is between camera and object
    const distCameraToObject = camera.position.distanceTo(objectPosition);
    const distCameraToOccluder = camera.position.distanceTo(occluderPosition);
    const distOccluderToObject = occluderPosition.distanceTo(objectPosition);

    // If object is "inside" occluder sphere and occluder is closer
    if (distOccluderToObject < occluderRadius * 1.2 && distCameraToOccluder < distCameraToObject) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  });

  return isVisible;
}
