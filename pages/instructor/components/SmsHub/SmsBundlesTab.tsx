import React from 'react';
import { Loader2 } from 'lucide-react';
import { SMS_PACKS, PackSize, useSmsCredits } from '@/hooks/useSmsCredits';

const SmsBundlesTab: React.FC = () => {
  const { isPurchasing, purchaseCredits } = useSmsCredits();

  return (
    <div className="p-4 space-y-3">
      {(Object.entries(SMS_PACKS) as [PackSize, typeof SMS_PACKS[PackSize]][]).map(([size, pack]) => (
        <div
          key={size}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >
          <p className="text-sm text-[#1A1A2E]">
            <span className="font-bold">{pack.price} Bundle</span> - {pack.credits} SMS ({pack.perSms})
          </p>
          <button
            onClick={() => purchaseCredits(size)}
            disabled={isPurchasing}
            className="mt-3 px-5 py-2 bg-slate-100 text-[#1A1A2E] rounded-lg text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 border border-slate-200"
            style={{ touchAction: 'manipulation' }}
          >
            {isPurchasing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Buy Bundle'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default SmsBundlesTab;
