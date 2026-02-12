import { useState } from 'react';
import { Zap, RotateCcw, Download, Upload } from 'lucide-react';

interface StormPreset {
  name: string;
  kp: number;
  solarWindSpeed: number;
  bz: number;
  description: string;
  color: string;
}

const STORM_PRESETS: StormPreset[] = [
  {
    name: 'QUIET',
    kp: 1,
    solarWindSpeed: 350,
    bz: 2,
    description: 'Normal solar conditions',
    color: 'cyan'
  },
  {
    name: 'ACTIVE',
    kp: 4,
    solarWindSpeed: 500,
    bz: -3,
    description: 'Minor geomagnetic activity',
    color: 'green'
  },
  {
    name: 'G1 STORM',
    kp: 5,
    solarWindSpeed: 550,
    bz: -5,
    description: 'Minor storm - Aurora at 60° latitude',
    color: 'yellow'
  },
  {
    name: 'G2 STORM',
    kp: 6,
    solarWindSpeed: 650,
    bz: -8,
    description: 'Moderate storm - Aurora at 55° latitude',
    color: 'orange'
  },
  {
    name: 'G3 STORM',
    kp: 7,
    solarWindSpeed: 750,
    bz: -12,
    description: 'Strong storm - Aurora visible from Cambridge',
    color: 'red'
  },
  {
    name: 'G5 EXTREME',
    kp: 9,
    solarWindSpeed: 1000,
    bz: -20,
    description: 'Extreme storm - Equatorial aurora',
    color: 'purple'
  },
  {
    name: 'CARRINGTON EVENT',
    kp: 9,
    solarWindSpeed: 2000,
    bz: -30,
    description: '1859-level catastrophic storm',
    color: 'red'
  }
];

interface StormDesignerProps {
  onApply: (params: { kp: number; solarWindSpeed: number; bz: number }) => void;
  onReset: () => void;
  isActive: boolean;
}

/**
 * StormDesigner - "What-If" Simulation Lab
 * Bypass live data to simulate extreme events
 * Educational tool for understanding storm impacts
 */
export default function StormDesigner({ onApply, onReset, isActive }: StormDesignerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customKp, setCustomKp] = useState(5);
  const [customWind, setCustomWind] = useState(600);
  const [customBz, setCustomBz] = useState(-10);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const applyPreset = (preset: StormPreset) => {
    setSelectedPreset(preset.name);
    setCustomKp(preset.kp);
    setCustomWind(preset.solarWindSpeed);
    setCustomBz(preset.bz);
    onApply({
      kp: preset.kp,
      solarWindSpeed: preset.solarWindSpeed,
      bz: preset.bz
    });
  };

  const applyCustom = () => {
    setSelectedPreset('CUSTOM');
    onApply({
      kp: customKp,
      solarWindSpeed: customWind,
      bz: customBz
    });
  };

  const handleReset = () => {
    setSelectedPreset(null);
    onReset();
  };

  const exportScenario = () => {
    const scenario = {
      kp: customKp,
      solarWindSpeed: customWind,
      bz: customBz,
      timestamp: new Date().toISOString(),
      preset: selectedPreset
    };
    const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storm-scenario-${Date.now()}.json`;
    a.click();
  };

  const importScenario = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const scenario = JSON.parse(event.target?.result as string);
        setCustomKp(scenario.kp);
        setCustomWind(scenario.solarWindSpeed);
        setCustomBz(scenario.bz);
        applyCustom();
      } catch (err) {
        console.error('Invalid scenario file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Floating "SIMULATION" Badge when active */}
      {isActive && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-pulse">
          <div className="bg-red-900/90 border-2 border-red-500 rounded-lg px-4 py-2 shadow-[0_0_30px_rgba(255,0,0,0.6)]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-300 animate-bounce" />
              <span className="text-red-200 font-bold text-sm">SIMULATION MODE ACTIVE</span>
              <button onClick={handleReset} className="text-red-300 hover:text-white ml-2">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-[150] px-3 py-8 rounded-l-lg font-bold text-sm transition-all ${
          isActive 
            ? 'bg-red-600 border-2 border-red-400 text-white shadow-[0_0_20px_rgba(255,0,0,0.6)]' 
            : 'bg-purple-900/80 border-2 border-purple-500 text-purple-200 hover:bg-purple-800'
        }`}
        style={{ writingMode: 'vertical-rl' }}
      >
        ⚡ STORM LAB
      </button>

      {/* Side Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-black/95 border-l-2 border-purple-500 z-[140] overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-purple-500">
              <h2 className="text-2xl font-bold text-purple-300 mb-1">⚡ STORM DESIGNER</h2>
              <p className="text-xs text-gray-400">Simulate extreme space weather events</p>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-purple-400 mb-2">QUICK SCENARIOS</h3>
              <div className="space-y-2">
                {STORM_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedPreset === preset.name
                        ? 'bg-purple-900 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-gray-900/50 border-gray-700 hover:border-purple-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{preset.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded bg-${preset.color}-900 text-${preset.color}-300 border border-${preset.color}-500`}>
                        Kp {preset.kp}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Parameters */}
            <div className="mb-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
              <h3 className="text-sm font-bold text-purple-400 mb-3">CUSTOM PARAMETERS</h3>
              
              {/* Kp Slider */}
              <div className="mb-4">
                <label className="text-xs text-gray-300 block mb-1">
                  Kp Index: <span className="font-bold text-purple-300">{customKp.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="9"
                  step="0.1"
                  value={customKp}
                  onChange={(e) => setCustomKp(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                  <span>Quiet</span>
                  <span>Extreme</span>
                </div>
              </div>

              {/* Solar Wind Slider */}
              <div className="mb-4">
                <label className="text-xs text-gray-300 block mb-1">
                  Solar Wind: <span className="font-bold text-purple-300">{customWind} km/s</span>
                </label>
                <input
                  type="range"
                  min="250"
                  max="2500"
                  step="10"
                  value={customWind}
                  onChange={(e) => setCustomWind(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                  <span>250</span>
                  <span>2500</span>
                </div>
              </div>

              {/* Bz Slider */}
              <div className="mb-4">
                <label className="text-xs text-gray-300 block mb-1">
                  IMF Bz: <span className="font-bold text-purple-300">{customBz.toFixed(1)} nT</span>
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  step="0.5"
                  value={customBz}
                  onChange={(e) => setCustomBz(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                  <span>South</span>
                  <span>North</span>
                </div>
              </div>

              <button
                onClick={applyCustom}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 border border-purple-400 rounded-lg text-white font-bold text-sm transition-all"
              >
                APPLY CUSTOM
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                RESET TO LIVE DATA
              </button>

              <div className="flex gap-2">
                <button
                  onClick={exportScenario}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-500 rounded-lg text-blue-300 text-xs transition-all"
                >
                  <Download className="w-3 h-3" />
                  EXPORT
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-900/50 hover:bg-green-800/50 border border-green-500 rounded-lg text-green-300 text-xs transition-all cursor-pointer">
                  <Upload className="w-3 h-3" />
                  IMPORT
                  <input type="file" accept=".json" onChange={importScenario} className="hidden" />
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-purple-900/20 border border-purple-700 rounded-lg text-[10px] text-purple-200">
              <p className="mb-2">
                <strong>Educational Tool:</strong> Simulate extreme events like the 1859 Carrington Event or future G5 storms.
              </p>
              <p>
                <strong>Note:</strong> Simulation mode overrides live NOAA data. Reset to return to real-time monitoring.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
