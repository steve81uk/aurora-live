import React from 'react';

interface RadiationBadgeProps {
  level: 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | string;
}

export function RadiationBadge({ level }: RadiationBadgeProps) {
  const col =
    level === 'S0' ? '#22d3ee' :
    level === 'S1' ? '#4ade80' :
    level === 'S2' ? '#facc15' :
    level === 'S3' ? '#fb923c' :
    level === 'S4' ? '#ef4444' :
    level === 'S5' ? '#dc2626' : '#6b7280';
  const label = level.toUpperCase();
  return (
    <div className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest"
      style={{ color: col, border: `1px solid ${col}40`, boxShadow: `0 0 6px ${col}60` }}>
      {label}
    </div>
  );
}
