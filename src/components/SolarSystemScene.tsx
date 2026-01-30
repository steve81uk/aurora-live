import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Astronomy from 'astronomy-engine';
import { CITIES, latLonToVector3, type City } from '../constants/cities';
import bezierEasing from 'bezier-easing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SolarSystemSceneProps {
  kpValue: number;
  solarWindSpeed: number;
  currentDate?: Date;
  selectedPlanet?: string | null;
  onPlanetSelect?: (planet: string | null) => void;
  focusedBody?: string | null;
  onBodyFocus?: (body: string | null) => void;
  controlsRef?: React.RefObject<OrbitControlsImpl | null>;
  surfaceMode?: boolean;
  surfaceLocation?: import('../data/surfaceLocations').SurfaceLocation | null;
  mythicTheme?: import('../types/mythic').AppTheme;
}

interface PlanetConfig {
  name: string;
  body: Astronomy.Body;
  radius: number;
  color: string;
  emissive?: string;
  axialTilt?: number;
}

// Hollywood Mode: Make planets visible!
const PLANETS: PlanetConfig[] = [
  { name: 'Mercury', body: Astronomy.Body.Mercury, radius: 0.4, color: '#8C7853', emissive: '#8C7853', axialTilt: 0.034 },
  { name: 'Venus', body: Astronomy.Body.Venus, radius: 0.9, color: '#FFC649', emissive: '#FFC649', axialTilt: 177.4 },
  { name: 'Earth', body: Astronomy.Body.Earth, radius: 1.0, color: '#0d47a1', emissive: '#1976d2', axialTilt: 23.4 },
  { name: 'Mars', body: Astronomy.Body.Mars, radius: 0.5, color: '#CD5C5C', emissive: '#CD5C5C', axialTilt: 25.2 },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter, radius: 4.0, color: '#C88B3A', emissive: '#C88B3A', axialTilt: 3.1 },
  { name: 'Saturn', body: Astronomy.Body.Saturn, radius: 3.5, color: '#FAD5A5', emissive: '#FAD5A5', axialTilt: 26.7 },
  { name: 'Uranus', body: Astronomy.Body.Uranus, radius: 2.0, color: '#4FD0E7', emissive: '#4FD0E7', axialTilt: 97.8 },
  { name: 'Neptune', body: Astronomy.Body.Neptune, radius: 2.0, color: '#4169E1', emissive: '#4169E1', axialTilt: 28.3 }
];

// CRITICAL: astronomy-engine returns AU coordinates (Earth = ~1.0 AU from Sun)
// We multiply by 40 to get screen units (Earth at 40, Jupiter at ~200, Neptune at ~1200)
const AU_TO_SCREEN_UNITS = 40;

// ISS orbit parameters (Low Earth Orbit)
const ISS_ORBIT_RADIUS = 1.1; // Relative to Earth radius (408 km altitude)
const ISS_ORBIT_PERIOD = 90 * 60; // 90 minutes in seconds

// L1 Lagrange Point distance (1.5 million km from Earth toward Sun)
const L1_DISTANCE = 0.01 * AU_TO_SCREEN_UNITS; // ~1.5 million km = 0.01 AU

function OrbitTrail({ planetBody, color }: { planetBody: Astronomy.Body; color: string }) {
  const points = useMemo(() => {
    const trailPoints: THREE.Vector3[] = [];
    const now = new Date();
    
    // Calculate 365 positions throughout the year
    for (let day = 0; day < 365; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const astroTime = Astronomy.MakeTime(date);
      const helio = Astronomy.HelioVector(planetBody, astroTime);
      
      // helio returns AU coordinates - multiply by 40 for screen units
      trailPoints.push(new THREE.Vector3(
        helio.x * AU_TO_SCREEN_UNITS,
        helio.y * AU_TO_SCREEN_UNITS,
        helio.z * AU_TO_SCREEN_UNITS
      ));
    }
    
    return trailPoints;
  }, [planetBody]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <primitive object={new THREE.Line(
      geometry,
      new THREE.LineDashedMaterial({
        color: color,
        opacity: 0.3,
        transparent: true,
        dashSize: 0.5,
        gapSize: 0.3
      })
    )} />
  );
}

