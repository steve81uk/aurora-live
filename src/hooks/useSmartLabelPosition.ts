import { useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Smart Label Positioning System
 * Prevents label overlaps by dynamically adjusting positions
 * when multiple objects are close together.
 */

interface LabelConfig {
  id: string;
  objectPosition: THREE.Vector3;
  isVisible: boolean;
  priority: number; // Higher priority labels push lower ones away
}

// Global registry of active labels
const activeLabelRegistry = new Map<string, LabelConfig>();

/**
 * Register a label and get its optimal display position
 * 
 * @param id - Unique identifier for this label
 * @param objectPosition - 3D position of the object
 * @param isVisible - Whether the object should show a label
 * @param priority - Display priority (0-10, higher = more important)
 * @returns Offset vector to apply to label position
 */
export function useSmartLabelPosition(
  id: string,
  objectPosition: THREE.Vector3 | null,
  isVisible: boolean,
  priority: number = 5
): THREE.Vector3 {
  const [offset, setOffset] = useState(new THREE.Vector3(0, 0.3, 0));
  const { camera } = useThree();

  useFrame(() => {
    if (!objectPosition || !isVisible) {
      // Remove from registry when not visible
      activeLabelRegistry.delete(id);
      setOffset(new THREE.Vector3(0, 0.3, 0)); // Default offset
      return;
    }

    // Update registry
    activeLabelRegistry.set(id, {
      id,
      objectPosition: objectPosition.clone(),
      isVisible,
      priority
    });

    // Calculate optimal offset to avoid overlaps
    const newOffset = calculateLabelOffset(id, objectPosition, camera, priority);
    setOffset(newOffset);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeLabelRegistry.delete(id);
    };
  }, [id]);

  return offset;
}

/**
 * Calculate optimal label offset to avoid overlaps
 */
function calculateLabelOffset(
  thisId: string,
  thisPosition: THREE.Vector3,
  camera: THREE.Camera,
  thisPriority: number
): THREE.Vector3 {
  const MIN_SEPARATION = 0.5; // Minimum screen-space distance between labels
  const BASE_OFFSET = new THREE.Vector3(0, 0.3, 0);
  
  // Check distance to all other labels
  let finalOffset = BASE_OFFSET.clone();
  
  for (const [otherId, other] of activeLabelRegistry.entries()) {
    if (otherId === thisId || !other.isVisible) continue;
    
    const distance = thisPosition.distanceTo(other.objectPosition);
    
    // If labels are too close
    if (distance < MIN_SEPARATION * 2) {
      // Calculate direction away from other label
      const awayDirection = new THREE.Vector3()
        .subVectors(thisPosition, other.objectPosition)
        .normalize();
      
      // If this label has lower priority, push it away
      if (thisPriority < other.priority) {
        // Push perpendicular to camera view
        const right = new THREE.Vector3();
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
        
        // Offset to the side + upward
        finalOffset.add(right.multiplyScalar(0.3));
        finalOffset.y += 0.2;
      } else if (thisPriority === other.priority) {
        // Equal priority: both shift slightly
        finalOffset.add(awayDirection.multiplyScalar(0.15));
        finalOffset.y += 0.1;
      }
      // If higher priority, keep original position (other label will move)
    }
  }
  
  return finalOffset;
}

/**
 * Calculate screen-space distance between two 3D points
 */
function getScreenDistance(
  pos1: THREE.Vector3,
  pos2: THREE.Vector3,
  camera: THREE.Camera
): number {
  const vector1 = pos1.clone().project(camera);
  const vector2 = pos2.clone().project(camera);
  
  return Math.sqrt(
    Math.pow(vector1.x - vector2.x, 2) +
    Math.pow(vector1.y - vector2.y, 2)
  );
}

/**
 * Check if label should be hidden due to camera distance
 * (fade out labels when too far)
 */
export function useLabelDistanceFade(
  objectPosition: THREE.Vector3 | null,
  minDistance: number = 10,
  maxDistance: number = 100
): number {
  const [opacity, setOpacity] = useState(1);
  const { camera } = useThree();

  useFrame(() => {
    if (!objectPosition) {
      setOpacity(0);
      return;
    }

    const distance = camera.position.distanceTo(objectPosition);
    
    if (distance < minDistance) {
      setOpacity(1);
    } else if (distance > maxDistance) {
      setOpacity(0);
    } else {
      // Smooth fade between min and max
      const fade = 1 - (distance - minDistance) / (maxDistance - minDistance);
      setOpacity(Math.max(0, Math.min(1, fade)));
    }
  });

  return opacity;
}
