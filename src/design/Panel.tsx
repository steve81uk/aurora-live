import type { ReactNode } from 'react';
import type { HTMLAttributes } from 'react';
import { glassmorphism } from '../design/tokens';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
}

export function Panel({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}: PanelProps) {
  const variantStyles = {
    default: `
      bg-black/60 
      backdrop-blur-xl 
      border border-white/10
      shadow-md
    `,
    elevated: `
      bg-black/80
      backdrop-blur-xl
      border border-white/20
      shadow-lg
    `,
    subtle: `
      bg-black/40
      backdrop-blur-md
      border border-white/5
      shadow-sm
    `,
  };
  
  return (
    <div
      className={`rounded-sm ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
