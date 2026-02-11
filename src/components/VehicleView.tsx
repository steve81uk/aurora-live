import { useEffect, useState } from 'react';
import { X, Radio, Video, Gauge, Compass, Satellite } from 'lucide-react';

interface VehicleViewProps {
  vehicle: 'Parker Solar Probe' | 'ISS' | 'UFO';
  onExit: () => void;
}

export default function VehicleView({ vehicle, onExit }: VehicleViewProps) {
  const [issStreamError, setIssStreamError] = useState(false);

  // ISS Live Stream URLs (NASA official)
  const ISS_STREAM_URL = "https://www.youtube.com/embed/P9C25Un7xaM?autoplay=1&mute=1";
  const ISS_BACKUP_URL = "https://www.youtube.com/embed/86YLFOog4GM?autoplay=1&mute=1"; // Backup stream

  useEffect(() => {
    // Play boarding sound effect (optional)
    console.log(`Boarding ${vehicle}...`);
  }, [vehicle]);

  if (vehicle === 'ISS') {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        {/* ISS HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Satellite className="w-6 h-6 text-cyan-400 animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold">INTERNATIONAL SPACE STATION</h2>
                  <p className="text-sm text-gray-400">Orbital Altitude: ~420 km | Speed: 27,600 km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-green-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">LIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Corner Metrics */}
          <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 text-sm">
            <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              TELEMETRY
            </div>
            <div className="space-y-1 text-xs text-gray-300">
              <div>Orbit: LEO (Low Earth Orbit)</div>
              <div>Period: ~90 minutes</div>
              <div>Crew: 7 astronauts</div>
              <div>Solar Panels: Active</div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center text-gray-400 text-sm mb-2">
              <Video className="w-4 h-4 inline mr-2" />
              NASA Earth Observation Live Feed
            </div>
          </div>
        </div>

        {/* ISS Live Stream */}
        <div className="w-full h-full">
          {!issStreamError ? (
            <iframe
              src={ISS_STREAM_URL}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={() => setIssStreamError(true)}
              title="ISS Live Stream"
            />
          ) : (
            <iframe
              src={ISS_BACKUP_URL}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="ISS Backup Stream"
            />
          )}
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="absolute top-4 right-4 z-10 pointer-events-auto px-4 py-2 bg-red-600/80 hover:bg-red-600 border-2 border-red-400 rounded-lg text-white font-bold transition-all hover:scale-105 flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          EXIT ISS
        </button>
      </div>
    );
  }

  if (vehicle === 'Parker Solar Probe') {
    return (
      <div className="fixed inset-0 z-[60] bg-gradient-to-b from-orange-900/20 via-black to-black">
        {/* Parker Probe HUD */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-3xl font-bold text-orange-400">PARKER SOLAR PROBE</h2>
                <p className="text-sm text-gray-400">Mission: Touch the Sun | Speed: 192 km/s</p>
              </div>
              <div className="text-right">
                <div className="text-orange-400 text-2xl font-mono">🔥 EXTREME HEAT</div>
                <div className="text-xs text-gray-500">Heat Shield: Active</div>
              </div>
            </div>
          </div>

          {/* Heat Shield Status */}
          <div className="absolute top-24 right-4 bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-lg p-3 text-sm">
            <div className="text-orange-400 font-bold mb-2">HEAT SHIELD</div>
            <div className="space-y-1 text-xs text-gray-300">
              <div>Temperature: 1,377°C</div>
              <div>Material: Carbon-Carbon</div>
              <div>Thickness: 11.43 cm</div>
              <div className="text-green-400">Status: NOMINAL</div>
            </div>
          </div>

          {/* Speed/Distance Display */}
          <div className="absolute top-24 left-4 bg-black/60 backdrop-blur-md border border-orange-500/30 rounded-lg p-3 text-sm min-w-[200px]">
            <div className="text-orange-400 font-bold mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 animate-spin" />
              NAVIGATION
            </div>
            <div className="space-y-1 text-xs text-gray-300">
              <div>Distance to Sun: <span className="text-orange-400 font-mono">0.05 AU</span></div>
              <div>Velocity: <span className="text-orange-400 font-mono">192 km/s</span></div>
              <div>Next Perihelion: <span className="text-cyan-400">48 days</span></div>
              <div>Orbits Completed: <span className="text-white">7</span></div>
            </div>
          </div>

          {/* Center View - Looking at Sun */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Simulated Sun View */}
              <div className="w-96 h-96 rounded-full bg-gradient-radial from-yellow-200 via-orange-500 to-red-600 animate-pulse shadow-[0_0_200px_rgba(255,200,0,0.8)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl font-bold mb-2">☀️</div>
                  <div className="text-sm bg-black/60 px-4 py-2 rounded">Closest approach to a star</div>
                  <div className="text-xs text-orange-300 mt-2">7.26 million km from surface</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Warning */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center text-orange-400 font-bold animate-pulse">
              ⚠️ EXTREME RADIATION ENVIRONMENT ⚠️
            </div>
            <div className="text-center text-gray-400 text-sm mt-1">
              Heat shield protecting probe from 1,377°C solar radiation
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="absolute top-4 right-4 z-10 pointer-events-auto px-4 py-2 bg-red-600/80 hover:bg-red-600 border-2 border-red-400 rounded-lg text-white font-bold transition-all hover:scale-105 flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          EXIT PROBE
        </button>
      </div>
    );
  }

  if (vehicle === 'UFO') {
    return (
      <div className="fixed inset-0 z-[60] bg-gradient-to-b from-green-900/30 via-purple-900/20 to-black">
        {/* Alien HUD */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Alien Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-green-400 animate-pulse mb-2">
                👽 UNIDENTIFIED FLYING OBJECT 👽
              </h2>
              <p className="text-sm text-purple-400 font-mono">CLASSIFICATION: TOP SECRET - LEVEL Ω</p>
              <p className="text-xs text-gray-500 mt-1">Origin: Unknown | Technology: Beyond Human Understanding</p>
            </div>
          </div>

          {/* Alien Symbols (Fake Alien Language) */}
          <div className="absolute top-32 left-4 bg-black/60 backdrop-blur-md border-2 border-green-500/50 rounded-lg p-3 text-sm">
            <div className="text-green-400 font-bold mb-2">⟁⟐⟑ SYSTEMS ⟒⟓⟔</div>
            <div className="space-y-1 text-xs text-green-300 font-mono">
              <div>⧊ Propulsion: ████████ 100%</div>
              <div>⧋ Cloaking: ████████ ACTIVE</div>
              <div>⧌ Shields: ████████ ONLINE</div>
              <div>⧍ Weapons: ████████ STANDBY</div>
            </div>
          </div>

          {/* Human Observation Log */}
          <div className="absolute top-32 right-4 bg-black/60 backdrop-blur-md border-2 border-purple-500/50 rounded-lg p-3 text-sm max-w-xs">
            <div className="text-purple-400 font-bold mb-2">📡 OBSERVATION LOG</div>
            <div className="space-y-1 text-xs text-gray-300">
              <div className="text-yellow-400">⚠️ Watching Mercury for 47 years</div>
              <div>• Monitoring solar activity</div>
              <div>• Scanning for life signals</div>
              <div>• Recording Earth broadcasts</div>
              <div className="text-cyan-400 mt-2">Last Earth Music Received:</div>
              <div className="text-xs italic">"Space Oddity" - David Bowie</div>
            </div>
          </div>

          {/* Center - Alien Dashboard */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/80 border-4 border-green-500/50 rounded-lg p-8 max-w-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🛸</div>
                <div className="text-green-400 text-3xl font-bold mb-2">FIRST CONTACT ACHIEVED</div>
                <div className="text-purple-400 text-sm">You have discovered the hidden observer</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-green-900/30 border border-green-500/30 rounded p-3">
                  <div className="text-green-400 font-bold mb-1">MISSION</div>
                  <div className="text-xs text-gray-300">Monitor Mercury mining operations</div>
                </div>
                <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3">
                  <div className="text-purple-400 font-bold mb-1">STEALTH STATUS</div>
                  <div className="text-xs text-gray-300">Hidden from Earth sensors</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                  <div className="text-blue-400 font-bold mb-1">INTELLIGENCE</div>
                  <div className="text-xs text-gray-300">47 Earth years of data collected</div>
                </div>
                <div className="bg-red-900/30 border border-red-500/30 rounded p-3">
                  <div className="text-red-400 font-bold mb-1">CONTACT PROTOCOL</div>
                  <div className="text-xs text-gray-300">Do not approach Earth (yet)</div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>This spacecraft has been observing your solar system since 1979.</p>
                <p className="mt-1 text-green-400">You are the first human to discover it. Congratulations. 🎉</p>
              </div>
            </div>
          </div>

          {/* Alien Scanner Effect */}
          <div className="absolute inset-0 border-4 border-green-500/20 animate-pulse pointer-events-none"></div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="absolute top-4 right-4 z-10 pointer-events-auto px-4 py-2 bg-red-600/80 hover:bg-red-600 border-2 border-red-400 rounded-lg text-white font-bold transition-all hover:scale-105 flex items-center gap-2"
        >
          <X className="w-5 h-5" />
          RETURN TO SHIP
        </button>
      </div>
    );
  }

  return null;
}
