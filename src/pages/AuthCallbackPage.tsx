import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const handleCallback = async () => {
      try {
        // Check both query params (?code=) and hash fragments (#error=, #access_token=)
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const code = params.get('code');
        const errorParam = params.get('error') || hashParams.get('error');
        const errorDescription = params.get('error_description') || hashParams.get('error_description');

        if (errorParam) {
          const msg = errorDescription
            ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            : errorParam;
          throw new Error(msg);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          await resolveSession();
          return;
        }

        // No code — session may arrive via hash fragment (token_hash flow).
        // Listen for the SIGNED_IN event which fires once the hash is processed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              await resolveSession(session.user.id);
            } else if (event === 'TOKEN_REFRESHED' && session) {
              await resolveSession(session.user.id);
            }
          }
        );
        unsubscribe = () => subscription.unsubscribe();

        // Also try getSession immediately in case it's already set
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await resolveSession(session.user.id);
          return;
        }

        // If still nothing after 8 seconds, give up
        setTimeout(() => {
          setErrorMsg('Verification timed out — please try signing in directly');
          setStatus('error');
        }, 8000);

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Verification failed';
        console.error('Auth callback error:', msg);
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    const resolveSession = async (userId?: string) => {
      try {
        let uid = userId;
        if (!uid) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('No session found after confirmation');
          uid = session.user.id;
        }

        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', uid)
          .single();

        setStatus('success');

        setTimeout(() => {
          const next = new URLSearchParams(window.location.search).get('next');
          const dest = next || (roleRow?.role === 'student' || roleRow?.role === 'parent' ? '/install' : '/instructor');
          navigate(dest, { replace: true });
        }, 2000);

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Verification failed';
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    handleCallback();

    return () => {
      if (unsubscribe) unsubscribe();
    };
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
