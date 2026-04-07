// Join Page - Public route for invite link validation
// Students land here when clicking a shared invite link

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, GraduationCap, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';

interface InviteData {
  instructor_id: string;
  instructor_name: string;
  instructor_pin: string;
}

const JoinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('t');
  
  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No invite token provided');
        setIsValidating(false);
        return;
      }

      try {
        const { data, error: rpcError } = await supabase
          .rpc('validate_invite_link', { _token: token });

        if (rpcError) throw rpcError;

        if (data && data.length > 0) {
          const result = data[0];
          if (result.is_valid) {
            setInviteData({
              instructor_id: result.instructor_id,
              instructor_name: result.instructor_name || 'Your Instructor',
              instructor_pin: result.instructor_pin || '',
            });
          } else {
            setError(result.error_message || 'This link is no longer valid');
          }
        } else {
          setError('Invalid link');
        }
      } catch (err) {
        console.error('Error validating invite:', err);
        setError('Unable to validate invite link. Please try again.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Navigate to auth with pre-filled data
  const handleContinue = () => {
    if (!inviteData) return;
    
    // Store invite data in sessionStorage for the auth page to pick up
    sessionStorage.setItem('cruzi_invite_data', JSON.stringify({
      instructorId: inviteData.instructor_id,
      instructorName: inviteData.instructor_name,
      pin: inviteData.instructor_pin,
      token: token,
    }));
    
    navigate('/auth?mode=signup&role=student');
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Validating your invite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-2">Link Invalid</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Ask your instructor for a new link or enter their PIN manually when signing up.
          </p>
          <Button
            onClick={() => navigate('/auth?role=student')}
            className="w-full"
          >
            Go to Sign Up
          </Button>
        </div>
      </div>
    );
  }

  // Valid invite - show confirmation
  const instructorFirst = inviteData?.instructor_name?.split(' ')[0] || 'your instructor';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-5">

        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">You've been invited</h1>
          <p className="text-muted-foreground mt-2">
            {inviteData?.instructor_name} has invited you to learn to drive with Cruzi.
          </p>
        </div>

        {/* Invite verified badge */}
        <div className="flex items-center gap-2 justify-center text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-bold">Invite verified — link is valid</span>
        </div>

        {/* App download — PRIMARY CTA */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Best experience
          </div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-black text-foreground">Get the Cruzi app</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Download Cruzi on your phone, then tap this invite link again to connect to {instructorFirst} automatically.
          </p>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="block mt-2">
            <img
              src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-14 mx-auto hover:opacity-90 transition-opacity"
            />
          </a>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or continue on the web</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Instructor card + web CTA — secondary */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-black text-base flex-shrink-0">
              {inviteData?.instructor_name?.slice(0, 2).toUpperCase() || 'IN'}
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Instructor</p>
              <p className="text-lg font-black text-foreground">{inviteData?.instructor_name}</p>
            </div>
          </div>

          {inviteData?.instructor_pin && (
            <div className="text-center mb-5 bg-muted/50 rounded-xl p-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Instructor PIN</p>
              <div className="flex items-center justify-center gap-1.5">
                {inviteData.instructor_pin.split('').map((digit, i) => (
                  <span key={i} className="w-9 h-11 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg font-black">
                    {digit}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">This PIN will be pre-filled when you sign up</p>
            </div>
          )}

          <Button
            onClick={handleContinue}
            variant="outline"
            className="w-full h-12 text-base font-bold rounded-xl"
          >
            Create Account on Web
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate('/auth?mode=login')} className="text-primary font-bold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default JoinPage;
