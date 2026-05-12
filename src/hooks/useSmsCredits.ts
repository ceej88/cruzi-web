// SMS Credits Hook - Manage instructor SMS credit balance and purchases
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// SMS Credit Pack type
//
// PR-4-B: `perSms` field removed. Per Erica's brief, prominent "Xp each"
// labels are gone; pricing transparency now lives in the BundleConfirmModal,
// which always shows a 3-line breakdown (SMS delivery cost / Service &
// processing fee / Total today). The `breakdown` field below is the source
// of truth for that modal, in pence, and matches the Stripe Price metadata
// (`sms_delivery_pence`, `service_fee_pence`) for the new 100/150/200 packs.
// For the existing 10/25/50 packs the same accounting is back-filled
// using the same 4p-per-SMS delivery wholesale Erica used for the new packs.
export interface SmsPack {
  credits: number;
  price: string;
  label: string;
  breakdown: {
    deliveryPence: number;
    servicePence: number;
    totalPence: number;
  };
  popular?: boolean;
  bestValue?: boolean;
}

// SMS Credit Packs configuration
//
// PR-4-B: extended from 3 → 6 entries. Existing 10/25/50 priceId / total
// price unchanged. New 100/150/200 packs target the Stripe Prices created
// in PR-4 step 1 and validated by purchase-sms-credits v18 backend allow-list.
// Badges moved per brief: Popular → 100, Best Value → 200.
export const SMS_PACKS: Record<string, SmsPack> = {
  '10':  { credits: 10,  price: '£1.49',  label: '10 SMS',  breakdown: { deliveryPence:  40, servicePence: 109, totalPence:  149 } },
  '25':  { credits: 25,  price: '£2.99',  label: '25 SMS',  breakdown: { deliveryPence: 100, servicePence: 199, totalPence:  299 } },
  '50':  { credits: 50,  price: '£4.99',  label: '50 SMS',  breakdown: { deliveryPence: 200, servicePence: 299, totalPence:  499 } },
  '100': { credits: 100, price: '£6.50',  label: '100 SMS', breakdown: { deliveryPence: 400, servicePence: 250, totalPence:  650 }, popular:   true },
  '150': { credits: 150, price: '£8.75',  label: '150 SMS', breakdown: { deliveryPence: 600, servicePence: 275, totalPence:  875 } },
  '200': { credits: 200, price: '£11.00', label: '200 SMS', breakdown: { deliveryPence: 800, servicePence: 300, totalPence: 1100 }, bestValue: true },
};

export type PackSize = '10' | '25' | '50' | '100' | '150' | '200';

interface SmsCreditsData {
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
}

interface SendSmsParams {
  phoneNumber: string;
  message: string;
  recipientUserId?: string;
  transactionType: 'SEND_INVITE' | 'SEND_BROADCAST';
}

export function useSmsCredits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Fetch current SMS credit balance
  const { data: credits, isLoading, refetch } = useQuery({
    queryKey: ['sms-credits', user?.id],
    queryFn: async (): Promise<SmsCreditsData> => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('get_or_create_sms_credits', { _instructor_id: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          balance: data[0].balance,
          lifetime_purchased: data[0].lifetime_purchased,
          lifetime_used: data[0].lifetime_used,
        };
      }
      
      return { balance: 0, lifetime_purchased: 0, lifetime_used: 0 };
    },
    enabled: !!user?.id,
  });

  // Purchase SMS credits
  const purchaseCredits = useCallback(async (packSize: PackSize) => {
    if (!user?.id) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to purchase SMS credits.',
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);

    // Open window synchronously to avoid popup blocker
    const checkoutWindow = window.open('about:blank', '_blank');

    try {
      const { data, error } = await supabase.functions.invoke('purchase-sms-credits', {
        body: { packSize },
      });

      if (error) throw error;

      if (data?.url && checkoutWindow) {
        checkoutWindow.location.href = data.url;
      } else if (data?.url) {
        // Fallback: redirect current window if popup was blocked
        window.location.href = data.url;
      } else {
        checkoutWindow?.close();
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      checkoutWindow?.close();
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Failed to initiate purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  }, [user?.id]);

  // Send SMS mutation
  const sendSmsMutation = useMutation({
    mutationFn: async (params: SendSmsParams) => {
      const { data, error } = await supabase.functions.invoke('send-twilio-sms', {
        body: params,
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send SMS');
      }

      return data;
    },
    onSuccess: (data) => {
      // Refresh credits after sending
      queryClient.invalidateQueries({ queryKey: ['sms-credits'] });
      
      toast({
        title: 'SMS sent!',
        description: `Message delivered. ${data.creditsRemaining} credits remaining.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to send SMS';
      const isInsufficientCredits = errorMessage.includes('Insufficient');
      
      toast({
        title: isInsufficientCredits ? 'No SMS credits' : 'SMS failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Check if purchase was successful (from URL params)
  const checkPurchaseSuccess = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const smsPurchase = urlParams.get('sms_purchase');
    const creditsAdded = urlParams.get('credits');

    if (smsPurchase === 'success' && creditsAdded) {
      toast({
        title: 'Credits added!',
        description: `${creditsAdded} SMS credits have been added to your account.`,
      });
      
      // Clean up URL
      urlParams.delete('sms_purchase');
      urlParams.delete('credits');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
      
      // Refresh credits
      refetch();
    }
  }, [refetch]);

  return {
    credits: credits?.balance ?? 0,
    lifetimePurchased: credits?.lifetime_purchased ?? 0,
    lifetimeUsed: credits?.lifetime_used ?? 0,
    isLoading,
    isPurchasing,
    purchaseCredits,
    sendSms: sendSmsMutation.mutateAsync,
    isSending: sendSmsMutation.isPending,
    refetch,
    checkPurchaseSuccess,
  };
}
