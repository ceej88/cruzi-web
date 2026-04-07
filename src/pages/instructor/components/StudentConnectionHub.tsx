// Student Connection Hub Component
// Native app design with brand gradient, 44px touch targets, skeleton loading

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Link2, Share2, RefreshCw, CheckCircle, ChevronDown, ChevronUp, MousePointer, Users, Clock, Shield, QrCode, ChevronLeft, Smartphone, MessageSquare, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import SmsInviteModal from '@/components/sms/SmsInviteModal';
import SmsTopUpModal from '@/components/sms/SmsTopUpModal';
import { useSmsCredits } from '@/hooks/useSmsCredits';

interface InviteLink {
  id: string;
  token: string;
  expires_at: string;
  click_count: number;
  conversion_count: number;
  created_at: string;
}

// ==================== SKELETON LOADING (NO BLANK SCREENS) ====================
const HubSkeleton = () => (
  <div className="fixed inset-0 md:relative flex flex-col bg-background">
    <div className="h-safe-area-top shrink-0" />
    <header className="shrink-0 p-4 pt-6">
      <div className="h-8 w-48 bg-muted/60 rounded-xl animate-pulse" />
      <div className="h-4 w-56 bg-muted/40 rounded-lg animate-pulse mt-2" />
    </header>
    <main className="flex-1 p-4 space-y-6">
      <div className="h-44 bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-teal-400/10 rounded-2xl animate-pulse" />
      <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
      <div className="h-16 bg-muted/30 rounded-xl animate-pulse" />
    </main>
  </div>
);

