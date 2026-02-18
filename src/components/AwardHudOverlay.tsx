import type { ReactNode } from 'react';
import { MetricTag } from '../design/MetricTag';
import { Button } from '../design/Button';

interface AwardHudOverlayProps {
  metrics?: {
    altitude?: string;
    velocity?: string;
    kpIndex?: number;
    solarWind?: string;
  };
  timelineLabel?: string;
  activeControl?: string;
  onControlChange?: (control: string) => void;
  children?: ReactNode;
}

export function AwardHudOverlay({ 
  metrics = {},
  timelineLabel = 'System nominal',
  activeControl = 'auto',
  onControlChange,
  children 
}: AwardHudOverlayProps) {
  const controls = ['auto', 'free', 'inspect'];
  
  return (
    <div className="hud-overlay">
      {/* Top metrics */}
      <div className="hud-metrics">
        {metrics.altitude && (
          <MetricTag 
            label="Altitude" 
            value={metrics.altitude} 
            unit="km"
          />
        )}
        {metrics.velocity && (
          <MetricTag 
            label="Velocity" 
            value={metrics.velocity} 
            unit="km/s"
          />
        )}
        {metrics.kpIndex !== undefined && (
          <MetricTag 
            label="Kp Index" 
            value={metrics.kpIndex.toFixed(1)}
            status={metrics.kpIndex >= 5 ? 'warning' : 'normal'}
          />
        )}
      </div>
      
      {/* Center content (children) */}
      <div className="hud-center">
        {children}
      </div>
      
      {/* Bottom controls */}
      <div className="hud-bottom">
        <div className="hud-timeline">
          <Button variant="ghost" size="sm">◀</Button>
          <span className="timeline-label">{timelineLabel}</span>
          <Button variant="ghost" size="sm">▶</Button>
        </div>
        
        <div className="hud-controls">
          {controls.map(control => (
            <button
              key={control}
              className={`chip ${activeControl === control ? 'is-active' : ''}`}
              onClick={() => onControlChange?.(control)}
            >
              {control === 'auto' ? 'Auto camera' : 
               control === 'free' ? 'Free fly' : 
               'Inspect object'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
