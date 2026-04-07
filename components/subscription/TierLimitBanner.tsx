import React from 'react';
import { AlertTriangle, Users, Zap, ChevronRight, BrainCircuit } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
interface TierLimitBannerProps {
  onUpgradeClick?: () => void;
}
const TierLimitBanner: React.FC<TierLimitBannerProps> = ({
  onUpgradeClick
}) => {
  const {
    isLiteTier,
    studentCount,
    studentLimit,
    aiCallsToday,
    aiCallsLimit
  } = useSubscription();

  // Don't show for Elite tier
  if (!isLiteTier) return null;
  const isNearStudentLimit = studentCount >= studentLimit * 0.8;
  const isAtStudentLimit = studentCount >= studentLimit;
  const isNearAILimit = aiCallsToday >= aiCallsLimit * 0.66; // 2/3 used

  return <div className="bg-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border-2 border-amber-500/30 shadow-xl relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 opacity-5 blur-[80px] rounded-full -mr-32 -mt-32" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
        {/* Left: Warning & Message */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl shadow-inner">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Lite Plan Limits</h3>
              <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Some features are limited on your current plan</p>
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
            Some features are limited on your current plan. 
            <strong className="text-foreground">Upgrade to Elite</strong> to unlock unlimited students, faster tools, and full access for your pupils.
          </p>
        </div>

        {/* Right: Capacity + Upgrade */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Student Capacity */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Roster Capacity
              </span>
              <span className={`text-sm font-black ${isAtStudentLimit ? 'text-destructive' : 'text-foreground'}`}>
                {studentCount} / {studentLimit}
              </span>
            </div>
            <div className="h-2 md:h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div className={`h-full transition-all duration-1000 rounded-full ${isAtStudentLimit ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isNearStudentLimit ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-primary'}`} style={{
              width: `${studentCount / studentLimit * 100}%`
            }} />
            </div>
          </div>

          {/* AI Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                AI Syntheses Today
              </span>
              <span className={`text-sm font-black ${aiCallsToday >= aiCallsLimit ? 'text-destructive' : 'text-foreground'}`}>
                {aiCallsToday} / {aiCallsLimit}
              </span>
            </div>
            <div className="h-2 md:h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div className={`h-full transition-all duration-1000 rounded-full ${aiCallsToday >= aiCallsLimit ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isNearAILimit ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-primary'}`} style={{
              width: `${aiCallsToday / aiCallsLimit * 100}%`
            }} />
            </div>
          </div>

          {/* Upgrade Button */}
          <button onClick={onUpgradeClick} className="w-full py-3 md:py-4 bg-foreground text-background rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-primary transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
            Upgrade to Elite
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>;
};
export default TierLimitBanner;