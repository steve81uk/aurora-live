import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsiblePanelProps {
  title: string;
  previewValue: string;
  previewLabel?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsiblePanel({ 
  title, 
  previewValue, 
  previewLabel,
  icon, 
  children, 
  defaultExpanded = false 
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div 
      className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl transition-all duration-300 hover:border-cyan-400/50 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-cyan-400">{icon}</div>}
          <div className="text-left">
            <h3 className="text-sm font-black tracking-wide text-white">{title}</h3>
            {previewLabel && (
              <p className="text-xs text-cyan-200/70 mt-0.5">{previewLabel}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
              {previewValue}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-cyan-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50 group-hover:text-cyan-400 transition-colors" />
          )}
        </div>
      </button>
      
      <div 
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 pt-0 border-t border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
