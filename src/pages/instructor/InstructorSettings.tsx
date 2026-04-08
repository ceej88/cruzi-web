import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Crown, CreditCard, Key, MessageSquare, Lock, Trash2,
  Copy, RefreshCw, LogOut, ExternalLink, Loader2, CheckCircle, Shield
} from 'lucide-react';

interface Props { userId: string; userEmail: string; }

const TIER_LABELS: Record<string, { label: string; limit: string; color: string }> = {
  free: { label: 'Free', limit: 'Up to 10 students', color: 'bg-gray-100 text-gray-700' },
  pro: { label: 'Pro', limit: 'Up to 30 students', color: 'bg-blue-100 text-blue-700' },
  premium: { label: 'Premium', limit: 'Unlimited students', color: 'bg-purple-100 text-[#7c3aed]' },
};

function useSubscription(userId: string) {
  return useQuery({
    queryKey: ['subscription', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('tier, status, current_period_end, trial_ends_at')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
  });
}

function useProfile(userId: string) {
  return useQuery({
    queryKey: ['settings-profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, instructor_pin')
        .eq('user_id', userId)
        .single();
      return data;
    },
  });
}

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">{children}</div>
);

const SectionTitle: React.FC<{ icon: React.FC<any>; label: string }> = ({ icon: Icon, label }) => (
  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
    <Icon className="w-4 h-4 text-[#7c3aed]" /> {label}
  </h3>
);

const InstructorSettings: React.FC<Props> = ({ userId, userEmail }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: sub, isLoading: subLoading } = useSubscription(userId);
  const { data: profile, refetch: refetchProfile } = useProfile(userId);

  const [copiedPin, setCopiedPin] = useState(false);
  const [refreshingPin, setRefreshingPin] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const tier = sub?.tier ?? 'free';
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS.free;

  const handleCopyPin = async () => {
    if (!profile?.instructor_pin) return;
    await navigator.clipboard.writeText(profile.instructor_pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleRefreshPin = async () => {
    setRefreshingPin(true);
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    await supabase.from('profiles').update({ instructor_pin: newPin }).eq('user_id', userId);
    await refetchProfile();
    setRefreshingPin(false);
  };

  const handleUpgrade = async () => {
    setLoadingCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { instructor_id: userId, success_url: window.location.href, cancel_url: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch { alert('Failed to start checkout. Please try again.'); }
    setLoadingCheckout(false);
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-billing-portal', {
        body: { instructor_id: userId, return_url: window.location.href },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch { alert('Failed to open billing portal. Please try again.'); }
    setLoadingPortal(false);
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 4000);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await supabase.functions.invoke('delete-account', { body: { user_id: userId } });
      await signOut();
      navigate('/auth');
    } catch { alert('Failed to delete account. Please contact support.'); }
    setDeletingAccount(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-4">
      <Section>
        <SectionTitle icon={Crown} label="Subscription" />
        {subLoading ? (
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${tierInfo.color}`}>{tierInfo.label}</span>
                <p className="text-xs text-gray-500 mt-1">{tierInfo.limit}</p>
              </div>
              {sub?.current_period_end && (
                <p className="text-xs text-gray-400">
                  Renews {new Date(sub.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            {sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date() && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                Trial ends {new Date(sub.trial_ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
              </div>
            )}
            {tier === 'free' && (
              <button
                onClick={handleUpgrade}
                disabled={loadingCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] text-white rounded-xl py-3 font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loadingCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                Upgrade to Pro
              </button>
            )}
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle icon={CreditCard} label="Billing" />
        <p className="text-sm text-gray-500">Manage your payment method, view invoices, and update billing details.</p>
        <button
          onClick={handleManageBilling}
          disabled={loadingPortal}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Manage Billing
        </button>
      </Section>

      <Section>
        <SectionTitle icon={Key} label="Instructor PIN" />
        <p className="text-sm text-gray-500">Students use this 4-digit PIN to connect to your account.</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center">
            <span className="text-3xl font-black text-gray-900 tracking-[0.3em]">
              {profile?.instructor_pin ?? '----'}
            </span>
          </div>
          <button
            onClick={handleCopyPin}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="Copy PIN"
          >
            {copiedPin ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500" />}
          </button>
          <button
            onClick={handleRefreshPin}
            disabled={refreshingPin}
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Generate new PIN"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshingPin ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </Section>

      <Section>
        <SectionTitle icon={MessageSquare} label="SMS Credits" />
        <p className="text-sm text-gray-500">Buy SMS credits to send reminders and broadcast messages to your students.</p>
        <button
          onClick={() => navigate('/instructor/sms')}
          className="w-full border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Manage SMS Credits
        </button>
      </Section>

      <Section>
        <SectionTitle icon={Lock} label="Change Password" />
        <p className="text-sm text-gray-500">A password reset link will be sent to <span className="font-semibold">{userEmail}</span>.</p>
        <button
          onClick={handlePasswordReset}
          disabled={sendingReset || resetSent}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {sendingReset && <Loader2 className="w-4 h-4 animate-spin" />}
          {resetSent ? <><CheckCircle className="w-4 h-4 text-green-500" /> Email sent</> : 'Send Reset Email'}
        </button>
      </Section>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
          <Shield className="w-4 h-4 text-gray-400" /> Legal
        </h3>
        {[
          { label: 'Privacy Policy', href: 'https://cruzi.co.uk/privacy' },
          { label: 'Terms of Service', href: 'https://cruzi.co.uk/terms' },
          { label: 'Cookie Policy', href: 'https://cruzi.co.uk/cookies' },
          { label: 'Help Centre', href: 'https://cruzi.co.uk/help' },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2 text-sm text-gray-600 hover:text-[#7c3aed] transition-colors"
          >
            {label}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>

      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</h3>
        <p className="text-sm text-gray-500">This permanently deletes your account and all data. This cannot be undone.</p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full border border-red-200 rounded-xl py-3 font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          Delete my account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Delete your account?</h3>
            <p className="text-sm text-gray-500">All your data including students, lessons, and settings will be permanently deleted. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorSettings;
