import React from 'react';
import { BookOpen, Brain, Code, Zap, X } from 'lucide-react';
import { TacticalCard } from './TacticalCard';

interface AstroAppendixProps {
  onClose?: () => void;
}

export const AstroAppendix: React.FC<AstroAppendixProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] z-[100] overflow-y-auto pointer-events-auto p-6 lg:p-12 font-['Inter']">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <h1 className="text-5xl lg:text-7xl font-['Rajdhani'] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
          ASTRO APPENDIX
        </h1>
        <div className="h-1 w-24 bg-cyan-500 mx-auto mb-6 shadow-[0_0_15px_#00ffff]" />
        <p className="text-cyan-400/60 font-mono uppercase tracking-[0.3em] text-sm">
          Project Neural DNA // v3.10.1 // Cambridge Systems
        </p>
      </div>

      {/* 4-Column Tactical HUD Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* 1. THE MANIFESTO */}
        <TacticalCard title="MANIFESTO" icon={BookOpen}>
          <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
            <p><span className="text-cyan-400 font-bold uppercase">The Objective:</span> To democratise solar weather data. For too long, the Sun's fury remained locked behind academic paywalls.</p>
            <p>SKÖLL-TRACK translates raw NOAA streams into a <span className="text-white">Wolf-Senses AI</span>. Whether you are an 8-year-old girl in Cambridge or an elite data alchemist, you deserve to see the storm coming.</p>
            <div className="p-3 bg-cyan-950/30 border-l-2 border-cyan-500 italic">
              "Predicting the solar wind to safeguard the local grid."
            </div>
          </div>
        </TacticalCard>

        {/* 2. FORMULA FORGE */}
        <TacticalCard title="FORMULA FORGE" icon={Zap}>
          <div className="space-y-6">
            <div className="group">
              <p className="text-[10px] text-cyan-500 font-mono mb-2 uppercase tracking-widest">Infra-Fatigue (Ψ)</p>
              <div className="bg-black/50 p-3 rounded border border-white/5 text-center font-mono text-xs">
                Ψ = (dJ/dt) / (v_A · Σ_P) - k · GIC
              </div>
            </div>
            <div>
              <p className="text-[10px] text-purple-500 font-mono mb-2 uppercase tracking-widest">Newell Coupling</p>
              <div className="bg-black/50 p-3 rounded border border-white/5 text-center font-mono text-xs text-white/80">
                P = v⁴/³ · B_t²/³ · sin⁸(θ/2)
              </div>
            </div>
          </div>
        </TacticalCard>

        {/* 3. SYSTEMS ARCHITECTURE */}
        <TacticalCard title="ARCHITECTURE" icon={Code}>
          <div className="text-[11px] font-mono space-y-3">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-500">CORE</span>
              <span className="text-cyan-400">React 19 / TS 5.7</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-500">RENDER</span>
              <span className="text-blue-400">Three.js r172</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-gray-500">STREAM</span>
              <span className="text-amber-400">NOAA / CelesTrak</span>
            </div>
            <div className="pt-2 text-gray-500 leading-tight">
              Features 16 real-time moons, GSAP flare particles, and magnetospheric compression shaders.
            </div>
          </div>
        </TacticalCard>

        {/* 4. AI SYNERGY */}
        <TacticalCard title="AI SYNERGY" icon={Brain}>
          <div className="space-y-4 text-xs text-gray-400">
            <p>Designed by a human Commander using an <span className="text-white">AI Command Fleet</span>. Claude Sonnet 4.5 orchestrated the code, while Wolfram Alpha validated the physics.</p>
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-4 rounded border border-cyan-500/20 text-center">
              <p className="text-cyan-400 font-bold font-mono tracking-tighter">STEVE81UK</p>
              <p className="text-[10px] uppercase">Systems Architect</p>
            </div>
            <a href="https://ko-fi.com/steve81uk" target="_blank" rel="noopener noreferrer" className="block text-center text-purple-400 hover:text-white transition-colors underline decoration-purple-500/30">Support the Mission</a>
          </div>
        </TacticalCard>

      </div>

      {onClose && (
        <button onClick={onClose} className="fixed top-8 right-8 p-4 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-full text-white transition-all">
          <X size={24} />
        </button>
      )}
    </div>
  );
};