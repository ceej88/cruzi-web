import React from 'react';
import { Plus, Minus, Hand, MessageCircle } from 'lucide-react';

interface DL25FaultMarker {
  category: string;
  minors: number;
  serious: boolean;
  dangerous: boolean;
  etaPhysical: boolean;
  etaVerbal: boolean;
}

interface ScoringCardProps {
  title: string;
  data: DL25FaultMarker;
  onUpdate: (updates: Partial<DL25FaultMarker>) => void;
}

const triggerHaptic = () => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

export const ScoringCard: React.FC<ScoringCardProps> = ({ title, data, onUpdate }) => {
  const toggleIntervention = (type: 'etaPhysical' | 'etaVerbal') => {
    triggerHaptic();
    onUpdate({ [type]: !data[type] });
  };

  const updateFaults = (delta: number) => {
    triggerHaptic();
    onUpdate({ minors: Math.max(0, (data.minors || 0) + delta) });
  };

  const toggleCritical = (type: 'serious' | 'dangerous') => {
    triggerHaptic();
    onUpdate({ [type]: !data[type] });
  };

  return (
    <div className="bg-card rounded-[2rem] p-6 md:p-8 shadow-xl border border-border">
      {/* Title */}
      <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight mb-6">{title}</h3>
      
      {/* Intervention Logs */}
      <div className="mb-6">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-3">
          INTERVENTION LOGS
        </span>
        <div className="flex gap-3">
          <button 
            onClick={() => toggleIntervention('etaPhysical')}
            className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 min-h-[52px] active:scale-95 ${
              data.etaPhysical 
                ? 'bg-primary/10 border-primary/30 text-primary' 
                : 'bg-muted border-transparent text-muted-foreground'
            }`}
          >
            <Hand className="h-4 w-4" /> PHYSICAL
          </button>
          <button 
            onClick={() => toggleIntervention('etaVerbal')}
            className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 min-h-[52px] active:scale-95 ${
              data.etaVerbal 
                ? 'bg-primary/10 border-primary/30 text-primary' 
                : 'bg-muted border-transparent text-muted-foreground'
            }`}
          >
            <MessageCircle className="h-4 w-4" /> VERBAL
          </button>
        </div>
      </div>

      {/* Counter Row */}
      <div className="flex items-center gap-6">
        {/* Minor Counter */}
        <div className="flex items-center bg-muted rounded-full p-1 border border-border">
          <button 
            onClick={() => updateFaults(-1)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-card flex items-center justify-center text-muted-foreground shadow-sm hover:text-destructive transition-all active:scale-90"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="w-12 md:w-16 text-center text-xl md:text-2xl font-black text-foreground">
            {data.minors || 0}
          </div>
          <button 
            onClick={() => updateFaults(1)}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[hsl(var(--neural-violet))] to-[hsl(var(--neural-purple))] flex items-center justify-center text-foreground shadow-lg shadow-purple-500/20 active:scale-90 transition-all"
          >
            <Plus className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Serious / Dangerous Toggles */}
        <div className="flex gap-3">
          <button 
            onClick={() => toggleCritical('serious')}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-black italic border-2 transition-all active:scale-90 ${
              data.serious 
                ? 'bg-amber-400 border-amber-400 text-white shadow-lg shadow-amber-400/20' 
                : 'bg-card border-border text-muted-foreground/30'
            }`}
          >
            S
          </button>
          <button 
            onClick={() => toggleCritical('dangerous')}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-black italic border-2 transition-all active:scale-90 ${
              data.dangerous 
                ? 'bg-destructive border-destructive text-white shadow-lg shadow-destructive/20' 
                : 'bg-card border-border text-muted-foreground/30'
            }`}
          >
            D
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringCard;
