// Cruzi AI - Instructor Data Hook
// Provides real-time data access for instructor dashboard

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Types for instructor data
export interface StudentProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  instructor_id: string | null;
  credit_balance: number;
  parent_email: string | null;
  notes: string | null;
  total_hours: number;
  progress: number;
  level: string;
  status: string;
  address: string | null;
  next_lesson: string | null;
  secure_pin: string | null;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LessonTypeEnum = 'lesson' | 'mocktest' | 'testday' | 'assessment' | 'gap' | 'away';

export interface Lesson {
  id: string;
  instructor_id: string;
  student_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  topic: string | null;
  notes: string | null;
  status: string;
  payment_method: string | null;
  lesson_type: LessonTypeEnum;
  color?: string;
  created_at: string;
  updated_at: string;
  student?: StudentProfile;
}

export interface TeachingTemplate {
  id: string;
  instructor_id: string;
  title: string;
  category: string | null;
  content: string;
  ai_summary: string | null;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockTestResult {
  id: string;
  instructor_id: string;
  student_id: string;
  date: string;
  markers: any[];
  total_minors: number;
  has_serious: boolean;
  has_dangerous: boolean;
  passed: boolean;
  notes: string | null;
  created_at: string;
  student?: StudentProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_label: string | null;
  target_tab: string | null;
  created_at: string;
}

export interface SkillProgress {
  id: string;
  instructor_id: string;
  student_id: string;
  topic: string;
  level: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingPin {
  id: string;
  instructor_id: string;
  pin_code: string;
  is_used: boolean;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

export interface SessionLog {
  id: string;
  instructor_id: string;
  student_id: string;
  lesson_id: string | null;
  summary: string;
  reflective_log: string;
  next_focus: string | null;
  skill_updates: { topic: string; level?: number }[];
  created_at: string;
}

export interface SharedPlanInput {
  student_id: string;
  title: string;
  objective: string;
  student_summary: string | null;
  bundled_skills: string[];
}

export interface ParentUpdateInput {
  studentName: string;
  parentEmail: string;
  instructorName: string;
  progressPercentage: number;
  skillsWorked: { topic: string; level: number }[];
  reflectiveLog: string;
  nextFocus: string;
  milestone?: string;
}

// Standalone hook for fetching shared plans for a specific student
export function useStudentSharedPlans(studentId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['instructor-student-plans', user?.id, studentId],
    queryFn: async () => {
      if (!user?.id || !studentId) return [];
      
      const { data, error } = await supabase
        .from('shared_plans')
        .select('*')
        .eq('instructor_id', user.id)
        .eq('student_id', studentId)
        .order('date_shared', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!studentId,
  });
}

export function useInstructorData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all students linked to this instructor
  const studentsQuery = useQuery({
    queryKey: ['instructor-students', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('instructor_id', user.id);
      
      if (error) throw error;
      return data as StudentProfile[];
    },
    enabled: !!user?.id,
  });

  // Fetch all lessons for this instructor
  const lessonsQuery = useQuery({
    queryKey: ['instructor-lessons', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('instructor_id', user.id)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!user?.id,
  });

  // Fetch teaching templates
  const templatesQuery = useQuery({
    queryKey: ['instructor-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('teaching_templates')
        .select('*')
        .or(`instructor_id.eq.${user.id},template_type.eq.system`)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as TeachingTemplate[];
    },
    enabled: !!user?.id,
  });

  // Fetch mock test results
  const mockTestsQuery = useQuery({
    queryKey: ['instructor-mock-tests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mock_test_results')
        .select('*')
        .eq('instructor_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as MockTestResult[];
    },
    enabled: !!user?.id,
  });

  // Fetch notifications
  const notificationsQuery = useQuery({
    queryKey: ['instructor-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Fetch skill progress for all students
  const skillProgressQuery = useQuery({
    queryKey: ['instructor-skill-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('instructor_id', user.id);
      
      if (error) throw error;
      return data as SkillProgress[];
    },
    enabled: !!user?.id,
  });

  // Fetch messages
  const messagesQuery = useQuery({
    queryKey: ['instructor-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Mutations
  const createLesson = useMutation({
    mutationFn: async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'> & { student_id?: string | null }) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lesson)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newLesson) => {
      await queryClient.cancelQueries({ queryKey: ['instructor-lessons', user?.id] });
      const previous = queryClient.getQueryData<Lesson[]>(['instructor-lessons', user?.id]);
      queryClient.setQueryData<Lesson[]>(['instructor-lessons', user?.id], (old) => [
        ...(old || []),
        { ...newLesson, id: 'temp-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Lesson,
      ]);
      return { previous };
    },
    onError: (_err, _newLesson, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['instructor-lessons', user?.id], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
      toast({ title: 'Lesson created successfully' });
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lesson> & { id: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
      toast({ title: 'Lesson deleted' });
    },
  });

  const updateStudentProfile = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudentProfile> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      toast({ title: 'Profile updated' });
    },
  });

  // Update student status (for marking as PASSED, ARCHIVED, etc.)
  const updateStudentStatus = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', studentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      toast({ 
        title: variables.status === 'PASSED' 
          ? '🎉 Student marked as passed!' 
          : 'Student status updated' 
      });
    },
  });

  const addCredits = useMutation({
    mutationFn: async ({ studentId, hours }: { studentId: string; hours: number }) => {
      // First get current balance
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', studentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentBalance = profile?.credit_balance || 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ credit_balance: currentBalance + hours })
        .eq('id', studentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      toast({ title: 'Credits added successfully' });
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<TeachingTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('teaching_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-templates'] });
      toast({ title: 'Template created' });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TeachingTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('teaching_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-templates'] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teaching_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-templates'] });
      toast({ title: 'Template deleted' });
    },
  });

