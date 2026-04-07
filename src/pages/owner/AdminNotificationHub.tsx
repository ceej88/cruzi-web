import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bell, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import AdminMessaging from './AdminMessaging';

interface NotifHistory {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  recipient_name: string | null;
  recipient_email: string | null;
}

const AdminNotificationHub: React.FC = () => {
  const [target, setTarget] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotifHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await (supabase as any).rpc('admin_notification_history', { _limit: 50 });
    if (!error && data) setHistory((data as unknown as NotifHistory[]) || []);
    setHistoryLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleBroadcast = async () => {
    if (!title || !message) { toast.error('Title and message required'); return; }
    setSending(true);
    const { data, error } = await (supabase as any).rpc('admin_broadcast_all', {
      _target: target,
      _title: title,
      _message: message,
      _specific_user_id: target === 'specific' ? userId : null,
    });
    if (error) {
      toast.error('Failed to send');
    } else {
      toast.success(`Sent to ${data} user(s)`);
      setTitle('');
      setMessage('');
      setUserId('');
      fetchHistory();
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      {/* Existing AdminMessaging for direct instructor messaging */}
      <AdminMessaging />

      {/* Broadcast to all */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Push Notification Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="instructors">All Instructors</SelectItem>
              <SelectItem value="students">All Students</SelectItem>
              <SelectItem value="specific">Specific User</SelectItem>
            </SelectContent>
          </Select>
          {target === 'specific' && (
            <Input placeholder="User ID (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)} className="rounded-lg" />
          )}
          <Input placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg" />
          <Textarea placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
          <Button onClick={handleBroadcast} disabled={sending} className="w-full rounded-lg">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Notification
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notifications sent yet.</p>
          ) : (
            <div className="overflow-x-auto max-h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <p className="text-xs font-medium">{n.recipient_name || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground">{n.recipient_email}</p>
                      </TableCell>
                      <TableCell className="text-xs">{n.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{n.type}</Badge></TableCell>
                      <TableCell className="text-xs">{format(new Date(n.created_at), 'dd MMM yy HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationHub;
