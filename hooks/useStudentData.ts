// Cruzi AI - Student Data Hooks
// React Query hooks for fetching and mutating student data from Supabase

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types based on database schema
export interface StudentProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  instructor_id: string | null;
  credit_balance: number | null;
  total_hours: number | null;
  progress: number | null;
  level: string | null;
  status: string | null;
  parent_email: string | null;
  address: string | null;
  secure_pin: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  adi_number: string | null;
  grade: string | null;
  bio: string | null;
  hourly_rate: number | null;
  stripe_account_id: string | null;
  stripe_account_status: string | null;
  stripe_onboarding_complete: boolean | null;
  stripe_payouts_enabled: boolean | null;
}

export interface Lesson {
  id: string;
  student_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  topic: string | null;
  status: string;
  notes: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillProgress {
  id: string;
  student_id: string;
  instructor_id: string;
  topic: string;
  level: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Hook: Get student's own profile
export function useStudentProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as StudentProfile | null;
    },
    enabled: !!user?.id,
  });
}

// Hook: Get student's instructor profile
export function useInstructorProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First get the student's profile to find instructor_id
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('instructor_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!studentProfile?.instructor_id) return null;
      
      // Then get the instructor's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentProfile.instructor_id)
        .maybeSingle();
      
      if (error) throw error;
      return data as InstructorProfile | null;
    },
    enabled: !!user?.id,
  });
}

// Hook: Get student's lessons
export function useStudentLessons() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-lessons', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', user.id)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!user?.id,
  });
}

// Hook: Get student's skill progress
export function useStudentSkills() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('topic', { ascending: true });
      
      if (error) throw error;
      return data as SkillProgress[];
    },
    enabled: !!user?.id,
  });
}

// Hook: Get messages with instructor
export function useStudentMessages() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id,
  });
}

// Mutation: Send message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-messages'] });
    },
  });
}

// Mutation: Mark messages as read
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (messageIds: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('receiver_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-messages'] });
    },
  });
}

// Hook: Calculate mastery percentage from skills (based on total points)
export function useMasteryPercentage() {
  const { data: skills } = useStudentSkills();
  
  const totalSkills = 27; // Full DVSA syllabus (27 competencies)
  const maxPoints = totalSkills * 5; // Each skill can be level 1-5
  const earnedPoints = skills?.reduce((sum, s) => sum + s.level, 0) || 0;
  
  return Math.round((earnedPoints / maxPoints) * 100);
}

// Hook: Get skills coverage stats
export function useSkillsCoverage() {
  const { data: skills } = useStudentSkills();
  
  const totalSkills = 27; // Full DVSA syllabus (27 competencies)
  const maxPoints = totalSkills * 5;
  const coveredSkills = skills?.length || 0;
  const masteredSkills = skills?.filter(s => s.level >= 4).length || 0;
  const earnedPoints = skills?.reduce((sum, s) => sum + s.level, 0) || 0;
  
  return {
    total: totalSkills,
    covered: coveredSkills,
    mastered: masteredSkills,
    earnedPoints,
    maxPoints,
    coveragePercent: Math.round((coveredSkills / totalSkills) * 100),
    masteryPercent: Math.round((earnedPoints / maxPoints) * 100)
  };
}

// Hook: Get next scheduled lesson
export function useNextLesson() {
  const { data: lessons } = useStudentLessons();
  
  const now = new Date();
  const upcoming = lessons
    ?.filter(l => new Date(l.scheduled_at) >= now && l.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  
  return upcoming?.[0] || null;
}

// Hook: Get completed lessons count
export function useCompletedLessonsCount() {
  const { data: lessons } = useStudentLessons();
  return lessons?.filter(l => l.status === 'COMPLETED').length || 0;
}

// Types for mock test results
export interface MockTestResult {
  id: string;
  student_id: string;
  instructor_id: string;
  date: string;
  markers: {
    category: string;
    minors: number;
    serious: boolean;
    dangerous: boolean;
  }[];
  total_minors: number;
  has_serious: boolean;
  has_dangerous: boolean;
  passed: boolean;
  notes: string | null;
  created_at: string;
}

// Hook: Get student's mock test results
export function useStudentMockTests() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-mock-tests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('student_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as MockTestResult[];
    },
    enabled: !!user?.id,
  });
}

// Types for shared plans (instructor feedback)
export interface StudentActivity {
  skill: string;
  activity: string;
  key_points: string[];
}

export interface SharedPlan {
  id: string;
  student_id: string;
  instructor_id: string;
  title: string;
  objective: string;
  student_summary: string | null;
  bundled_skills: string[] | null;
  student_activities: StudentActivity[] | null;
  date_shared: string;
  created_at: string;
}

// Hook: Get student's shared plans from instructor
export function useStudentSharedPlans() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['student-shared-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('shared_plans')
        .select('*')
        .eq('student_id', user.id)
        .order('date_shared', { ascending: false });
      
      if (error) throw error;
      return (data as unknown) as SharedPlan[];
    },
    enabled: !!user?.id,
  });
}
