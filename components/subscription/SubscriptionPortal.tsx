import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, ChevronLeft, Zap, Users, Brain, Star } from 'lucide-react';
import CruziLogo from '@/components/shared/CruziLogo';

export type SelectedTier = 'LITE' | 'ELITE';

interface SubscriptionPortalProps {
  onSelectTier: (tier: SelectedTier) => void;
  onBack: () => void;
}

const SubscriptionPortal: React.FC<SubscriptionPortalProps> = ({ onSelectTier, onBack }) => {
  const liteFeatures = [
    'Up to 5 active students',
    '3 AI-powered sessions daily',
    'Core scheduling features',
    'Student progress tracking',
    'Manual skill scoring',
  ];

  const eliteFeatures = [
    'Unlimited students',
    'Unlimited AI sessions',
    'Neural Scribe voice capture',
    'Advanced analytics & insights',
    'Priority support',
    'Content Studio access',
    'Smart booking suggestions',
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* ========== MOBILE/TABLET (< 1024px) ========== */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 pt-safe px-6 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-4 active:scale-95 touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-safe">
          <div className="text-center mb-8">
            <CruziLogo size="sm" />
            <h1 className="font-outfit text-4xl font-black text-foreground mt-6 mb-2 italic uppercase tracking-tight">
              Choose Your Matrix
            </h1>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em]">
              Select Your Operating Tier
            </p>
          </div>

          {/* Tier Cards */}
          <div className="space-y-6 pb-8">
            {/* LITE Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onSelectTier('LITE')}
              className="relative bg-white rounded-[2rem] p-6 border-2 border-border shadow-lg active:scale-[0.98] transition-transform touch-manipulation cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Lite</h3>
                  <p className="text-muted-foreground text-sm font-bold">Free Forever</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <ul className="space-y-3">
                {liteFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 w-full py-4 bg-muted text-foreground rounded-full font-black text-xs uppercase tracking-widest text-center">
                Start Free
              </div>
            </motion.div>

            {/* ELITE Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onSelectTier('ELITE')}
              className="relative bg-[#0F172A] rounded-[2rem] p-6 border-2 border-primary shadow-2xl active:scale-[0.98] transition-transform touch-manipulation cursor-pointer overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Elite</h3>
                      <Crown className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-white/60 text-sm font-bold">£29.99/month</p>
                  </div>
                  <div className="px-3 py-1.5 bg-[#2DD4BF]/20 rounded-full">
                    <span className="text-[10px] font-black text-[#2DD4BF] uppercase tracking-widest">
                      30-Day Free Trial
                    </span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {eliteFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                      <Check className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 w-full py-4 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-primary/30">
                  Start 30-Day Trial
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP (>= 1024px) ========== */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-5xl w-full">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <CruziLogo size="md" />
            <h1 className="font-outfit text-6xl font-black text-foreground mt-8 mb-3 italic uppercase tracking-tight">
              Choose Your Matrix
            </h1>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">
              Select Your Operating Tier
            </p>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* LITE Tier */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onSelectTier('LITE')}
              className="relative bg-white rounded-[3rem] p-10 border-2 border-border shadow-xl hover:border-primary/50 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Lite</h3>
                  <p className="text-muted-foreground font-bold">Free Forever</p>
                </div>
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Zap className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {liteFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="w-full py-5 bg-muted text-foreground rounded-full font-black text-sm uppercase tracking-widest text-center group-hover:bg-primary group-hover:text-white transition-all">
                Start Free
              </div>
            </motion.div>

            {/* ELITE Tier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => onSelectTier('ELITE')}
              className="relative bg-[#0F172A] rounded-[3rem] p-10 border-2 border-primary shadow-2xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden group"
            >
              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2DD4BF]/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight">Elite</h3>
                      <Crown className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-white/60 font-bold">£29.99/month</p>
                  </div>
                  <div className="px-4 py-2 bg-[#2DD4BF]/20 rounded-full">
                    <span className="text-xs font-black text-[#2DD4BF] uppercase tracking-widest">
                      30-Day Free Trial
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {eliteFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <Check className="w-5 h-5 text-[#2DD4BF] shrink-0" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="w-full py-5 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest text-center shadow-lg shadow-primary/40 group-hover:shadow-primary/60 transition-all">
                  Start 30-Day Trial
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPortal;
