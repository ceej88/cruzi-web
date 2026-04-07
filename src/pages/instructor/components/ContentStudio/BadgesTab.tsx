// Content Studio - Badges Tab (16 Artifact Badges)

import React from 'react';
import { motion } from 'framer-motion';
import { MILESTONE_BADGES, SKILL_BADGES, BadgeConfig, triggerHaptic } from './types';

interface BadgesTabProps {
  selectedBadge: string;
  setSelectedBadge: (value: string) => void;
}

const BadgesTab: React.FC<BadgesTabProps> = ({ selectedBadge, setSelectedBadge }) => {
  const handleBadgeSelect = (key: string) => {
    triggerHaptic();
    setSelectedBadge(key);
  };

  return (
    <motion.div 
      className="space-y-8 px-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Milestone Badges */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          Milestone Badges
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {MILESTONE_BADGES.map((badge) => (
            <BadgeCard
              key={badge.key}
              badge={badge}
              isSelected={selectedBadge === badge.key}
              onSelect={() => handleBadgeSelect(badge.key)}
            />
          ))}
        </div>
      </section>

      {/* Core Skills Badges */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          Core Skills Badges
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {SKILL_BADGES.map((badge) => (
            <BadgeCard
              key={badge.key}
              badge={badge}
              isSelected={selectedBadge === badge.key}
              onSelect={() => handleBadgeSelect(badge.key)}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
};

interface BadgeCardProps {
  badge: BadgeConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isSelected, onSelect }) => {
  const Icon = badge.Icon;
  
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
        isSelected 
          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30 scale-105' 
          : 'bg-background border-border text-muted-foreground hover:border-primary/50'
      }`}
    >
      <Icon className={`h-7 w-7 ${isSelected ? 'text-white' : ''}`} />
      <span className="text-[8px] font-bold uppercase tracking-wider text-center leading-tight">
        {badge.label}
      </span>
    </motion.button>
  );
};

export default BadgesTab;
