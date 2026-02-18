/**
 * MissionHUD - Mission Control Corner Display
 * Displays mission elapsed time, camera position, and system status
 * Pure HTML/CSS - No R3F hooks
 */

import { useState, useEffect } from 'react';

interface MissionHUDProps {
  focusedBody: string | null;
  currentDate: Date;
  activeModule: string;
  cameraPosition?: { x: number; y: number; z: number };
}

export function MissionHUD({ focusedBody, currentDate, activeModule, cameraPosition }: MissionHUDProps) {
  const [fps, setFps] = useState(60);

  // Simple FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFPS);
    };

    const id = requestAnimationFrame(countFPS);
    return () => cancelAnimationFrame(id);
  }, []);

  // Format date for mission control display
  const formatDate = (date: Date) => {
    const year = date.getUTCFullYear();
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000);
    const time = date.toISOString().slice(11, 19);
    return `${year}.${String(dayOfYear).padStart(3, '0')}.${time}`;
  };

  const distance = cameraPosition 
    ? Math.sqrt(cameraPosition.x ** 2 + cameraPosition.y ** 2 + cameraPosition.z ** 2)
    : 0;

  return (
    <>
      {/* Top-Left: Mission Info */}
      <div className="absolute top-4 left-20 font-mono text-xs text-cyan-400 
                      bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-sm
                      shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <div className="flex flex-col gap-1">
          <div className="text-white font-bold tracking-[0.15em] mb-1">SKÖLL MISSION</div>
          <div className="text-[10px] leading-relaxed">
            <div>MET: {formatDate(currentDate)} UTC</div>
            <div>TGT: {focusedBody?.toUpperCase() || 'FREE NAV'}</div>
            <div>MODE: {activeModule}</div>
          </div>
        </div>
      </div>

      {/* Top-Right: Camera Info */}
      {cameraPosition && (
        <div className="absolute top-4 right-4 font-mono text-xs text-cyan-400 
                        bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-sm
                        shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <div className="flex flex-col gap-1">
            <div className="text-white font-bold tracking-[0.15em] mb-1">CAMERA</div>
            <div className="text-[10px] leading-relaxed tabular-nums">
              <div>X: {cameraPosition.x.toFixed(2)}</div>
              <div>Y: {cameraPosition.y.toFixed(2)}</div>
              <div>Z: {cameraPosition.z.toFixed(2)}</div>
              <div>DST: {distance.toFixed(2)} U</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom-Left: System Status */}
      <div className="absolute bottom-20 left-4 font-mono text-xs text-cyan-400 
                      bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-sm
                      shadow-[0_0_15px_rgba(6,182,212,0.2)]">
        <div className="flex flex-col gap-1">
          <div className="text-white font-bold tracking-[0.15em] mb-1">SYSTEM</div>
          <div className="text-[10px] leading-relaxed tabular-nums">
            <div>FPS: <span className={fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>{fps}</span></div>
            <div>API: <span className="text-green-400">NOM</span></div>
            <div>RDR: <span className="text-green-400">ACT</span></div>
          </div>
        </div>
      </div>

      {/* Center Crosshair/Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-8 h-8">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-cyan-400/30" />
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 w-px h-full bg-cyan-400/30" />
          {/* Center circle */}
          <div className="absolute inset-0 border border-cyan-400/30 rounded-full" 
               style={{ width: '32px', height: '32px', left: '-4px', top: '-4px' }} />
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 
                          bg-cyan-400/50 rounded-full" />
        </div>
      </div>
    </>
  );
}
