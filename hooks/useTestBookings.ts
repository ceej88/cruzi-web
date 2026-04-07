import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TestBooking {
  id: string;
  student_id: string;
  instructor_id: string;
  status: string;
  pass_issued_at: string;
  pass_expires_at: string;
  preferred_windows: any[];
  booked_date: string | null;
  dvsa_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Student: get active booking pass
export function useActiveBookingPass() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['active-booking-pass', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('test_bookings')
        .select('*')
        .eq('student_id', user.id)
        .in('status', ['PASS_ISSUED', 'STUDENT_BOOKED'])
        .gt('pass_expires_at', new Date().toISOString())
        .order('pass_issued_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as TestBooking | null;
    },
    enabled: !!user?.id,
  });
}

// Instructor: get all test bookings for their students
export function useInstructorTestBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['instructor-test-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('test_bookings')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TestBooking[];
    },
    enabled: !!user?.id,
  });
}

// Instructor: issue a booking pass
export function useIssueBookingPass() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      studentId,
      expiryDays,
      preferredWindows,
    }: {
      studentId: string;
      expiryDays: number;
      preferredWindows?: any[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const { data, error } = await supabase
        .from('test_bookings')
        .insert({
          student_id: studentId,
          instructor_id: user.id,
          status: 'PASS_ISSUED',
          pass_expires_at: expiresAt.toISOString(),
          preferred_windows: preferredWindows || [],
        })
        .select()
        .single();
      if (error) throw error;

      // Notify student
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'SUCCESS',
        title: 'Test Booking Pass Issued',
        message: `Your instructor has issued a booking pass valid for ${expiryDays} days. Open the app to copy the PRN and book your test.`,
        target_tab: 'home',
        action_label: 'View Pass',
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-test-bookings'] });
      toast({ title: 'Booking Pass Issued', description: 'Student has been notified.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to issue pass', description: err.message, variant: 'destructive' });
    },
  });
}

// Student: log booked test date
export function useLogTestBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      bookedDate,
      dvsaRef,
    }: {
      bookingId: string;
      bookedDate: string;
      dvsaRef?: string;
    }) => {
      const { data, error } = await supabase
        .from('test_bookings')
        .update({
          status: 'STUDENT_BOOKED',
          booked_date: bookedDate,
          dvsa_ref: dvsaRef || null,
        })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-booking-pass'] });
      toast({ title: 'Test date logged', description: 'Your instructor has been notified.' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to log test date', description: err.message, variant: 'destructive' });
    },
  });
}

// Copy PRN to clipboard via edge function
export async function copyPrnToClipboard(): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('copy-prn');
    if (error) throw error;
    if (data?.prn) {
      await navigator.clipboard.writeText(data.prn);
      return true;
    }
    throw new Error(data?.error || 'No PRN available');
  } catch (err: any) {
    console.error('PRN copy failed:', err);
    throw err;
  }
}