function Sun({ onBodyFocus }: { onBodyFocus?: (body: string | null) => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (sunRef.current) {
      // Subtle pulsing heartbeat effect
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.05 + 1;
      const hoverScale = hovered ? 1.03 : 1.0;
      sunRef.current.scale.setScalar(pulse * hoverScale);
    }
    if (coronaRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.08 + 1;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Sun - Arc Reactor Style (Gold Basic Material) */}
      <mesh 
        ref={sunRef}
        onClick={() => {
          onBodyFocus?.(null); // Reset focus to null for heliocentric view
          console.log('☀️ Sun clicked - Reset to solar system view');
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[8.0, 64, 64]} />
        <meshBasicMaterial
          color="#FFD700" // Gold
          toneMapped={false}
        />
      </mesh>
      
      {/* Corona glow layer */}
      <mesh ref={coronaRef} scale={1.3}>
        <sphereGeometry args={[8.0, 64, 64]} />
        <meshBasicMaterial
          color="#FFA500" // Orange
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Powerful point light to illuminate planets */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={1500} 
        distance={5000} 
        decay={2} 
        color="#FFD700" 
      />
    </group>
  );
}

// CME Shockwave - expanding sphere when solar wind is fast
function CMEShockwave({ visible }: { speed: number; visible: boolean }) {
  const shockRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame((_state, delta) => {
    if (shockRef.current && visible) {
      // Expand outward
      setScale(prev => {
        const newScale = prev + delta * 10;
        // Reset when too large
        return newScale > 100 ? 1 : newScale;
      });
      
      shockRef.current.scale.setScalar(scale);
      
      // Fade out as it expands
      const material = shockRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0.3 - (scale / 100) * 0.3, 0.05);
    }
  });

  if (!visible) return null;

  return (
    <mesh ref={shockRef} position={[0, 0, 0]}>
      <sphereGeometry args={[9, 32, 32]} />
      <meshBasicMaterial
        color="#FF4400"
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Planet({
  config, 
  kpValue, 
  currentDate, 
  onClick,
  focusedBody,
  surfaceMode = false
}: { 
  config: PlanetConfig; 
  kpValue?: number; 
  currentDate: Date;
  onClick?: () => void;
  focusedBody?: string | null;
  surfaceMode?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const magnetosphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [distance, setDistance] = useState(0);
  
  // Load Earth texture
  const earthTexture = useMemo(() => {
    if (config.name === 'Earth') {
      const loader = new THREE.TextureLoader();
      // Using free NASA Blue Marble texture
      return loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg');
    }
    return null;
  }, [config.name]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Calculate real heliocentric position using astronomy-engine
      const astroTime = Astronomy.MakeTime(currentDate);
      const helio = Astronomy.HelioVector(config.body, astroTime);
      
      // helio returns AU coordinates - multiply by 40 for screen units
      const x = helio.x * AU_TO_SCREEN_UNITS;
      const y = helio.y * AU_TO_SCREEN_UNITS;
      const z = helio.z * AU_TO_SCREEN_UNITS;
      
      groupRef.current.position.set(x, y, z);
      
      // Calculate distance from Sun in AU
      const distanceAU = Math.sqrt(helio.x ** 2 + helio.y ** 2 + helio.z ** 2);
      setDistance(distanceAU);
      
      // Debug logging
      if (config.name === 'Earth') {
        console.log('🌍 Earth Position:', {
          AU: { x: helio.x.toFixed(3), y: helio.y.toFixed(3), z: helio.z.toFixed(3) },
          Screen: { x: x.toFixed(1), y: y.toFixed(1), z: z.toFixed(1) }
        });
      }
    }
    
    // Rotate planet on its axis
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      
      // Hover glow effect
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = hovered ? 0.4 : 0.2;
      }
    }
    
    // Rotate magnetosphere shell slowly
    if (magnetosphereRef.current) {
      magnetosphereRef.current.rotation.y += delta * 0.1;
    }
  });

  const isEarth = config.name === 'Earth';
  const axialTiltRadians = (config.axialTilt || 0) * (Math.PI / 180);
  
  // Magnetosphere color based on Kp
  const magnetosphereColor = (kpValue && kpValue >= 5) ? '#ff00ff' : '#00ff88';

  return (
    <group ref={groupRef}>
      <group rotation={[axialTiltRadians, 0, 0]}>
        <mesh 
          ref={meshRef} 
          castShadow 
          receiveShadow
          onClick={() => {
            if (onClick) {
              onClick();
              console.log(`🪐 Clicked: ${config.name}`);
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[config.radius, 64, 64]} />
          {config.name === 'Earth' && earthTexture ? (
            <meshStandardMaterial
              map={earthTexture}
              roughness={0.8}
              metalness={0.2}
              transparent={surfaceMode && focusedBody === config.name}
              opacity={surfaceMode && focusedBody === config.name ? 0.15 : 1.0}
              side={THREE.DoubleSide}
            />
          ) : (
            <meshStandardMaterial
              color={config.color}
              emissive={config.emissive || config.color}
              emissiveIntensity={0.2}
              roughness={0.7}
              metalness={0.2}
              transparent={surfaceMode && focusedBody === config.name}
              opacity={surfaceMode && focusedBody === config.name ? 0.2 : 1.0}
              side={THREE.DoubleSide}
            />
          )}
        </mesh>
        
        {/* Holo-Card Info (visible only when focused) */}
        {focusedBody === config.name && (
          <Html position={[0, config.radius + 2, 0]} center>
            <div className="bg-black/80 backdrop-blur-md border-2 border-cyan-400 rounded-lg p-4 text-white shadow-xl min-w-[200px]">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">{config.name}</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-cyan-300">Distance:</span> {distance.toFixed(3)} AU</p>
                <p><span className="text-cyan-300">Radius:</span> {config.radius.toFixed(1)} (scaled)</p>
                {isEarth && (
                  <button className="mt-3 w-full px-3 py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400 rounded text-sm font-bold transition-all">
                    🌌 View Aurora
                  </button>
                )}
              </div>
            </div>
          </Html>
        )}
        
        {/* Tooltip on hover */}
        {hovered && focusedBody !== config.name && (
          <Html position={[0, config.radius + 1, 0]} center>
            <div className="bg-black/60 backdrop-blur-sm border border-white/30 rounded px-3 py-1 text-white text-sm font-bold">
              {config.name}
            </div>
          </Html>
        )}
        
        {/* Holo-Shield Magnetosphere (Earth only) */}
        {isEarth && (
          <mesh ref={magnetosphereRef} scale={1.25}>
            <sphereGeometry args={[config.radius, 32, 32]} />
            <meshPhongMaterial
              color={magnetosphereColor}
              emissive={magnetosphereColor}
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {isEarth && (
          <>
            {/* Primary atmosphere - standard glow */}
            <mesh scale={1.08}>
              <sphereGeometry args={[config.radius, 64, 64]} />
              <meshBasicMaterial
                color="#4dd0e1"
                transparent
                opacity={0.25}
                side={THREE.BackSide}
              />
            </mesh>
            
            {/* Secondary atmosphere - "Blue Marble" haze with additive blending */}
            <mesh scale={1.12}>
              <sphereGeometry args={[config.radius, 64, 64]} />
              <meshBasicMaterial
                color="#1e88e5"
                transparent
                opacity={0.15}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            
            <AuroraRibbon kpValue={kpValue || 3} earthRadius={config.radius} />
            <CityMarkers earthRadius={config.radius} />
          </>
        )}

        {config.name === 'Saturn' && <SaturnRings />}
      </group>
    </group>
  );
}

function SaturnRings() {
  return (
    <mesh rotation={[Math.PI / 2.5, 0, 0]}>
      <ringGeometry args={[4.0, 6.5, 64]} />
      <meshBasicMaterial color="#C9B482" side={THREE.DoubleSide} transparent opacity={0.7} />
    </mesh>
  );
}

function Moon({ earthPosition, currentDate }: { earthPosition: THREE.Vector3; currentDate: Date }) {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (moonRef.current) {
      // Calculate Moon position relative to Earth
      const astroTime = Astronomy.MakeTime(currentDate);
      const geoVector = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, true);
      
      // GeoVector returns km, scale to ~2 screen units from Earth
      const moonScale = 200_000; // Adjust for visibility
      moonRef.current.position.x = earthPosition.x + (geoVector.x / moonScale);
      moonRef.current.position.y = earthPosition.y + (geoVector.y / moonScale);
      moonRef.current.position.z = earthPosition.z + (geoVector.z / moonScale);
      
      console.log('🌙 Moon Distance from Earth:', Math.sqrt(
        Math.pow(geoVector.x / moonScale, 2) +
        Math.pow(geoVector.y / moonScale, 2) +
        Math.pow(geoVector.z / moonScale, 2)
      ).toFixed(2), 'screen units');
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.27, 32, 32]} />
      <meshStandardMaterial 
        color="#C0C0C0" 
        emissive="#C0C0C0" 
        emissiveIntensity={0.1} 
        roughness={0.9} 
        metalness={0.1} 
      />
    </mesh>
  );
}

