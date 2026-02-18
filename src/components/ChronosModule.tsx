/**
 * The Chronos Module - Historical Time Travel
 * Replay past solar storms and events with award-winning slider
 */

import { useState } from 'react';
import { Clock, Calendar, Rewind, FastForward, Play, Pause, RotateCcw } from 'lucide-react';
import { AuroraChronosSlider } from './AuroraChronosSlider';
import { DataExportButton } from './DataExportButton';
import { ProbabilityMatrix } from './ProbabilityMatrix';

interface ChronosModuleProps {
  onDateSelect?: (date: Date) => void;
  currentDate?: Date;
  kpValue?: number;
}

interface HistoricalEvent {
  id: string;
  date: string;
  name: string;
  type: 'G5' | 'G4' | 'G3' | 'X-Class' | 'M-Class';
  kpMax: number;
  description: string;
  severity: 'extreme' | 'severe' | 'moderate';
}

export function ChronosModule({ onDateSelect, currentDate = new Date(), kpValue = 3 }: ChronosModuleProps) {
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const historicalEvents: HistoricalEvent[] = [
    {
      id: '2024-05-11',
      date: '2024-05-11',
      name: 'May 2024 Superstorm',
      type: 'G5',
      kpMax: 9,
      description: 'Strongest geomagnetic storm in 20+ years. Aurora visible in Florida and Mexico.',
      severity: 'extreme'
    },
    {
      id: '2023-03-24',
      date: '2023-03-24',
      name: 'March 2023 Storm',
      type: 'G4',
      kpMax: 8,
      description: 'Severe geomagnetic storm from X1.2 flare. Power grid fluctuations reported.',
      severity: 'severe'
    },
    {
      id: '2022-10-12',
      date: '2022-10-12',
      name: 'October 2022 Event',
      type: 'G3',
      kpMax: 7,
      description: 'Moderate storm with aurora visible at mid-latitudes. Minor satellite disruptions.',
      severity: 'moderate'
    },
    {
      id: '2021-11-04',
      date: '2021-11-04',
      name: 'Halloween Storm 2021',
      type: 'X-Class',
      kpMax: 8,
      description: 'X1.0 solar flare caused radio blackouts. Aurora reached 45°N latitude.',
      severity: 'severe'
    },
    {
      id: '2017-09-08',
      date: '2017-09-08',
      name: 'September 2017 Double Storm',
      type: 'G5',
      kpMax: 9,
      description: 'Two X-class flares in 3 days. Hurricane Irma observation disrupted.',
      severity: 'extreme'
    }
  ];

  const severityColors = {
    extreme: 'border-red-500 bg-red-500/10 text-red-400',
    severe: 'border-orange-500 bg-orange-500/10 text-orange-400',
    moderate: 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 lg:p-12 h-full overflow-y-auto pointer-events-auto wolf-scroll obsidian-bg">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 aurora-text">
            CHRONOS
          </h1>
          <p className="text-cyan-400/70 font-mono tracking-wider">
            Solar Storm Archive • Time Navigation • Historical Events
          </p>
        </div>
        <DataExportButton
          data={{
            currentDate: currentDate.toISOString(),
            selectedEvent,
            historicalEvents,
            kpValue,
            playbackSpeed
          }}
          filename="chronos-archive"
          label="CHRONOS DATA"
        />
      </header>

      {/* Solar Storm Archive */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-amber-400 mb-4 font-mono tracking-widest neon-amber">
          SOLAR STORM ARCHIVE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="holo-card p-6 text-left neon-glow-hover">
            <div className="text-xl font-bold text-red-400 mb-2">1859</div>
            <div className="text-sm font-mono text-cyan-400">CARRINGTON EVENT</div>
            <div className="text-xs text-gray-500 mt-2">Kp Index: 9+ • Strongest recorded</div>
          </button>
          <button className="holo-card p-6 text-left neon-glow-hover">
            <div className="text-xl font-bold text-orange-400 mb-2">1989</div>
            <div className="text-sm font-mono text-cyan-400">QUEBEC BLACKOUT</div>
            <div className="text-xs text-gray-500 mt-2">Kp Index: 9 • 6M without power</div>
          </button>
          <button className="holo-card p-6 text-left neon-glow-hover">
            <div className="text-xl font-bold text-yellow-400 mb-2">2024</div>
            <div className="text-sm font-mono text-cyan-400">MAY SUPERSTORM</div>
            <div className="text-xs text-gray-500 mt-2">Kp Index: 8.7 • Global aurora</div>
          </button>
        </div>
      </section>

      {/* AWARD-WINNING AURORA CHRONOS SLIDER */}
      <section className="mb-8">
        <AuroraChronosSlider
          currentDate={currentDate}
          onDateChange={(date) => onDateSelect?.(date)}
          kpValue={selectedEvent?.kpMax || kpValue}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Event List (Left) */}
        <div className="lg:col-span-4 holo-card p-4">
          <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar size={18} />
            Historical Solar Events
          </h2>

          <div className="space-y-3">
            {historicalEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left holo-card neon-glow-hover
                  ${selectedEvent?.id === event.id
                    ? severityColors[event.severity] + ' shadow-lg'
                    : ''
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{event.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                    event.type === 'G5' ? 'border-red-500 text-red-400' :
                    event.type === 'G4' ? 'border-orange-500 text-orange-400' :
                    event.type === 'X-Class' ? 'border-purple-500 text-purple-400' :
                    'border-yellow-500 text-yellow-400'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{event.date}</p>
                <p className="text-gray-300 text-sm">{event.description}</p>
                <div className="mt-2 text-xs font-mono text-cyan-400">
                  MAX KP: {event.kpMax}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Playback Control & Visualization (Right) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Selected Event Details */}
          {selectedEvent ? (
            <>
              <div className="holo-card p-6">
                <h2 className="text-3xl font-bold aurora-text-static mb-2">{selectedEvent.name}</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300 font-mono aurora-text-static">{selectedEvent.date}</span>
                  </div>
                  <div className={`px-3 py-1 rounded border ${
                    selectedEvent.type === 'G5' ? 'border-red-500 text-red-400 bg-red-500/10' :
                    selectedEvent.type === 'G4' ? 'border-orange-500 text-orange-400 bg-orange-500/10' :
                    'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  }`}>
                    {selectedEvent.type} STORM
                  </div>
                  <div className="text-cyan-400 font-mono">
                    MAX KP: <span className="font-bold text-xl">{selectedEvent.kpMax}</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6">{selectedEvent.description}</p>

                {/* Playback Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-400 rounded-lg
                             transition-all hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.4)] neon-glow-hover"
                  >
                    {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
                  </button>
                  
                  <button className="p-3 holo-card neon-glow-hover transition-all">
                    <Rewind size={20} className="text-cyan-400" />
                  </button>
                  
                  <button className="p-3 holo-card neon-glow-hover transition-all">
                    <FastForward size={20} className="text-cyan-400" />
                  </button>
                  
                  <button className="p-3 holo-card neon-glow-hover transition-all">
                    <RotateCcw size={20} className="text-cyan-400" />
                  </button>

                  <div className="flex-1 min-w-[20px]" />

                  <div className="flex items-center gap-2 metric-panel p-2">
                    <span className="text-gray-400 text-sm font-mono">SPEED:</span>
                    {[1, 2, 5, 10].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-3 py-1 rounded font-mono text-sm transition-all ${
                          playbackSpeed === speed
                            ? 'bg-cyan-500 text-white neon-glow-hover'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="flex-1 holo-card p-6">
                <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-wider mb-4">
                  Event Timeline
                </h3>
                <div className="relative h-32 bg-black/60 rounded-lg border border-gray-700 p-4">
                  {/* Timeline bar */}
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      style={{ width: isPlaying ? '60%' : '0%', transition: 'width 0.3s' }}
                    />
                  </div>
                  {/* Playhead */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-24 bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                    style={{ left: isPlaying ? '60%' : '16px', transition: 'left 0.3s' }}
                  />
                </div>

                {/* Event markers */}
                <div className="mt-8 grid grid-cols-5 gap-2">
                  {['T-6h', 'T-3h', 'IMPACT', 'T+3h', 'T+6h'].map((label, i) => (
                    <div key={i} className="text-center">
                      <div className={`h-2 w-2 mx-auto rounded-full ${
                        i === 2 ? 'bg-red-500' : 'bg-cyan-500'
                      }`} />
                      <span className="text-xs text-gray-400 font-mono mt-1 block">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* No event selected */
            <div className="flex-1 holo-card flex flex-col items-center justify-center text-center p-12">
              <Clock size={64} className="text-gray-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-400 mb-3">Select a Historical Event</h3>
              <p className="text-gray-500 max-w-md">
                Choose a solar storm from the list to replay its timeline and observe the aurora evolution.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI PREDICTIVE ENGINE */}
      <section className="mt-8">
        <ProbabilityMatrix 
          latitude={52.2053}
          currentKp={kpValue}
          sunspotNumber={150}
        />
      </section>
    </div>
  );
}
