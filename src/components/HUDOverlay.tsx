import { useState, useEffect, useRef } from 'react';
import { MapPin, Activity, Wind, TrendingUp, TrendingDown, Clock, AlertTriangle, Radio, Locate, Gauge, Eye, Bell, Camera, Zap, Maximize } from 'lucide-react';
import type { Location, KpIndexData, SolarWind, ForecastData, AuroraVisibility } from '../types/aurora';
import { LocationSelector } from './LocationSelector';
import { PeakTimer } from './PeakTimer';
import { HISTORICAL_EVENTS } from '../constants/historicalEvents';

interface HUDOverlayProps {
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
  kpData?: KpIndexData;
  solarWind?: SolarWind;
  forecast?: ForecastData;
  visibility?: AuroraVisibility;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  isOnline: boolean;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

interface DataHistory {
  timestamp: number;
  speed: number;
  density: number;
  kp: number;
}


function CircularProgress({ value, max = 100, size = 80, strokeWidth = 8, color = '#06b6d4' }: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function Sparkline({ data, width = 100, height = 30, color = '#06b6d4' }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function TrendIndicator({ current, previous }: {
  current: number;
  previous: number;
}) {
  const diff = current - previous;
  const percentChange = previous !== 0 ? Math.abs((diff / previous) * 100) : 0;
  
  if (Math.abs(diff) < 0.01) return null;

  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
      {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{percentChange.toFixed(1)}%</span>
    </div>
  );
}

export function HUDOverlay({
  selectedLocation,
  onLocationChange,
  kpData,
  solarWind,
  forecast,
  visibility,
  loading,
  error,
  onRefresh,
  isOnline,
  currentDate,
  onDateChange
}: HUDOverlayProps) {
  const [liveData, setLiveData] = useState<{
    kpData?: KpIndexData;
    solarWind?: SolarWind;
    forecast?: ForecastData;
    visibility?: AuroraVisibility;
  } | null>(null);
  const [isLinking, setIsLinking] = useState(true);
  const [dataHistory, setDataHistory] = useState<DataHistory[]>([]);
  const previousDataRef = useRef<{ speed: number; density: number; kp: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [scienceMode, setScienceMode] = useState(false); // Simple/Advanced toggle
  const [selectedHistoricalEvent, setSelectedHistoricalEvent] = useState<string>('live'); // Historical bookmarks
  const [missionLog, setMissionLog] = useState<Array<{date: Date; kp: number; speed: number}>>([]);
  const [showToast, setShowToast] = useState(false);
  
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const threeDaysLater = Date.now() + 3 * 24 * 60 * 60 * 1000;
  const isHistorical = currentDate.getTime() < Date.now();
  
  // Notification system
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastAlertDate, setLastAlertDate] = useState<string | null>(null);
  const hasAlertedToday = lastAlertDate === new Date().toDateString();

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setGeoLocation(coords);
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch('/live_data.json');
        if (!response.ok) throw new Error('File not found');
        const data = await response.json();
        setLiveData(data);
        setIsLinking(false);

        const newEntry: DataHistory = {
          timestamp: Date.now(),
          speed: data.solarWind?.speed || 0,
          density: data.solarWind?.density || 0,
          kp: data.kpData?.kpValue || 0
        };

        setDataHistory(prev => {
          const updated = [...prev, newEntry];
          return updated.slice(-10);
        });
      } catch (err) {
        setIsLinking(true);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Playback effect for time travel
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      onDateChange(new Date(currentDate.getTime() + playbackSpeed * 60 * 60 * 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, currentDate, onDateChange]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);
  
  const activeKpData = liveData?.kpData || kpData;
  const activeSolarWind = liveData?.solarWind || solarWind;
  const activeForecast = liveData?.forecast || forecast;
  const activeVisibility = liveData?.visibility || visibility;

  const currentData = {
    speed: activeSolarWind?.speed || 0,
    density: activeSolarWind?.density || 0,
    kp: activeKpData?.kpValue || 0
  };
  
  // Monitor Kp index and trigger alerts
  useEffect(() => {
    const kp = currentData.kp;
    
    if (kp > 4 && !hasAlertedToday && notificationPermission === 'granted') {
      // Trigger notification
      const notification = new Notification('⚠️ Geomagnetic Storm Alert', {
        body: `Kp Index: ${kp.toFixed(1)} - Auroras may be visible at lower latitudes!`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'kp-alert',
        requireInteraction: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      setLastAlertDate(new Date().toDateString());
      console.log('🚨 Kp Alert triggered! Kp =', kp);
    }
  }, [activeKpData?.kpValue, hasAlertedToday, notificationPermission]);
  
  // Test alert function
  const testAlert = () => {
    if (notificationPermission === 'granted') {
      new Notification('🌟 Test Alert', {
        body: 'Notifications are working! You will be alerted when Kp > 4.',
        icon: '/favicon.ico'
      });
    } else if (notificationPermission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          new Notification('✅ Notifications Enabled', {
            body: 'You will now receive storm alerts!',
            icon: '/favicon.ico'
          });
        }
      });
    } else {
      alert('Notifications are blocked. Please enable them in your browser settings.');
    }
  };
  
  // Snapshot/Mission Log function
  const captureSnapshot = () => {
    const snapshot = {
      date: currentDate,
      kp: currentData.kp,
      speed: currentData.speed
    };
    setMissionLog(prev => [...prev, snapshot]);
    setShowToast(true);
    console.log('📸 Snapshot captured:', snapshot);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // Historical event selector
  const jumpToHistoricalEvent = (eventId: string) => {
    setSelectedHistoricalEvent(eventId);
    if (eventId === 'live') {
      onDateChange(new Date());
      return;
    }
    
    const event = HISTORICAL_EVENTS.find(e => e.id === eventId);
    if (event) {
      onDateChange(event.date);
      console.log('🕰️ Jumped to:', event.name, 'Kp:', event.kpValue);
    }
  };

  const getKpStatus = () => {
    if (isLinking) return { text: 'LINKING...', color: 'text-cyan-400', bg: 'bg-cyan-500/20', level: 'STANDBY' };
    const kp = currentData.kp;
    if (kp < 3) return { text: 'NOMINAL', color: 'text-green-400', bg: 'bg-green-500/20', level: 'G0' };
    if (kp < 5) return { text: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-500/20', level: 'G1' };
    if (kp < 7) return { text: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', level: 'G2' };
    return { text: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', level: 'G3+' };
  };

  const status = getKpStatus();
  const speedHistory = dataHistory.map(d => d.speed);
  const hasPrevious = previousDataRef.current !== null;
  
  // Red alert pulsing
  const isRedAlert = currentData.kp >= 5;

  useEffect(() => {
    if (currentData.speed > 0) {
      previousDataRef.current = { ...currentData };
    }
  }, [currentData.speed, currentData.density, currentData.kp]);

  return (
    <div className={`absolute inset-0 pointer-events-none font-mono ${isRedAlert ? 'animate-pulse-red' : ''}`}>
      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 30px 10px rgba(239, 68, 68, 0.8); }
        }
        .animate-pulse-red {
          animation: pulse-red 2s ease-in-out infinite;
        }
      `}</style>
      <div
        className={`pointer-events-auto ${isRedAlert ? 'border-4 border-red-500' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr 320px',
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateAreas: `
            "header header header"
            "left-panel main right-panel"
            "bottom bottom bottom"
          `,
          height: '100vh',
          gap: '0'
        }}
      >
        {/* Top Bar */}
        <div
          style={{ gridArea: 'header' }}
          className="bg-black/10 backdrop-blur-lg shadow-2xl shadow-cyan-500/10 border-b border-white/20 px-6 py-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 pl-2">
            <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <h1 className="text-3xl font-black text-white tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] [text-shadow:_0_0_15px_rgba(0,0,0,0.8)]">
              SOLAR ADMIRAL
            </h1>
          </div>
          
          <div className="flex items-center gap-4 pr-2">
            <button
              onClick={() => document.documentElement.requestFullscreen()}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/40 border-2 border-purple-400 rounded transition-all duration-200 hover:scale-105 active:scale-95"
              title="Enter Fullscreen (F)"
            >
              <Maximize className="w-5 h-5 text-purple-300" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-cyan-100 font-bold [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">RISK LEVEL:</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-black ${status.bg} ${status.color} border-2 border-current [text-shadow:_0_0_10px_rgba(0,0,0,0.8)]`}>
                {status.level}
              </span>
            </div>
            <div className="text-sm text-cyan-100 font-semibold [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">
              {activeKpData?.timestamp && new Date(activeKpData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Left Panel - Solar Wind & Magnetic Field */}
        <div
          style={{ gridArea: 'left-panel' }}
          className="bg-black/10 backdrop-blur-lg shadow-xl shadow-cyan-500/10 border-r border-white/10 rounded-xl overflow-y-auto p-6 space-y-4"
        >
          <section className="p-6 rounded-lg border border-white/10 shadow-lg bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <Wind className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">SOLAR WIND</h3>
            </div>
            
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg text-cyan-100 font-semibold [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">SPEED</span>
                {hasPrevious && previousDataRef.current && (
                  <TrendIndicator
                    current={currentData.speed}
                    previous={previousDataRef.current.speed}
                  />
                )}
              </div>
              <div className="text-5xl font-black text-white mb-1">
                {currentData.speed}
                <span className="text-2xl ml-2 text-cyan-100">km/s</span>
              </div>
              {speedHistory.length > 1 && (
                <div className="mt-2">
                  <Sparkline data={speedHistory} width={240} height={30} color="#a78bfa" />
                </div>
              )}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg text-cyan-100 font-semibold">DENSITY</span>
                {hasPrevious && previousDataRef.current && (
                  <TrendIndicator
                    current={currentData.density}
                    previous={previousDataRef.current.density}
                  />
                )}
              </div>
              <div className="text-3xl font-bold text-white">
                {currentData.density.toFixed(2)}
                <span className="text-lg ml-2 text-cyan-100">p/cm³</span>
              </div>
            </div>

            <div>
              <div className="text-lg text-cyan-100 font-semibold mb-2">Bz COMPONENT</div>
              <div className="text-3xl font-bold text-white">
                {activeSolarWind?.bz?.toFixed(2) || '0.00'}
                <span className="text-lg ml-2 text-cyan-100">nT</span>
              </div>
            </div>
            
            {/* Science Mode Toggle */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <button
                onClick={() => setScienceMode(!scienceMode)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-bold transition-all ${
                  scienceMode 
                    ? 'bg-purple-600/30 border-2 border-purple-400 text-purple-300' 
                    : 'bg-black/30 border-2 border-slate-500 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <Zap className="w-5 h-5" />
                {scienceMode ? 'ADVANCED MODE' : 'SIMPLE MODE'}
              </button>
            </div>
            
            {/* Advanced Metrics - Only show in Science Mode */}
            {scienceMode && (
              <div className="mt-6 pt-6 border-t border-purple-500/30 space-y-4">
                <div className="text-sm font-bold text-purple-400 mb-3">ADVANCED METRICS</div>
                
                <div>
                  <div className="text-sm text-cyan-200 mb-1">Proton Density</div>
                  <div className="text-2xl font-bold text-white">
                    {(currentData.density * 1.67).toFixed(2)}
                    <span className="text-sm ml-2 text-cyan-100">×10⁻⁶ kg/m³</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-cyan-200 mb-1">Solar Wind Temp</div>
                  <div className="text-2xl font-bold text-white">
                    {((currentData.speed * currentData.speed * 0.01) / 1000).toFixed(0)}K
                    <span className="text-sm ml-2 text-cyan-100">(approx)</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-cyan-200 mb-1">Estimated Dst</div>
                  <div className="text-2xl font-bold text-white">
                    {(-(currentData.kp * currentData.kp * 15)).toFixed(0)}
                    <span className="text-sm ml-2 text-cyan-100">nT</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-cyan-200 mb-1">Dynamic Pressure</div>
                  <div className="text-2xl font-bold text-white">
                    {(currentData.density * currentData.speed * currentData.speed * 1.67e-6).toFixed(2)}
                    <span className="text-sm ml-2 text-cyan-100">nPa</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-cyan-200 mb-1">Electric Field (Ey)</div>
                  <div className="text-2xl font-bold text-white">
                    {((currentData.speed * Math.abs(activeSolarWind?.bz || 0)) / 1000).toFixed(2)}
                    <span className="text-sm ml-2 text-cyan-100">mV/m</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="p-6 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <MapPin className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider">OBSERVATION POINT</h3>
            </div>
            <div className="text-xl font-bold text-white mb-4">
              {selectedLocation.name}
            </div>
            <LocationSelector onLocationChange={onLocationChange} />
            
            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border-2 border-cyan-400/50 rounded text-lg font-bold text-white transition-all disabled:opacity-50"
            >
              <Locate className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
              {locating ? 'LOCATING...' : 'LOCATE ME'}
            </button>

            {geoLocation && (
              <div className="mt-4 p-3 bg-black/50 rounded text-lg text-cyan-100">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">LAT:</span>
                  <span>{geoLocation.lat.toFixed(4)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">LON:</span>
                  <span>{geoLocation.lon.toFixed(4)}°</span>
                </div>
              </div>
            )}

            <div className="mt-5 pt-5 border-t border-cyan-500/30">
              <PeakTimer location={selectedLocation} />
            </div>
          </section>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400/50 rounded text-lg font-bold text-white transition-all disabled:opacity-50"
          >
            <Clock className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'REFRESHING...' : 'REFRESH DATA'}
          </button>
          
          <button
            onClick={testAlert}
            className={`w-full flex items-center justify-center gap-2 px-5 py-4 border-2 rounded text-lg font-bold transition-all ${
              notificationPermission === 'granted' 
                ? 'bg-green-500/20 hover:bg-green-500/30 border-green-400/50 text-green-400'
                : notificationPermission === 'denied'
                ? 'bg-red-500/20 border-red-400/50 text-red-400 cursor-not-allowed'
                : 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-400/50 text-yellow-400'
            }`}
          >
            <Bell className="w-6 h-6" />
            {notificationPermission === 'granted' ? 'TEST ALERT' : 
             notificationPermission === 'denied' ? 'BLOCKED' : 'ENABLE ALERTS'}
          </button>
          
          {/* Snapshot Button */}
          <button
            onClick={captureSnapshot}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400/50 rounded text-lg font-bold text-white transition-all"
          >
            <Camera className="w-6 h-6" />
            SNAPSHOT
          </button>
          
          {/* Toast Notification */}
          {showToast && (
            <div className="p-4 bg-green-500/90 border-2 border-green-300 rounded text-center animate-bounce">
              <div className="text-lg font-bold text-white">📸 Mission Log Saved!</div>
              <div className="text-sm text-green-100 mt-1">
                Kp: {currentData.kp.toFixed(1)} | Speed: {currentData.speed} km/s
              </div>
            </div>
          )}
          
          {/* Historical Events Dropdown */}
          <div className="p-4 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
            <label className="block text-sm font-bold text-cyan-100 mb-2">TIME JUMP</label>
            <select
              value={selectedHistoricalEvent}
              onChange={(e) => jumpToHistoricalEvent(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 backdrop-blur-sm border-2 border-cyan-400/50 rounded text-white font-bold text-base"
            >
              <option value="live">🔴 LIVE NOW</option>
              <optgroup label="EXTREME EVENTS">
                {HISTORICAL_EVENTS.filter(e => e.kpValue >= 9).map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.date.getFullYear()})
                  </option>
                ))}
              </optgroup>
              <optgroup label="MAJOR STORMS">
                {HISTORICAL_EVENTS.filter(e => e.kpValue === 8).map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.date.getFullYear()})
                  </option>
                ))}
              </optgroup>
            </select>
            {selectedHistoricalEvent !== 'live' && (
              <div className="mt-3 p-3 bg-purple-900/30 border border-purple-400/50 rounded">
                <div className="text-sm text-purple-300 font-bold">
                  {HISTORICAL_EVENTS.find(e => e.id === selectedHistoricalEvent)?.name}
                </div>
                <div className="text-xs text-purple-200 mt-1">
                  Simulated Kp: {HISTORICAL_EVENTS.find(e => e.id === selectedHistoricalEvent)?.kpValue}
                </div>
              </div>
            )}
          </div>
          
          {/* Mission Log Summary */}
          {missionLog.length > 0 && (
            <div className="p-4 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
              <div className="text-sm font-bold text-cyan-100 mb-2">
                MISSION LOG ({missionLog.length} snapshots)
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {missionLog.slice(-5).reverse().map((log, idx) => (
                  <div key={idx} className="text-xs text-cyan-200 bg-black/30 p-2 rounded">
                    {log.date.toLocaleTimeString()} | Kp: {log.kp.toFixed(1)} | {log.speed} km/s
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-5 bg-red-500/20 border-2 border-red-400/50 rounded animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <span className="text-lg font-bold text-red-400">CONNECTION ERROR</span>
              </div>
              <p className="text-lg text-white">{error}</p>
            </div>
          )}
        </div>

        {/* Right Panel - AI Predictions */}
        <div
          style={{ gridArea: 'right-panel' }}
          className="bg-black/10 backdrop-blur-lg shadow-xl shadow-cyan-500/10 border-l border-white/10 rounded-xl overflow-y-auto p-6 space-y-4"
        >
          <section className="p-6 rounded-lg border border-white/10 shadow-lg bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">KP INDEX</h3>
            </div>
            
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <CircularProgress value={currentData.kp} max={9} size={140} strokeWidth={12} color="#4ade80" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black text-white [text-shadow:_0_0_15px_rgba(0,0,0,0.8)]">
                    {currentData.kp.toFixed(1)}
                  </div>
                  <div className="text-lg text-cyan-100 font-semibold [text-shadow:_0_0_10px_rgba(0,0,0,0.5)]">/ 9.0</div>
                </div>
              </div>
            </div>

            {hasPrevious && previousDataRef.current && (
              <div className="flex justify-center">
                <TrendIndicator
                  current={currentData.kp}
                  previous={previousDataRef.current.kp}
                />
              </div>
            )}

            <div className={`mt-4 px-4 py-3 rounded-full text-lg font-bold text-center ${status.color} border-2 border-current [text-shadow:_0_0_10px_rgba(0,0,0,0.8)]`}>
              {status.text}
            </div>
          </section>

          <section className="p-6 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <Eye className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider">AURORA PROBABILITY</h3>
            </div>
            
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <CircularProgress
                  value={activeVisibility?.percentage || 0}
                  max={100}
                  size={140}
                  strokeWidth={12}
                  color="#3b82f6"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black text-white">
                    {activeVisibility?.percentage || 0}
                  </div>
                  <div className="text-lg text-cyan-100 font-semibold">%</div>
                </div>
              </div>
            </div>

            <div className="text-center text-lg text-cyan-100 font-semibold">
              {activeVisibility?.quality || 'Unknown'}
            </div>
          </section>

          <section className="p-6 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <Radio className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider">CME ARRIVAL</h3>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-3">
                {activeSolarWind?.speed ? ((150000000 / (activeSolarWind.speed * 60 * 60 * 24))).toFixed(1) : '--'}
              </div>
              <div className="text-lg text-cyan-100 font-semibold">Days to Earth</div>
            </div>
          </section>

          <section className="p-6 rounded-lg border border-white/20 shadow-lg bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Gauge className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-cyan-100 tracking-wider">3-DAY FORECAST</h3>
            </div>
            <div className="space-y-3">
              {(activeForecast?.prediction || []).slice(0, 3).map((pred, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded border-2 border-white/10">
                  <span className="text-lg text-cyan-100 font-semibold">
                    {new Date(pred.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-xl font-bold text-white">
                    Kp {pred.kpValue.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom Bar - Time Warp Controls */}
        <div
          style={{ gridArea: 'bottom' }}
          className="bg-black/20 backdrop-blur-md shadow-xl shadow-cyan-500/10 border-t border-white/20 p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-100 tracking-wider">TIME WARP</h3>
            {isHistorical && (
              <span className="px-3 py-1 bg-orange-500/30 border border-orange-400/50 rounded text-sm font-bold text-orange-300">
                HISTORICAL MODE
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            {/* Date Display */}
            <div className="text-center">
              <div className="text-3xl font-black text-white">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xl text-cyan-100 font-semibold">
                {currentDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })} UTC
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onDateChange(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
                className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/50 rounded text-white font-bold"
                title="Back 1 day"
              >
                ◀◀
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-6 py-2 ${isPlaying ? 'bg-red-600/30 border-red-400/50' : 'bg-green-600/30 border-green-400/50'} border rounded text-white font-bold`}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>
              
              <button
                onClick={() => onDateChange(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
                className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/50 rounded text-white font-bold"
                title="Forward 1 day"
              >
                ▶▶
              </button>
              
              <button
                onClick={() => onDateChange(new Date())}
                className="px-4 py-2 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/50 rounded text-white font-bold"
              >
                NOW
              </button>
            </div>
            
            {/* Speed Selector */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-cyan-100 font-semibold">SPEED:</span>
              {[1, 10, 100, 1000].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-3 py-1 border rounded text-sm font-bold transition-all ${
                    playbackSpeed === speed
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-cyan-600/20 border-cyan-400/50 text-cyan-100 hover:bg-cyan-600/30'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
            
            {/* Timeline Slider */}
            <div className="relative">
              <input
                type="range"
                min={sevenDaysAgo}
                max={threeDaysLater}
                value={currentDate.getTime()}
                onChange={(e) => onDateChange(new Date(parseInt(e.target.value)))}
                className="w-full h-2 bg-cyan-900/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0891b2 ${((currentDate.getTime() - sevenDaysAgo) / (threeDaysLater - sevenDaysAgo)) * 100}%, #1e293b ${((currentDate.getTime() - sevenDaysAgo) / (threeDaysLater - sevenDaysAgo)) * 100}%)`
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-cyan-300">
                <span>-7 days</span>
                <span>NOW</span>
                <span>+3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
