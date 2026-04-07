import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type InstructorTier = 'lite' | 'elite';

interface UseInstructorTierReturn {
  tier: InstructorTier;
  isLite: boolean;
  isElite: boolean;
  isLoading: boolean;
}

export function useInstructorTier(): UseInstructorTierReturn {
  const { user } = useAuth();

  const { data: tier, isLoading } = useQuery({
    queryKey: ['instructor-tier', user?.id],
    queryFn: async (): Promise<InstructorTier> => {
      if (!user?.id) return 'lite';

      // Step 1: Get student's instructor_id from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('instructor_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile?.instructor_id) {
        console.log('No instructor linked or error fetching profile');
        return 'lite';
      }

      // Step 2: Get instructor's subscription tier
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', profile.instructor_id)
        .maybeSingle();

      if (subError || !subscription) {
        console.log('No subscription found for instructor');
        return 'lite';
      }

      return (subscription.tier as InstructorTier) || 'lite';
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true, // Refresh when tab regains focus
    refetchOnMount: 'always', // Always refetch on mount
  });

  const currentTier = tier || 'lite';

  return {
    tier: currentTier,
    isLite: currentTier === 'lite',
    isElite: currentTier === 'elite',
    isLoading,
  };
}
