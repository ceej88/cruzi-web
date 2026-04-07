import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'lite' | 'elite';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  ai_calls_today: number;
  ai_calls_reset_at: string;
  created_at: string;
  updated_at: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  tier: SubscriptionTier;
  isLoading: boolean;
  studentCount: number;
  studentLimit: number;
  aiCallsToday: number;
  aiCallsLimit: number;
  canAddStudent: boolean;
  canUseAI: boolean;
  isLiteTier: boolean;
  isEliteTier: boolean;
  incrementAIUsage: () => Promise<boolean>;
  refetch: () => void;
}

const LITE_STUDENT_LIMIT = 5;
const LITE_AI_CALLS_LIMIT = 3;

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [studentCount, setStudentCount] = useState(0);

  // Fetch subscription data
  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Use the database function to get or create subscription
      const { data, error } = await supabase.rpc('get_or_create_subscription', {
        _user_id: user.id
      });

      if (error) {
        console.error('Error fetching subscription:', error);
        // Return a default lite subscription
        return {
          id: '',
          user_id: user.id,
          tier: 'lite' as SubscriptionTier,
          status: 'active' as SubscriptionStatus,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          ai_calls_today: 0,
          ai_calls_reset_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Subscription;
      }

      if (data && data.length > 0) {
        const sub = data[0];
        return {
          id: sub.id,
          user_id: sub.user_id,
          tier: sub.tier as SubscriptionTier,
          status: sub.status as SubscriptionStatus,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_start: null,
          current_period_end: null,
          ai_calls_today: sub.ai_calls_today,
          ai_calls_reset_at: sub.ai_calls_reset_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Subscription;
      }

      return null;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Fetch student count
  useEffect(() => {
    const fetchStudentCount = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase.rpc('get_active_student_count', {
        _instructor_id: user.id
      });

      if (!error && typeof data === 'number') {
        setStudentCount(data);
      }
    };

    fetchStudentCount();
  }, [user?.id]);

  // Check and increment AI usage
  const incrementAIUsage = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    const { data, error } = await supabase.rpc('check_and_increment_ai_usage', {
      _user_id: user.id
    });

    if (error) {
      console.error('Error incrementing AI usage:', error);
      return false;
    }

    // Refetch subscription to update UI
    queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
    
    return data === true;
  }, [user?.id, queryClient]);

  const tier = (subscription?.tier || 'lite') as SubscriptionTier;
  const isLiteTier = tier === 'lite';
  const isEliteTier = tier === 'elite';
  const studentLimit = isEliteTier ? Infinity : LITE_STUDENT_LIMIT;
  const aiCallsLimit = isEliteTier ? Infinity : LITE_AI_CALLS_LIMIT;
  const aiCallsToday = subscription?.ai_calls_today || 0;
  const canAddStudent = isEliteTier || studentCount < LITE_STUDENT_LIMIT;
  const canUseAI = isEliteTier || aiCallsToday < LITE_AI_CALLS_LIMIT;

  return {
    subscription,
    tier,
    isLoading,
    studentCount,
    studentLimit,
    aiCallsToday,
    aiCallsLimit,
    canAddStudent,
    canUseAI,
    isLiteTier,
    isEliteTier,
    incrementAIUsage,
    refetch,
  };
}
