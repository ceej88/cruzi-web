// Cruzi AI - Student Pricing Hooks
// Manages custom pricing, block booking, and gifted hours

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface StudentPricing {
  id: string;
  instructor_id: string;
  student_id: string;
  pricing_type: 'PERCENTAGE' | 'FIXED_RATE';
  discount_percent: number;
  custom_hourly_rate: number | null;
  applies_to: 'ALL' | 'SINGLE_ONLY' | 'BLOCKS_ONLY';
  gifted_hours: number;
  label: string | null;
  created_at: string;
  updated_at: string;
}

export interface EffectivePricing {
  has_custom_pricing: boolean;
  pricing_type: string;
  discount_percent: number;
  custom_hourly_rate: number | null;
  applies_to: string;
  gifted_hours: number;
  label: string | null;
  instructor_hourly_rate: number | null;
  block_booking_enabled: boolean;
  block_10_price: number | null;
  block_20_price: number | null;
  block_30_price: number | null;
}

export interface InstructorPricingSettings {
  hourly_rate: number | null;
  block_booking_enabled: boolean;
  block_10_price: number | null;
  block_20_price: number | null;
  block_30_price: number | null;
}

// Calculate effective price based on pricing rules
export function calculateEffectivePrice(
  basePrice: number,
  pricing: EffectivePricing | null,
  isBlock: boolean
): { price: number; savings: number; label: string | null } {
  if (!pricing || !pricing.has_custom_pricing) {
    return { price: basePrice, savings: 0, label: null };
  }

  // Check if discount applies to this type
  const applies = pricing.applies_to === 'ALL' ||
    (isBlock && pricing.applies_to === 'BLOCKS_ONLY') ||
    (!isBlock && pricing.applies_to === 'SINGLE_ONLY');

  if (!applies) {
    return { price: basePrice, savings: 0, label: pricing.label };
  }

  if (pricing.pricing_type === 'FIXED_RATE' && pricing.custom_hourly_rate) {
    const price = pricing.custom_hourly_rate;
    return { price, savings: basePrice - price, label: pricing.label };
  }

  if (pricing.pricing_type === 'PERCENTAGE' && pricing.discount_percent > 0) {
    const discount = basePrice * (pricing.discount_percent / 100);
    return { price: basePrice - discount, savings: discount, label: pricing.label };
  }

  return { price: basePrice, savings: 0, label: pricing.label };
}

// INSTRUCTOR HOOKS

// Hook: Get instructor's pricing settings (from their own profile)
export function useInstructorPricingSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['instructor-pricing-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('hourly_rate, block_booking_enabled, block_10_price, block_20_price, block_30_price')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as InstructorPricingSettings | null;
    },
    enabled: !!user?.id,
  });
}

// Hook: Update instructor pricing settings
export function useUpdateInstructorPricing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<InstructorPricingSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-pricing-settings'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-own-profile'] });
      toast.success('Pricing settings updated');
    },
    onError: (error) => {
      console.error('Pricing update error:', error);
      toast.error('Failed to update pricing');
    },
  });
}

// Hook: Get all student pricing for instructor
export function useInstructorStudentPricing() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['instructor-student-pricing', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('student_pricing')
        .select('*')
        .eq('instructor_id', user.id);

      if (error) throw error;
      return data as StudentPricing[];
    },
    enabled: !!user?.id,
  });
}

// Hook: Get pricing for a specific student (instructor view)
export function useStudentPricingForInstructor(studentId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-pricing-detail', user?.id, studentId],
    queryFn: async () => {
      if (!user?.id || !studentId) return null;

      const { data, error } = await supabase
        .from('student_pricing')
        .select('*')
        .eq('instructor_id', user.id)
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) throw error;
      return data as StudentPricing | null;
    },
    enabled: !!user?.id && !!studentId,
  });
}

// Hook: Upsert student pricing (create or update)
export function useUpsertStudentPricing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricing: {
      student_id: string;
      pricing_type: 'PERCENTAGE' | 'FIXED_RATE';
      discount_percent?: number;
      custom_hourly_rate?: number | null;
      applies_to?: 'ALL' | 'SINGLE_ONLY' | 'BLOCKS_ONLY';
      gifted_hours?: number;
      label?: string | null;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('student_pricing')
        .upsert({
          instructor_id: user.id,
          student_id: pricing.student_id,
          pricing_type: pricing.pricing_type,
          discount_percent: pricing.discount_percent || 0,
          custom_hourly_rate: pricing.custom_hourly_rate || null,
          applies_to: pricing.applies_to || 'ALL',
          gifted_hours: pricing.gifted_hours || 0,
          label: pricing.label || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'instructor_id,student_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-student-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing-detail'] });
      toast.success('Student pricing updated');
    },
    onError: (error) => {
      console.error('Student pricing error:', error);
      toast.error('Failed to update student pricing');
    },
  });
}

