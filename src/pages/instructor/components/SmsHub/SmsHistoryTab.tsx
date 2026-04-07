import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const SmsHistoryTab: React.FC = () => {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['sms-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 text-center py-20">
        <p className="text-sm text-[#6B7280]">No SMS history yet</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED' || status === 'SENT') return <CheckCircle className="h-3.5 w-3.5 text-[#34C759]" />;
    if (status === 'FAILED') return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    return <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />;
  };

  return (
    <div className="p-4 space-y-0">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0"
        >
          <div className="mt-1">{getStatusIcon(tx.status)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#1A1A2E] line-clamp-2">
              {tx.message_preview || tx.transaction_type.replace(/_/g, ' ')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-[#6B7280]">
                {tx.transaction_type === 'PURCHASE' ? `+${tx.credits_change} credits` : `${tx.credits_change} credit`}
              </span>
              {tx.recipient_phone && (
                <span className="text-[10px] text-[#6B7280]">→ {tx.recipient_phone}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-medium text-[#6B7280] leading-tight">
              {format(new Date(tx.created_at), 'd MMM')}<br />
              {format(new Date(tx.created_at), 'HH:mm')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmsHistoryTab;
