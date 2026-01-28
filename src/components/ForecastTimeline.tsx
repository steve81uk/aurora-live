import { TrendingUp } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import type { KpIndexData } from '../types/aurora';

interface ForecastTimelineProps {
  predictions?: KpIndexData[];
}

const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return timestamp;
  }
};

export function ForecastTimeline({ predictions = [] }: ForecastTimelineProps) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-cyan-400/50">
        <p className="text-[10px] font-mono">NO FORECAST DATA</p>
      </div>
    );
  }

  const chartData = predictions.map((pred, idx) => ({
    time: formatTime(pred.timestamp),
    kp: pred.kpValue,
    status: pred.status,
    index: idx
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black border border-cyan-500 p-1.5">
          <p className="text-cyan-400 font-black text-sm font-mono">KP {data.kp.toFixed(1)}</p>
          <p className="text-[9px] text-cyan-600 font-mono uppercase">{data.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <h3 className="text-[11px] font-black tracking-widest text-cyan-400">3-HOUR FORECAST</h3>
      </div>

      <ResponsiveContainer width="100%" height="100%" className="flex-1">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="kpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ffff" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#00ffff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="time" 
            stroke="#00ffff"
            strokeOpacity={0.3}
            tick={{ fill: '#00ffff', fontSize: 9, fontFamily: 'Share Tech Mono, monospace' }}
            tickLine={{ stroke: '#00ffff', strokeOpacity: 0.3 }}
          />
          
          <YAxis 
            domain={[0, 9]} 
            stroke="#00ffff"
            strokeOpacity={0.3}
            tick={{ fill: '#00ffff', fontSize: 10, fontFamily: 'Share Tech Mono, monospace' }}
            tickLine={{ stroke: '#00ffff', strokeOpacity: 0.3 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={5} 
            stroke="#ffff00" 
            strokeDasharray="3 3" 
            strokeOpacity={0.5}
            label={{ 
              value: 'STORM', 
              fill: '#ffff00', 
              fontSize: 9,
              fontFamily: 'Share Tech Mono, monospace',
              position: 'right'
            }}
          />
          
          <Area 
            type="monotone" 
            dataKey="kp" 
            stroke="#00ffff" 
            strokeWidth={2}
            fill="url(#kpGradient)"
            isAnimationActive={true}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