// Hook: Add gifted hours to a student
export function useAddGiftedHours() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, hours }: { studentId: string; hours: number }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // First get existing pricing or create new
      const { data: existing } = await supabase
        .from('student_pricing')
        .select('gifted_hours')
        .eq('instructor_id', user.id)
        .eq('student_id', studentId)
        .maybeSingle();

      const currentGifted = existing?.gifted_hours || 0;

      const { data, error } = await supabase
        .from('student_pricing')
        .upsert({
          instructor_id: user.id,
          student_id: studentId,
          gifted_hours: currentGifted + hours,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'instructor_id,student_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-student-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing-detail'] });
      toast.success(`${variables.hours} gifted hours added`);
    },
    onError: (error) => {
      console.error('Gift hours error:', error);
      toast.error('Failed to add gifted hours');
    },
  });
}

// Hook: Delete student pricing (reset to default)
export function useDeleteStudentPricing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('student_pricing')
        .delete()
        .eq('instructor_id', user.id)
        .eq('student_id', studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-student-pricing'] });
      queryClient.invalidateQueries({ queryKey: ['student-pricing-detail'] });
      toast.success('Pricing reset to default');
    },
    onError: (error) => {
      console.error('Delete pricing error:', error);
      toast.error('Failed to reset pricing');
    },
  });
}

// STUDENT HOOKS

// Hook: Get student's effective pricing (their personalized rates)
export function useStudentEffectivePricing() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-effective-pricing', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // First get student's instructor_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('instructor_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile?.instructor_id) return null;

      // Call the RPC function
      const { data, error } = await supabase
        .rpc('get_student_effective_pricing', {
          _student_id: user.id,
          _instructor_id: profile.instructor_id,
        });

      if (error) throw error;
      return (data?.[0] || null) as EffectivePricing | null;
    },
    enabled: !!user?.id,
  });
}

// Hook: Calculate personalized top-up options for student
export function useStudentTopUpOptions() {
  const { data: pricing, isLoading } = useStudentEffectivePricing();

  if (isLoading || !pricing) {
    return { options: [], isLoading, hasCustomPricing: false, giftedHours: 0 };
  }

  const hourlyRate = pricing.instructor_hourly_rate || 45;
  const blockEnabled = pricing.block_booking_enabled;

  // Single lesson option
  const singleResult = calculateEffectivePrice(hourlyRate, pricing, false);
  const options: Array<{
    label: string;
    hours: number;
    price: number;
    originalPrice: number;
    savings: number;
    tag: string;
    isBlock: boolean;
  }> = [{
    label: 'Single Hour',
    hours: 1,
    price: Math.round(singleResult.price),
    originalPrice: Math.round(hourlyRate),
    savings: Math.round(singleResult.savings),
    tag: 'Standard',
    isBlock: false,
  }];

  // Block options only if enabled
  if (blockEnabled) {
    const block10Base = pricing.block_10_price || Math.round(hourlyRate * 10 * 0.95);
    const block20Base = pricing.block_20_price || Math.round(hourlyRate * 20 * 0.90);
    const block30Base = pricing.block_30_price || Math.round(hourlyRate * 30 * 0.85);

    const block10Result = calculateEffectivePrice(block10Base, pricing, true);
    const block20Result = calculateEffectivePrice(block20Base, pricing, true);
    const block30Result = calculateEffectivePrice(block30Base, pricing, true);

    options.push(
      {
        label: '10 Hour Block',
        hours: 10,
        price: Math.round(block10Result.price),
        originalPrice: Math.round(block10Base),
        savings: Math.round(block10Result.savings) || Math.round((hourlyRate * 10) - block10Base),
        tag: 'Popular',
        isBlock: true,
      },
      {
        label: '20 Hour Block',
        hours: 20,
        price: Math.round(block20Result.price),
        originalPrice: Math.round(block20Base),
        savings: Math.round(block20Result.savings) || Math.round((hourlyRate * 20) - block20Base),
        tag: 'Great Value',
        isBlock: true,
      },
      {
        label: '30 Hour Block',
        hours: 30,
        price: Math.round(block30Result.price),
        originalPrice: Math.round(block30Base),
        savings: Math.round(block30Result.savings) || Math.round((hourlyRate * 30) - block30Base),
        tag: 'Best Value',
        isBlock: true,
      }
    );
  }

  return {
    options,
    isLoading: false,
    hasCustomPricing: pricing.has_custom_pricing,
    giftedHours: pricing.gifted_hours,
    discountLabel: pricing.label,
    hourlyRate: singleResult.price,
    baseHourlyRate: hourlyRate,
  };
}
