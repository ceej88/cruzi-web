// Cruzi AI - Unread Messages Hook
// Provides unread message count for navigation badges

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadMessageCount() {
  const { user } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  return unreadCount;
}

// Hook for instructor to mark messages as read
export function useInstructorMarkMessagesRead() {
  const { user } = useAuth();

  const markAsRead = async (messageIds: string[]) => {
    if (!user?.id || messageIds.length === 0) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .eq('receiver_id', user.id);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return { markAsRead };
}
