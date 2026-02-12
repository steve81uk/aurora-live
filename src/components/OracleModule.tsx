/**
 * Oracle Module - The Metrics Room
 * 2D dashboard with AI predictions, metrics, and Grid Guardian scores
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Wind, Zap, Thermometer, Radio } from 'lucide-react';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  isHighKp: boolean;
}

function MetricTile({ icon, label, value, unit, status, isHighKp }: MetricTileProps) {
  const statusColors = {
    normal: 'border-green-500 bg-green-500/10',
    warning: 'border-yellow-500 bg-yellow-500/10',
    critical: 'border-red-500 bg-red-500/10'
  };

  return (
    <div 
      className={`
        backdrop-blur-md border-2 rounded-lg p-4
        ${statusColors[status]}
        ${isHighKp ? 'animate-pulse' : ''}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-cyan-400">{icon}</div>
        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{value}</span>
        <span className="text-gray-500 text-sm font-mono">{unit}</span>
      </div>
    </div>
  );
}

function GridGuardianGauge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#fbbf24'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="backdrop-blur-md bg-black/40 border-2 border-cyan-500 rounded-lg p-6">
      <h3 className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-4 text-center">
        Grid Guardian Score
      </h3>
      
      {/* Circular gauge */}
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#1f2937"
            strokeWidth="20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 80}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 10px ${getColor(score)})`
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-5xl font-bold text-white font-mono"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-gray-400 text-xs font-mono mt-1">RESILIENCE</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 font-mono">
          {score >= 80 ? '✅ OPTIMAL GRID STATUS' :
           score >= 60 ? '⚠️ MODERATE RISK' :
           score >= 40 ? '⚠️ HIGH RISK' :
           '🚨 CRITICAL THREAT'}
        </p>
      </div>
    </div>
  );
}

export function OracleModule() {
  const { data, isLoading, quality } = useLiveSpaceWeather();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [gridScore, setGridScore] = useState(85);

  useEffect(() => {
    // Generate forecast data (mock for now - will use ML model later)
    const now = Date.now();
    const historical = Array.from({ length: 12 }, (_, i) => ({
      time: new Date(now - (12 - i) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: Math.max(0, Math.min(9, (data?.kpIndex?.kpValue || 3) + (Math.random() - 0.5) * 2)),
      predicted: null
    }));

    const future = Array.from({ length: 6 }, (_, i) => ({
      time: new Date(now + (i + 1) * 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      actual: null,
      predicted: Math.max(0, Math.min(9, (data?.kpIndex?.kpValue || 3) + (Math.random() - 0.5) * 3))
    }));

    setForecastData([...historical, ...future]);

    // Calculate Grid Guardian score based on current conditions
    const kp = data?.kpIndex?.kpValue || 0;
    const solarWind = data?.solarWind?.speed || 400;
    const score = Math.max(0, 100 - (kp * 8) - ((solarWind - 400) / 10));
    setGridScore(score);
  }, [data]);

  const kpValue = data?.kpIndex?.kpValue || 0;
  const isHighKp = kpValue > 5;

  return (
    <div className="w-screen h-screen bg-slate-950 overflow-hidden relative">
      {/* Scan-line overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: `
            linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
            linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
          `,
          backgroundSize: '100% 4px, 6px 100%'
        }}
      />

      {/* Header */}
      <div className="p-4 border-b border-cyan-900/50 backdrop-blur-md bg-black/20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cyan-400 font-mono tracking-widest">
            THE ORACLE // METRICS ROOM
          </h1>
          <div className="flex gap-6 text-xs font-mono text-gray-400">
            <span>LATENCY: <span className="text-green-400">{quality === 'excellent' ? '< 5s' : '~10s'}</span></span>
            <span>API: <span className={quality === 'excellent' ? 'text-green-400' : 'text-yellow-400'}>
              {quality.toUpperCase()}
            </span></span>
            <span>TIME: <span className="text-cyan-400">{new Date().toLocaleTimeString()}</span></span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-80px)]">
        {/* Forecast Window (cols 1-8) */}
        <div className="col-span-8 backdrop-blur-md bg-black/40 border-2 border-cyan-500 rounded-lg p-6">
          <h2 className="text-cyan-400 font-mono text-lg uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity size={20} />
            Neural Storm Forecast
          </h2>
          
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                style={{ fontSize: '12px', fontFamily: 'monospace' }}
              />
              <YAxis 
                stroke="#6b7280"
                domain={[0, 9]}
                ticks={[0, 3, 5, 7, 9]}
                style={{ fontSize: '12px', fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #06b6d4',
                  borderRadius: '8px',
                  fontFamily: 'monospace'
                }}
              />
              <Legend 
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual Kp"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#d946ef"
                strokeWidth={3}
                strokeDasharray="5 5"
                fill="url(#predictedGradient)"
                name="AI Predicted"
                dot={{ fill: '#d946ef', r: 4 }}
              />
              {/* Storm threshold lines */}
              <line y1="5" y2="5" stroke="#f59e0b" strokeDasharray="3 3" />
              <line y1="7" y2="7" stroke="#ef4444" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grid Guardian Gauge (cols 9-12) */}
        <div className="col-span-4">
          <GridGuardianGauge score={gridScore} />
        </div>

        {/* Data Tiles (bottom, full width) */}
        <div className="col-span-12 grid grid-cols-4 gap-4">
          <MetricTile
            icon={<Wind size={24} />}
            label="Solar Wind Speed"
            value={data?.solarWind?.speed?.toFixed(1) || '---'}
            unit="km/s"
            status={
              (data?.solarWind?.speed || 0) > 600 ? 'critical' :
              (data?.solarWind?.speed || 0) > 500 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Activity size={24} />}
            label="Proton Density"
            value={data?.solarWind?.density?.toFixed(1) || '---'}
            unit="p/cm³"
            status={
              (data?.solarWind?.density || 0) > 15 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Thermometer size={24} />}
            label="Temperature"
            value={data?.solarWind?.temperature ? (data.solarWind.temperature / 1000).toFixed(0) : '---'}
            unit="×10³ K"
            status="normal"
            isHighKp={isHighKp}
          />
          
          <MetricTile
            icon={<Zap size={24} />}
            label="IMF Bz"
            value={data?.solarWind?.bz?.toFixed(1) || '---'}
            unit="nT"
            status={
              (data?.solarWind?.bz || 0) < -10 ? 'critical' :
              (data?.solarWind?.bz || 0) < -5 ? 'warning' :
              'normal'
            }
            isHighKp={isHighKp}
          />
        </div>
      </div>

      {/* Deep Space Log (scrolling ticker) */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-cyan-900/50 p-2 overflow-hidden">
        <div className="flex items-center gap-4 animate-marquee">
          <span className="text-cyan-400 font-mono text-xs whitespace-nowrap">
            📡 DEEP SPACE LOG:
          </span>
          {data?.alerts?.map((alert: any, i: number) => (
            <span key={i} className="text-yellow-400 font-mono text-xs whitespace-nowrap">
              {alert.message || 'No recent events'} •
            </span>
          ))}
          {!data?.alerts?.length && (
            <span className="text-gray-500 font-mono text-xs whitespace-nowrap">
              No active space weather alerts • System nominal •
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
