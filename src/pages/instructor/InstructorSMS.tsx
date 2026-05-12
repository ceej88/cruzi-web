import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare, Send, CreditCard, History, CheckCircle, XCircle,
  Loader2, Star, Trophy, Info, X, ShieldCheck, Phone, Lock, AlertTriangle,
} from 'lucide-react';
import { useSmsCredits, SMS_PACKS, type PackSize } from '@/hooks/useSmsCredits';

interface Props { userId: string; }

// ---------------------------------------------------------------------------
// Contract with the Phase A edge function dispatch-scheduled-sms:
//   - notification_type ∈ { 'lesson_reminder', 'payment_reminder' }
//   - timing_hours ∈ ALLOWED_TIMINGS [12,24,48,72]; UI restricts to 24/48/72
//   - custom_message replaces the default BODY (the prefix sentence with
//     date/time is constructed by the edge fn).
//   - include_reply_instructions (PR-1 schema) is read by the future Phase B
//     live-send path; we still write it now so settings are ready when sends
//     are unlocked.
// All other reminder types remain in the table but are *not* exposed as
// configurable here — they are surfaced as "Coming soon" only.
// ---------------------------------------------------------------------------

type ActiveKey = 'lesson_reminder' | 'payment_reminder';

const ACTIVE_REMINDERS: { key: ActiveKey; label: string; defaultHours: 24|48|72; defaultBody: string; payloadHint: string; }[] = [
  {
    key: 'lesson_reminder',
    label: 'Lesson reminder',
    defaultHours: 24,
    defaultBody: 'Reply to confirm or rearrange.',
    payloadHint: 'Sends before each scheduled lesson.',
  },
  {
    key: 'payment_reminder',
    label: 'Payment reminder',
    defaultHours: 48,
    defaultBody: 'Please send payment before your lesson. Reply if you need help.',
    payloadHint: 'Sends only when the lesson still has payment outstanding.',
  },
];

const TIMING_OPTIONS: (24|48|72)[] = [24, 48, 72];

const COMING_SOON: { key: string; label: string }[] = [
  { key: 'lesson_changes',  label: 'Lesson changes' },
  { key: 'progress_update', label: 'Progress update' },
  { key: 'on_my_way',       label: 'On my way' },
  { key: 'arrived',         label: 'Arrived' },
  { key: 'passed_test',     label: 'Passed test' },
];

