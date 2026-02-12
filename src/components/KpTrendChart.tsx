/**
 * KP Index Trend Chart
 * Displays 24-hour historical KP data with forecast overlay
 */

import { useEffect, useState } from 'react';
import { useLiveSpaceWeather } from '../hooks/useLiveSpaceWeather';

interface KpDataPoint {
  timestamp: Date;
  value: number;
  type: 'historical' | 'forecast';
}

export function KpTrendChart() {
  const { data } = useLiveSpaceWeather();
  const [historicalData, setHistoricalData] = useState<KpDataPoint[]>([]);
  
  useEffect(() => {
    // Fetch 24h historical data from NOAA
    async function fetchHistorical() {
      try {
        const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
        const jsonData = await response.json();
        
        // Get last 24 hours (1440 data points at 1-min intervals)
        const last24h = jsonData.slice(-1440);
        
        const parsed: KpDataPoint[] = last24h.map((item: any) => ({
          timestamp: new Date(item.time_tag),
          value: parseFloat(item.kp_index),
          type: 'historical' as const
        }));
        
        setHistoricalData(parsed);
      } catch (error) {
        console.error('Failed to fetch historical KP:', error);
      }
    }
    
    fetchHistorical();
    // Refresh every 60 seconds
    const interval = setInterval(fetchHistorical, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate chart dimensions
  const width = 800;
  const height = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Calculate scales
  const maxKp = 9;
  const minKp = 0;
  
  if (historicalData.length === 0) {
    return (
      <div className="bg-black/80 border border-cyan-500/50 rounded-lg p-4 font-mono text-cyan-400 text-xs">
        <div className="animate-pulse">Loading KP trend data...</div>
      </div>
    );
  }
  
  // Generate SVG path for line chart
  const points = historicalData.map((point, index) => {
    const x = (index / historicalData.length) * chartWidth;
    const y = chartHeight - ((point.value - minKp) / (maxKp - minKp)) * chartHeight;
    return `${x},${y}`;
  });
  
  const linePath = `M ${points.join(' L ')}`;
  
  // Generate area under curve
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;
  
  // Color based on current KP
  const currentKp = data?.kpIndex || 3;
  const lineColor = currentKp >= 5 ? '#ef4444' : currentKp >= 4 ? '#f59e0b' : '#4ade80';
  
  return (
    <div className="bg-black/90 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-md font-mono">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-cyan-400 font-bold text-sm">KP INDEX - 24 HOUR TREND</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">Current:</span>
          <span className={`font-bold text-lg ${currentKp >= 5 ? 'text-red-500' : currentKp >= 4 ? 'text-yellow-500' : 'text-green-400'}`}>
            {currentKp.toFixed(1)}
          </span>
        </div>
      </div>
      
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="kpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {[0, 3, 5, 7, 9].map(kp => {
            const y = chartHeight - ((kp - minKp) / (maxKp - minKp)) * chartHeight;
            return (
              <g key={kp}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={kp === 5 ? '#ef4444' : '#334155'}
                  strokeWidth={kp === 5 ? 2 : 1}
                  strokeDasharray={kp === 5 ? '4,4' : '2,2'}
                  opacity={kp === 5 ? 0.5 : 0.2}
                />
                <text
                  x={-10}
                  y={y + 4}
                  fill={kp === 5 ? '#ef4444' : '#64748b'}
                  fontSize="11"
                  textAnchor="end"
                  fontWeight={kp === 5 ? 'bold' : 'normal'}
                >
                  {kp}
                </text>
              </g>
            );
          })}
          
          {/* Area under curve */}
          <path
            d={areaPath}
            fill="url(#kpGradient)"
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Current value indicator */}
          {historicalData.length > 0 && (
            <circle
              cx={chartWidth}
              cy={chartHeight - ((currentKp - minKp) / (maxKp - minKp)) * chartHeight}
              r="4"
              fill={lineColor}
              className="animate-pulse"
            />
          )}
          
          {/* X-axis labels */}
          <text x={0} y={chartHeight + 25} fill="#64748b" fontSize="10">
            24h ago
          </text>
          <text x={chartWidth / 2} y={chartHeight + 25} fill="#64748b" fontSize="10" textAnchor="middle">
            12h ago
          </text>
          <text x={chartWidth} y={chartHeight + 25} fill="#64748b" fontSize="10" textAnchor="end">
            Now
          </text>
        </g>
      </svg>
      
      <div className="mt-3 text-[10px] text-gray-400 text-center">
        <span className="text-cyan-400">{historicalData.length}</span> data points • Updated every 60s
      </div>
    </div>
  );
}
