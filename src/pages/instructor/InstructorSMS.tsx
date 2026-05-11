import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, CreditCard, History, CheckCircle, XCircle, Loader2, Star, Trophy } from 'lucide-react';
import { useSmsCredits, SMS_PACKS, type PackSize } from '@/hooks/useSmsCredits';

interface Props { userId: string; }

const NOTIFICATION_TYPES = [
  { key: 'next_lesson_reminder', label: 'Next Lesson Reminder', defaultHours: 24 },
  { key: 'outstanding_payment', label: 'Outstanding Payment Reminder', defaultHours: 48 },
  { key: 'lesson_changes', label: 'Lesson Changes', defaultHours: 1 },
  { key: 'progress_update', label: 'Progress Update', defaultHours: 0 },
  { key: 'on_my_way', label: 'On My Way', defaultHours: 0 },
  { key: 'arrived', label: 'Arrived', defaultHours: 0 },
  { key: 'passed_test', label: 'Passed Test', defaultHours: 0 },
];

function useSMSCredits(userId: string) {
  return useQuery({
    queryKey: ['sms-credits', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_or_create_sms_credits', { _instructor_id: userId });
      if (error) throw error;
      return data as { balance: number; lifetime_purchased: number; lifetime_used: number } | null;
    },
  });
}

function useNotificationSettings(userId: string) {
  return useQuery({
    queryKey: ['notif-settings', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('instructor_id', userId);
      return data ?? [];
    },
  });
}

