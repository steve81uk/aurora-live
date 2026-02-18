/**
 * Wolf Icon Library
 * Reusable wolf-themed icons for SKÖLL-TRACK
 */

import type { SVGProps } from 'react';

export type WolfIconVariant = 
  | 'head'           // Full wolf head silhouette
  | 'howl'           // Wolf howling at moon
  | 'paw'            // Wolf paw print
  | 'eye'            // Single glowing eye
  | 'rune'           // Norse rune wolf symbol
  | 'running'        // Wolf in motion (chase)
  | 'minimal';       // Simple geometric wolf

interface WolfIconProps extends SVGProps<SVGSVGElement> {
  variant?: WolfIconVariant;
  size?: number;
  glowing?: boolean;
  animated?: boolean;
}

export function WolfIcon({ 
  variant = 'head', 
  size = 24, 
  glowing = false,
  animated = false,
  className = '',
  ...props 
}: WolfIconProps) {
  
  const glowClass = glowing ? 'drop-shadow-[0_0_8px_rgba(6,214,160,0.6)]' : '';
  const animateClass = animated ? 'animate-pulse' : '';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${glowClass} ${animateClass} ${className}`}
      {...props}
    >
      {variant === 'head' && <WolfHeadPath />}
      {variant === 'howl' && <WolfHowlPath />}
      {variant === 'paw' && <WolfPawPath />}
      {variant === 'eye' && <WolfEyePath />}
      {variant === 'rune' && <WolfRunePath />}
      {variant === 'running' && <WolfRunningPath />}
      {variant === 'minimal' && <WolfMinimalPath />}
    </svg>
  );
}

// Wolf head silhouette (simplified for icon size)
function WolfHeadPath() {
  return (
    <>
      <defs>
        <linearGradient id="wolf-icon-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M 12 3 L 10 5 L 9 4.5 L 8 6.5 L 7 6 L 6 8.5 L 5 10 L 4 13 L 5 16 L 7 18 L 10 19 L 12 19.5 L 14 19 L 17 18 L 19 16 L 20 13 L 19 10 L 18 8.5 L 17 6 L 16 6.5 L 15 4.5 L 14 5 Z"
        stroke="url(#wolf-icon-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11" r="1" fill="#06D6A0" />
      <circle cx="15" cy="11" r="1" fill="#06D6A0" />
    </>
  );
}

// Wolf howling silhouette
function WolfHowlPath() {
  return (
    <path
      d="M 8 20 L 9 16 L 8 15 L 9 12 L 8 11 L 10 8 L 11 5 L 13 3 L 14 5 L 13 7 L 14 9 L 16 11 L 15 13 L 16 15 L 15 18 L 16 20 M 10 11 L 12 9 L 14 10 M 13 14 L 14 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

// Wolf paw print
function WolfPawPath() {
  return (
    <>
      {/* Main pad */}
      <ellipse cx="12" cy="15" rx="3.5" ry="4" fill="currentColor" />
      
      {/* Toe pads */}
      <ellipse cx="8" cy="9" rx="1.5" ry="2" fill="currentColor" />
      <ellipse cx="11" cy="7" rx="1.5" ry="2.2" fill="currentColor" />
      <ellipse cx="14" cy="7" rx="1.5" ry="2.2" fill="currentColor" />
      <ellipse cx="17" cy="9" rx="1.5" ry="2" fill="currentColor" />
    </>
  );
}

// Single glowing wolf eye
function WolfEyePath() {
  return (
    <>
      <defs>
        <radialGradient id="eye-glow">
          <stop offset="0%" stopColor="#06D6A0" stopOpacity="1" />
          <stop offset="70%" stopColor="#10b981" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Outer glow */}
      <circle cx="12" cy="12" r="8" fill="url(#eye-glow)" opacity="0.4" />
      
      {/* Eye shape */}
      <ellipse cx="12" cy="12" rx="6" ry="4" fill="none" stroke="#06D6A0" strokeWidth="1.5" />
      
      {/* Pupil */}
      <ellipse cx="12" cy="12" rx="2" ry="3" fill="#06D6A0">
        <animate attributeName="ry" values="3;0.5;3" dur="4s" repeatCount="indefinite" />
      </ellipse>
    </>
  );
}

// Norse rune wolf (Fenrir-inspired)
function WolfRunePath() {
  return (
    <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
      {/* Vertical line (main rune) */}
      <line x1="12" y1="3" x2="12" y2="21" />
      
      {/* Angular wolf shape */}
      <path d="M 12 6 L 8 9 L 10 12 L 8 15 L 12 18" />
      <path d="M 12 6 L 16 9 L 14 12 L 16 15 L 12 18" />
      
      {/* Eyes */}
      <circle cx="10" cy="10" r="0.8" fill="currentColor" />
      <circle cx="14" cy="10" r="0.8" fill="currentColor" />
    </g>
  );
}

// Wolf running/chasing
function WolfRunningPath() {
  return (
    <path
      d="M 3 15 L 5 13 L 7 14 L 9 12 L 11 11 L 13 9 L 15 10 L 18 8 L 20 10 M 6 15 L 7 17 M 10 14 L 11 17 M 14 12 L 14 15 M 17 11 L 18 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

// Minimal geometric wolf
function WolfMinimalPath() {
  return (
    <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* Triangle head */}
      <path d="M 12 4 L 7 12 L 17 12 Z" />
      
      {/* Ears */}
      <path d="M 9 7 L 7 4" />
      <path d="M 15 7 L 17 4" />
      
      {/* Body/neck */}
      <path d="M 8 12 L 6 20" />
      <path d="M 16 12 L 18 20" />
      <path d="M 12 12 L 12 20" />
      
      {/* Eyes */}
      <circle cx="10" cy="9" r="0.8" fill="currentColor" />
      <circle cx="14" cy="9" r="0.8" fill="currentColor" />
    </g>
  );
}

// Utility: Wolf icon as button
export function WolfIconButton({
  variant = 'head',
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: WolfIconProps & { onClick?: () => void; 'aria-label'?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`p-2 hover:bg-white/10 rounded transition-colors ${className}`}
    >
      <WolfIcon variant={variant} {...props} />
    </button>
  );
}

// Utility: Animated wolf loader
export function WolfLoader({ size = 48 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <WolfIcon 
        variant="howl" 
        size={size} 
        glowing 
        className="absolute inset-0 animate-pulse"
      />
      <WolfIcon 
        variant="howl" 
        size={size} 
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: '3s' }}
      />
    </div>
  );
}

// Utility: Wolf paw trail (for loading/transitions)
export function WolfPawTrail() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <WolfIcon
          key={i}
          variant="paw"
          size={16}
          className="opacity-30"
          style={{
            animation: `fadeIn 1.5s ease-in-out ${i * 0.3}s infinite`,
            transform: `rotate(${i * 15}deg)`
          }}
        />
      ))}
    </div>
  );
}
