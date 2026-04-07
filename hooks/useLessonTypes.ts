// Cruzi AI - Lesson Types Hook
// CRUD operations for instructor-defined lesson pricing categories

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LessonType {
  id: string;
  instructor_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  sort_order: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Hook: Get all lesson types for current instructor
export function useInstructorLessonTypes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lesson-types', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('lesson_types')
        .select('*')
        .eq('instructor_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as LessonType[];
    },
    enabled: !!user?.id,
  });
}

// Hook: Get lesson types for a student's instructor
export function useStudentInstructorLessonTypes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-lesson-types', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get instructor_id from student profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('instructor_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile?.instructor_id) return [];

      const { data, error } = await supabase
        .from('lesson_types')
        .select('*')
        .eq('instructor_id', profile.instructor_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as LessonType[];
    },
    enabled: !!user?.id,
  });
}

// Hook: Create a new lesson type
export function useCreateLessonType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      price: number;
      duration_minutes?: number;
      description?: string;
      sort_order?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lesson_types')
        .insert({
          instructor_id: user.id,
          name: input.name,
          price: input.price,
          duration_minutes: input.duration_minutes || 60,
          description: input.description || null,
          sort_order: input.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-types'] });
      toast.success('Lesson type created');
    },
    onError: (error) => {
      console.error('Create lesson type error:', error);
      toast.error('Failed to create lesson type');
    },
  });
}

// Hook: Update an existing lesson type
export function useUpdateLessonType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LessonType> & { id: string }) => {
      const { data, error } = await supabase
        .from('lesson_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-types'] });
      toast.success('Lesson type updated');
    },
    onError: (error) => {
      console.error('Update lesson type error:', error);
      toast.error('Failed to update lesson type');
    },
  });
}

// Hook: Delete a lesson type
export function useDeleteLessonType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lesson_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-types'] });
      toast.success('Lesson type deleted');
    },
    onError: (error) => {
      console.error('Delete lesson type error:', error);
      toast.error('Failed to delete lesson type');
    },
  });
}