function useSMSHistory(userId: string) {
  return useQuery({
    queryKey: ['sms-history', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('instructor_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
}

function useStudentsWithPhone(userId: string) {
  return useQuery({
    queryKey: ['students-phone', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('instructor_id', userId)
        .or('status.eq.ACTIVE,status.is.null')
        .not('phone', 'is', null);
      return data ?? [];
    },
  });
}

const RemindersTab: React.FC<{ userId: string }> = ({ userId }) => {
  const qc = useQueryClient();
  const { data: settings = [], isLoading } = useNotificationSettings(userId);
  const [form, setForm] = useState<Record<string, { enabled: boolean; timing_hours: number; custom_message: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const init: typeof form = {};
    NOTIFICATION_TYPES.forEach(t => {
      const existing = settings.find((s: any) => s.notification_type === t.key);
      init[t.key] = {
        enabled: existing?.enabled ?? false,
        timing_hours: existing?.timing_hours ?? t.defaultHours,
        custom_message: existing?.custom_message ?? '',
      };
    });
    setForm(init);
  }, [settings]);

  const save = async (key: string) => {
    setSaving(key);
    const val = form[key];
    await supabase.from('notification_settings').upsert({
      instructor_id: userId,
      notification_type: key,
      enabled: val.enabled,
      timing_hours: val.timing_hours,
      custom_message: val.custom_message,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'instructor_id,notification_type' });
    await qc.invalidateQueries({ queryKey: ['notif-settings', userId] });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const update = (key: string, field: string, value: any) => {
    setForm(f => ({ ...f, [key]: { ...f[key], [field]: value } }));
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Configure automatic SMS reminders sent to your students.</p>
      {NOTIFICATION_TYPES.map(t => {
        const val = form[t.key] ?? { enabled: false, timing_hours: t.defaultHours, custom_message: '' };
        return (
          <div key={t.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 text-sm">{t.label}</p>
              <button
                onClick={() => update(t.key, 'enabled', !val.enabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${val.enabled ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {val.enabled && (
              <>
                {t.defaultHours > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 flex-shrink-0">Send</label>
                    <input
                      type="number"
                      min={1}
                      value={val.timing_hours}
                      onChange={e => update(t.key, 'timing_hours', Number(e.target.value))}
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-[#7c3aed]"
                    />
                    <label className="text-xs text-gray-500">hours before</label>
                  </div>
                )}
                <textarea
                  value={val.custom_message}
                  onChange={e => update(t.key, 'custom_message', e.target.value)}
                  placeholder="Custom message (leave blank for default)"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
                />
                <button
                  onClick={() => save(t.key)}
                  disabled={saving === t.key}
                  className="flex items-center gap-1.5 bg-[#7c3aed] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {saving === t.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved === t.key ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                  {saved === t.key ? 'Saved' : 'Save'}
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

const BroadcastTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: credits } = useSMSCredits(userId);
  const { data: students = [] } = useStudentsWithPhone(userId);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean }[]>([]);

  const handleSend = async () => {
    if (!message.trim() || students.length === 0) return;
    const balance = credits?.balance ?? 0;
    if (balance < students.length) {
      alert(`Not enough credits. You have ${balance} credits but need ${students.length}.`);
      return;
    }
    setSending(true);
    setResults([]);
    const res: { name: string; ok: boolean }[] = [];
    for (const s of students) {
      try {
        const { error } = await supabase.functions.invoke('send-twilio-sms', {
          body: { to: s.phone, message, instructor_id: userId },
        });
        res.push({ name: s.full_name ?? s.email ?? 'Student', ok: !error });
      } catch {
        res.push({ name: s.full_name ?? s.email ?? 'Student', ok: false });
      }
    }
    setResults(res);
    setSending(false);
    setMessage('');
  };

  return (
    <div className="space-y-4">
      {credits && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-700">SMS Credits</span>
          <span className="text-lg font-bold text-green-700">{credits.balance}</span>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''} with phone numbers</span>
          <span className="text-gray-400">{message.length}/320</span>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 320))}
          placeholder="Type your broadcast message..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
        />
        <button
          onClick={handleSend}
          disabled={sending || !message.trim() || students.length === 0}
          className="flex items-center justify-center gap-2 w-full bg-[#7c3aed] text-white rounded-xl py-3 font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending…' : `Send to ${students.length} student${students.length !== 1 ? 's' : ''}`}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Results</p>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {r.ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              <span className={r.ok ? 'text-gray-700' : 'text-red-600'}>{r.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BundlesTab: React.FC<{ userId: string }> = ({ userId: _userId }) => {
  // Source of truth for pack sizes/prices and the purchase flow lives in useSmsCredits.
  // This guarantees the request body matches the purchase-sms-credits edge function contract
  // (which only accepts packSize: '10' | '25' | '50').
  const { credits, isLoading, isPurchasing, purchaseCredits } = useSmsCredits();
  const [buyingSize, setBuyingSize] = useState<PackSize | null>(null);

  const handleBuy = async (size: PackSize) => {
    setBuyingSize(size);
    try {
      await purchaseCredits(size);
    } finally {
      setBuyingSize(null);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
      ) : credits && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Current Balance</p>
            <p className="text-xs text-green-600">Lifetime used: {credits.lifetime_used}</p>
          </div>
          <span className="text-3xl font-black text-green-700">{credits.balance}</span>
        </div>
      )}
      <div className="space-y-3">
        {(Object.entries(SMS_PACKS) as [PackSize, typeof SMS_PACKS[PackSize]][]).map(([size, pack]) => {
          const highlight = pack.popular || pack.bestValue;
          return (
            <div
              key={size}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center justify-between ${highlight ? 'border-[#7c3aed]' : 'border-gray-100'}`}
            >
              <div>
                {pack.popular && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7c3aed] uppercase tracking-wide">
                    <Star className="w-3 h-3" /> Most Popular
                  </span>
                )}
                {pack.bestValue && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7c3aed] uppercase tracking-wide">
                    <Trophy className="w-3 h-3" /> Best Value
                  </span>
                )}
                <p className="font-bold text-gray-900">{pack.label}</p>
                <p className="text-sm text-gray-500">{pack.credits} credits · {pack.perSms}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 mb-2">{pack.price}</p>
                <button
                  onClick={() => handleBuy(size)}
                  disabled={isPurchasing}
                  className="flex items-center gap-1.5 bg-[#7c3aed] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {buyingSize === size ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-gray-400">Credits never expire · Secure payment via Stripe</p>
    </div>
  );
};

const HistoryTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: history = [], isLoading, error } = useSMSHistory(userId);

  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">Failed to load history.</div>;
  if (history.length === 0) return (
    <div className="text-center py-16">
      <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="font-semibold text-gray-500">No SMS credit history yet</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {history.map((tx: any) => (
        <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits</p>
              <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right">
              {tx.price_paid != null && <p className="text-sm font-semibold text-gray-700">£{Number(tx.price_paid).toFixed(2)}</p>}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                tx.status === 'failed' ? 'bg-red-100 text-red-600' :
                'bg-yellow-100 text-yellow-700'
              }`}>{tx.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TABS = [
  { id: 'reminders', label: 'Reminders', icon: MessageSquare },
  { id: 'broadcast', label: 'Broadcast', icon: Send },
  { id: 'bundles', label: 'Bundles', icon: CreditCard },
  { id: 'history', label: 'History', icon: History },
];

const InstructorSMS: React.FC<Props> = ({ userId }) => {
  const [tab, setTab] = useState('reminders');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.id ? 'bg-[#7c3aed] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'reminders' && <RemindersTab userId={userId} />}
      {tab === 'broadcast' && <BroadcastTab userId={userId} />}
      {tab === 'bundles' && <BundlesTab userId={userId} />}
      {tab === 'history' && <HistoryTab userId={userId} />}
    </div>
  );
};

export default InstructorSMS;
