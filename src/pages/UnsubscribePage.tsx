import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'already' | 'invalid' | 'success' | 'error'>('loading');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();

        if (data.valid === true) setStatus('valid');
        else if (data.reason === 'already_unsubscribed') setStatus('already');
        else setStatus('invalid');
      } catch {
        setStatus('error');
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });

      if (error) throw error;
      const result = typeof data === 'string' ? JSON.parse(data) : data;
      if (result.success) setStatus('success');
      else if (result.reason === 'already_unsubscribed') setStatus('already');
      else setStatus('error');
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground font-outfit">
          {status === 'success' ? 'Unsubscribed' : 'Email Preferences'}
        </h1>

        {status === 'loading' && (
          <p className="text-muted-foreground">Verifying your request...</p>
        )}

        {status === 'valid' && (
          <>
            <p className="text-muted-foreground">
              Click below to unsubscribe from Cruzi notification emails.
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={submitting}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Unsubscribe'}
            </button>
          </>
        )}

        {status === 'success' && (
          <p className="text-muted-foreground">
            You've been unsubscribed. You won't receive notification emails from Cruzi anymore.
          </p>
        )}

        {status === 'already' && (
          <p className="text-muted-foreground">
            You're already unsubscribed from Cruzi emails.
          </p>
        )}

        {status === 'invalid' && (
          <p className="text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}

        {status === 'error' && (
          <p className="text-destructive">
            Something went wrong. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
};

export default UnsubscribePage;
