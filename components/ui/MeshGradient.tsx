import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MeshGradientProps {
  variant?: 'neural' | 'cosmic' | 'aurora' | 'sunset';
  intensity?: 'subtle' | 'medium' | 'vibrant';
  animated?: boolean;
  className?: string;
}

const gradientConfigs = {
  neural: {
    colors: [
      'hsla(262, 83%, 66%, 0.4)',  // Indigo
      'hsla(216, 100%, 50%, 0.3)', // Blue
      'hsla(195, 100%, 50%, 0.35)', // Cyan
      'hsla(280, 70%, 50%, 0.25)',  // Purple
    ],
    positions: [
      { x: '20%', y: '30%' },
      { x: '80%', y: '20%' },
      { x: '40%', y: '70%' },
      { x: '70%', y: '80%' },
    ],
  },
  cosmic: {
    colors: [
      'hsla(280, 80%, 60%, 0.4)',  // Violet
      'hsla(320, 70%, 50%, 0.35)', // Magenta
      'hsla(200, 90%, 50%, 0.3)',  // Sky
      'hsla(260, 85%, 55%, 0.25)', // Purple
    ],
    positions: [
      { x: '10%', y: '20%' },
      { x: '90%', y: '30%' },
      { x: '30%', y: '80%' },
      { x: '60%', y: '50%' },
    ],
  },
  aurora: {
    colors: [
      'hsla(160, 84%, 39%, 0.4)',  // Emerald
      'hsla(195, 100%, 50%, 0.35)', // Cyan
      'hsla(262, 83%, 66%, 0.3)',  // Indigo
      'hsla(180, 70%, 45%, 0.25)', // Teal
    ],
    positions: [
      { x: '25%', y: '25%' },
      { x: '75%', y: '15%' },
      { x: '50%', y: '75%' },
      { x: '85%', y: '65%' },
    ],
  },
  sunset: {
    colors: [
      'hsla(45, 100%, 50%, 0.35)', // Gold
      'hsla(20, 90%, 55%, 0.4)',   // Orange
      'hsla(340, 80%, 55%, 0.3)',  // Rose
      'hsla(280, 70%, 50%, 0.25)', // Purple
    ],
    positions: [
      { x: '30%', y: '20%' },
      { x: '70%', y: '40%' },
      { x: '20%', y: '70%' },
      { x: '80%', y: '75%' },
    ],
  },
};

const intensityScale = {
  subtle: 0.5,
  medium: 1,
  vibrant: 1.5,
};

const MeshGradient: React.FC<MeshGradientProps> = ({
  variant = 'neural',
  intensity = 'medium',
  animated = true,
  className,
}) => {
  const config = gradientConfigs[variant];
  const scale = intensityScale[intensity];

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Animated gradient orbs */}
      {config.colors.map((color, index) => {
        const pos = config.positions[index];
        const size = 300 + index * 100;
        
        // Adjust color opacity based on intensity
        const adjustedColor = color.replace(
          /[\d.]+\)$/,
          `${parseFloat(color.match(/[\d.]+\)$/)?.[0] || '0.3') * scale})`
        );

        return (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle, ${adjustedColor} 0%, transparent 70%)`,
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              filter: 'blur(60px)',
            }}
            animate={animated ? {
              x: [0, 30 * (index % 2 === 0 ? 1 : -1), -20 * (index % 2 === 0 ? 1 : -1), 0],
              y: [0, -25 * (index % 2 === 0 ? -1 : 1), 35 * (index % 2 === 0 ? -1 : 1), 0],
              scale: [1, 1.1, 0.95, 1],
            } : undefined}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.5,
            }}
          />
        );
      })}

      {/* Noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
};

export default MeshGradient;
