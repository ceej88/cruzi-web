import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Users } from 'lucide-react';
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
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No invite token found');
        setIsValidating(false);
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from('parent_share_tokens')
          .select('student_id, expires_at')
          .eq('token', token)
          .single();

        if (dbError || !data) {
          setError('This invite link is not valid or has expired.');
          setIsValidating(false);
          return;
        }
        if (new Date(data.expires_at) < new Date()) {
          setError('This invite link has expired. Ask your child to send a new one.');
          setIsValidating(false);
          return;
        }
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

  const handleWebSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
      if (signUpError) throw signUpError;
      const userId = data.user?.id;
      if (!userId) throw new Error('Sign up failed — please try again.');
      await supabase.from('profiles').upsert({ user_id: userId, full_name: name.trim(), email: email.trim() }, { onConflict: 'user_id' });
      await supabase.from('user_roles').upsert({ user_id: userId, role: 'parent' }, { onConflict: 'user_id' });
      if (token) {
        await supabase.functions.invoke('claim-parent-token', { body: { token } });
      }
      setFormSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Link Invalid</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">Ask your child to share a new invite link from the Cruzi app.</p>
        </div>
      </div>
    );
  }

  if (formSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">You're connected</h1>
          <p className="text-muted-foreground mb-8">
            Download the Cruzi app to view your child's progress, upcoming lessons, and achievements.
          </p>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="block mb-4">
            <img
              src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-14 mx-auto"
            />
          </a>
        </div>
      </div>
    );
  }

  const firstName = studentInfo?.student_name?.split(' ')[0] || 'your child';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Follow {firstName}'s journey
          </h1>
          <p className="text-muted-foreground mt-2">
            {studentInfo?.student_name} has invited you to follow their driving lessons on Cruzi.
          </p>
        </div>

        {/* App Store — PRIMARY */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Recommended
          </div>
          <h2 className="text-xl font-black text-foreground">Get the Cruzi app</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Download the Cruzi app, then tap your invite link again to connect automatically.
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

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or sign up on the web (limited)</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Fallback web form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Create a web account</h3>
          <p className="text-sm text-muted-foreground mb-5">
            You can view a limited version of {firstName}'s progress on the web without downloading the app.
          </p>
          {formError && (
            <p className="text-sm text-destructive mb-4 bg-destructive/10 rounded-lg px-3 py-2">{formError}</p>
          )}
          <form onSubmit={handleWebSignup} className="space-y-3">
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
                placeholder="Create a password"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full mt-2" disabled={formLoading}>
              {formLoading ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</span>
              ) : (
                'Create Web Account'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentInvitePage;
