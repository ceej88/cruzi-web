import React, { useState, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import { useInstructorData } from '@/hooks/useInstructorData';
import { toast } from '@/hooks/use-toast';

const SmsBroadcastTab: React.FC = () => {
  const { students } = useInstructorData();
  const { credits, sendSms, isSending } = useSmsCredits();
  const [message, setMessage] = useState('');
  const smsCharLimit = 320;
  const studentsWithPhone = students.filter(s => s.phone);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    if (studentsWithPhone.length === 0) {
      toast({ title: 'No phone numbers', description: 'None of your students have phone numbers on file.', variant: 'destructive' });
      return;
    }
    if (credits < studentsWithPhone.length) {
      toast({ title: 'Insufficient credits', description: `You need ${studentsWithPhone.length} credits but have ${credits}.`, variant: 'destructive' });
      return;
    }

    let sent = 0;
    for (const student of studentsWithPhone) {
      try {
        await sendSms({
          phoneNumber: student.phone!,
          message,
          recipientUserId: student.user_id,
          transactionType: 'SEND_BROADCAST',
        });
        sent++;
      } catch (e) {
        console.error(`SMS to ${student.full_name} failed:`, e);
      }
    }

    if (sent > 0) {
      toast({ title: 'SMS broadcast sent', description: `Delivered to ${sent}/${studentsWithPhone.length} students.` });
      setMessage('');
    }
  }, [message, studentsWithPhone, credits, sendSms]);

  return (
    <div className="p-4 space-y-4">
      {/* Message input */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, smsCharLimit))}
        placeholder="Type your SMS message here..."
        className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm min-h-[120px] resize-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] outline-none transition-all"
        disabled={isSending}
      />

      {/* Recipient info */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
        <span className="text-sm text-[#1A1A2E]">Send to all active students</span>
        <span className="text-xs font-bold text-[#6B7280]">{studentsWithPhone.length} with phone</span>
      </div>

      {/* Character count */}
      <p className="text-xs text-[#6B7280]">
        Remaining characters: <span className="font-bold">{smsCharLimit - message.length}</span>
      </p>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={isSending || !message.trim() || studentsWithPhone.length === 0 || credits < studentsWithPhone.length}
        className="w-full py-3.5 bg-[#3B82F6] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
        style={{ touchAction: 'manipulation' }}
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Now ({studentsWithPhone.length} SMS = {studentsWithPhone.length} credits)
          </>
        )}
      </button>
    </div>
  );
};

export default SmsBroadcastTab;
