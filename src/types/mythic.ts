// Mythic Theme System Types

export type AppTheme = 'SCI_FI' | 'NORSE';

export interface MythicData {
  title: string;
  message: string;
  icon?: string;
  color?: string;
  sound?: string;
}

export interface ThemeConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  fontFamily: string;
  auroraColors: string[];
  particleColor: string;
}

export const THEME_CONFIGS: Record<AppTheme, ThemeConfig> = {
  SCI_FI: {
    name: 'Scientific',
    primaryColor: '#00ffff', // Cyan
    secondaryColor: '#8b5cf6', // Purple
    accentColor: '#3b82f6', // Blue
    glowColor: 'rgba(0, 255, 255, 0.5)',
    fontFamily: 'Inter',
    auroraColors: ['#00ff88', '#00ffff', '#8b5cf6', '#ff00ff'],
    particleColor: '#ffffff',
  },
  NORSE: {
    name: 'Norse Mythology',
    primaryColor: '#ff6b35', // Fire Orange
    secondaryColor: '#00d4ff', // Ice Blue
    accentColor: '#ffd700', // Gold
    glowColor: 'rgba(255, 107, 53, 0.5)',
    fontFamily: 'Inter',
    auroraColors: ['#ff0000', '#ff6b35', '#ffd700', '#00ff00', '#00d4ff', '#8b00ff'], // Bifröst rainbow
    particleColor: '#ff6b35',
  },
};
