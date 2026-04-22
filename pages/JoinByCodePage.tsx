import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, GraduationCap, CheckCircle, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cruzi.app';

interface TeaserData {
  first_name: string;
  hours_logged: number;
}

const JoinByCodePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const normalisedCode = (code || '').toUpperCase().trim();

  const [isValidating, setIsValidating] = useState(true);
  const [teaser, setTeaser] = useState<TeaserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!normalisedCode || normalisedCode.length !== 6) {
        setError('This link looks incomplete.');
        setIsValidating(false);
        return;
      }
      try {
        const { data, error: rpcError } = await supabase.rpc(
          'get_public_teaser_by_code',
          { p_code: normalisedCode }
        );
        if (rpcError) throw rpcError;
        if (data && data.length > 0) {
          setTeaser({
            first_name: data[0].first_name,
            hours_logged: data[0].hours_logged,
          });
        } else {
          setError("We couldn't find that code. It may have been mistyped.");
        }
      } catch {
        setError('Unable to load this invite right now. Please try again in a moment.');
      } finally {
        setIsValidating(false);
      }
    };
    validate();
  }, [normalisedCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setFormError('Please use at least 8 characters for your password.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) throw signUpError;
      const userId = data.user?.id;
      if (!userId) throw new Error('Sign up failed — please try again.');

      await supabase
        .from('profiles')
        .upsert(
          { user_id: userId, full_name: name.trim(), email: email.trim() },
          { onConflict: 'user_id' }
        );
      await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: 'instructor' },
          { onConflict: 'user_id' }
        );

      // Carrier: write a pending claim that the mobile app's resolver picks up
      // on first sign-in. If session isn't yet active (email confirmation gating),
      // the insert will silently fail — the user falls back to entering the code
      // manually via the in-app Connect sheet, which is fine.
      await supabase.from('pending_claims').insert({
        user_id: userId,
        code: normalisedCode,
        role: 'instructor',
      });

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

  if (error || !teaser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Link not found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "We couldn't find that code."}
          </p>
          <p className="text-sm text-muted-foreground">
            Ask the person who sent you this link to share it again.
          </p>
        </div>
      </div>
    );
  }

  if (formSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">Account created</h1>
          <p className="text-muted-foreground mb-8">
            Download the Cruzi app and sign in with your email — you'll be linked
            to {teaser.first_name} automatically.
          </p>
          <div className="space-y-3">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" size="lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Download for iPhone
              </Button>
            </a>
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" variant="outline" size="lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Download for Android
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2 text-center">
          {teaser.first_name} has invited you
        </h1>
        <p className="text-muted-foreground mb-2 text-center">
          {teaser.hours_logged > 0
            ? `${teaser.first_name} has logged ${teaser.hours_logged} ${
                teaser.hours_logged === 1 ? 'hour' : 'hours'
              } of practice on Cruzi.`
            : `${teaser.first_name} has just started using Cruzi.`}
        </p>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Create your free instructor account below — when you download the app,
          you'll be linked automatically.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={formLoading}>
            {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already have a Cruzi instructor account?{' '}
          <Link to="/auth" className="text-primary underline">
            Sign in here
          </Link>{' '}
          and enter the code{' '}
          <span className="font-mono font-bold">{normalisedCode}</span> in the app.
        </p>
      </div>
    </div>
  );
};

export default JoinByCodePage;
