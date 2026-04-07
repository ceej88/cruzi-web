// Cruzi AI - Real-time Message Subscriptions Hook
// Enables real-time updates for messages without manual refresh

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMessagesRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          // Invalidate both student and instructor message queries
          queryClient.invalidateQueries({ queryKey: ['student-messages'] });
          queryClient.invalidateQueries({ queryKey: ['instructor-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get unread count from cached messages
  const getUnreadCount = () => {
    // Try student messages first
    const studentMessages = queryClient.getQueryData<any[]>(['student-messages', user?.id]);
    if (studentMessages) {
      return studentMessages.filter(m => m.receiver_id === user?.id && !m.is_read).length;
    }

    // Try instructor messages
    const instructorMessages = queryClient.getQueryData<any[]>(['instructor-messages', user?.id]);
    if (instructorMessages) {
      return instructorMessages.filter(m => m.receiver_id === user?.id && !m.is_read).length;
    }

    return 0;
  };

  return getUnreadCount();
}
