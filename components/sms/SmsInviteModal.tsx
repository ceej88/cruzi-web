// SMS Invite Modal - Send invitation link via SMS
// Native App Rulebook: 44px touch targets, skeleton loading, haptic feedback

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import { 
  Smartphone, 
  Send, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  Plus
} from 'lucide-react';
import SmsTopUpModal from './SmsTopUpModal';

interface SmsInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteUrl: string;
  instructorName: string;
  pin: string;
}

const SmsInviteModal: React.FC<SmsInviteModalProps> = ({ 
  isOpen, 
  onClose, 
  inviteUrl,
  instructorName,
  pin
}) => {
  const { credits, sendSms, isSending, isLoading } = useSmsCredits();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setError(null);
    
    // Basic UK phone validation
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!/^(0|\+44)?7\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid UK mobile number');
      return;
    }

    if (credits < 1) {
      setShowTopUp(true);
      return;
    }

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);

    const message = `${instructorName} has invited you to join their driving school on Cruzi! 🚗\n\nTap the link to get started: ${inviteUrl}\n\nOr use PIN: ${pin}`;

    try {
      await sendSms({
        phoneNumber: cleanPhone,
        message,
        transactionType: 'SEND_INVITE',
      });
      
      // Success haptic
      if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      setPhoneNumber('');
      onClose();
    } catch (err) {
      // Error handled by hook toast
      console.error('SMS send error:', err);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setPhoneNumber('');
      setError(null);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
                <Smartphone className="h-5 w-5" />
              </div>
              Send via SMS
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send your invite link directly to a student's phone
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Credits Display */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">SMS Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-lg ${credits > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {isLoading ? '...' : credits}
                </span>
                <button
                  onClick={() => setShowTopUp(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors min-h-[32px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Plus className="h-3 w-3" />
                  Top Up
                </button>
              </div>
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Student's Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="07xxx xxxxxx"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setError(null);
                }}
                className="h-12 text-lg font-medium rounded-xl"
                disabled={isSending}
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </div>
              )}
            </div>

            {/* Message Preview */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Message Preview
              </label>
              <div className="p-3 bg-muted/30 rounded-xl text-sm text-muted-foreground border border-border">
                <p className="font-medium text-foreground">{instructorName} has invited you to join their driving school on Cruzi! 🚗</p>
                <p className="mt-2 text-xs break-all">Tap the link to get started: {inviteUrl.slice(0, 40)}...</p>
                <p className="mt-1 text-xs">Or use PIN: {pin}</p>
              </div>
            </div>

            {/* Insufficient Credits Warning */}
            {credits < 1 && !isLoading && (
              <div className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-destructive">No SMS credits</p>
                  <p className="text-xs text-muted-foreground">Top up to send invites via SMS</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSending}
                className="flex-1 min-h-[48px] rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !phoneNumber.trim() || credits < 1}
                className="flex-1 min-h-[48px] rounded-xl font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #2DD4BF 100%)',
                  touchAction: 'manipulation'
                }}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send SMS
              </Button>
            </div>

            {/* Cost Info */}
            <p className="text-center text-[10px] text-muted-foreground">
              1 credit per SMS • Secure delivery via Twilio
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Up Modal */}
      <SmsTopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
    </>
  );
};

export default SmsInviteModal;
