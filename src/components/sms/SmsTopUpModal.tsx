import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SMS_PACKS, PackSize, SmsPack, useSmsCredits } from '@/hooks/useSmsCredits';
import { MessageSquare, Star, Trophy, Loader2 } from 'lucide-react';

interface SmsTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SmsTopUpModal: React.FC<SmsTopUpModalProps> = ({ isOpen, onClose }) => {
  const { credits, purchaseCredits, isPurchasing } = useSmsCredits();
  const [selectedPack, setSelectedPack] = React.useState<PackSize | null>(null);

  const handlePurchase = async (packSize: PackSize) => {
    setSelectedPack(packSize);
    await purchaseCredits(packSize);
    setSelectedPack(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg">
              <MessageSquare className="h-5 w-5" />
            </div>
            SMS Credits
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Top up your SMS credits to send invites and broadcasts
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance */}
        <div className="p-4 bg-muted/50 rounded-xl text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
            Current Balance
          </p>
          <p className="text-3xl font-black text-primary">{credits}</p>
          <p className="text-xs text-muted-foreground">SMS credits remaining</p>
        </div>

        {/* Pack Options */}
        <div className="space-y-3 pt-2">
          {(Object.entries(SMS_PACKS) as [PackSize, SmsPack][]).map(([size, pack]) => (
            <button
              key={size}
              onClick={() => handlePurchase(size)}
              disabled={isPurchasing}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                pack.popular 
                  ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                  : pack.bestValue
                    ? 'border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">{pack.label}</span>
                    {pack.popular && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" /> Popular
                      </span>
                    )}
                    {pack.bestValue && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                        <Trophy className="h-3 w-3" /> Best Value
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{pack.perSms}</p>
                </div>
              </div>
              
              <div className="text-right">
                {isPurchasing && selectedPack === size ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <span className="font-black text-xl">{pack.price}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-muted-foreground">
            Credits never expire • Secure payment via Stripe
          </p>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full rounded-xl font-bold">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SmsTopUpModal;
