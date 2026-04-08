import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

async function getRoleAndRedirect(navigate: ReturnType<typeof useNavigate>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('level')
      .eq('user_id', user.id)
      .maybeSingle();

    const level = profile?.level;
    if (level === 'instructor') {
      navigate('/instructor');
    } else if (level === 'student' || level === 'parent') {
      navigate('/install');
    } else {
      // No profile yet or unknown — check user metadata
      const role = user.user_metadata?.role;
      navigate(role === 'instructor' ? '/instructor' : '/install');
    }
  } catch {
    navigate('/auth');
  }
}

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. PKCE code flow
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          setStatus('success');
          setTimeout(() => getRoleAndRedirect(navigate), 1500);
          return;
        }

        // 2. Implicit flow — access_token in hash
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            setStatus('success');
            setTimeout(() => getRoleAndRedirect(navigate), 1500);
            return;
          }
        }

        // 3. Check for error in hash (e.g. expired token)
        if (hash && hash.includes('error')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const errorDesc = params.get('error_description') ?? 'Verification failed. Please try again.';
          setErrorMsg(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          setStatus('error');
          return;
        }

        // 4. Session may already exist (user clicked link on same device)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => getRoleAndRedirect(navigate), 1500);
          return;
        }

        setErrorMsg('Verification link has expired or was already used. Please sign in or request a new link.');
        setStatus('error');
      } catch {
        setErrorMsg('Verification failed. Please try again.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        <h1 className="text-4xl font-bold font-outfit neural-gradient-text">Cruzi</h1>

        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Confirming your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold">Email confirmed</h2>
            <p className="text-muted-foreground">Welcome to Cruzi. Redirecting you now...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