// ==================== PIN DISPLAY (GLASSMORPHISM + BRAND GRADIENT) ====================
const PinDisplay: React.FC<{ pin: string; onCopy: () => void; copied: boolean }> = ({ pin, onCopy, copied }) => {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl p-6"
      style={{ 
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.12) 50%, rgba(45,212,191,0.10) 100%)' 
      }}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.2em]">
            Your Connection PIN
          </p>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-400/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">Active</span>
          </div>
        </div>
        
        {/* PIN Digits - Glassmorphism */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {pin?.split('').map((digit, i) => (
            <span
              key={i}
              className="w-14 h-18 sm:w-16 sm:h-20 bg-white/80 backdrop-blur-md text-violet-600 rounded-xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg border border-white/50"
            >
              {digit}
            </span>
          ))}
        </div>
        
        {/* Tap to Copy hint */}
        <button
          onClick={onCopy}
          className="w-full mt-5 flex items-center justify-center gap-2 min-h-[44px] active:scale-95 transition-all"
          style={{ touchAction: 'manipulation' }}
        >
          {copied ? (
            <>
              <div className="w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-teal-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600">Tap to Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ==================== QR CODE SECTION ====================
const QRCodeSection: React.FC<{
  hasLink: boolean;
  inviteUrl: string | null;
  onGenerate: () => void;
  isGenerating: boolean;
  linkExpiresIn: string | null;
  clickCount: number;
  conversionCount: number;
}> = ({ hasLink, inviteUrl, onGenerate, isGenerating, linkExpiresIn, clickCount, conversionCount }) => {
  if (!hasLink) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">
          Scan to Join
        </p>
        
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-violet-300 rounded-xl hover:border-violet-400 active:scale-95 transition-all disabled:opacity-50"
          style={{ touchAction: 'manipulation' }}
        >
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
            <QrCode className="w-6 h-6 text-violet-600" />
          </div>
          <span className="text-sm font-bold text-violet-600">
            {isGenerating ? 'Generating...' : 'Generate Secure Link'}
          </span>
          <span className="text-xs text-muted-foreground">
            Create a 7-day link to share on social media
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Scan to Join
        </p>
        <span className="text-[10px] font-medium text-muted-foreground">
          Expires {linkExpiresIn}
        </span>
      </div>
      
      {/* QR Code with corner accents */}
      <div className="flex justify-center mb-4">
        <div className="relative p-4 bg-white rounded-xl">
          {inviteUrl && (
            <QRCodeSVG 
              value={inviteUrl} 
              size={160}
              level="M"
              includeMargin={false}
            />
          )}
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-500 rounded-tl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-500 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-500 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-500 rounded-br" />
        </div>
      </div>
      
      {/* Stats Pills */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
          <MousePointer className="w-3 h-3" />
          <span>{clickCount} clicks</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
          <Users className="w-3 h-3" />
          <span>{conversionCount} joined</span>
        </div>
      </div>
    </div>
  );
};

// ==================== COLLAPSIBLE SECURITY INFO ====================
const SecurityInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger 
        className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] bg-muted/30 rounded-xl active:bg-muted/50 transition-colors"
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-sm font-bold text-foreground">Link Security</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-2 px-4 py-4 bg-muted/20 rounded-xl">
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <span>Links expire automatically after 7 days</span>
          </li>
          <li className="flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <span>Changing your PIN invalidates all existing links</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
            <span>Students need current PIN + valid link to join</span>
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ==================== STICKY BOTTOM ACTION BAR ====================
const StickyActionBar: React.FC<{
  onCopyPin: () => void;
  onCopyLink: () => void;
  onShare: () => void;
  onNewLink: () => void;
  onSendSms: () => void;
  copiedItem: 'pin' | 'link' | null;
  hasLink: boolean;
  isGeneratingLink: boolean;
  smsCredits: number;
}> = ({ onCopyPin, onCopyLink, onShare, onNewLink, onSendSms, copiedItem, hasLink, isGeneratingLink, smsCredits }) => {
  return (
    <footer 
      className="shrink-0 bg-card/95 backdrop-blur-md border-t border-border p-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
    >
      <div className="max-w-lg mx-auto space-y-2">
        {/* SMS Send Button - Primary Action */}
        <button
          onClick={onSendSms}
          className="w-full flex items-center justify-center gap-2 min-h-[48px] text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg"
          style={{ 
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #2DD4BF 100%)',
            touchAction: 'manipulation'
          }}
        >
          <Smartphone className="w-4 h-4" />
          <span>Send via SMS</span>
          <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
            {smsCredits} credits
          </span>
        </button>
        
        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCopyPin}
            className="flex items-center justify-center gap-2 min-h-[48px] bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-bold active:scale-95 active:bg-slate-50 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            {copiedItem === 'pin' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy PIN</span>
              </>
            )}
          </button>
          
          <button
            onClick={onCopyLink}
            className="flex items-center justify-center gap-2 min-h-[48px] bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-bold active:scale-95 active:bg-slate-50 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            {copiedItem === 'link' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
          
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 min-h-[48px] bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-bold active:scale-95 active:bg-slate-50 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <Share2 className="w-4 h-4" />
            <span>Share...</span>
          </button>
          
          <button
            onClick={onNewLink}
            disabled={isGeneratingLink}
            className="flex items-center justify-center gap-2 min-h-[48px] bg-muted text-muted-foreground rounded-2xl font-bold active:scale-95 active:bg-muted/80 transition-all disabled:opacity-50"
            style={{ touchAction: 'manipulation' }}
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingLink ? 'animate-spin' : ''}`} />
            <span>New Link</span>
          </button>
        </div>
      </div>
      
      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </footer>
  );
};

// ==================== MAIN COMPONENT ====================
const StudentConnectionHub: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedItem, setCopiedItem] = useState<'pin' | 'link' | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [instructorName, setInstructorName] = useState<string>('');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const { credits: smsCredits, checkPurchaseSuccess } = useSmsCredits();

  // Check for SMS purchase success on mount
  useEffect(() => {
    checkPurchaseSuccess();
  }, [checkPurchaseSuccess]);

  const baseUrl = window.location.origin;

  // Fetch PIN and active link on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('instructor_pin, full_name, email')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profile?.instructor_pin) {
          setPin(profile.instructor_pin);
        } else {
          const { data: newPin, error: genError } = await supabase
            .rpc('generate_instructor_pin', { _user_id: user.id });
          
          if (genError) throw genError;
          setPin(newPin);
        }
        
        setInstructorName(profile?.full_name || profile?.email?.split('@')[0] || 'Instructor');

        const { data: links, error: linkError } = await supabase
          .from('invite_links')
          .select('*')
          .eq('instructor_id', user.id)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!linkError && links && links.length > 0) {
          setInviteLink(links[0]);
        }
      } catch (err) {
        console.error('Error loading connection hub:', err);
        toast({ title: 'Error loading data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Generate or refresh invite link
  const handleGenerateLink = useCallback(async () => {
    if (!user?.id) return;
    
    setIsGeneratingLink(true);
    if (navigator.vibrate) navigator.vibrate(20);
    
    try {
      const { data, error } = await supabase
        .rpc('generate_invite_link', { _user_id: user.id });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const { data: newLink, error: fetchError } = await supabase
          .from('invite_links')
          .select('*')
          .eq('token', data[0].token)
          .single();
        
        if (!fetchError && newLink) {
          setInviteLink(newLink);
          toast({ title: 'New link generated', description: 'Fresh 7-day link ready to share!' });
          if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        }
      }
    } catch (err) {
      console.error('Error generating link:', err);
      toast({ title: 'Error generating link', variant: 'destructive' });
    } finally {
      setIsGeneratingLink(false);
    }
  }, [user?.id]);

  // Copy PIN to clipboard
  const handleCopyPin = useCallback(() => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopiedItem('pin');
    toast({ title: 'PIN copied!' });
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setTimeout(() => setCopiedItem(null), 2000);
  }, [pin]);

  // Copy full invite URL
  const handleCopyLink = useCallback(() => {
    if (!inviteLink) {
      handleGenerateLink();
      return;
    }
    
    const url = `${baseUrl}/join?t=${inviteLink.token}`;
    navigator.clipboard.writeText(url);
    setCopiedItem('link');
    toast({ title: 'Link copied!' });
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    setTimeout(() => setCopiedItem(null), 2000);
  }, [inviteLink, baseUrl, handleGenerateLink]);

  // Native share
  const handleShare = useCallback(async () => {
    if (!inviteLink) {
      await handleGenerateLink();
      return;
    }
    
    const url = `${baseUrl}/join?t=${inviteLink.token}`;
    const shareData = {
      title: `Join ${instructorName}'s Driving School on Cruzi`,
      text: `Use PIN ${pin} or tap the link to join my driving school and start booking lessons!`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      } catch (err) {
        handleCopyLink();
      }
    } else {
      const text = `${shareData.text}\n${url}`;
      navigator.clipboard.writeText(text);
      toast({ title: 'Share text copied!' });
    }
  }, [inviteLink, baseUrl, instructorName, pin, handleCopyLink, handleGenerateLink]);

  const linkExpiresIn = inviteLink ? formatDistanceToNow(new Date(inviteLink.expires_at), { addSuffix: true }) : null;
  const inviteUrl = inviteLink ? `${baseUrl}/join?t=${inviteLink.token}` : null;

  if (isLoading) {
    return <HubSkeleton />;
  }

  return (
    <>
      {/* ========== MOBILE/TABLET (< 1024px) ========== */}
      <div className="lg:hidden fixed inset-0 flex flex-col bg-background overflow-hidden">
        {/* Safe area top */}
        <div className="h-safe-area-top shrink-0" />
        
        {/* Header with Back Button */}
        <header className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              navigate(-1);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-card border border-border text-foreground active:scale-95 transition-transform"
            style={{ touchAction: 'manipulation' }}
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black italic text-foreground tracking-tight">Connection Hub</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Student Onboarding Center</p>
          </div>
        </header>

        {/* Scrollable Content */}
        <main 
          className="flex-1 overflow-y-auto px-4 pb-8 space-y-5 scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            transform: 'translateZ(0)'
          }}
        >
          {/* PIN Display */}
          {pin && (
            <PinDisplay 
              pin={pin} 
              onCopy={handleCopyPin} 
              copied={copiedItem === 'pin'} 
            />
          )}

          {/* QR Code Section */}
          <QRCodeSection
            hasLink={!!inviteLink}
            inviteUrl={inviteUrl}
            onGenerate={handleGenerateLink}
            isGenerating={isGeneratingLink}
            linkExpiresIn={linkExpiresIn}
            clickCount={inviteLink?.click_count || 0}
            conversionCount={inviteLink?.conversion_count || 0}
          />

          {/* How students join - Collapsible */}
          <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
            <CollapsibleTrigger 
              className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] bg-gradient-to-r from-violet-500 via-purple-500 to-teal-400 rounded-xl text-white font-bold active:opacity-90 transition-opacity"
              style={{ touchAction: 'manipulation' }}
            >
              <span>How students join</span>
              {isHowItWorksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 px-4 py-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-teal-400/10 rounded-xl border border-violet-200">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-black text-violet-600 flex-shrink-0">1.</span>
                  <span className="text-foreground">Share your PIN or link via text, social media, or in person</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-violet-600 flex-shrink-0">2.</span>
                  <span className="text-foreground">Students scan the QR code or click your link to create an account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-violet-600 flex-shrink-0">3.</span>
                  <span className="text-foreground">They enter your PIN and get automatically linked to you</span>
                </li>
              </ul>
              <p className="text-xs text-violet-600 mt-4 pt-3 border-t border-violet-200">
                <strong>Tip:</strong> Put this PIN on your business card, car door, or website!
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Security Info */}
          <SecurityInfo />
        </main>

        {/* Sticky Bottom Action Bar */}
        <StickyActionBar
          onCopyPin={handleCopyPin}
          onCopyLink={handleCopyLink}
          onShare={handleShare}
          onNewLink={handleGenerateLink}
          onSendSms={() => setShowSmsModal(true)}
          copiedItem={copiedItem}
          hasLink={!!inviteLink}
          isGeneratingLink={isGeneratingLink}
          smsCredits={smsCredits}
        />
      </div>

      {/* ========== DESKTOP (>= 1024px) ========== */}
      <div className="hidden lg:block">
        {/* Page header with back button */}
        <div className="mb-8 flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black italic text-foreground tracking-tight">
              Student Connection Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage student onboarding and invitation links
            </p>
          </div>
        </div>
        
        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left column: PIN + QR */}
          <div className="space-y-6">
            {pin && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <PinDisplay pin={pin} onCopy={handleCopyPin} copied={copiedItem === 'pin'} />
              </div>
            )}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <QRCodeSection
                hasLink={!!inviteLink}
                inviteUrl={inviteUrl}
                onGenerate={handleGenerateLink}
                isGenerating={isGeneratingLink}
                linkExpiresIn={linkExpiresIn}
                clickCount={inviteLink?.click_count || 0}
                conversionCount={inviteLink?.conversion_count || 0}
              />
            </div>
          </div>

          {/* Right column: Actions + Stats */}
          <div className="space-y-6">
            {/* SMS Invite Card */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Send via SMS
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary">{smsCredits} credits</span>
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Top Up
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSmsModal(true)}
                className="w-full flex items-center justify-center gap-2 min-h-[44px] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #2DD4BF 100%)' }}
              >
                <Smartphone className="h-4 w-4" />
                Send Invite via SMS
              </button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                1 credit per SMS • Includes your invite link
              </p>
            </div>
            
            {/* Quick Actions Card */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyPin}
                  className="flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 border border-border bg-card rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
                  {copiedItem === 'pin' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-teal-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy PIN
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 border border-border bg-card rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
                  {copiedItem === 'link' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-teal-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 border border-border bg-card rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={handleGenerateLink}
                  disabled={isGeneratingLink}
                  className="flex items-center justify-center gap-2 min-h-[36px] px-4 py-2 bg-muted text-muted-foreground rounded-xl font-medium text-sm hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isGeneratingLink ? 'animate-spin' : ''}`} />
                  New Link
                </button>
              </div>
            </div>
            
            {/* Stats Card */}
            {inviteLink && (
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Link Analytics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <p className="text-2xl font-black text-violet-600">{inviteLink.click_count}</p>
                    <p className="text-xs text-muted-foreground">Link Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <p className="text-2xl font-black text-teal-600">{inviteLink.conversion_count}</p>
                    <p className="text-xs text-muted-foreground">Students Joined</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Info */}
            <SecurityInfo />
            
            {/* How it works (collapsible) */}
            <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
              <CollapsibleTrigger 
                className="w-full flex items-center justify-between px-4 py-3 min-h-[36px] bg-gradient-to-r from-violet-500 via-purple-500 to-teal-400 rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
              >
                <span>How students join</span>
                {isHowItWorksOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 px-4 py-4 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-teal-400/10 rounded-xl border border-violet-200">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-black text-violet-600 flex-shrink-0">1.</span>
                    <span className="text-foreground">Share your PIN or link via text, social media, or in person</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-black text-violet-600 flex-shrink-0">2.</span>
                    <span className="text-foreground">Students scan the QR code or click your link to create an account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-black text-violet-600 flex-shrink-0">3.</span>
                    <span className="text-foreground">They enter your PIN and get automatically linked to you</span>
                  </li>
                </ul>
                <p className="text-xs text-violet-600 mt-4 pt-3 border-t border-violet-200">
                  <strong>Tip:</strong> Put this PIN on your business card, car door, or website!
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* SMS Modals */}
      {inviteUrl && pin && (
        <SmsInviteModal
          isOpen={showSmsModal}
          onClose={() => setShowSmsModal(false)}
          inviteUrl={inviteUrl}
          instructorName={instructorName}
          pin={pin}
        />
      )}
      <SmsTopUpModal isOpen={showTopUpModal} onClose={() => setShowTopUpModal(false)} />
    </>
  );
};

export default StudentConnectionHub;
