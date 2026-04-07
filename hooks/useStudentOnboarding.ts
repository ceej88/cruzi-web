// Cruzi AI - Student Onboarding Hooks
// Handles PIN verification and onboarding state

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { StudentOnboardingData } from '@/components/student/StudentOnboardingWizard';

interface StudentOnboardingState {
  secure_pin: string | null;
  onboarded_at: string | null;
  full_name: string | null;
}

// Hook: Check if student needs PIN verification or onboarding
export function useStudentOnboardingStatus() {
  const { user } = useAuth();
  const [isPinVerified, setIsPinVerified] = useState(false);

  // Check localStorage for session-based PIN verification
  useEffect(() => {
    if (user?.id) {
      const verified = sessionStorage.getItem(`cruzi_pin_verified_${user.id}`);
      setIsPinVerified(verified === 'true');
    }
  }, [user?.id]);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['student-onboarding-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('secure_pin, onboarded_at, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as StudentOnboardingState | null;
    },
    enabled: !!user?.id,
  });

  const markPinVerified = useCallback(() => {
    if (user?.id) {
      sessionStorage.setItem(`cruzi_pin_verified_${user.id}`, 'true');
      setIsPinVerified(true);
    }
  }, [user?.id]);

  return {
    isLoading,
    hasPinGate: !!profile?.secure_pin,
    isPinVerified,
    isOnboarded: !!profile?.onboarded_at,
    studentName: profile?.full_name || user?.email || 'Student',
    markPinVerified,
    refetch,
  };
}

// Hook: Validate student secure PIN
export function useValidateSecurePin() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (pinCode: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('validate_student_secure_pin', {
          _student_user_id: user.id,
          _pin_code: pinCode,
        });

      if (error) throw error;
      return data as boolean;
    },
  });
}

// Hook: Complete student onboarding
export function useCompleteOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentOnboardingData) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          parent_email: data.parent_email || null,
          status: 'ACTIVE',
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Call the complete onboarding function
      const { error: onboardingError } = await supabase
        .rpc('complete_student_onboarding', {
          _student_user_id: user.id,
        });

      if (onboardingError) throw onboardingError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });
}

// Hook: For instructors to generate a secure PIN for a student
export function useGenerateStudentPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentUserId: string) => {
      const { data, error } = await supabase
        .rpc('generate_student_secure_pin', {
          _student_user_id: studentUserId,
        });

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
    },
  });
}
