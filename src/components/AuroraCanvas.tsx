import { useEffect, useRef, useState } from 'react';

interface AuroraCanvasProps {
  kpValue?: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function AuroraCanvas({ kpValue = 3 }: AuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);

  // Initialize stars
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    starsRef.current = Array.from({ length: 300 }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height * 0.6,
      radius: Math.random() * 1.5 + 0.3,
      brightness: Math.random() * 0.6 + 0.4,
      twinkleSpeed: Math.random() * 0.015 + 0.008,
      twinkleOffset: Math.random() * Math.PI * 2
    }));
  }, [dimensions]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      timeRef.current += kpValue > 4 ? 0.024 : 0.012; // Turbo mode for high Kp
      
      // Create gradient sky background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#000510');
      skyGradient.addColorStop(0.6, '#001020');
      skyGradient.addColorStop(1, '#001530');
      
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawCelestialOrb(ctx, canvas.width, canvas.height, timeRef.current);

      starsRef.current.forEach(star => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness + twinkle * 0.25;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'screen';
      drawEnhancedAuroraLayers(ctx, canvas.width, canvas.height, timeRef.current, kpValue);
      ctx.globalCompositeOperation = 'source-over';

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, kpValue]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// Draw sun or moon based on current time
function drawCelestialOrb(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time: number
) {
  const now = new Date();
  const hours = now.getHours() + now.getMinutes() / 60;
  
  // Determine if day or night (6am-6pm is day)
  const isDay = hours >= 6 && hours < 18;
  
  // Position orb across sky (left to right over 12 hours)
  const progress = isDay 
    ? (hours - 6) / 12  // Day: 6am to 6pm
    : ((hours >= 18 ? hours - 18 : hours + 6) / 12); // Night: 6pm to 6am
  
  const x = width * 0.1 + width * 0.8 * progress;
  const y = height * 0.15 + Math.sin(progress * Math.PI) * -height * 0.1; // Arc across sky
  
  const radius = 30;
  
  if (isDay) {
    // Draw sun
    const sunGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    sunGradient.addColorStop(0, 'rgba(255, 253, 150, 0.8)');
    sunGradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.4)');
    sunGradient.addColorStop(1, 'rgba(255, 150, 0, 0)');
    
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Draw moon
    const moonGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    moonGradient.addColorStop(0, 'rgba(220, 230, 240, 0.9)');
    moonGradient.addColorStop(0.6, 'rgba(200, 210, 230, 0.5)');
    moonGradient.addColorStop(1, 'rgba(180, 190, 210, 0)');
    
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon crescent (subtle)
    ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
    ctx.beginPath();
    ctx.arc(x + radius * 0.3, y - radius * 0.2, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Enhanced aurora with 8 layers, curtain effect, and better colors
function drawEnhancedAuroraLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  kpValue: number
) {
  const baseY = height * 0.3;
  const numLayers = 8;
  
  // Rapid color cycling for high Kp - change every 3 seconds
  const getTurboColor = (time: number, baseColor: { r: number; g: number; b: number; a: number }) => {
    if (kpValue <= 4) return baseColor;
    
    const cycle = Math.floor((time % 15) / 3); // 5 color phases, 3s each
    const neonColors = [
      { r: 147, g: 51, b: 234 },   // Neon Purple
      { r: 236, g: 72, b: 153 },   // Hot Pink
      { r: 6, g: 182, b: 212 },    // Cyan
      { r: 34, g: 197, b: 94 },    // Green
      { r: 251, g: 146, b: 60 }    // Orange
    ];
    
    const neon = neonColors[cycle];
    return { r: neon.r, g: neon.g, b: neon.b, a: baseColor.a * 1.2 };
  };

  // Google x TIE Fighter palette
  const colors = kpValue > 5
    ? [
        // High activity: Purple/Red/Pink
        { r: 147, g: 51, b: 234, a: 0.35 },   // Purple
        { r: 239, g: 68, b: 68, a: 0.33 },    // Red
        { r: 236, g: 72, b: 153, a: 0.34 },   // Pink
        { r: 168, g: 85, b: 247, a: 0.32 },   // Light purple
        { r: 220, g: 38, b: 38, a: 0.36 },    // Deep red
        { r: 251, g: 113, b: 133, a: 0.31 },  // Rose
        { r: 192, g: 38, b: 211, a: 0.33 },   // Magenta-purple
        { r: 225, g: 29, b: 72, a: 0.35 }     // Crimson
      ]
    : [
        // Low activity: Green/Cyan/Lime
        { r: 34, g: 197, b: 94, a: 0.30 },    // Green
        { r: 6, g: 182, b: 212, a: 0.28 },    // Cyan
        { r: 132, g: 204, b: 22, a: 0.29 },   // Lime
        { r: 16, g: 185, b: 129, a: 0.27 },   // Emerald
        { r: 14, g: 165, b: 233, a: 0.31 },   // Sky blue
        { r: 163, g: 230, b: 53, a: 0.26 },   // Lime green
        { r: 52, g: 211, b: 153, a: 0.28 },   // Teal
        { r: 34, g: 211, b: 238, a: 0.30 }    // Bright cyan
      ];

  // Draw each aurora layer
  for (let layer = 0; layer < numLayers; layer++) {
    const amplitude = (25 + kpValue * 10) * (1 + layer * 0.25);
    const frequency = 0.002 + layer * 0.0003;
    const speed = (kpValue > 4 ? 0.6 : 0.3) + layer * 0.15; // Faster in turbo mode
    const yOffset = baseY + layer * 20;
    const baseColor = colors[layer];
    const color = getTurboColor(time, baseColor);
    
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    // Draw horizontal wave with vertical curtain modulation
    for (let x = 0; x <= width; x += 3) {
      // Horizontal wave components
      const wave1 = Math.sin(x * frequency + time * speed) * amplitude;
      const wave2 = Math.sin(x * frequency * 1.8 - time * speed * 0.6) * amplitude * 0.4;
      const wave3 = Math.sin(x * frequency * 0.7 + time * speed * 1.4) * amplitude * 0.25;
      
      // Vertical curtain effect (sine modulation creates vertical streaks)
      const curtainFreq = 0.008 + layer * 0.001;
      const curtainWave = Math.sin(x * curtainFreq + time * 0.5 + layer) * amplitude * 0.5;
      
      const y = yOffset + wave1 + wave2 + wave3 + curtainWave;
      ctx.lineTo(x, y);
    }
    
    // Complete the shape
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Add subtle glow for intense activity
    if (kpValue >= 5) {
      ctx.shadowBlur = 25 + kpValue * 2;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 1.5})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Add intense shimmer for extreme storms
  if (kpValue >= 7) {
    const shimmerY = baseY + Math.sin(time * 3) * 15;
    const shimmerGradient = ctx.createLinearGradient(0, shimmerY - 30, 0, shimmerY + 30);
    shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = shimmerGradient;
    ctx.fillRect(0, shimmerY - 30, width, 60);
  }
}