// SMS segment counter — GSM-7 short rules (1 seg ≤160, else 153/seg).
function smsSegments(len: number): number {
  if (len === 0) return 0;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

// UK phone validator — mirrors edge fn toE164UK().
function isValidUkMobile(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = raw.replace(/[\s\-()]/g, '');
  return /^\+447\d{9}$/.test(d) || /^447\d{9}$/.test(d) || /^07\d{9}$/.test(d);
}

// Build the same preview the edge fn would produce, against a sample lesson.
function buildPreview(
  type: ActiveKey,
  customBody: string,
  includeReplyInstructions: boolean,
): string {
  const prefix = type === 'lesson_reminder'
    ? 'You have a driving lesson on Saturday, 15 May at 10:00.'
    : 'Payment reminder for your driving lesson on Saturday, 15 May at 10:00.';
  const body = customBody.trim()
    || (type === 'lesson_reminder'
        ? ACTIVE_REMINDERS[0].defaultBody
        : ACTIVE_REMINDERS[1].defaultBody);
  const replyHint = includeReplyInstructions
    ? ' Reply YES to confirm or CANCEL to request cancellation.'
    : '';
  return `${prefix} ${body}${replyHint}`.trim();
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
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

function useStudentsPhoneReadiness(userId: string) {
  return useQuery({
    queryKey: ['students-phone-readiness', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone, email')
        .eq('instructor_id', userId)
        .or('status.eq.ACTIVE,status.is.null');
      return data ?? [];
    },
  });
}

// ---------------------------------------------------------------------------
// Page-level cards
// ---------------------------------------------------------------------------
const ExplainerCard: React.FC<{ userId: string }> = ({ userId }) => {
  const storageKey = `cruzi:sms-explainer-dismissed:${userId}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { setDismissed(localStorage.getItem(storageKey) === '1'); } catch {}
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 relative" data-testid="card-sms-explainer">
      <button
        onClick={() => {
          try { localStorage.setItem(storageKey, '1'); } catch {}
          setDismissed(true);
        }}
        className="absolute top-3 right-3 text-purple-400 hover:text-purple-700"
        aria-label="Dismiss"
        data-testid="button-dismiss-explainer"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-sm text-purple-900">
          <p className="font-semibold">How SMS works in Cruzi</p>
          <ul className="list-disc list-inside space-y-1 text-purple-800">
            <li>The web app is for setup, billing and reporting.</li>
            <li>The mobile app will handle live alerts and actions (coming soon).</li>
            <li>Learner CANCEL replies become cancellation <em>requests</em> — they do not auto-cancel.</li>
            <li>Cruzi never auto-cancels a lesson. You always approve.</li>
            <li>SMS reminders do <em>not</em> deduct lesson credits — only SMS credits.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const TestModePanel: React.FC = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4" data-testid="panel-test-mode">
    <div className="flex items-start gap-3">
      <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="space-y-1 text-sm text-amber-900">
        <p className="font-semibold">Test mode — live SMS not enabled yet</p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-800">
          <li>The dry-run scheduler is active and matching lessons against your settings.</li>
          <li>No live SMS is being sent.</li>
          <li>No Twilio messages are being dispatched.</li>
          <li>No SMS credits are being deducted.</li>
        </ul>
      </div>
    </div>
  </div>
);

const PhoneReadinessPanel: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: students = [], isLoading } = useStudentsPhoneReadiness(userId);

  const { valid, missing, missingList } = useMemo(() => {
    let valid = 0;
    const missingList: { id: string; name: string }[] = [];
    for (const s of students as any[]) {
      if (isValidUkMobile(s.phone)) valid++;
      else missingList.push({ id: s.id, name: s.full_name ?? s.email ?? 'Unnamed student' });
    }
    return { valid, missing: missingList.length, missingList };
  }, [students]);

  if (isLoading) return <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3" data-testid="panel-phone-readiness">
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-gray-500" />
        <p className="font-semibold text-sm text-gray-900">Learner phone readiness</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700" data-testid="text-valid-phone-count">{valid}</p>
          <p className="text-xs text-green-700">Valid UK mobile</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${missing > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-2xl font-bold ${missing > 0 ? 'text-red-600' : 'text-gray-400'}`} data-testid="text-missing-phone-count">{missing}</p>
          <p className={`text-xs ${missing > 0 ? 'text-red-600' : 'text-gray-500'}`}>Missing or invalid</p>
        </div>
      </div>
      {missing > 0 && (
        <details className="text-sm" data-testid="details-missing-phones">
          <summary className="cursor-pointer text-gray-700 font-medium hover:text-gray-900">
            Show learners needing phone cleanup ({missing})
          </summary>
          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {missingList.slice(0, 50).map(s => (
              <li key={s.id} className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded" data-testid={`item-missing-phone-${s.id}`}>
                {s.name}
              </li>
            ))}
            {missingList.length > 50 && (
              <li className="text-xs text-gray-400 italic">…and {missingList.length - 50} more</li>
            )}
          </ul>
        </details>
      )}
      <p className="text-[11px] text-gray-400">
        This is a setup readiness check, not an inbox. Update phone numbers from each learner's profile.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reminders tab
// ---------------------------------------------------------------------------
type FormState = {
  enabled: boolean;
  timing_hours: 24 | 48 | 72;
  custom_message: string;
  include_reply_instructions: boolean;
};

const ReminderCard: React.FC<{
  cfg: typeof ACTIVE_REMINDERS[number];
  value: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}> = ({ cfg, value, onChange, onSave, saving, saved }) => {
  const previewLen = buildPreview(cfg.key, value.custom_message, value.include_reply_instructions).length;
  const preview = buildPreview(cfg.key, value.custom_message, value.include_reply_instructions);
  const segs = smsSegments(previewLen);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3" data-testid={`card-reminder-${cfg.key}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
          <p className="text-[11px] text-gray-400">{cfg.payloadHint}</p>
        </div>
        <button
          onClick={() => onChange({ enabled: !value.enabled })}
          className={`w-11 h-6 rounded-full transition-colors relative ${value.enabled ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
          data-testid={`toggle-enabled-${cfg.key}`}
          aria-pressed={value.enabled}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {value.enabled && (
        <>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Send</label>
            <div className="flex gap-2">
              {TIMING_OPTIONS.map(h => (
                <button
                  key={h}
                  onClick={() => onChange({ timing_hours: h })}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    value.timing_hours === h
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#7c3aed]'
                  }`}
                  data-testid={`button-timing-${cfg.key}-${h}`}
                >
                  {h}h before
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Custom message body (leave blank for default)</label>
            <textarea
              value={value.custom_message}
              onChange={e => onChange({ custom_message: e.target.value.slice(0, 320) })}
              placeholder={cfg.defaultBody}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
              data-testid={`input-message-${cfg.key}`}
            />
          </div>

          <label className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Include reply instructions</span>
            <button
              onClick={() => onChange({ include_reply_instructions: !value.include_reply_instructions })}
              className={`w-11 h-6 rounded-full transition-colors relative ${value.include_reply_instructions ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
              data-testid={`toggle-reply-${cfg.key}`}
              aria-pressed={value.include_reply_instructions}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value.include_reply_instructions ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>Preview (sample lesson Saturday 15 May, 10:00)</span>
              <span data-testid={`text-charcount-${cfg.key}`}>{previewLen} chars · {segs} segment{segs === 1 ? '' : 's'}</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap" data-testid={`text-preview-${cfg.key}`}>{preview}</p>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-px" />
            <span>Replies do not auto-cancel. CANCEL becomes a request awaiting your approval.</span>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#7c3aed] text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            data-testid={`button-save-${cfg.key}`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <CheckCircle className="w-3.5 h-3.5" /> : null}
            {saved ? 'Saved' : 'Save'}
          </button>
        </>
      )}
    </div>
  );
};

const RemindersTab: React.FC<{ userId: string }> = ({ userId }) => {
  const qc = useQueryClient();
  const { data: settings = [], isLoading } = useNotificationSettings(userId);
  const [form, setForm] = useState<Record<ActiveKey, FormState>>({
    lesson_reminder:  { enabled: false, timing_hours: 24, custom_message: '', include_reply_instructions: true },
    payment_reminder: { enabled: false, timing_hours: 48, custom_message: '', include_reply_instructions: true },
  });
  const [saving, setSaving] = useState<ActiveKey | null>(null);
  const [saved, setSaved] = useState<ActiveKey | null>(null);

  useEffect(() => {
    const next: Record<ActiveKey, FormState> = {
      lesson_reminder:  { enabled: false, timing_hours: 24, custom_message: '', include_reply_instructions: true },
      payment_reminder: { enabled: false, timing_hours: 48, custom_message: '', include_reply_instructions: true },
    };
    for (const cfg of ACTIVE_REMINDERS) {
      const existing = (settings as any[]).find(s => s.notification_type === cfg.key);
      if (existing) {
        const t = Number(existing.timing_hours);
        next[cfg.key] = {
          enabled: !!existing.enabled,
          timing_hours: (TIMING_OPTIONS.includes(t as 24|48|72) ? t : cfg.defaultHours) as 24|48|72,
          custom_message: existing.custom_message ?? '',
          include_reply_instructions: existing.include_reply_instructions ?? true,
        };
      }
    }
    setForm(next);
  }, [settings]);

  const handleChange = (key: ActiveKey, patch: Partial<FormState>) => {
    setForm(f => ({ ...f, [key]: { ...f[key], ...patch } }));
  };

  const handleSave = async (key: ActiveKey) => {
    setSaving(key);
    const v = form[key];
    await supabase.from('notification_settings').upsert({
      instructor_id: userId,
      notification_type: key,
      enabled: v.enabled,
      timing_hours: v.timing_hours,
      custom_message: v.custom_message,
      include_reply_instructions: v.include_reply_instructions,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'instructor_id,notification_type' });
    await qc.invalidateQueries({ queryKey: ['notif-settings', userId] });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  if (isLoading) {
    return <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Configure the two automated reminders the dispatcher currently supports. More are coming soon.</p>

      <div className="space-y-3">
        {ACTIVE_REMINDERS.map(cfg => (
          <ReminderCard
            key={cfg.key}
            cfg={cfg}
            value={form[cfg.key]}
            onChange={patch => handleChange(cfg.key, patch)}
            onSave={() => handleSave(cfg.key)}
            saving={saving === cfg.key}
            saved={saved === cfg.key}
          />
        ))}
      </div>

      <PhoneReadinessPanel userId={userId} />

      <details className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4" data-testid="details-coming-soon">
        <summary className="cursor-pointer font-semibold text-sm text-gray-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-400" />
          Advanced reminders — coming soon
        </summary>
        <p className="text-xs text-gray-500 mt-2 mb-3">
          These reminder types are not yet wired to the dispatcher. They will be enabled in a future release alongside live mobile alerts.
        </p>
        <div className="space-y-2">
          {COMING_SOON.map(c => (
            <div
              key={c.key}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 opacity-60"
              data-testid={`item-coming-soon-${c.key}`}
            >
              <span className="text-sm text-gray-600">{c.label}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Broadcast tab — preserved behaviour, char count + segment count added
// ---------------------------------------------------------------------------
const BroadcastTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: credits } = useSMSCredits(userId);
  const { data: students = [] } = useStudentsWithPhone(userId);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean }[]>([]);

  const segs = smsSegments(message.length);
  const estimatedCredits = students.length * Math.max(segs, 1);

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
    for (const s of students as any[]) {
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
          <span className="text-lg font-bold text-green-700" data-testid="text-credits-balance">{credits.balance}</span>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{students.length} student{students.length !== 1 ? 's' : ''} with phone numbers</span>
          <span className="text-gray-400" data-testid="text-broadcast-charcount">{message.length}/320 · {segs} segment{segs === 1 ? '' : 's'}</span>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 320))}
          placeholder="Type your broadcast message..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
          data-testid="input-broadcast-message"
        />
        {message.length > 0 && students.length > 0 && (
          <p className="text-[11px] text-gray-400" data-testid="text-broadcast-estimate">
            Estimated cost: ~{estimatedCredits} SMS credits ({students.length} learner{students.length === 1 ? '' : 's'} × {Math.max(segs, 1)} segment{segs === 1 ? '' : 's'})
          </p>
        )}
        <button
          onClick={handleSend}
          disabled={sending || !message.trim() || students.length === 0}
          className="flex items-center justify-center gap-2 w-full bg-[#7c3aed] text-white rounded-xl py-3 font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
          data-testid="button-send-broadcast"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending…' : `Send to ${students.length} student${students.length !== 1 ? 's' : ''}`}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Results</p>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" data-testid={`row-broadcast-result-${i}`}>
              {r.ok ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
              <span className={r.ok ? 'text-gray-700' : 'text-red-600'}>{r.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Bundles tab — preserved as-is (Stripe checkout flow unchanged)
// ---------------------------------------------------------------------------
const BundlesTab: React.FC<{ userId: string }> = ({ userId: _userId }) => {
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
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Current balance</p>
          </div>
          <span className="text-3xl font-black text-green-700" data-testid="text-bundles-balance">{credits ?? 0}</span>
        </div>
      )}
      <div className="space-y-3">
        {(Object.entries(SMS_PACKS) as [PackSize, typeof SMS_PACKS[PackSize]][]).map(([size, pack]) => {
          const highlight = pack.popular || pack.bestValue;
          return (
            <div
              key={size}
              className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center justify-between ${highlight ? 'border-[#7c3aed]' : 'border-gray-100'}`}
              data-testid={`card-pack-${size}`}
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
                  data-testid={`button-buy-pack-${size}`}
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

// ---------------------------------------------------------------------------
// History tab — reporting only
// ---------------------------------------------------------------------------
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
      <p className="text-[11px] text-gray-400">Reporting only — no actions can be taken from here.</p>
      {(history as any[]).map(tx => (
        <div key={tx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4" data-testid={`row-history-${tx.id}`}>
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

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'reminders', label: 'Reminders', icon: MessageSquare },
  { id: 'broadcast', label: 'Broadcast', icon: Send },
  { id: 'bundles',   label: 'Bundles',   icon: CreditCard },
  { id: 'history',   label: 'History',   icon: History },
];

const InstructorSMS: React.FC<Props> = ({ userId }) => {
  const [tab, setTab] = useState('reminders');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900" data-testid="text-page-title">SMS setup &amp; reporting</h1>
        <p className="text-sm text-gray-500">Configure automated reminders, top up credits, and review activity.</p>
      </div>

      <ExplainerCard userId={userId} />
      <TestModePanel />

      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.id ? 'bg-[#7c3aed] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid={`tab-${t.id}`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reminders' && <RemindersTab userId={userId} />}
      {tab === 'broadcast' && <BroadcastTab userId={userId} />}
      {tab === 'bundles'   && <BundlesTab userId={userId} />}
      {tab === 'history'   && <HistoryTab userId={userId} />}
    </div>
  );
};

export default InstructorSMS;
