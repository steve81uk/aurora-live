import React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * TacticalCard - Reusable glassmorphism mission-control card
 * 0.5px cyan border, backdrop blur, aurora gradient
 */

interface TacticalCardProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  active?: boolean;
}

export function TacticalCard({ title, children, icon: Icon, className = '', active = false }: TacticalCardProps) {
  return (
    <div 
      className={`
        relative
        bg-gradient-to-br from-black/80 to-cyan-900/10
        backdrop-blur-xl
        border border-cyan-400/50
        rounded-lg
        p-6
        transition-all duration-300
        hover:border-cyan-300
        ${active ? 'shadow-[0_0_15px_rgba(0,255,153,0.2)]' : 'shadow-lg shadow-cyan-500/10'}
        ${className}
      `}
      style={{
        borderWidth: '0.5px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cyan-500/20">
        {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
        <h3 
          className="font-['Rajdhani'] text-cyan-400 text-lg font-bold tracking-[0.2rem] uppercase"
        >
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="font-['Inter'] text-white/90 text-[0.8rem] leading-relaxed">
        {children}
      </div>

      {/* Aurora glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-green-500/0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none rounded-lg" />
    </div>
  );
}

/**
 * TacticalGrid - 4-column responsive wrapper
 */
interface TacticalGridProps {
  children: React.ReactNode;
  className?: string;
}

export function TacticalGrid({ children, className = '' }: TacticalGridProps) {
  return (
    <div 
      className={`
        grid 
        grid-cols-1 
        md:grid-cols-2 
        lg:grid-cols-4 
        gap-4
        ${className}
      `}
    >
      {children}
    </div>
  );
}
