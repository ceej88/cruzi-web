import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Megaphone, Send, Loader2, MessageSquare } from 'lucide-react';

interface Instructor {
  user_id: string;
  full_name: string | null;
  email: string;
}

const AdminMessaging: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  const [directMessage, setDirectMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingDirect, setSendingDirect] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    const loadInstructors = async () => {
      const { data, error } = await (supabase as any).rpc('admin_list_instructors');
      if (!error && data) setInstructors(data as unknown as Instructor[]);
    };
    loadInstructors();
  }, []);

  const handleDirectSend = async () => {
    if (!selectedInstructor || !directTitle.trim() || !directMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSendingDirect(true);
    const { error } = await (supabase as any).rpc('admin_notify_instructor', {
      _target_user_id: selectedInstructor,
      _title: directTitle.trim(),
      _message: directMessage.trim(),
    });
    setSendingDirect(false);
    if (error) {
      toast.error('Failed to send: ' + error.message);
    } else {
      toast.success('Message sent!');
      setDirectTitle('');
      setDirectMessage('');
      setSelectedInstructor('');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSendingBroadcast(true);
    const { data, error } = await (supabase as any).rpc('admin_broadcast_instructors', {
      _title: broadcastTitle.trim(),
      _message: broadcastMessage.trim(),
    });
    setSendingBroadcast(false);
    if (error) {
      toast.error('Failed to broadcast: ' + error.message);
    } else {
      toast.success(`Broadcast sent to ${data} instructors!`);
      setBroadcastTitle('');
      setBroadcastMessage('');
    }
  };

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Admin Messaging
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="broadcast" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="broadcast" className="text-xs font-bold">
              <Megaphone className="h-3.5 w-3.5 mr-1.5" /> Broadcast All
            </TabsTrigger>
            <TabsTrigger value="direct" className="text-xs font-bold">
              <Send className="h-3.5 w-3.5 mr-1.5" /> Direct Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast" className="space-y-3 mt-4">
            <Input
              placeholder="Notification title"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
            <Textarea
              placeholder="Message to all instructors..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={3}
            />
            <Button onClick={handleBroadcast} disabled={sendingBroadcast} className="w-full">
              {sendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
              Send to All Instructors
            </Button>
          </TabsContent>

          <TabsContent value="direct" className="space-y-3 mt-4">
            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger>
                <SelectValue placeholder="Select an instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((i) => (
                  <SelectItem key={i.user_id} value={i.user_id}>
                    {i.full_name || i.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Notification title"
              value={directTitle}
              onChange={(e) => setDirectTitle(e.target.value)}
            />
            <Textarea
              placeholder="Message to this instructor..."
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              rows={3}
            />
            <Button onClick={handleDirectSend} disabled={sendingDirect} className="w-full">
              {sendingDirect ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Direct Message
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminMessaging;
