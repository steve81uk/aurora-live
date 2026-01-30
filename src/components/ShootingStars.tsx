import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShootingStar {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  startTime: number;
  color: THREE.Color;
}

export function ShootingStars() {
  const starsRef = useRef<THREE.Points>(null);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const lastSpawnTime = useRef(0);
  
  // Create geometry and material for shooting star trails
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(100 * 3); // Max 100 points in trails
    const colors = new Float32Array(100 * 3);
    const sizes = new Float32Array(100);
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const mat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    
    return { geometry: geo, material: mat };
  }, []);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Spawn new shooting star every 3-8 seconds
    if (time - lastSpawnTime.current > 3 + Math.random() * 5) {
      lastSpawnTime.current = time;
      
      // Random starting position (far from camera, in a spherical shell)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.PI / 6 + Math.random() * (Math.PI / 3); // Upper hemisphere bias
      const distance = 150 + Math.random() * 100;
      
      const startPos = new THREE.Vector3(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
      );
      
      // Random velocity (streak across sky)
      const speed = 15 + Math.random() * 25;
      const direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5 - 0.5, // Bias downward
        (Math.random() - 0.5) * 2
      ).normalize();
      
      const velocity = direction.multiplyScalar(speed);
      
      // Random color (mostly white/blue, occasional green/yellow)
      const colorChoice = Math.random();
      let color: THREE.Color;
      if (colorChoice < 0.7) {
        color = new THREE.Color(0xffffff); // White (70%)
      } else if (colorChoice < 0.9) {
        color = new THREE.Color(0xaaddff); // Blue-white (20%)
      } else {
        color = new THREE.Color(0xffff88); // Yellow-green (10%)
      }
      
      shootingStarsRef.current.push({
        position: startPos,
        velocity,
        life: 0,
        maxLife: 1.5 + Math.random() * 1.0, // 1.5-2.5 seconds
        startTime: time,
        color,
      });
    }
    
    // Update existing shooting stars
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    
    let vertexIndex = 0;
    
    shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
      star.life = time - star.startTime;
      
      // Remove dead stars
      if (star.life > star.maxLife) {
        return false;
      }
      
      // Update position
      star.position.add(
        star.velocity.clone().multiplyScalar(0.016) // ~60 FPS
      );
      
      // Calculate fade (fade in quickly, fade out slowly)
      const lifeRatio = star.life / star.maxLife;
      let opacity: number;
      if (lifeRatio < 0.1) {
        opacity = lifeRatio / 0.1; // Fade in first 10%
      } else {
        opacity = 1 - ((lifeRatio - 0.1) / 0.9); // Fade out remaining 90%
      }
      
      // Add trail points (5 points per star for trail effect)
      const trailLength = 5;
      for (let i = 0; i < trailLength; i++) {
        if (vertexIndex >= 100) break; // Max 100 points
        
        const trailOffset = star.velocity.clone().multiplyScalar(-i * 0.3);
        const trailPos = star.position.clone().add(trailOffset);
        
        positions[vertexIndex * 3] = trailPos.x;
        positions[vertexIndex * 3 + 1] = trailPos.y;
        positions[vertexIndex * 3 + 2] = trailPos.z;
        
        // Trail fades from head to tail
        const trailFade = (trailLength - i) / trailLength;
        const finalOpacity = opacity * trailFade;
        
        colors[vertexIndex * 3] = star.color.r * finalOpacity;
        colors[vertexIndex * 3 + 1] = star.color.g * finalOpacity;
        colors[vertexIndex * 3 + 2] = star.color.b * finalOpacity;
        
        // Size decreases along trail
        sizes[vertexIndex] = 2.5 * trailFade * opacity;
        
        vertexIndex++;
      }
      
      return true; // Keep star alive
    });
    
    // Clear remaining vertices
    for (let i = vertexIndex; i < 100; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
      sizes[i] = 0;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.setDrawRange(0, vertexIndex);
  });
  
  return <points ref={starsRef} geometry={geometry} material={material} />;
}
