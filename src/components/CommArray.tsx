/**
 * CommArray Component - Social Links Portal
 * Floating link icon with glassmorphism modal for fleet connections
 */

import { useState } from 'react';
import { Link, Music, Coffee, Menu } from 'lucide-react';

interface CommArrayProps {
  onAudioTrigger?: () => void;
}

export function CommArray({ onAudioTrigger }: CommArrayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Play radio static on hover
  const playRadioStatic = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // White noise radio static
    const bufferSize = ctx.sampleRate * 0.15; // 150ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 2;
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start();
    
    if (onAudioTrigger) onAudioTrigger();
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    playRadioStatic();
  };

  const links = [
    {
      name: 'STEVE81UK LINKTREE',
      url: 'https://linktr.ee/steve81uk',
      icon: <Menu size={20} />,
      color: 'cyan'
    },
    {
      name: 'FUEL THE WOLF',
      url: 'https://ko-fi.com/steve81uk',
      icon: <Coffee size={20} />,
      color: 'amber'
    },
    {
      name: 'ORBITAL BEATS',
      description: 'Spotify Playlists',
      url: 'https://open.spotify.com/user/steve81uk',
      icon: <Music size={20} />,
      color: 'green'
    }
  ];

  return (
    <>
      {/* Floating Comm Icon */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovering(false)}
        className={`fixed top-4 right-4 z-[900] pointer-events-auto w-14 h-14 rounded-full backdrop-blur-md bg-black/40 border-2 border-cyan-500 flex items-center justify-center transition-all duration-300 ${isHovering ? 'scale-110 shadow-[0_0_30px_rgba(6,182,212,0.8)]' : 'shadow-[0_0_15px_rgba(6,182,212,0.4)]'}`}
        style={{ animation: 'pulse 2s ease-in-out infinite' }}
      >
        <Link size={24} className="text-cyan-400" />
      </button>

      {/* Glassmorphism Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-auto animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Portal Container */}
          <div
            className="relative backdrop-blur-xl bg-black/50 border-2 border-cyan-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_60px_rgba(6,182,212,0.6)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-purple-500" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                COMM-ARRAY
              </h2>
              <p className="text-cyan-600 text-xs uppercase tracking-wide mt-1">
                Fleet Communications Portal
              </p>
            </div>

            {/* Links Grid */}
            <div className="space-y-4">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block backdrop-blur-md bg-white/5 border-2 border-${link.color}-500 rounded-lg p-4 transition-all duration-300 hover:bg-${link.color}-500/10 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full bg-${link.color}-500/20 border border-${link.color}-500 flex items-center justify-center text-${link.color}-400 group-hover:scale-110 transition-transform`}>
                      {link.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <div className={`font-bold text-${link.color}-400 tracking-wide`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {link.name}
                      </div>
                      {link.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {link.description}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className={`text-${link.color}-500 group-hover:translate-x-1 transition-transform`}>
                      →
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-3 backdrop-blur-md bg-red-500/10 border border-red-500 rounded-lg text-red-400 font-bold tracking-wide hover:bg-red-500/20 transition-all"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              CLOSE PORTAL
            </button>

            {/* Wolf Badge */}
            <div className="mt-4 text-center text-xs text-cyan-600">
              🐺 Built by AuroraWolf (Stephen Edwards)
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </>
  );
}
