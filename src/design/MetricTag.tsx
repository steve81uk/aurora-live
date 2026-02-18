import type { ReactNode } from 'react';
import { metricStyles } from '../design/tokens';

interface MetricTagProps {
  label: string;
  value: ReactNode;
  unit?: string;
  status?: 'normal' | 'success' | 'warning' | 'error';
  className?: string;
}

export function MetricTag({ 
  label, 
  value, 
  unit,
  status = 'normal',
  className = '' 
}: MetricTagProps) {
  const statusColors = {
    normal: 'text-white',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };
  
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span 
        className="font-mono text-xs text-white/50 uppercase tracking-wider"
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span 
          className={`font-mono text-lg font-bold tabular-nums ${statusColors[status]}`}
        >
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-white/40">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
