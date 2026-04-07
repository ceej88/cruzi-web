import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cruzi.app';

interface StudentInfo {
  student_name: string;
}

const ParentInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [isValidating, setIsValidating] = useState(true);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) { setError('No invite token found'); setIsValidating(false); return; }
      try {
        const { data, error: dbError } = await (supabase as any)
          .from('parent_share_tokens')
          .select('student_id, expires_at')
          .eq('token', token)
          .single();

        if (dbError || !data) { setError('This invite link is not valid or has expired.'); setIsValidating(false); return; }
        if (new Date(data.expires_at) < new Date()) { setError('This invite link has expired. Ask your child to send a new one.'); setIsValidating(false); return; }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', data.student_id)
          .single();

        setStudentInfo({ student_name: profile?.full_name || 'your child' });
      } catch {
        setError('Unable to validate invite link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) { setFormError('Please fill in all fields.'); return; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: 'https://cruzi.co.uk/auth/callback?next=/install',
          data: { role: 'parent', full_name: name.trim() },
        },
      });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (userId) {
        await supabase.from('profiles').upsert({
          user_id: userId,
          full_name: name.trim(),
          email: email.trim(),
        }, { onConflict: 'user_id' });

        await supabase.from('user_roles').upsert({
          user_id: userId,
          role: 'parent',
        }, { onConflict: 'user_id' });

        if (token) {
          await supabase.functions.invoke('claim-parent-token', { body: { token } });
        }
      }

      setSentToEmail(email.trim());
      setShowEmailSent(true);
      startResendCooldown();
    } catch (err: any) {
      setFormError(
        err.message?.includes('already registered')
          ? 'This email is already registered. Try logging into the Cruzi app instead.'
          : (err.message || 'Something went wrong. Please try again.')
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || formLoading) return;
    setFormLoading(true);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: sentToEmail,
        options: { emailRedirectTo: 'https://cruzi.co.uk/auth/callback?next=/install' },
      });
      startResendCooldown();
    } finally {
      setFormLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Checking your invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-2">Link Invalid</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">Ask your child to share a new invite link from the Cruzi app.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showEmailSent) {
    return (
      <div className="bg-background overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-md mx-auto px-4 py-10 text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground">Check your inbox</h1>
          <p className="text-muted-foreground">
            We sent a verification link to{' '}
            <span className="font-bold text-foreground break-all">{sentToEmail}</span>
          </p>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">
              Once verified, download Cruzi to follow {studentInfo?.student_name?.split(' ')[0] || 'your child'}'s progress
            </p>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-14 mx-auto hover:opacity-90 transition-opacity"
              />
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-14 mx-auto hover:opacity-90 transition-opacity"
              />
            </a>
          </div>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || formLoading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 transition-all hover:bg-primary/90"
          >
            {formLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </button>
        </div>
      </div>
    );
  }

  const firstName = studentInfo?.student_name?.split(' ')[0] || 'your child';

  return (
    <div className="bg-background overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="max-w-md mx-auto px-4 py-10 space-y-5">

        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Follow {firstName}'s driving journey
          </h1>
          <p className="text-muted-foreground mt-2">
            {studentInfo?.student_name} has invited you to follow their driving lessons on Cruzi.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-1">Create your account</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Set up your account to follow {firstName}'s lessons and progress.
          </p>

          {formError && (
            <p className="text-sm text-destructive mb-4 bg-destructive/10 rounded-lg px-3 py-2">{formError}</p>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl mt-1"
              disabled={formLoading}
            >
              {formLoading
                ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</span>
                : 'Create Account'
              }
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Already have an account?{' '}
          <a href="https://cruzi.co.uk/auth" className="text-primary font-bold hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default ParentInvitePage;
