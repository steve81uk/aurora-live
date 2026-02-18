/**
 * RadioBlackoutOverlay - Simulates ionospheric radio blackout during X-class flares
 * Applies static/glitch shader on HUD when X-ray flux exceeds M5/X1
 */

import { useRef, useEffect, useState } from 'react';
import { Howl } from 'howler';

interface RadioBlackoutOverlayProps {
  xrayFlux: string; // e.g., 'M5.4', 'X1.2', 'C2.1'
  active: boolean;
}

export function RadioBlackoutOverlay({ xrayFlux, active }: RadioBlackoutOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [intensity, setIntensity] = useState(0);
  const [whiteNoiseAudio, setWhiteNoiseAudio] = useState<Howl | null>(null);

  // Parse X-ray flux intensity
  useEffect(() => {
    if (!xrayFlux) {
      setIntensity(0);
      return;
    }

    const match = xrayFlux.match(/^([XMCBA])(\d+\.?\d*)/);
    if (!match) {
      setIntensity(0);
      return;
    }

    const [, classLetter, magnitude] = match;
    const mag = parseFloat(magnitude);

    let calculatedIntensity = 0;
    switch (classLetter) {
      case 'X':
        calculatedIntensity = Math.min(1.0, 0.6 + mag * 0.1); // X1 = 0.7, X10 = 1.0
        break;
      case 'M':
        calculatedIntensity = mag >= 5 ? Math.min(0.5, mag / 20) : 0; // M5 = 0.25
        break;
      default:
        calculatedIntensity = 0;
    }

    setIntensity(calculatedIntensity);
  }, [xrayFlux, active]);

  // White noise audio
  useEffect(() => {
    if (active && intensity > 0 && !whiteNoiseAudio) {
      // Create white noise with Howler
      try {
        const audioContext = new AudioContext();
        const bufferSize = 2 * audioContext.sampleRate;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        // Note: Howler doesn't support AudioBuffer directly
        // So we'll skip the audio for now or use a pre-made white noise file
        // For now, just a placeholder comment
        // TODO: Add white-noise.mp3 to public/audio/ and load it here
      } catch (e) {
        console.warn('Audio context not available');
      }
    }

    if (!active || intensity === 0) {
      whiteNoiseAudio?.stop();
      setWhiteNoiseAudio(null);
    }
  }, [active, intensity, whiteNoiseAudio]);

  // Canvas static rendering
  useEffect(() => {
    if (!canvasRef.current || intensity === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;

    const renderStatic = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255 * intensity;
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = Math.random() * 100 * intensity; // Alpha (transparency)
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(renderStatic);
    };

    renderStatic();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [intensity]);

  if (!active || intensity === 0) return null;

  return (
    <>
      {/* Static overlay canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[950] pointer-events-none mix-blend-screen"
        style={{ opacity: intensity * 0.4 }}
      />

      {/* Warning banner */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[951] bg-red-900/90 border-2 border-red-500 rounded-lg px-6 py-3 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-3 text-white font-mono">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <div className="font-bold text-sm">⚠️ RADIO BLACKOUT ACTIVE</div>
            <div className="text-xs text-red-200">Signal Loss: Ionospheric Absorption ({xrayFlux} X-ray)</div>
          </div>
        </div>
      </div>

      {/* Manual override button */}
      <div className="fixed bottom-24 right-4 z-[951]">
        <button
          onClick={() => setIntensity(0)}
          className="bg-cyan-600/90 hover:bg-cyan-500 border-2 border-cyan-400 rounded-lg px-4 py-2 text-white text-xs font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)] backdrop-blur-sm"
        >
          🔧 MANUAL OVERRIDE (5s)
        </button>
      </div>
    </>
  );
}
