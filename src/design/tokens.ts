/**
 * Design System Tokens
 * Norse mythology + Aurora aesthetics for SKÖLL-TRACK
 */

export const tokens = {
  // Colors - Aurora + Norse
  colors: {
    // Brand (Sköll's eyes)
    accent: '#06D6A0',
    accentHover: '#05c494',
    accentDim: 'rgba(6, 214, 160, 0.1)',
    
    // Aurora gradient
    auroraGreen: '#10b981',
    auroraCyan: '#06b6d4',
    auroraPurple: '#a855f7',
    auroraOrange: '#ff8c42',  // Solar flare
    
    // Norse-inspired neutrals
    raven: '#0a0a0a',          // Odin's ravens
    ash: '#1a1a1a',            // Charcoal
    stone: '#2a2a2a',          // Runestone
    mist: '#3a3a3a',           // Morning mist
    
    // Legacy (keep for compatibility)
    background: '#000000',
    backgroundElevated: '#0a0a0a',
    surface: 'rgba(10, 10, 10, 0.6)',
    surfaceHover: 'rgba(15, 15, 15, 0.8)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderFocus: 'rgba(6, 214, 160, 0.5)',
    borderWolf: 'rgba(16, 185, 129, 0.4)',  // Wolf motif border
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textDim: 'rgba(255, 255, 255, 0.3)',
    
    // States
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06D6A0',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // Border Radius (Sharp aesthetic)
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px - our default
    md: '0.25rem',    // 4px
    lg: '0.375rem',   // 6px - max for award-site feel
    full: '9999px',
  },
  
  // Typography - Norse/Runic aesthetic
  typography: {
    fontFamily: {
      rune: "'Rajdhani', sans-serif",  // Norse-style headers
      mono: "'Share Tech Mono', 'Courier New', monospace",  // Data displays
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",  // UI text
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px - hero text
    },
    fontWeight: {
      light: '300',
      normal: '400',
      bold: '700',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.1em',       // Norse aesthetic
      wider: '0.15em',     // Mission labels
      widest: '0.3em',     // Rune-style
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Shadows (Aurora glow effects)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(6, 214, 160, 0.3)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.6)',
    glowPurple: '0 0 20px rgba(168, 85, 247, 0.6)',
    aurora: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(6, 182, 212, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-Index layers
  zIndex: {
    canvas: 0,
    ui: 50,
    modal: 60,
    modalHigh: 70,
    navigation: 100,
    loading: 999,
  },
} as const;

// Glassmorphism preset
export const glassmorphism = {
  background: 'rgba(10, 10, 10, 0.6)',
  backdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: tokens.shadows.md,
};

// Data metric styles
export const metricStyles = {
  label: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.textTertiary,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  value: {
    fontFamily: tokens.typography.fontFamily.mono,
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.textPrimary,
    fontWeight: tokens.typography.fontWeight.bold,
    fontVariantNumeric: 'tabular-nums',
  },
};
