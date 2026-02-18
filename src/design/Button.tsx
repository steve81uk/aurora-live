import type { ReactNode } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { tokens } from '../design/tokens';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    font-mono font-bold uppercase tracking-wide
    border transition-all duration-200
    pointer-events-auto
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-sm',
    md: 'px-4 py-2 text-sm rounded-sm',
    lg: 'px-6 py-3 text-base rounded-sm',
  };
  
  const variantStyles = {
    primary: `
      bg-[${tokens.colors.accent}] 
      border-[${tokens.colors.accent}] 
      text-black
      hover:bg-[${tokens.colors.accentHover}]
      active:scale-95
    `,
    secondary: `
      bg-transparent
      border-[${tokens.colors.accent}]
      text-[${tokens.colors.accent}]
      hover:bg-[${tokens.colors.accentDim}]
      active:scale-95
    `,
    ghost: `
      bg-transparent
      border-transparent
      text-white
      hover:bg-white/10
      active:scale-95
    `,
    subtle: `
      bg-white/5
      border-white/10
      text-white/70
      hover:bg-white/10
      hover:text-white
      active:scale-95
    `,
  };
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
