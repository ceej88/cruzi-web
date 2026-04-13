import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CruziLogo from '@/components/shared/CruziLogo';
import { createCheckoutSession } from '@/services/stripeService';
import type { SelectedTier } from '@/components/subscription/SubscriptionPortal';
import type { InstructorProfile } from '@/types';

interface InstructorSignupProps {
  tier: SelectedTier;
  onComplete: () => void;
  onBack: () => void;
}

const InstructorSignup: React.FC<InstructorSignupProps> = ({ tier, onComplete, onBack }) => {
  const [isSignIn, setIsSignIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(20);
    setLoading(true);

    try {
      if (isSignIn) {
        // Sign in existing user
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: 'Authentication Failed',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // Successful sign-in - redirect to instructor dashboard
        navigate('/instructor');
      } else {
        // Sign up new user
        const redirectUrl = `${window.location.origin}/auth/callback`;

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.name,
              role: 'instructor',
              selected_tier: tier,
            },
          },
        });

        if (error) {
          toast({
            title: 'Registration Failed',
            description: error.message,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        // The handle_new_user_profile trigger (SECURITY DEFINER) creates profile and
        // user_roles rows. No client-side writes: session is null until email is
        // verified so RLS would reject them silently.
        if (data.user) {
          // Persist tier selection so the dashboard can pick it up after verify
          const maxStudents = tier === 'LITE' ? 5 : 9999;
          const trialEndsAt = tier === 'ELITE'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined;

          const fullProfile: InstructorProfile = {
            name: formData.name,
            email: formData.email,
            adiNumber: '',
            grade: '',
            bio: '',
            hourlyRate: 0,
            blockRates: { tenHours: 0, twentyHours: 0, thirtyHours: 0 },
            showBankDetailsToStudents: false,
            stripeConnected: false,
            isVerified: false,
            verificationStatus: 'NONE',
            subscriptionTier: tier.toLowerCase() as 'lite' | 'elite',
            maxStudents,
            selectedTier: tier,
            trialExpiresAt: trialEndsAt,
          };

          localStorage.setItem('cruzi_settings', JSON.stringify(fullProfile));
          localStorage.setItem('cruzi_instructor_profile', JSON.stringify(fullProfile));
          localStorage.setItem('cruzi_selected_tier', tier);
          window.dispatchEvent(new Event('cruzi_data_update'));

          // For Elite tier, open Stripe checkout in a new tab
          if (tier === 'ELITE') {
            try {
              const { url } = await createCheckoutSession();
              if (url) {
                toast({
                  title: 'Starting Elite Trial',
                  description: 'Opening secure payment setup in new tab...',
                });
                window.open(url, '_blank');
                return;
              }
            } catch (checkoutError) {
              console.error('Elite checkout session failed:', checkoutError);
              toast({
                title: 'Checkout Setup Issue',
                description: 'Your account was created. You can start your Elite trial from Settings.',
                variant: 'destructive',
              });
            }
          }
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast({
            title: 'Check Your Email',
            description: 'Please verify your email address to continue.',
          });
        } else {
          // Auto-confirmed OR Elite checkout failed - proceed to next step
          onComplete();
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* ========== MOBILE/TABLET (< 1024px) ========== */}
      <div className="lg:hidden flex-1 flex flex-col p-8 overflow-y-auto pb-safe">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 active:scale-95 touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </button>

        {/* Header */}
        <header className="py-8 text-center space-y-4">
          <CruziLogo size="sm" />
          <h1 className="font-outfit text-4xl text-foreground leading-none italic uppercase font-black">
            {isSignIn ? 'Welcome Back.' : 'Initialize.'}
          </h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
            {tier} MATRIX ACTIVE
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
          {!isSignIn && (
            <input
              required
              placeholder="PROFESSIONAL NAME"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full min-h-[56px] bg-white border border-border rounded-2xl px-6 font-bold text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          )}
          <input
            type="email"
            required
            placeholder="EMAIL ADDRESS"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full min-h-[56px] bg-white border border-border rounded-2xl px-6 font-bold text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <input
            type="password"
            required
            placeholder="PASSWORD"
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full min-h-[56px] bg-white border border-border rounded-2xl px-6 font-bold text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          
          <div className="flex-1" />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[64px] bg-primary text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-primary/30 active:scale-95 touch-manipulation disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SYNCING...
              </>
            ) : (
              isSignIn ? 'AUTHENTICATE' : 'SECURE REGISTRATION'
            )}
          </button>

          <div className="text-center pt-6 space-y-6">
            <button
              type="button"
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-[10px] font-black text-muted-foreground uppercase tracking-widest active:scale-95 hover:text-foreground transition-colors"
            >
              {isSignIn ? 'Need a Hub? Create Profile' : 'Already registered? Sign In'}
            </button>
          </div>
        </form>
      </div>

      {/* ========== DESKTOP (>= 1024px) ========== */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-20 bg-[#F8FAFC]">
        <div className="w-full max-w-xl bg-white rounded-[4rem] p-16 shadow-2xl border border-border space-y-12 animate-in slide-in-from-bottom-12 duration-700">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-bold">Back</span>
          </button>

          {/* Header */}
          <div className="text-center space-y-4">
            <CruziLogo size="sm" />
            <h2 className="font-outfit text-5xl italic text-foreground leading-none uppercase font-black tracking-tight">
              {isSignIn ? 'Command.' : 'Initialize.'}
            </h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
              {tier} Plan • Setting Up Your Academy
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSignIn && (
              <input
                required
                placeholder="PROFESSIONAL NAME"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full py-5 px-8 bg-[#F8FAFC] border-none rounded-[2rem] font-bold text-lg text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              />
            )}
            <input
              required
              type="email"
              placeholder="EMAIL ADDRESS"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full py-5 px-8 bg-[#F8FAFC] border-none rounded-[2rem] font-bold text-lg text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            <input
              required
              type="password"
              placeholder="PASSWORD"
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full py-5 px-8 bg-[#F8FAFC] border-none rounded-[2rem] font-bold text-lg text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-foreground text-white rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-primary transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  SYNCING...
                </>
              ) : (
                isSignIn ? 'AUTHENTICATE HUB' : 'ACTIVATE ACADEMY'
              )}
            </button>
            
            <div className="flex justify-between items-center px-4 pt-4">
              <button
                type="button"
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
              >
                {isSignIn ? 'New? Register' : 'Login to Hub'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorSignup;
