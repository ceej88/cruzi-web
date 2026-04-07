import React from 'react';
import { Crown, Zap, Users, ChevronUp } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface TierIndicatorProps {
  onUpgradeClick?: () => void;
  compact?: boolean;
}

const TierIndicator: React.FC<TierIndicatorProps> = ({ onUpgradeClick, compact = false }) => {
  const { tier, studentCount, studentLimit, isLiteTier, isEliteTier } = useSubscription();

  if (compact) {
    return (
      <button
        onClick={onUpgradeClick}
        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
          isEliteTier 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
            : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
        }`}
      >
        {isEliteTier ? (
          <span className="flex items-center gap-1.5">
            <Crown className="h-3 w-3" />
            Elite
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Lite
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tier Badge */}
      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
        isEliteTier 
          ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
          : 'bg-muted/30 text-muted-foreground border-border/50'
      }`}>
        <div className="flex items-center gap-2">
          {isEliteTier ? (
            <>
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Elite Neural Command</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>Lite Tier</span>
            </>
          )}
        </div>
      </div>

      {/* Capacity Meter - Only for Lite tier */}
      {isLiteTier && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              Student Capacity
            </span>
            <span className={`${studentCount >= studentLimit ? 'text-destructive' : 'text-foreground'}`}>
              {studentCount} / {studentLimit}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                studentCount >= studentLimit 
                  ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                  : studentCount >= studentLimit * 0.8
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]'
              }`}
              style={{ width: `${Math.min((studentCount / studentLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Upgrade Button - Only for Lite tier */}
      {isLiteTier && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 transition-all flex items-center justify-center gap-2 group"
        >
          <ChevronUp className="h-3 w-3 group-hover:-translate-y-0.5 transition-transform" />
          Upgrade to Elite
        </button>
      )}
    </div>
  );
};

export default TierIndicator;
