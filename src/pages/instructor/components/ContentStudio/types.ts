// Content Studio Types & Configuration

import { 
  Footprints, Car, Shield, Trophy, Flame, Crown, Star, Gem,
  Eye, Zap, Brain, GitBranch, RefreshCw, Square, Moon, Gauge,
  type LucideIcon
} from 'lucide-react';

export type TabType = 'studio' | 'badges' | 'preview';

export interface ThemeConfig {
  id: string;
  name: string;
  gradient: string;
  textColor: 'white' | 'dark';
  canvasColors: readonly [string, string, string];
}

export interface BadgeConfig {
  key: string;
  label: string;
  Icon: LucideIcon;
  category: 'milestone' | 'skill';
}

// 6 Themes
export const THEMES: ThemeConfig[] = [
  { 
    id: 'cyber', 
    name: 'Cyber Node', 
    gradient: 'from-violet-600 via-purple-600 to-teal-500',
    textColor: 'white',
    canvasColors: ['#7c3aed', '#9333ea', '#14b8a6'] as const
  },
  { 
    id: 'midnight', 
    name: 'Midnight Carbon', 
    gradient: 'from-slate-900 via-slate-800 to-slate-700',
    textColor: 'white',
    canvasColors: ['#0f172a', '#1e293b', '#334155'] as const
  },
  { 
    id: 'aurora', 
    name: 'Aurora', 
    gradient: 'from-green-500 via-emerald-500 to-teal-400',
    textColor: 'white',
    canvasColors: ['#22c55e', '#10b981', '#2dd4bf'] as const
  },
  { 
    id: 'gold', 
    name: 'Gold Rush', 
    gradient: 'from-amber-600 via-yellow-500 to-orange-400',
    textColor: 'dark',
    canvasColors: ['#d97706', '#eab308', '#fb923c'] as const
  },
  { 
    id: 'ember', 
    name: 'Ember', 
    gradient: 'from-rose-500 via-red-500 to-pink-500',
    textColor: 'white',
    canvasColors: ['#f43f5e', '#ef4444', '#ec4899'] as const
  },
  { 
    id: 'ghost', 
    name: 'Ghost', 
    gradient: 'from-slate-200 via-slate-100 to-white',
    textColor: 'dark',
    canvasColors: ['#e2e8f0', '#f1f5f9', '#ffffff'] as const
  },
];

// 8 Milestone Badges
export const MILESTONE_BADGES: BadgeConfig[] = [
  { key: 'first_steps', label: 'First Steps', Icon: Footprints, category: 'milestone' },
  { key: 'getting_rolling', label: 'Getting Rolling', Icon: Car, category: 'milestone' },
  { key: 'road_warrior', label: 'Road Warrior', Icon: Shield, category: 'milestone' },
  { key: 'driving_pro', label: 'Driving Pro', Icon: Trophy, category: 'milestone' },
  { key: 'on_fire', label: 'On Fire', Icon: Flame, category: 'milestone' },
  { key: 'champ', label: 'Champion', Icon: Crown, category: 'milestone' },
  { key: 'legendary', label: 'Legendary', Icon: Star, category: 'milestone' },
  { key: 'master', label: 'Master', Icon: Gem, category: 'milestone' },
];

// 8 Core Skills Badges  
export const SKILL_BADGES: BadgeConfig[] = [
  { key: 'mirrors', label: 'Mirrors', Icon: Eye, category: 'skill' },
  { key: 'signals', label: 'Signals', Icon: Zap, category: 'skill' },
  { key: 'anticipation', label: 'Anticipation', Icon: Brain, category: 'skill' },
  { key: 'junctions', label: 'Junctions', Icon: GitBranch, category: 'skill' },
  { key: 'rounds', label: 'Roundabouts', Icon: RefreshCw, category: 'skill' },
  { key: 'parking', label: 'Parking', Icon: Square, category: 'skill' },
  { key: 'night', label: 'Night Driving', Icon: Moon, category: 'skill' },
  { key: 'speed', label: 'Speed Awareness', Icon: Gauge, category: 'skill' },
];

export const ALL_BADGES = [...MILESTONE_BADGES, ...SKILL_BADGES];

export const getBadgeByKey = (key: string): BadgeConfig | undefined => 
  ALL_BADGES.find(b => b.key === key);

export const getThemeById = (id: string): ThemeConfig => 
  THEMES.find(t => t.id === id) || THEMES[0];

// Haptic feedback utility
export const triggerHaptic = (duration = 20): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
};
