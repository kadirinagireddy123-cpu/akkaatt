import { ThemePalette } from '../types/campusPulse';

export interface ThemeDefinition {
  id: ThemePalette;
  name: string;
  tagline: string;
  dotColor: string;
  primaryHex: string;
  activeBg: string;
  activeText: string;
  glowClass: string;
  borderClass: string;
}

export const THEME_DEFINITIONS: Record<ThemePalette, ThemeDefinition> = {
  ocean: {
    id: 'ocean',
    name: 'Ocean Tech',
    tagline: 'Crisp, contemporary royal sky and cyan',
    dotColor: '#00a8ff',
    primaryHex: '#00a8ff',
    activeBg: 'bg-[#00a8ff] text-white',
    activeText: 'text-[#00a8ff]',
    glowClass: 'shadow-[0_0_20px_rgba(0,168,255,0.35)]',
    borderClass: 'border-[#00a8ff]/40'
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Pulse',
    tagline: 'Bold, high-energy ruby & rose styling',
    dotColor: '#ef4444',
    primaryHex: '#ef4444',
    activeBg: 'bg-rose-600 text-white',
    activeText: 'text-rose-500',
    glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
    borderClass: 'border-rose-500/40'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Campus',
    tagline: 'Fresh, vibrant collegiate forest & mint',
    dotColor: '#10b981',
    primaryHex: '#10b981',
    activeBg: 'bg-emerald-500 text-slate-950 font-bold',
    activeText: 'text-emerald-400',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    borderClass: 'border-emerald-500/40'
  },
  amber: {
    id: 'amber',
    name: 'Amber Surge',
    tagline: 'Warm, high-contrast dynamic citrus & amber',
    dotColor: '#f59e0b',
    primaryHex: '#f59e0b',
    activeBg: 'bg-amber-500 text-slate-950 font-bold',
    activeText: 'text-amber-400',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    borderClass: 'border-amber-500/40'
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Pulse',
    tagline: 'Modern tech violet & deep ultramarine',
    dotColor: '#6366f1',
    primaryHex: '#6366f1',
    activeBg: 'bg-indigo-600 text-white',
    activeText: 'text-indigo-400',
    glowClass: 'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
    borderClass: 'border-indigo-500/40'
  }
};