  const saveMockTest = useMutation({
    mutationFn: async (result: Omit<MockTestResult, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('mock_test_results')
        .insert(result)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-mock-tests'] });
      toast({ title: 'Mock test result saved' });
    },
  });

  const updateSkillProgress = useMutation({
    mutationFn: async (progress: { student_id: string; topic: string; level: number; notes?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Upsert skill progress
      const { data, error } = await supabase
        .from('skill_progress')
        .upsert({
          instructor_id: user.id,
          student_id: progress.student_id,
          topic: progress.topic,
          level: progress.level,
          notes: progress.notes,
        }, {
          onConflict: 'student_id,topic',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-skill-progress'] });
    },
  });

  const sendMessage = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['instructor-messages'] });
    },
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-notifications'] });
    },
  });

  const clearNotifications = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-notifications'] });
    },
  });

  // Fetch onboarding PINs
  const pinsQuery = useQuery({
    queryKey: ['instructor-pins', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('onboarding_pins')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OnboardingPin[];
    },
    enabled: !!user?.id,
  });

  // Generate a new 4-digit PIN
  const createOnboardingPin = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Generate 4-digit PIN
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Set expiry to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const { data, error } = await supabase
        .from('onboarding_pins')
        .insert({
          instructor_id: user.id,
          pin_code: pinCode,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as OnboardingPin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-pins'] });
      toast({ title: 'PIN generated successfully' });
    },
  });

  const deleteOnboardingPin = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('onboarding_pins')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-pins'] });
      toast({ title: 'PIN deleted' });
    },
  });

  // Generate 6-digit secure PIN for a student's portal access
  const generateStudentSecurePin = useMutation({
    mutationFn: async (studentUserId: string) => {
      const { data, error } = await supabase
        .rpc('generate_student_secure_pin', {
          _student_user_id: studentUserId,
        });
      
      if (error) throw error;
      return data as string;
    },
    onSuccess: (pin) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      toast({ 
        title: 'Access PIN Generated',
        description: `PIN: ${pin}. Share this with your student.`,
      });
    },
  });

  // Create shared plan for student
  const createSharedPlan = useMutation({
    mutationFn: async (plan: SharedPlanInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('shared_plans')
        .insert({
          instructor_id: user.id,
          student_id: plan.student_id,
          title: plan.title,
          objective: plan.objective,
          student_summary: plan.student_summary,
          bundled_skills: plan.bundled_skills,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Plan shared with student' });
    },
  });

  // Save session log from Neural Scribe
  const saveSessionLog = useMutation({
    mutationFn: async (log: Omit<SessionLog, 'id' | 'instructor_id' | 'created_at'>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('session_logs')
        .insert({
          instructor_id: user.id,
          student_id: log.student_id,
          lesson_id: log.lesson_id,
          summary: log.summary,
          reflective_log: log.reflective_log,
          next_focus: log.next_focus,
          skill_updates: log.skill_updates,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Session log saved' });
    },
  });

  // Send parent progress update email
  const sendParentUpdate = useMutation({
    mutationFn: async (data: ParentUpdateInput) => {
      const { data: response, error } = await supabase.functions.invoke('send-parent-update', {
        body: data,
      });
      
      if (error) throw error;
      return response;
    },
    onSuccess: () => {
      toast({ title: 'Parent update sent' });
    },
  });

  return {
    // Queries
    students: studentsQuery.data || [],
    lessons: lessonsQuery.data || [],
    templates: templatesQuery.data || [],
    mockTests: mockTestsQuery.data || [],
    notifications: notificationsQuery.data || [],
    skillProgress: skillProgressQuery.data || [],
    messages: messagesQuery.data || [],
    pins: pinsQuery.data || [],
    
    // Loading states
    isLoading: studentsQuery.isLoading || lessonsQuery.isLoading,
    
    // Mutations
    createLesson,
    updateLesson,
    deleteLesson,
    updateStudentProfile,
    updateStudentStatus,
    addCredits,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    saveMockTest,
    updateSkillProgress,
    sendMessage,
    markNotificationRead,
    clearNotifications,
    createOnboardingPin,
    deleteOnboardingPin,
    generateStudentSecurePin,
    createSharedPlan,
    saveSessionLog,
    sendParentUpdate,
    
    // Refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-students'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-templates'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-mock-tests'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-skill-progress'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-pins'] });
    },
  };
}
