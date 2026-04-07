import React, { useState } from 'react';
import { Crown, Star, Zap, Users, ExternalLink, Loader2, Building2, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { createCheckoutSession, openBillingPortal } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { isFounder } from '@/constants/founders';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';

const BillingSection: React.FC = () => {
  const { user } = useAuth();
  const {
    tier, isFreeTier, isProTier, isPremiumTier,
    studentCount, studentLimit, isSchoolCovered, schoolName,
    isInTrial, trialEndsAt, subscription,
  } = useSubscription();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const founderAccount = isFounder(user?.id);

  const handleUpgrade = async (selectedTier: 'pro' | 'premium') => {
    setLoadingTier(selectedTier);
    try {
      const { url } = await createCheckoutSession(selectedTier);
      if (url) window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to start checkout', variant: 'destructive' });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await openBillingPortal();
      if (url) window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to open billing', variant: 'destructive' });
    } finally {
      setLoadingPortal(false);
    }
  };

  const daysLeft = trialEndsAt ? Math.max(0, differenceInDays(new Date(trialEndsAt), new Date())) : null;

  const tierConfig = {
    free: { icon: Zap, label: 'Free', accent: 'text-muted-foreground', bg: 'bg-muted/50' },
    pro: { icon: Star, label: 'Pro', accent: 'text-primary', bg: 'bg-primary/10' },
    premium: { icon: Crown, label: 'Premium', accent: 'text-amber-500', bg: 'bg-amber-500/10' },
  };
  const current = tierConfig[tier] || tierConfig.free;

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${current.bg}`}>
            {isSchoolCovered ? (
              <Building2 className="h-5 w-5 text-amber-500" />
            ) : (
              <current.icon className={`h-5 w-5 ${current.accent}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-foreground">
              {founderAccount ? 'Founder Account' : isSchoolCovered ? `Covered by ${schoolName || 'School'}` : `${current.label} Plan`}
            </p>
            <p className="text-xs text-muted-foreground">
              {founderAccount
                ? 'Unlimited access — forever'
                : isSchoolCovered
                  ? 'Premium features included'
                  : isInTrial && daysLeft !== null
                    ? `Trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                    : isPremiumTier
                      ? 'Unlimited students'
                      : isProTier
                        ? 'Up to 15 students'
                        : 'Up to 5 students'
              }
            </p>
          </div>
          {!isPremiumTier && !isSchoolCovered && !founderAccount && (
            <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Upgrade
            </span>
          )}
        </div>

        {/* Trial countdown bar */}
        {isInTrial && daysLeft !== null && !founderAccount && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mb-1.5">
              <Clock className="h-3 w-3" />
              <span>Trial expires {trialEndsAt ? format(new Date(trialEndsAt), 'dd MMM yyyy') : ''}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.max(0, ((30 - daysLeft) / 30) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Student capacity */}
        {!isPremiumTier && !isSchoolCovered && !founderAccount && (
          <div className="px-4 pb-4 border-t border-border pt-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                Students
              </span>
              <span className={studentCount >= studentLimit ? 'text-destructive' : 'text-foreground'}>
                {studentCount} / {studentLimit === Infinity ? '∞' : studentLimit}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  studentCount >= studentLimit
                    ? 'bg-destructive'
                    : studentCount >= studentLimit * 0.8
                      ? 'bg-amber-500'
                      : 'bg-primary'
                }`}
                style={{ width: studentLimit === Infinity ? '5%' : `${Math.min((studentCount / studentLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Options — only show if not on Premium, not school-covered, not founder */}
      {!isPremiumTier && !isSchoolCovered && !founderAccount && (
        <div className="space-y-3">
          {/* Pro Card */}
          {isFreeTier && (
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={!!loadingTier}
              className="w-full bg-card rounded-2xl border border-border hover:border-primary/40 p-4 flex items-center gap-4 transition-all active:scale-[0.98] touch-manipulation"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-foreground">Pro — £14.99/mo</p>
                <p className="text-xs text-muted-foreground">Up to 15 students</p>
              </div>
              {loadingTier === 'pro' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              ) : (
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          )}

          {/* Premium Card */}
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={!!loadingTier}
            className="w-full bg-card rounded-2xl border-2 border-amber-500/30 hover:border-amber-500/60 p-4 flex items-center gap-4 transition-all active:scale-[0.98] touch-manipulation"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-black text-foreground">Premium — £24.99/mo</p>
              <p className="text-xs text-muted-foreground">Unlimited students</p>
            </div>
            {loadingTier === 'premium' ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500 shrink-0" />
            ) : (
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>
        </div>
      )}

      {/* Manage Billing — only show if they have an active paid subscription */}
      {(isProTier || isPremiumTier) && !isSchoolCovered && !founderAccount && (
        <button
          onClick={handleManageBilling}
          disabled={loadingPortal}
          className="w-full bg-card rounded-2xl border border-border hover:border-primary/30 p-4 flex items-center gap-4 transition-all active:scale-[0.98] touch-manipulation"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-black text-foreground">Manage Billing</p>
            <p className="text-xs text-muted-foreground">Update payment method, cancel, or switch plan</p>
          </div>
          {loadingPortal && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
        </button>
      )}
    </div>
  );
};

export default BillingSection;
