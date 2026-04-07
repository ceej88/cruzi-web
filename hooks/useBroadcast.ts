import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateBroadcastDraft } from '@/services/instructorAIService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'TEST_READY';

interface Student {
  user_id: string;
  full_name: string | null;
  level: string | null;
}

interface UseBroadcastReturn {
  isDrafting: boolean;
  isDispatching: boolean;
  dispatchProgress: number;
  draftMessage: (notes: string) => Promise<string>;
  dispatchBroadcast: (message: string, studentIds: string[]) => Promise<boolean>;
  getTargetStudents: (students: Student[], selectedLevels: StudentLevel[]) => Student[];
}

export function useBroadcast(): UseBroadcastReturn {
  const { user } = useAuth();
  const [isDrafting, setIsDrafting] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);

  const draftMessage = useCallback(async (notes: string): Promise<string> => {
    setIsDrafting(true);
    try {
      const draft = await generateBroadcastDraft(notes);
      return draft;
    } catch (error) {
      console.error('Draft generation failed:', error);
      return notes;
    } finally {
      setIsDrafting(false);
    }
  }, []);

  const getTargetStudents = useCallback((students: Student[], selectedLevels: StudentLevel[]): Student[] => {
    if (selectedLevels.length === 0) return students;
    
    return students.filter(student => {
      const studentLevel = (student.level || 'BEGINNER').toUpperCase();
      return selectedLevels.some(level => studentLevel.includes(level.replace('_', ' ')) || studentLevel === level);
    });
  }, []);

  const dispatchBroadcast = useCallback(async (message: string, studentIds: string[]): Promise<boolean> => {
    if (!user?.id || studentIds.length === 0) {
      toast({
        title: 'Cannot send broadcast',
        description: 'No students selected or not logged in.',
        variant: 'destructive',
      });
      return false;
    }

    setIsDispatching(true);
    setDispatchProgress(0);

    try {
      let successCount = 0;
      
      for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        
        const { error } = await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: studentId,
          content: message,
        });

        if (error) {
          console.error(`Failed to send to ${studentId}:`, error);
        } else {
          successCount++;
        }

        setDispatchProgress(Math.round(((i + 1) / studentIds.length) * 100));
      }

      if (successCount === studentIds.length) {
        toast({
          title: 'Broadcast sent!',
          description: `Message delivered to ${successCount} students.`,
        });
        return true;
      } else if (successCount > 0) {
        toast({
          title: 'Partial delivery',
          description: `Sent to ${successCount}/${studentIds.length} students.`,
          variant: 'destructive',
        });
        return true;
      } else {
        toast({
          title: 'Broadcast failed',
          description: 'Could not send to any students.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      toast({
        title: 'Broadcast error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDispatching(false);
      setDispatchProgress(0);
    }
  }, [user?.id]);

  return {
    isDrafting,
    isDispatching,
    dispatchProgress,
    draftMessage,
    dispatchBroadcast,
    getTargetStudents,
  };
}
