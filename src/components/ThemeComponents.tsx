/**
 * ThemeWrapper - Universal Aurora-Obsidian Theme Container
 * Wraps all UI elements with consistent styling
 */

import type { ReactNode } from 'react';

interface ThemeWrapperProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  centered?: boolean;
  fullScreen?: boolean;
}

export function ThemeWrapper({ 
  children, 
  className = '', 
  scrollable = false,
  centered = false,
  fullScreen = false 
}: ThemeWrapperProps) {
  
  const baseClasses = `
    obsidian-glass
    backdrop-blur-xl
    border-2 border-cyan-500/30
    rounded-lg
    shadow-[0_0_30px_rgba(6,182,212,0.3)]
    ${scrollable ? 'overflow-y-auto wolf-scroll' : 'overflow-hidden'}
    ${centered ? 'flex items-center justify-center' : ''}
    ${fullScreen ? 'w-full h-full' : ''}
  `.trim();

  return (
    <div className={`${baseClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * ThemeCard - Small themed card component
 */
interface ThemeCardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  onClick?: () => void;
}

export function ThemeCard({ children, className = '', glowing = false, onClick }: ThemeCardProps) {
  return (
    <div 
      className={`
        holo-card
        ${glowing ? 'neon-glow-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * ThemeButton - Themed button component
 */
interface ThemeButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function ThemeButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}: ThemeButtonProps) {
  
  const variantClasses = {
    primary: 'border-cyan-400 text-cyan-400 hover:bg-cyan-400/20',
    secondary: 'border-amber-400 text-amber-400 hover:bg-amber-400/20',
    danger: 'border-red-400 text-red-400 hover:bg-red-400/20',
    success: 'border-green-400 text-green-400 hover:bg-green-400/20'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-black/80
        backdrop-blur-md
        border-2
        rounded-lg
        font-mono
        font-bold
        tracking-wider
        uppercase
        transition-all
        duration-300
        neon-glow-hover
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/**
 * ThemeSelect - Themed dropdown component
 */
interface ThemeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  placeholder?: string;
}

export function ThemeSelect({ value, onChange, options, className = '', placeholder }: ThemeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`themed-select ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * ThemeInput - Themed input component
 */
interface ThemeInputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ThemeInput({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '' 
}: ThemeInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`
        bg-black/90
        border-2 border-cyan-500/40
        rounded-lg
        text-white
        px-3 py-2
        font-mono
        text-sm
        outline-none
        transition-all
        duration-300
        hover:border-cyan-500/60
        focus:border-cyan-500
        focus:shadow-[0_0_20px_rgba(6,214,160,0.4)]
        ${className}
      `}
    />
  );
}

/**
 * ThemeMetric - Metric display component
 */
interface ThemeMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export function ThemeMetric({ label, value, unit, status = 'normal', className = '' }: ThemeMetricProps) {
  
  const statusColors = {
    normal: 'text-green-400',
    warning: 'text-amber-400',
    critical: 'text-red-400'
  };

  return (
    <div className={`metric-panel ${className}`}>
      <div className="text-xs text-cyan-400/70 font-mono tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono ${statusColors[status]}`}>
        {value}
        {unit && <span className="text-sm ml-1 text-cyan-400/60">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * ThemeSection - Section container with header
 */
interface ThemeSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ThemeSection({ title, subtitle, children, className = '' }: ThemeSectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-amber-400 font-mono tracking-widest neon-amber">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-cyan-400/60 font-mono mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
