/**
 * GoldenRecord Component - Lo-fi Orbital Beats Player
 * Spotify embed with Golden Record vinyl aesthetic
 * Ko-fi support link integrated
 */

import { useState, useEffect } from 'react';
import { Coffee, Music, ExternalLink } from 'lucide-react';

export function GoldenRecord() {
  const [rotation, setRotation] = useState(0);

  // Smooth vinyl rotation animation
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      setRotation(prev => (prev + 0.3) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-2xl mx-auto">
      {/* Rotating Vinyl Background */}
      <div className="relative w-80 h-80">
        {/* Outer vinyl disc */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 via-amber-950 to-black border-4 border-amber-600/50 shadow-[0_0_50px_rgba(251,191,36,0.4)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.1s linear',
          }}
        >
          {/* Grooves */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-amber-800/30"
              style={{
                inset: `${8 + i * 6}%`,
              }}
            />
          ))}

          {/* Centre label */}
          <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-amber-500 to-amber-800 border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <Music className="w-8 h-8 text-black/70" />
          </div>
        </div>
      </div>

      {/* Spotify Embed - Lo-fi Orbital Beats with Circular Clip-Path */}
      <div className="relative w-full max-w-md">
        <div className="text-cyan-400 font-['Rajdhani'] text-lg font-bold tracking-[0.2rem] uppercase mb-3 text-center">
          🎵 Lo-fi Orbital Beats
        </div>
        
        {/* Circular-clipped Spotify Player (Golden Record aesthetic) */}
        <div 
          className="relative overflow-hidden rounded-full border-4 border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.4)]"
          style={{
            clipPath: 'circle(50%)',
            width: '300px',
            height: '300px',
            margin: '0 auto',
          }}
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20"
            style={{ opacity: 0.3 }}
          />
          <iframe
            data-testid="embed-iframe"
            style={{
              borderRadius: '50%',
              opacity: 0.95,
              transform: 'scale(1.2)', // Scale up to fill circle
            }}
            src="https://open.spotify.com/embed/playlist/2lNXQBXNlGGV861HmtULwI?utm_source=generator&theme=0"
            width="100%"
            height="300"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-white/60 text-xs font-['Inter']">
          <span>Curated for deep space exploration 🚀</span>
          <a
            href="https://open.spotify.com/playlist/2lNXQBXNlGGV861HmtULwI?si=CBsg_GglRV2xo9UvUDsOtg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Ko-fi Support Link */}
      <a
        href="https://ko-fi.com/steve81uk"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-['Rajdhani'] font-bold tracking-[0.1rem] rounded-lg border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105"
      >
        <Coffee className="w-5 h-5" />
        FUEL THE WOLF
      </a>

      <div className="text-white/50 text-xs font-['Inter'] text-center max-w-md leading-relaxed">
        Support SKÖLL-TRACK development and get access to exclusive features, real-time alerts, and advanced data exports.
      </div>
    </div>
  );
}
