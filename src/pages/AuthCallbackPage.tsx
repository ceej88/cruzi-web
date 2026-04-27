import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const ALLOWED_NEXT_PATHS = new Set(['/install', '/instructor', '/auth']);

async function claimPendingParentToken() {
  const pendingToken = localStorage.getItem('pending_parent_token');
  if (!pendingToken) return;
  localStorage.removeItem('pending_parent_token');
  try {
    await supabase.functions.invoke('claim-parent-token', { body: { token: pendingToken } });
  } catch {
    // non-fatal — parent can still use the app, link may need manual retry
  }
}

async function claimPendingInstructorCode(userId: string) {
  const code = localStorage.getItem('pending_instructor_code');
  if (!code) return;
  localStorage.removeItem('pending_instructor_code');
  try {
    const { data } = await supabase.rpc('claim_instructor_invite', {
      p_token: code,
      p_instructor_user_id: userId,
    });
    if (data?.ok) {
      sessionStorage.setItem('cruzi.invite.outcome', 'linked');
    } else if (data?.error === 'EXPIRED') {
      sessionStorage.setItem('cruzi.invite.outcome', 'expired');
    } else if (data?.error === 'ALREADY_CLAIMED') {
      sessionStorage.setItem('cruzi.invite.outcome', 'already_claimed');
    } else {
      sessionStorage.setItem('cruzi.invite.outcome', 'error');
    }
  } catch {
    sessionStorage.setItem('cruzi.invite.outcome', 'error');
  }
}

async function getRoleAndRedirect(
  navigate: ReturnType<typeof useNavigate>,
  nextParam: string | null
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/auth'); return; }

    await claimPendingParentToken();
    await claimPendingInstructorCode(user.id);

    // Read role from user_roles (source of truth), fall back to metadata
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = roleRow?.role ?? user.user_metadata?.role;

    // Honour ?next= param if it points to an allowed internal path
    if (nextParam && ALLOWED_NEXT_PATHS.has(nextParam)) {
      navigate(nextParam);
      return;
    }

    if (role === 'instructor' || role === 'school_admin') {
      navigate('/instructor');
    } else {
      navigate('/install');
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
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const next = searchParams.get('next');

        // 1. PKCE code flow
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          setStatus('success');
          setTimeout(() => getRoleAndRedirect(navigate, next), 1500);
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
            setTimeout(() => getRoleAndRedirect(navigate, next), 1500);
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
          setTimeout(() => getRoleAndRedirect(navigate, next), 1500);
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
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-primary" />
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
