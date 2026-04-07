import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePublicPage } from '@/hooks/usePublicPage';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const APP_STORE_URL = "https://apps.apple.com/app/cruzi/id6744941638";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cruzi.app";

interface TokenData {
  studentName: string;
  studentId: string;
}

type PageState = 'loading' | 'form' | 'success' | 'error';

const BENEFITS = [
  { emoji: '📊', title: 'Track progress', desc: 'See skills, scores and lesson history in real time' },
  { emoji: '🚗', title: 'Practice drives', desc: 'Log private practice sessions between lessons' },
  { emoji: '🏆', title: 'Celebrate milestones', desc: 'Get notified when they hit key achievements' },
];

const ParentRedirect: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  usePublicPage();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage('Invalid parent invite link.');
        setPageState('error');
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .rpc('validate_parent_share_token', { _token: token });

        if (error) {
          console.error('Token validation error:', error);
          setErrorMessage("Unable to validate invite link. Please try again.");
          setPageState('error');
          return;
        }

        if (data && data.length > 0 && data[0].is_valid) {
          setTokenData({ studentName: data[0].student_name || 'your child', studentId: '' });
          setPageState('form');
        } else {
          setErrorMessage(data?.[0]?.error_message || "This invite link is not valid.");
          setPageState('error');
        }
      } catch (err) {
        console.error('Error validating parent token:', err);
        setErrorMessage('Unable to validate invite link. Please try again.');
        setPageState('error');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email address'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!tokenData || !token) return;

    setIsSubmitting(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('This email is already registered. Try signing in via the Cruzi app.');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Account creation failed. Please try again.');
        return;
      }

      const userId = authData.user.id;

      // Insert role + profile in parallel
      const [roleResult, profileResult] = await Promise.allSettled([
        supabase.from('user_roles').insert({ user_id: userId, role: 'parent' as const }),
        supabase.from('profiles').insert({ user_id: userId, email, full_name: fullName }),
      ]);

      if (roleResult.status === 'rejected') console.error('Role insert error:', roleResult.reason);
      if (profileResult.status === 'rejected') console.error('Profile insert error:', profileResult.reason);

      // Claim parent token (non-blocking)
      try {
        await supabase.functions.invoke('claim-parent-token', { body: { token } });
      } catch (claimErr) {
        console.error('Token claim error (non-blocking):', claimErr);
      }

      // Send parent welcome email (non-blocking)
      try {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'welcome-parent',
            recipientEmail: email,
            idempotencyKey: `welcome-parent-${userId}`,
            templateData: { name: fullName, studentName: tokenData.studentName },
          },
        });
      } catch (emailErr) {
        console.error('Welcome email error (non-blocking):', emailErr);
      }

      await supabase.auth.signOut();
      setPageState('success');
    } catch (err) {
      console.error('Parent signup error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = tokenData?.studentName || 'your child';

  // --- LOADING ---
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70 font-medium">Validating your invite…</p>
        </div>
      </div>
    );
  }

  // --- ERROR ---
  if (pageState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
        <div className="max-w-md w-full mx-4 bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Link Invalid</h1>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <p className="text-sm text-gray-400">
            Ask your child to send a new parent invite from their Cruzi app.
          </p>
        </div>
      </div>
    );
  }

  // --- SUCCESS ---
  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <span className="text-white font-black text-2xl tracking-tight">Cruzi</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">You're connected!</h1>
            <p className="text-white/80 mb-8">
              Download the Cruzi app to follow {studentName}'s driving journey.
            </p>

            {/* Sign-in reminder */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 mb-6 text-left">
              <p className="text-white font-bold text-sm mb-1">⚠️ Important</p>
              <p className="text-white/90 text-sm">
                When you open the app, tap <span className="font-black">"Sign In"</span> — your account is already set up.
              </p>
              {email && (
                <p className="text-white/60 text-sm mt-2">
                  Your login: <span className="text-white font-bold">{email}</span>
                </p>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full h-14 bg-white text-gray-900 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.72 12.57 5.72C13.36 5.72 14.85 4.62 16.4 4.8C17.07 4.83 18.83 5.08 19.97 6.72C19.87 6.78 17.6 8.12 17.63 10.88C17.66 14.16 20.48 15.22 20.51 15.23C20.48 15.32 20.02 16.9 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg>
                Download for iPhone
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full h-14 bg-white/10 text-white rounded-xl font-bold text-base border border-white/20 hover:bg-white/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M3.18 23.72C2.44 23.38 2 22.65 2 21.84V2.16C2 1.35 2.44.62 3.18.28L13.04 12 3.18 23.72ZM14.47 13.43L5.37 22.04L16.63 15.58L14.47 13.43ZM20.17 10.36C20.78 10.72 21.18 11.33 21.18 12S20.78 13.28 20.17 13.64L17.89 14.96L15.51 12L17.89 9.04L20.17 10.36ZM5.37 1.96L14.47 10.57L16.63 8.42L5.37 1.96Z"/></svg>
                Download for Android
              </a>
            </div>

            <p className="text-white/50 text-sm">
              We look forward to supporting you and {studentName} — every great driver has great people behind them 💜
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM ---
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <span className="text-white font-black text-2xl tracking-tight">Cruzi</span>
      </div>

      {/* Hero */}
      <div className="text-center px-6 pb-6">
        <div className="text-5xl mb-4">👪</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          Follow {studentName}'s driving journey
        </h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">
          Create a free parent account to stay connected
        </p>
      </div>

      {/* Benefits */}
      <div className="px-6 pb-6 max-w-md mx-auto w-full">
        <div className="space-y-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex items-start gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/10">
              <span className="text-xl mt-0.5">{b.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm">{b.title}</p>
                <p className="text-white/60 text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signup card */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-gray-700 font-semibold text-sm">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="h-12 rounded-xl border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-12 rounded-xl border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-12 rounded-xl pr-10 border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">At least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 text-white font-bold text-base rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account…
                </span>
              ) : (
                'Create Parent Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-[#7C3AED] hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</a>
          </p>

          <p className="text-center text-sm text-gray-400 mt-8">
            We look forward to supporting you and {studentName} — every great driver has great people behind them 💜
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentRedirect;