function CityMarkers({ earthRadius }: { earthRadius: number }) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  return (
    <>
      {CITIES.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, earthRadius);
        return (
          <mesh
            key={city.name}
            position={[pos.x, pos.y, pos.z]}
            onClick={() => {
              setSelectedCity(city);
              console.log('🌍 City clicked:', city.name);
              console.log(`  📍 Coordinates: ${city.lat.toFixed(4)}°, ${city.lon.toFixed(4)}°`);
              console.log(`  🌌 Aurora frequency: ${city.auroraFrequency}`);
              console.log(`  📊 Aurora probability: ${city.auroraProbability}`);
              console.log(`  👥 Population: ${city.population.toLocaleString()}`);
              console.log(`  🕐 Timezone: ${city.timezone}`);
              if (city.isCapital) console.log('  🏛️ Capital city');
            }}
          >
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color={city.color} />
          </mesh>
        );
      })}
      
      {selectedCity && (
        <Html position={[0, earthRadius + 1.5, 0]}>
          <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-cyan-400/50 rounded-lg p-4 text-white font-mono max-w-xs">
            <h3 className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
              {selectedCity.name}
              {selectedCity.isCapital && <span className="text-xs bg-purple-600 px-2 py-1 rounded">CAPITAL</span>}
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-cyan-300">Lat:</span> {selectedCity.lat.toFixed(4)}°</p>
              <p><span className="text-cyan-300">Lon:</span> {selectedCity.lon.toFixed(4)}°</p>
              <p><span className="text-cyan-300">Population:</span> {selectedCity.population.toLocaleString()}</p>
              <p><span className="text-cyan-300">Aurora Freq:</span> {selectedCity.auroraFrequency}</p>
              <p>
                <span className="text-cyan-300">Aurora Prob:</span>{' '}
                <span className={`font-bold ${
                  selectedCity.auroraProbability === 'High' ? 'text-green-400' :
                  selectedCity.auroraProbability === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {selectedCity.auroraProbability}
                </span>
              </p>
              <p><span className="text-cyan-300">Timezone:</span> {selectedCity.timezone}</p>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('myLocation', JSON.stringify(selectedCity));
                alert(`Set ${selectedCity.name} as your location!`);
              }}
              className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700 px-3 py-2 rounded text-sm font-bold"
            >
              Set as My Location
            </button>
            <button
              onClick={() => setSelectedCity(null)}
              className="mt-2 w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
            >
              Close
            </button>
          </div>
        </Html>
      )}
    </>
  );
}

function AuroraRibbon({ kpValue, earthRadius }: { kpValue: number; earthRadius: number }) {
  const auroraRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_state, delta) => {
    if (auroraRef.current) {
      auroraRef.current.rotation.y += 0.001;
      timeRef.current += delta;
    }
  });

  // Color logic: Kp > 5 = RED/PURPLE, Kp < 5 = GREEN
  const getAuroraColors = (kp: number): string[] => {
    if (kp >= 7) {
      // Extreme storm - Red/Purple
      return ['#ff0044', '#ff3366', '#cc00ff'];
    } else if (kp >= 5) {
      // Strong storm - Orange/Red
      return ['#ffaa00', '#ff8800', '#ff4400'];
    } else {
      // Normal - Green
      return ['#00ff88', '#00ff00', '#88ffaa'];
    }
  };

  const colors = getAuroraColors(kpValue);
  const auroraRadius = earthRadius * 1.15;

  return (
    <group ref={auroraRef}>
      {/* Multiple layers for volumetric effect */}
      {colors.map((color, index) => {
        const scale = 1 + index * 0.08;
        const opacity = 0.25 - index * 0.05;
        const height = 0.1 + (kpValue / 9) * 0.15; // Height varies with Kp
        
        return (
          <mesh
            key={index}
            rotation={[Math.PI / 2, 0, 0]}
            scale={scale}
          >
            <torusGeometry args={[auroraRadius, height, 24, 128]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={kpValue / 2}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {/* Animated curtain effect - vertical ribbons */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.cos(angle) * auroraRadius;
        const z = Math.sin(angle) * auroraRadius;
        const curtainHeight = 0.3 + Math.sin(timeRef.current + i) * 0.2;
        
        return (
          <mesh
            key={`curtain-${i}`}
            position={[x, curtainHeight, z]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[0.3, curtainHeight * 2, 1, 8]} />
            <meshStandardMaterial
              color={colors[0]}
              emissive={colors[0]}
              emissiveIntensity={kpValue / 3}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function SolarWindParticles({ speed }: { speed: number }) {
  const particlesRef = useRef<THREE.Points>(null);

  const particlesGeometry = useMemo(() => {
    const count = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 5;
      const distance = Math.random() * 70;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = distance;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const speedFactor = speed / 500;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += speedFactor * 0.1;

        if (positions[i + 2] > 70) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 5;
          positions[i] = Math.cos(angle) * radius;
          positions[i + 1] = Math.sin(angle) * radius;
          positions[i + 2] = 0;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial size={0.06} color="#FFA500" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function StarField() {
  const nearStarsRef = useRef<THREE.Points>(null);
  const midStarsRef = useRef<THREE.Points>(null);
  const farStarsRef = useRef<THREE.Points>(null);
  
  // Create 3 layers of stars with different counts and sizes
  const starLayers = useMemo(() => {
    const createLayer = (count: number, minRadius: number, maxRadius: number, size: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Random size variation for twinkling effect
        sizes[i] = size * (0.5 + Math.random() * 0.5);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      return geometry;
    };

    return {
      near: createLayer(3000, 150, 200, 0.3), // Closer, larger stars
      mid: createLayer(4000, 250, 350, 0.2),  // Medium distance
      far: createLayer(3000, 400, 500, 0.15)  // Distant, smaller stars
    };
  }, []);

  // Parallax animation
  useFrame((state) => {
    const cameraPos = state.camera.position;
    
    if (nearStarsRef.current) {
      nearStarsRef.current.position.set(
        cameraPos.x * 0.02,
        cameraPos.y * 0.02,
        cameraPos.z * 0.02
      );
    }
    if (midStarsRef.current) {
      midStarsRef.current.position.set(
        cameraPos.x * 0.01,
        cameraPos.y * 0.01,
        cameraPos.z * 0.01
      );
    }
    // Far stars don't move (parallax = 0)
    
    // Subtle twinkle effect (1% of stars per frame)
    if (Math.random() < 0.01 && nearStarsRef.current) {
      const geometry = nearStarsRef.current.geometry;
      const sizes = geometry.attributes.size.array as Float32Array;
      const idx = Math.floor(Math.random() * (sizes.length / 3));
      sizes[idx] = 0.3 * (0.8 + Math.random() * 0.4);
      geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Near layer - brightest, largest */}
      <points ref={nearStarsRef} geometry={starLayers.near}>
        <pointsMaterial 
          size={0.3} 
          color="#FFFFFF" 
          transparent 
          opacity={0.9} 
          sizeAttenuation
          vertexColors={false}
        />
      </points>
      
      {/* Mid layer */}
      <points ref={midStarsRef} geometry={starLayers.mid}>
        <pointsMaterial 
          size={0.2} 
          color="#E0E0FF" 
          transparent 
          opacity={0.7} 
          sizeAttenuation 
        />
      </points>
      
      {/* Far layer - dimmest */}
      <points ref={farStarsRef} geometry={starLayers.far}>
        <pointsMaterial 
          size={0.15} 
          color="#C0C0E0" 
          transparent 
          opacity={0.5} 
          sizeAttenuation 
        />
      </points>
    </>
  );
}

// ISS - International Space Station (Low Earth Orbit)
function ISS({ earthPosition, currentDate }: { earthPosition: THREE.Vector3; currentDate: Date }) {
  const issRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (issRef.current) {
      // ISS orbits every 90 minutes
      const time = (currentDate.getTime() / 1000) % ISS_ORBIT_PERIOD;
      const angle = (time / ISS_ORBIT_PERIOD) * Math.PI * 2;
      
      // Orbital inclination of 51.6 degrees
      const inclination = 51.6 * (Math.PI / 180);
      
      const x = earthPosition.x + Math.cos(angle) * ISS_ORBIT_RADIUS * Math.cos(inclination);
      const y = earthPosition.y + Math.sin(angle) * ISS_ORBIT_RADIUS;
      const z = earthPosition.z + Math.cos(angle) * ISS_ORBIT_RADIUS * Math.sin(inclination);
      
      issRef.current.position.set(x, y, z);
      issRef.current.rotation.y += 0.02; // Spin for visibility
    }
  });

  return (
    <group ref={issRef}>
      {/* Main module */}
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.04, 0.06]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Solar panels */}
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.001, 0.08]} />
        <meshStandardMaterial color="#1a237e" metalness={0.5} emissive="#0d47a1" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[0.15, 0.001, 0.08]} />
        <meshStandardMaterial color="#1a237e" metalness={0.5} emissive="#0d47a1" emissiveIntensity={0.3} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.03, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={1} />
      </mesh>
    </group>
  );
}

// DSCOVR - Deep Space Climate Observatory at L1 Lagrange Point
function DSCOVR({ earthPosition }: { earthPosition: THREE.Vector3 }) {
  const dscoverRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (dscoverRef.current) {
      // L1 is between Earth and Sun, approximately 1.5 million km from Earth
      const directionToSun = new THREE.Vector3(0, 0, 0).sub(earthPosition).normalize();
      const l1Position = earthPosition.clone().add(directionToSun.multiplyScalar(L1_DISTANCE));
      dscoverRef.current.position.copy(l1Position);
      dscoverRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={dscoverRef}>
      {/* Main satellite body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#B8860B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Solar panel */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 0.001, 0.15]} />
        <meshStandardMaterial color="#1a237e" metalness={0.5} emissive="#0d47a1" emissiveIntensity={0.4} />
      </mesh>
      {/* Sensor array */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#4dd0e1" emissive="#00bcd4" emissiveIntensity={0.5} metalness={1} />
      </mesh>
    </group>
  );
}

// Trajectory line from Earth to DSCOVR
function L1TrajectoryLine({ earthPosition }: { earthPosition: THREE.Vector3 }) {
  const lineGeometry = useMemo(() => {
    const directionToSun = new THREE.Vector3(0, 0, 0).sub(earthPosition).normalize();
    const l1Position = earthPosition.clone().add(directionToSun.multiplyScalar(L1_DISTANCE));
    
    return new THREE.BufferGeometry().setFromPoints([
      earthPosition,
      l1Position
    ]);
  }, [earthPosition]);

  return (
    <primitive object={new THREE.Line(
      lineGeometry,
      new THREE.LineDashedMaterial({
        color: '#00bcd4',
        opacity: 0.4,
        transparent: true,
        dashSize: 0.2,
        gapSize: 0.1
      })
    )} />
  );
}

export default function SolarSystemScene({ 
  kpValue, 
  solarWindSpeed, 
  currentDate = new Date(),
  focusedBody = null,
  onBodyFocus = () => {},
  controlsRef,
  surfaceMode = false,
  surfaceLocation: _surfaceLocation = null,
  mythicTheme: _mythicTheme = 'SCI_FI'
}: SolarSystemSceneProps) {
  const { camera, size } = useThree();
  const showTrails = true; // TODO: Add toggle in UI
  const [earthPosition, setEarthPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [planetPositions, setPlanetPositions] = useState<Map<string, THREE.Vector3>>(new Map());
  const [transitioning, setTransitioning] = useState(false);
  const cameraStartPos = useRef(new THREE.Vector3());
  const cameraTargetPos = useRef(new THREE.Vector3());
  const cameraStartTime = useRef(0);
  const controlsStartTarget = useRef(new THREE.Vector3());
  const controlsTargetPos = useRef(new THREE.Vector3());
  
  const easeInOutCubic = bezierEasing(0.65, 0, 0.35, 1); // Smooth easing curve

  useEffect(() => {
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    
    // Adjust camera for larger scale
    if (isMobile) {
      camera.position.set(150, 60, 150);
    } else if (isTablet) {
      camera.position.set(120, 50, 120);
    } else {
      camera.position.set(100, 40, 100);
    }
    
    // CRITICAL: Set far clipping plane to 5000 so Neptune doesn't disappear
    camera.far = 5000;
    camera.updateProjectionMatrix();
    
    camera.lookAt(0, 0, 0);
  }, [camera, size.width]);

  // Calculate all planet positions
  useEffect(() => {
    const positions = new Map<string, THREE.Vector3>();
    const astroTime = Astronomy.MakeTime(currentDate);
    
    PLANETS.forEach(planet => {
      const helio = Astronomy.HelioVector(planet.body, astroTime);
      positions.set(planet.name, new THREE.Vector3(
        helio.x * AU_TO_SCREEN_UNITS,
        helio.y * AU_TO_SCREEN_UNITS,
        helio.z * AU_TO_SCREEN_UNITS
      ));
    });
    
    // Earth position for Moon and satellites
    const earthPos = positions.get('Earth');
    if (earthPos) setEarthPosition(earthPos);
    
    setPlanetPositions(positions);
  }, [currentDate]);
  
  // Enhanced camera chase view animation with OrbitControls target
  // CRITICAL: Only animate when transitioning, then release control to user
  useFrame((state) => {
    // Camera shake during severe storms (Kp > 7)
    if (kpValue > 7 && !transitioning) {
      const shakeIntensity = ((kpValue - 7) / 2) * 0.01; // Scale 0-0.01 for Kp 7-9
      const shakeX = (Math.random() - 0.5) * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * shakeIntensity;
      const shakeZ = (Math.random() - 0.5) * shakeIntensity;
      
      camera.position.x += shakeX;
      camera.position.y += shakeY;
      camera.position.z += shakeZ;
    }
    
    // Handle focus transitions
    if (focusedBody && focusedBody !== 'reset' && controlsRef?.current) {
      const targetPos = focusedBody === 'Sun' 
        ? new THREE.Vector3(0, 0, 0)
        : planetPositions.get(focusedBody);
      
      if (targetPos) {
        // Start transition if not already transitioning
        if (!transitioning && camera.position.distanceTo(cameraTargetPos.current) > 1) {
          // Calculate target positions
          const planet = PLANETS.find(p => p.name === focusedBody);
          const distance = planet ? planet.radius * 3 : 30;
          
          const sunDir = new THREE.Vector3(0, 0, 0).sub(targetPos).normalize();
          const newCameraPos = targetPos.clone().add(sunDir.multiplyScalar(-distance));
          newCameraPos.y += distance * 0.2; // Slight elevation
          
          // Store start and target positions
          cameraStartPos.current.copy(camera.position);
          cameraTargetPos.current.copy(newCameraPos);
          controlsStartTarget.current.copy(controlsRef.current.target);
          controlsTargetPos.current.copy(targetPos);
          cameraStartTime.current = state.clock.elapsedTime;
          setTransitioning(true);
        }
        
        // Animate during transition
        if (transitioning) {
          const elapsed = state.clock.elapsedTime - cameraStartTime.current;
          const duration = 2.0; // 2 second animation
          
          if (elapsed < duration) {
            const t = easeInOutCubic(Math.min(elapsed / duration, 1));
            
            // Animate camera position
            camera.position.lerpVectors(cameraStartPos.current, cameraTargetPos.current, t);
            
            // Animate OrbitControls target
            const currentTarget = new THREE.Vector3();
            currentTarget.lerpVectors(controlsStartTarget.current, controlsTargetPos.current, t);
            controlsRef.current.target.copy(currentTarget);
            
            camera.lookAt(currentTarget);
          } else {
            // Animation complete - release control to user!
            setTransitioning(false);
            // Final position
            camera.position.copy(cameraTargetPos.current);
            controlsRef.current.target.copy(controlsTargetPos.current);
          }
        }
        
        controlsRef.current.update();
      }
    } else if (focusedBody === 'reset' && controlsRef?.current) {
      // Reset to heliocentric view
      if (!transitioning) {
        cameraStartPos.current.copy(camera.position);
        cameraTargetPos.current.set(100, 40, 100);
        controlsStartTarget.current.copy(controlsRef.current.target);
        controlsTargetPos.current.set(0, 0, 0);
        cameraStartTime.current = state.clock.elapsedTime;
        setTransitioning(true);
      }
      
      if (transitioning) {
        const elapsed = state.clock.elapsedTime - cameraStartTime.current;
        const duration = 2.0;
        
        if (elapsed < duration) {
          const t = easeInOutCubic(Math.min(elapsed / duration, 1));
          
          camera.position.lerpVectors(cameraStartPos.current, cameraTargetPos.current, t);
          
          const currentTarget = new THREE.Vector3();
          currentTarget.lerpVectors(controlsStartTarget.current, controlsTargetPos.current, t);
          controlsRef.current.target.copy(currentTarget);
        } else {
          setTransitioning(false);
          camera.position.copy(cameraTargetPos.current);
          controlsRef.current.target.copy(controlsTargetPos.current);
        }
      }
      
      controlsRef.current.update();
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      
      <StarField />
      
      <Sun onBodyFocus={onBodyFocus} />
      
      {/* CME Shockwave when solar wind is fast */}
      <CMEShockwave speed={solarWindSpeed} visible={solarWindSpeed > 500} />
      
      {showTrails && PLANETS.map(planet => {
        const trailColors: Record<string, string> = {
          'Mercury': '#808080',
          'Venus': '#FFA500',
          'Earth': '#0000FF',
          'Mars': '#FF0000',
          'Jupiter': '#C88B3A',
          'Saturn': '#FAD5A5',
          'Uranus': '#4FD0E7',
          'Neptune': '#4169E1'
        };
        return (
          <OrbitTrail
            key={`trail-${planet.name}`}
            planetBody={planet.body}
            color={trailColors[planet.name] || '#FFFFFF'}
          />
        );
      })}

      {PLANETS.map(planet => (
        <Planet
          key={planet.name}
          config={planet}
          kpValue={planet.name === 'Earth' ? kpValue : undefined}
          currentDate={currentDate}
          onClick={() => {
            onBodyFocus(planet.name);
          }}
          focusedBody={focusedBody}
          surfaceMode={surfaceMode}
        />
      ))}

      <Moon earthPosition={earthPosition} currentDate={currentDate} />
      
      {/* Space Assets */}
      <ISS earthPosition={earthPosition} currentDate={currentDate} />
      <DSCOVR earthPosition={earthPosition} />
      <L1TrajectoryLine earthPosition={earthPosition} />

      <SolarWindParticles speed={solarWindSpeed} />
      
      {/* EXIT ORBIT Button - appears when focused on a celestial body */}
      {focusedBody && focusedBody !== 'reset' && !transitioning && (
        <Html center>
          <button
            onClick={() => {
              console.log('🚀 EXIT ORBIT clicked');
              onBodyFocus?.('reset');
            }}
            className="px-6 py-3 bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold 
                       rounded-lg shadow-2xl border-2 border-cyan-400 
                       transition-all duration-200 hover:scale-105 active:scale-95
                       backdrop-blur-md text-lg pointer-events-auto cursor-pointer"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            ⬅️ EXIT ORBIT
          </button>
        </Html>
      )}
    </>
  );
}
