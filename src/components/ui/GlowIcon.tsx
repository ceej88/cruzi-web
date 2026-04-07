import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  glowColor?: 'primary' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'rose';
  intensity?: 'subtle' | 'medium' | 'strong';
  animated?: boolean;
}

const glowColors = {
  primary: {
    icon: 'text-primary',
    glow: 'bg-primary/40',
    shadow: 'shadow-primary/50',
  },
  indigo: {
    icon: 'text-indigo-400',
    glow: 'bg-indigo-500/40',
    shadow: 'shadow-indigo-500/50',
  },
  cyan: {
    icon: 'text-cyan-400',
    glow: 'bg-cyan-500/40',
    shadow: 'shadow-cyan-500/50',
  },
  emerald: {
    icon: 'text-emerald-400',
    glow: 'bg-emerald-500/40',
    shadow: 'shadow-emerald-500/50',
  },
  amber: {
    icon: 'text-amber-400',
    glow: 'bg-amber-500/40',
    shadow: 'shadow-amber-500/50',
  },
  rose: {
    icon: 'text-rose-400',
    glow: 'bg-rose-500/40',
    shadow: 'shadow-rose-500/50',
  },
};

const intensityScale = {
  subtle: {
    blur: 'blur-md',
    scale: 'scale-150',
    opacity: 'opacity-30',
  },
  medium: {
    blur: 'blur-lg',
    scale: 'scale-[1.8]',
    opacity: 'opacity-50',
  },
  strong: {
    blur: 'blur-xl',
    scale: 'scale-[2.2]',
    opacity: 'opacity-70',
  },
};

const GlowIcon: React.FC<GlowIconProps> = ({
  icon: Icon,
  size = 20,
  className,
  glowColor = 'primary',
  intensity = 'medium',
  animated = false,
}) => {
  const colors = glowColors[glowColor];
  const intensityStyles = intensityScale[intensity];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Glow layer */}
      <div
        className={cn(
          'absolute rounded-full',
          colors.glow,
          intensityStyles.blur,
          intensityStyles.scale,
          intensityStyles.opacity,
          animated && 'animate-pulse'
        )}
        style={{ width: size, height: size }}
      />
      {/* Icon */}
      <Icon
        size={size}
        className={cn(
          'relative z-10 drop-shadow-lg',
          colors.icon,
          `drop-shadow-[0_0_8px_var(--tw-shadow-color)]`,
          colors.shadow
        )}
      />
    </div>
  );
};

export default GlowIcon;
