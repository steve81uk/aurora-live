import { X } from 'lucide-react';

interface CreditsModalProps {
  onClose: () => void;
}

export function CreditsModal({ onClose }: CreditsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-2xl m-4 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-cyan-500/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300">SYSTEM DATA SOURCES</h2>
            <p className="text-sm text-cyan-400/80 mt-1">Powered by NOAA & Open Source</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-all duration-200"
            title="Close Credits"
          >
            <X className="w-6 h-6 text-red-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Data Sources */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-3">📡 Data Sources</h3>
            <ul className="space-y-2 text-sm text-cyan-100/90">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Space Weather:</strong> NOAA Space Weather Prediction Center (SWPC)</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Solar Events:</strong> NASA DONKI (Database Of Notifications, Knowledge, Information)</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Orbital Mechanics:</strong> Astronomy Engine (NASA NOVAS)</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Planetary Textures:</strong> Solar System Scope & NASA GIBS</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Sky Maps:</strong> Stellarium Web</span>
              </li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-3">🛠️ Technology</h3>
            <ul className="space-y-2 text-sm text-cyan-100/90">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">3D Rendering:</strong> Three.js + React Three Fiber</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">Framework:</strong> React 19 + TypeScript + Vite</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                <span><strong className="text-cyan-300">UI:</strong> Tailwind CSS + Lucide Icons</span>
              </li>
            </ul>
          </div>

          {/* Creator */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-3">👨‍💻 Creator</h3>
            <p className="text-sm text-cyan-100/90">
              <strong className="text-cyan-300">Built by:</strong> Stephen Edwards
            </p>
            <p className="text-xs text-cyan-400/60 mt-2">
              SKÖLL-TRACK · Track the Sun's Fury · Solar System Explorer
            </p>
          </div>

          {/* Attribution */}
          <div className="pt-4 border-t border-cyan-500/20">
            <p className="text-xs text-cyan-400/60 text-center">
              All space weather data provided by NOAA SWPC for public use.
              <br />
              Planetary imagery courtesy of Solar System Scope and public data sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
