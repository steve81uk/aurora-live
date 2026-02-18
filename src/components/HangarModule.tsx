/**
 * The Hangar Module - Spacecraft Boarding Bay
 * Dedicated view for ISS live stream, Hubble images, and spacecraft replays
 */

import { useState, useEffect } from 'react';
import { Telescope, X, ExternalLink, Download, Zap } from 'lucide-react';
import { DataExportButton } from './DataExportButton';
import { TacticalCard } from './TacticalCard';
import { fetchSpaceState, type SpaceState } from '../utils/DataBridge';

interface HangarModuleProps {
  initialVehicle?: string | null;
  onExit?: () => void;
}

export function HangarModule({ initialVehicle, onExit }: HangarModuleProps) {
  const [activeVehicle, setActiveVehicle] = useState<string | null>(initialVehicle || null);
  const [spaceState, setSpaceState] = useState<SpaceState | null>(null);

  // Fetch space state every 60 seconds
  useEffect(() => {
    fetchSpaceState().then(setSpaceState);
    const interval = setInterval(() => {
      fetchSpaceState().then(setSpaceState);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const vehicles = [
    {
      id: 'ISS',
      name: 'International Space Station',
      icon: '🛰️',
      stream: 'https://www.youtube.com/embed/aB1yRz0HhdY',
      description: 'Live HD Earth view from the ISS',
      altitude: '420 km',
      speed: '7.66 km/s',
      status: 'OPERATIONAL'
    },
    {
      id: 'ISS-SEN',
      name: 'ISS Live (SEN)',
      icon: '🌍',
      stream: 'https://www.youtube.com/embed/fO9e9jnhYK8',
      description: 'Alternative ISS live stream from SEN',
      altitude: '420 km',
      speed: '7.66 km/s',
      status: 'OPERATIONAL'
    },
    {
      id: 'Hubble',
      name: 'Hubble Space Telescope',
      icon: '🔭',
      stream: 'https://esahubble.org/images/archive/top100/',
      description: 'Latest deep space observations',
      altitude: '540 km',
      speed: '7.59 km/s',
      status: 'OPERATIONAL'
    },
    {
      id: 'JWST',
      name: 'James Webb Space Telescope',
      icon: '🌌',
      stream: 'https://webbtelescope.org/resource-gallery/images',
      description: 'Infrared universe exploration',
      altitude: 'L2 (1.5M km)',
      speed: 'N/A',
      status: 'OPERATIONAL'
    },
    {
      id: 'Voyager1',
      name: 'Voyager 1',
      icon: '🚀',
      stream: 'https://voyager.jpl.nasa.gov/mission/status/',
      description: 'Interstellar space explorer',
      altitude: '24B km',
      speed: '17 km/s',
      status: 'OPERATIONAL'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 min-h-fit py-8 overflow-y-auto pointer-events-auto wolf-scroll obsidian-bg">
      {/* Header with Export Button */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 aurora-text">
            THE HANGAR
          </h1>
          <p className="text-cyan-400/70 font-mono tracking-wider">
            Live Spacecraft • Mission Streams • Fleet Status
          </p>
        </div>
        
        {/* Export Fleet Data */}
        <DataExportButton
          data={{
            fleet: vehicles.map(v => ({
              name: v.name,
              status: v.status,
              altitude: v.altitude,
              speed: v.speed,
              description: v.description
            })),
            exportedAt: new Date().toISOString()
          }}
          filename="hangar-fleet-status"
          label="Fleet Data"
        />
      </header>

      {/* NASA ISS Live Stream */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 font-mono tracking-widest neon-amber">
          LIVE: ISS HD EARTH VIEWING
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="holo-card p-4">
            <h3 className="text-lg font-bold text-amber-400 mb-3 font-mono">NASA ISS FEED</h3>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/aB1yRz0HhdY"
                title="NASA ISS Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-cyan-400/60 text-sm mt-2 font-mono">
              Primary ISS HD Earth Viewing • 24/7 Live
            </p>
          </div>

          <div className="holo-card p-4">
            <h3 className="text-lg font-bold text-amber-400 mb-3 font-mono">ISS LIVE (SEN)</h3>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/fO9e9jnhYK8"
                title="ISS Live Video from SEN"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-cyan-400/60 text-sm mt-2 font-mono">
              Alternative ISS Stream • Space Exploration Network
            </p>
          </div>
        </div>
      </section>

      {/* Infrastructure Fatigue Monitor (Ψ) */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 font-mono tracking-widest neon-amber">
          INFRASTRUCTURE FATIGUE MONITOR
        </h2>
        
        <TacticalCard 
          title="Wolf-Formula (Ψ) Live Tracker"
          icon={Zap}
          active={spaceState?.fatigue.stressLevel === 'CRITICAL' || spaceState?.fatigue.stressLevel === 'HIGH'}
        >
          {spaceState ? (
            <>
              {/* 4-Column Metrics Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                <div>
                  <div className="text-gray-400 text-xs mb-1">PSI (Ψ)</div>
                  <div className="text-cyan-300 font-mono text-2xl font-bold">
                    {spaceState.fatigue.psi.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">GIC (A)</div>
                  <div className="text-purple-300 font-mono text-2xl font-bold">
                    {spaceState.fatigue.gic.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">Kp INDEX</div>
                  <div className="text-green-300 font-mono text-2xl font-bold">
                    {spaceState.indices.kpIndex.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs mb-1">STATUS</div>
                  <div className={`font-mono text-sm font-bold ${
                    spaceState.fatigue.stressLevel === 'CRITICAL' ? 'text-red-400' :
                    spaceState.fatigue.stressLevel === 'HIGH' ? 'text-orange-400' :
                    spaceState.fatigue.stressLevel === 'MODERATE' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {spaceState.fatigue.stressLevel}
                  </div>
                </div>
              </div>

              {/* Stress-O-Meter Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-mono">STRESS-O-METER</span>
                  <span className="text-cyan-300 text-xs font-mono">
                    {(Math.min(spaceState.fatigue.psi, 1.5) / 1.5 * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-4 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(spaceState.fatigue.psi / 1.5 * 100, 100)}%`,
                      background: spaceState.fatigue.psi < 0.5 
                        ? 'linear-gradient(90deg, #00ffff, #00ff99)'
                        : spaceState.fatigue.psi < 1.0
                        ? 'linear-gradient(90deg, #ffaa00, #ff6600)'
                        : 'linear-gradient(90deg, #ff0000, #aa0000)',
                      boxShadow: spaceState.fatigue.psi > 1.0 
                        ? '0 0 15px rgba(255, 0, 0, 0.8)' 
                        : '0 0 10px rgba(0, 255, 255, 0.5)'
                    }}
                  />
                </div>
              </div>

              {/* Formula Display */}
              <div className="mt-4 p-3 bg-black/40 rounded border border-cyan-500/20">
                <div className="text-xs text-gray-400 mb-2">WOLF-FORMULA:</div>
                <div className="font-mono text-cyan-300 text-sm">
                  Ψ = (dJ/dt) / (v<sub>A</sub> · Σ<sub>P</sub>) - k · GIC
                </div>
                <div className="text-[10px] text-gray-500 mt-2">
                  Where v<sub>A</sub> = Alfvén Velocity, Σ<sub>P</sub> = Pedersen Conductivity, k = 0.05
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mb-3" />
              <div className="text-sm font-mono">INITIALISING WOLF-SENSES...</div>
            </div>
          )}
        </TacticalCard>
      </section>

      {/* Fleet Status */}
      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-4 font-mono tracking-widest">
          FLEET STATUS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <TacticalCard 
              key={vehicle.id} 
              title={vehicle.name}
              active={vehicle.status === 'OPERATIONAL'}
            >
              {/* Vehicle Icon */}
              <div className="text-4xl mb-3">{vehicle.icon}</div>
              
              <p className="text-gray-400 text-sm mb-4">{vehicle.description}</p>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <span className="text-gray-500 text-xs">ALTITUDE:</span>
                  <div className="text-cyan-300 font-mono font-bold">{vehicle.altitude}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">VELOCITY:</span>
                  <div className="text-cyan-300 font-mono font-bold">{vehicle.speed}</div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`text-xs font-mono px-2 py-1 rounded inline-block ${
                vehicle.status === 'OPERATIONAL' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
              }`}>
                {vehicle.status}
              </div>
            </TacticalCard>
          ))}
        </div>
      </section>

      {/* Active Vehicle Detail Modal */}
      {activeVehicle && activeVehicle !== 'ISS' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto">
          <div className="holo-card max-w-4xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{vehicles.find(v => v.id === activeVehicle)?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {vehicles.find(v => v.id === activeVehicle)?.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {vehicles.find(v => v.id === activeVehicle)?.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveVehicle(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Telescope size={64} className="text-cyan-400 mb-6" />
              <p className="text-gray-400 mb-8 max-w-md">
                External mission data portal
              </p>
              <a
                href={vehicles.find(v => v.id === activeVehicle)?.stream}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 
                         rounded-lg text-white font-bold text-lg transition-all neon-glow-hover
                         flex items-center gap-3"
              >
                <ExternalLink size={24} />
                OPEN LIVE DATA
              </a>
              <p className="text-gray-500 text-sm mt-4 font-mono">
                Opens in new tab • Official mission portal
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
