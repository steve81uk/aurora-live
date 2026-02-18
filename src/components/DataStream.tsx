import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';
import { getLiveStreamData, getTimeAgo } from '../services/dataStreamService';
import type { DataMetric } from '../types/dataStream';
import type { AppTheme } from '../types/mythic';

interface DataStreamProps {
  mythicTheme: AppTheme;
  refreshInterval?: number;
}

export function DataStream({ mythicTheme, refreshInterval = 60000 }: DataStreamProps) {
  const [metrics, setMetrics] = useState<DataMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLiveStreamData();
        setMetrics(data);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stream data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Zap className="w-3 h-3" />
          <span>NEURAL DATA STREAM</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Clock className="w-3 h-3" />
          <span>{getTimeAgo(lastUpdate)}</span>
        </div>
      </div>

      {/* Scrolling Cards */}
      <div className="overflow-x-auto overflow-y-hidden hide-scrollbar snap-x snap-mandatory">
        <div className="flex gap-3 pb-2">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} mythicTheme={mythicTheme} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ metric, mythicTheme }: { metric: DataMetric; mythicTheme: AppTheme }) {
  const getMetricName = (): string => {
    if (mythicTheme === 'NORSE' && metric.mythicName?.norse) {
      return metric.mythicName.norse;
    }
    return metric.name;
    return metric.name;
  };

  const getStatusColor = (): string => {
    switch (metric.status) {
      case 'critical':
        return 'border-red-500/40 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/40 bg-yellow-500/10';
      default:
        return 'border-cyan-500/20 bg-black/20';
    }
  };

  const getValueColor = (): string => {
    switch (metric.status) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-cyan-400';
    }
  };

  const getTrendIcon = () => {
    const iconClass = "w-3 h-3";
    switch (metric.trend) {
      case 'rising':
        return <TrendingUp className={`${iconClass} text-red-400`} />;
      case 'falling':
        return <TrendingDown className={`${iconClass} text-green-400`} />;
      default:
        return <Minus className={`${iconClass} text-gray-400`} />;
    }
  };

  const getSourceIcon = (): string => {
    const icons: Record<string, string> = {
      NOAA: '🛰️',
      NASA: '🚀',
      DSCOVR: '🌐',
      GOES: '📡',
      HEIMDALL: mythicTheme === 'NORSE' ? '🎺' : '👁️',
      COMPUTED: mythicTheme === 'NORSE' ? '⚔️' : '🧮',
    };
    return icons[metric.source] || '📊';
  };

  return (
    <div
      className={`snap-start flex-shrink-0 w-56 rounded-lg border backdrop-blur-md p-3 transition-all duration-300 hover:shadow-lg ${getStatusColor()}`}
      style={{
        boxShadow: metric.status === 'critical'
          ? '0 0 20px rgba(239, 68, 68, 0.3)'
          : metric.status === 'warning'
          ? '0 0 15px rgba(234, 179, 8, 0.2)'
          : 'none',
      }}
    >
      {/* Top Row: Source & Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-xs text-white/50">
          <span>{getSourceIcon()}</span>
          <span>{metric.source}</span>
        </div>
        <div className="text-xs text-white/40">
          {getTimeAgo(metric.timestamp)}
        </div>
      </div>

      {/* Metric Name */}
      <div className="text-xs font-semibold text-white/70 mb-1">
        {getMetricName()}
      </div>

      {/* Value & Trend */}
      <div className="flex items-baseline justify-between mb-2">
        <div className={`text-2xl font-bold ${getValueColor()}`}>
          {metric.value}
          <span className="text-sm ml-1 text-white/50">{metric.unit}</span>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {metric.trendDelta !== 0 && (
            <span className="text-xs text-white/50">
              {metric.trendDelta > 0 ? '+' : ''}
              {metric.trendDelta}%
            </span>
          )}
        </div>
      </div>

      {/* Sparkline (mini historical chart) */}
      {metric.historical && (
        <div className="h-8 mb-2">
          <Sparkline data={metric.historical} color={getValueColor()} />
        </div>
      )}

      {/* Confidence Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Confidence</span>
          <span className="text-white/60 font-mono">{metric.confidence}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              metric.confidence >= 90
                ? 'bg-green-400'
                : metric.confidence >= 70
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`}
            style={{ width: `${metric.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 200;
  const height = 32;
  const step = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * step;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color.replace('text-', '')}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
    </svg>
  );
}
