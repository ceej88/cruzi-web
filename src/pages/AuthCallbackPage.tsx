import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for PKCE code first
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          setStatus('success');
          setTimeout(() => navigate('/instructor'), 2000);
          return;
        }

        // Check for implicit hash tokens
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            setStatus('success');
            setTimeout(() => navigate('/instructor'), 2000);
            return;
          }
        }

        // Nothing in URL — check if session already exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => navigate('/instructor'), 2000);
          return;
        }

        setErrorMsg('Verification timed out. Please try again.');
        setStatus('error');
      } catch (err) {
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
            <p className="text-muted-foreground">Welcome to Cruzi. Taking you to the app...</p>
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
