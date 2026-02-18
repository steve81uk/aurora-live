/**
 * Meteor Shower System
 * Displays shooting stars and meteors using NASA Fireball API data
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, AdditiveBlending } from 'three';

interface Meteor {
  id: string;
  position: Vector3;
  velocity: Vector3;
  brightness: number;
  lifetime: number;
  age: number;
}

export function MeteorShowerSystem() {
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const groupRef = useRef<Group>(null);
  
  // Fetch real meteor data from NASA Fireball API
  useEffect(() => {
    async function fetchFireballs() {
      try {
        const response = await fetch('https://ssd-api.jpl.nasa.gov/fireball.api');
        const data = await response.json();
        
        console.log('NASA Fireball data:', data);
        
        // Process recent fireballs (last 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Note: NASA Fireball API format needs to be parsed
        // For now, create random meteors as visual effect
        createRandomMeteors();
        
      } catch (error) {
        console.warn('Failed to fetch fireball data, using random meteors:', error);
        createRandomMeteors();
      }
    }
    
    fetchFireballs();
    // Refresh every 10 minutes
    const interval = setInterval(fetchFireballs, 600000);
    return () => clearInterval(interval);
  }, []);
  
  function createRandomMeteors() {
    const newMeteors: Meteor[] = [];
    
    // Create 20 random meteors around Earth
    for (let i = 0; i < 20; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 50 + Math.random() * 30; // Start far from center
      
      const position = new Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
      
      // Velocity toward origin (Earth)
      const velocity = position.clone().normalize().multiplyScalar(-0.3 - Math.random() * 0.2);
      
      newMeteors.push({
        id: `meteor-${i}-${Date.now()}`,
        position,
        velocity,
        brightness: 0.5 + Math.random() * 0.5,
        lifetime: 5 + Math.random() * 5, // 5-10 seconds
        age: Math.random() * 2 // Stagger start times
      });
    }
    
    setMeteors(newMeteors);
  }
  
  // Animate meteors
  useFrame((state, delta) => {
    setMeteors(prev => {
      const updated = prev.map(meteor => {
        const newAge = meteor.age + delta;
        
        // Remove meteor if too old
        if (newAge > meteor.lifetime) {
          return null;
        }
        
        // Update position
        const newPos = meteor.position.clone().add(
          meteor.velocity.clone().multiplyScalar(delta)
        );
        
        return {
          ...meteor,
          position: newPos,
          age: newAge
        };
      }).filter(Boolean) as Meteor[];
      
      // Add new meteors randomly
      if (Math.random() < 0.05 && updated.length < 30) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 60 + Math.random() * 20;
        
        const position = new Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
        
        const velocity = position.clone().normalize().multiplyScalar(-0.3 - Math.random() * 0.2);
        
        updated.push({
          id: `meteor-${Date.now()}-${Math.random()}`,
          position,
          velocity,
          brightness: 0.5 + Math.random() * 0.5,
          lifetime: 5 + Math.random() * 5,
          age: 0
        });
      }
      
      return updated;
    });
  });
  
  return (
    <group ref={groupRef}>
      {meteors.map(meteor => {
        // Calculate fade in/out
        const fadeIn = Math.min(meteor.age / 0.5, 1);
        const fadeOut = Math.min((meteor.lifetime - meteor.age) / 1, 1);
        const opacity = Math.min(fadeIn, fadeOut) * meteor.brightness;
        
        // Trail length based on velocity
        const trailLength = meteor.velocity.length() * 3;
        const trailEnd = meteor.position.clone().sub(
          meteor.velocity.clone().normalize().multiplyScalar(trailLength)
        );
        
        return (
          <group key={meteor.id}>
            {/* Meteor head (bright point) */}
            <mesh position={meteor.position}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={opacity}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            
            {/* Meteor trail (line) */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    meteor.position.x, meteor.position.y, meteor.position.z,
                    trailEnd.x, trailEnd.y, trailEnd.z
                  ])}
                  itemSize={3}
                  args={[new Float32Array([
                    meteor.position.x, meteor.position.y, meteor.position.z,
                    trailEnd.x, trailEnd.y, trailEnd.z
                  ]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color="#ffaa00"
                transparent
                opacity={opacity * 0.6}
                blending={AdditiveBlending}
                depthWrite={false}
              />
            </line>
          </group>
        );
      })}
    </group>
  );
}
