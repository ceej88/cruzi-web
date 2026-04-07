import React, { useState } from 'react';
import { X, Crown, Users, Zap, FileText, Shield, Loader2, CreditCard, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession } from '@/services/stripeService';
import { toast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  reason?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, reason }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const { url } = await createCheckoutSession();
      if (url) {
        window.open(url, '_blank');
        onUpgrade?.();
        onClose();
        toast({
          title: 'Checkout opened',
          description: 'Complete your payment in the new tab to activate Elite.',
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Upgrade failed',
        description: error instanceof Error ? error.message : 'Could not start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const benefits = [
    { icon: Users, text: 'Unlimited Student Capacity', description: 'Scale your academy without limits' },
    { icon: Zap, text: 'Faster Voice Notes', description: 'No waiting, instant results' },
    { icon: FileText, text: 'Stripe Merchant Integration', description: 'Accept payments directly from students' },
    { icon: Shield, text: 'Unlimited Lesson Records', description: 'No daily limits on voice notes' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-foreground/80 backdrop-blur-xl flex items-end md:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-card w-full md:max-w-md max-h-[75vh] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden border border-border flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Ultra Compact Header */}
          <div className="bg-foreground px-4 py-4 text-background relative overflow-hidden shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Go Elite</h2>
                <p className="text-primary text-[8px] font-bold uppercase tracking-widest">Unlock full potential</p>
              </div>
            </div>
          </div>

          {/* Compact Benefits */}
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            {reason && (
              <div className="bg-primary/10 px-3 py-2 rounded-lg border border-primary/20 flex gap-2 items-center">
                <Zap className="h-3 w-3 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-primary italic line-clamp-1">"{reason}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5">
              {benefits.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[9px] font-bold text-foreground leading-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Footer */}
          <div className="p-3 bg-muted/30 border-t border-border shrink-0 space-y-2">
            <button 
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full py-3 bg-foreground text-background rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 text-amber-400" />
              )}
              {isProcessing ? 'Processing...' : 'Upgrade £29.99/mo'}
            </button>
            
            <div className="flex items-center justify-between px-1">
              <button 
                onClick={onClose}
                className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
              >
                Maybe Later
              </button>
              <div className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-2.5 w-2.5" />
                <span className="text-[7px] font-bold uppercase">Stripe Secured</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal;