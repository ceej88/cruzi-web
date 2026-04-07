import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MessageSquare, Send, Circle } from 'lucide-react';
import { format } from 'date-fns';

type FeedbackType = 'question' | 'feature_request' | 'bug' | 'general';
type FeedbackStatus = 'unread' | 'read' | 'replied';
type FilterValue = 'all' | 'unread' | 'question' | 'feature_request' | 'bug';

interface FeedbackRow {
  id: string;
  parent_user_id: string | null;
  parent_name: string | null;
  parent_email: string | null;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<FeedbackType, { label: string; color: string }> = {
  question: { label: 'Question', color: 'bg-blue-100 text-blue-700' },
  feature_request: { label: 'Feature Request', color: 'bg-purple-100 text-purple-700' },
  bug: { label: 'Bug', color: 'bg-red-100 text-red-700' },
  general: { label: 'General', color: 'bg-slate-100 text-slate-600' },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  unread: { label: 'Unread', color: 'bg-red-100 text-red-700' },
  read: { label: 'Read', color: 'bg-slate-100 text-slate-600' },
  replied: { label: 'Replied', color: 'bg-emerald-100 text-emerald-700' },
};

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'question', label: 'Questions' },
  { value: 'feature_request', label: 'Feature Requests' },
  { value: 'bug', label: 'Bugs' },
];

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sortNewest, setSortNewest] = useState(true);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('parent_feedback')
      .select('*')
      .order('created_at', { ascending: !sortNewest });
    setFeedback((data as FeedbackRow[] | null) ?? []);
    setLoading(false);
  }, [sortNewest]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const filtered = feedback.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return f.status === 'unread';
    return f.type === filter;
  });

  const unreadCount = feedback.filter((f) => f.status === 'unread').length;

  const openDetail = async (row: FeedbackRow) => {
    setSelected(row);
    setReplyText('');
    if (row.status === 'unread') {
      await supabase.from('parent_feedback').update({ status: 'read' }).eq('id', row.id);
      setFeedback((prev) => prev.map((f) => f.id === row.id ? { ...f, status: 'read' } : f));
    }
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    const now = new Date().toISOString();
    await supabase
      .from('parent_feedback')
      .update({ admin_reply: replyText, status: 'replied', replied_at: now })
      .eq('id', selected.id);

    // Send push notification to parent
    if (selected.parent_user_id) {
      await supabase.functions.invoke('notify', {
        body: {
          user_id: selected.parent_user_id,
          type: 'FEEDBACK_REPLY',
          title: 'Cruzi replied to your message 💜',
          message: 'Tap to read our reply in Settings → Share your thoughts',
          target_tab: 'settings',
        },
      });
    }

    setFeedback((prev) =>
      prev.map((f) => f.id === selected.id ? { ...f, admin_reply: replyText, status: 'replied', replied_at: now } : f)
    );
    setSelected({ ...selected, admin_reply: replyText, status: 'replied', replied_at: now });
    setReplyText('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              {f.value === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 text-[10px] font-bold">{unreadCount}</span>
              )}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSortNewest(!sortNewest)}>
          {sortNewest ? 'Newest first' : 'Oldest first'}
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No feedback yet — it will appear here when parents submit questions or ideas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => (
            <Card
              key={row.id}
              className="rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openDetail(row)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(row.created_at), 'd MMM yyyy')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_CONFIG[row.type].color}`}>
                        {TYPE_CONFIG[row.type].label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold truncate">{row.parent_name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {row.message.length > 80 ? row.message.slice(0, 80) + '…' : row.message}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {row.status === 'unread' && <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" />}
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_CONFIG[row.status].color}`}>
                      {STATUS_CONFIG[row.status].label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Feedback Detail
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Meta */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_CONFIG[selected.type].color}`}>
                    {TYPE_CONFIG[selected.type].label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_CONFIG[selected.status].color}`}>
                    {STATUS_CONFIG[selected.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(selected.created_at), 'd MMM yyyy, HH:mm')}
                  </span>
                </div>

                {/* Parent info */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-semibold">{selected.parent_name || 'Anonymous'}</p>
                  {selected.parent_email && (
                    <p className="text-xs text-muted-foreground">{selected.parent_email}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Message</p>
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Existing reply */}
                {selected.admin_reply && (
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                    <p className="text-xs font-bold uppercase text-primary mb-1">Reply</p>
                    <p className="text-sm whitespace-pre-wrap">{selected.admin_reply}</p>
                    {selected.replied_at && (
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Replied {format(new Date(selected.replied_at), 'd MMM yyyy, HH:mm')}
                      </p>
                    )}
                  </div>
                )}

                {/* Reply section */}
                {selected.status !== 'replied' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      placeholder="Your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px] rounded-lg"
                    />
                    <Button
                      onClick={sendReply}
                      disabled={!replyText.trim() || sending}
                      className="w-full rounded-lg bg-primary"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Send Reply
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeedback;
