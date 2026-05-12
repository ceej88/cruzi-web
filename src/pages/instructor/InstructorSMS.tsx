import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare, Send, CreditCard, History, CheckCircle, XCircle,
  Loader2, Star, Trophy, Phone, Clock, AlertTriangle, X,
} from 'lucide-react';
import { useSmsCredits, SMS_PACKS, type PackSize } from '@/hooks/useSmsCredits';

interface Props { userId: string; }

// ---------------------------------------------------------------------------
// Edge-fn contract (dispatch-scheduled-sms):
//   notification_type ∈ { 'lesson_reminder', 'payment_reminder' }
//   timing_hours      ∈ ALLOWED_TIMINGS [12,24,48,72]; UI restricts to 24/48/72
//   include_reply_instructions — PR-1 column, read by future Phase B path
// ---------------------------------------------------------------------------

type ActiveKey = 'lesson_reminder' | 'payment_reminder';

const ACTIVE_REMINDERS: { key: ActiveKey; label: string; defaultHours: 24|48|72; defaultBody: string; }[] = [
  { key: 'lesson_reminder',  label: 'Next Lesson Reminder',     defaultHours: 24, defaultBody: 'Reply to confirm or rearrange.' },
  { key: 'payment_reminder', label: 'Outstanding Payment Reminder', defaultHours: 48, defaultBody: 'Please send payment before your lesson. Reply if you need help.' },
];

const TIMING_OPTIONS: (24|48|72)[] = [24, 48, 72];

const COMING_SOON = [
  { key: 'lesson_changes',  label: 'Lesson changes' },
  { key: 'progress_update', label: 'Progress update' },
  { key: 'on_my_way',       label: 'On my way' },
  { key: 'arrived',         label: 'Arrived' },
  { key: 'passed_test',     label: 'Passed test' },
];

function smsSegments(len: number): number {
  if (len === 0) return 0;
  if (len <= 160) return 1;
  return Math.ceil(len / 153);
}

function isValidUkMobile(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = raw.replace(/[\s\-()]/g, '');
  return /^\+447\d{9}$/.test(d) || /^447\d{9}$/.test(d) || /^07\d{9}$/.test(d);
}

function buildPreview(type: ActiveKey, customBody: string, includeReply: boolean): string {
  const prefix = type === 'lesson_reminder'
    ? 'You have a driving lesson on Saturday, 15 May at 10:00.'
    : 'Payment reminder for your driving lesson on Saturday, 15 May at 10:00.';
  const body = customBody.trim()
    || (type === 'lesson_reminder' ? ACTIVE_REMINDERS[0].defaultBody : ACTIVE_REMINDERS[1].defaultBody);
  const reply = includeReply ? ' Reply YES to confirm or CANCEL to request cancellation.' : '';
  return `${prefix} ${body}${reply}`.trim();
}

// PR-4-B: render pence as £x.xx (e.g. 650 → £6.50, 40 → £0.40).
function fmtGbp(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
function useSMSCreditsRaw(userId: string) {
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
      const { data } = await supabase.from('notification_settings').select('*').eq('instructor_id', userId);
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
        .from('sms_transactions').select('*').eq('instructor_id', userId)
        .order('created_at', { ascending: false }).limit(100);
      return data ?? [];
    },
  });
}

// Phase A.5.2: canonical eligibility resolver (single source of truth).
// Returns one row per candidate learner with `ineligible_reason` (null when
// eligible). Both Broadcast and the Phone-readiness panel consume this.
type EligibilityRow = {
  student_id: string;
  phone: string | null;
  full_name: string | null;
  status: string | null;
  ineligible_reason:
    | 'opted_out'
    | 'not_linked_to_instructor'
    | 'status_blocks_sms'
    | 'no_phone'
    | 'invalid_phone'
    | null;
};

function useEligibility(userId: string) {
  return useQuery({
    queryKey: ['sms-eligibility', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('eligible_sms_recipients', {
        p_instructor_id: userId,
      });
      if (error) throw error;
      return (data ?? []) as EligibilityRow[];
    },
  });
}

// Broadcast list — only eligible learners. Shape preserved for existing
// consumers: { id, full_name, phone, email? }.
function useStudentsWithPhone(userId: string) {
  const { data: rows = [], ...rest } = useEligibility(userId);
  const data = rows
    .filter(r => r.ineligible_reason === null)
    .map(r => ({
      id: r.student_id,
      full_name: r.full_name,
      phone: r.phone,
      email: null as string | null,
    }));
  return { data, ...rest };
}

// Readiness panel — every candidate, broken down by reason.
function useStudentsPhoneReadiness(userId: string) {
  return useEligibility(userId);
}

// ---------------------------------------------------------------------------
// Shared compact pieces
// ---------------------------------------------------------------------------
const SetupOnlyNote: React.FC = () => (
  <p
    className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 break-words"
    data-testid="text-setup-only-note"
  >
    Live SMS is not enabled yet. This page is setup only.
  </p>
);

const CreditsBanner: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: credits } = useSMSCreditsRaw(userId);
  const balance = credits?.balance ?? 0;
  const low = balance < 10;
  return (
    <div
      className={`rounded-xl border p-3 flex items-center justify-between gap-3 min-w-0 ${
        low ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
      }`}
      data-testid="banner-credits"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <CreditCard className={`w-4 h-4 flex-shrink-0 ${low ? 'text-amber-600' : 'text-green-700'}`} />
        <span className={`text-xs font-semibold truncate ${low ? 'text-amber-700' : 'text-green-700'}`}>
          {low ? 'Low SMS credits' : 'SMS credits'}
        </span>
      </div>
      <span
        className={`text-lg font-bold flex-shrink-0 ${low ? 'text-amber-700' : 'text-green-700'}`}
        data-testid="text-credits-balance"
      >
        {balance}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reminders tab — compact, mobile-first
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
  const preview = buildPreview(cfg.key, value.custom_message, value.include_reply_instructions);
  const len = preview.length;
  const segs = smsSegments(len);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2.5 min-w-0 overflow-hidden"
      data-testid={`card-reminder-${cfg.key}`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate min-w-0 flex-1">{cfg.label}</p>
        <button
          onClick={() => onChange({ enabled: !value.enabled })}
          className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${value.enabled ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
          aria-pressed={value.enabled}
          data-testid={`toggle-enabled-${cfg.key}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <p className="text-[11px] text-gray-500">
        {value.enabled ? <span className="text-green-700 font-semibold">Enabled</span> : <span className="text-gray-400 font-semibold">Disabled</span>}
      </p>

      {value.enabled && (
        <>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Send before lesson / due
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIMING_OPTIONS.map(h => (
                <button
                  key={h}
                  onClick={() => onChange({ timing_hours: h })}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-colors min-w-0 ${
                    value.timing_hours === h
                      ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                  data-testid={`button-timing-${cfg.key}-${h}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 mb-1">Message</p>
            <textarea
              value={value.custom_message}
              onChange={e => onChange({ custom_message: e.target.value.slice(0, 320) })}
              placeholder={cfg.defaultBody}
              rows={2}
              className="w-full max-w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#7c3aed] resize-none break-words"
              data-testid={`input-message-${cfg.key}`}
            />
            <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 gap-2 min-w-0">
              <span data-testid={`text-charcount-${cfg.key}`} className="truncate">{len} chars · {segs} seg{segs === 1 ? '' : 's'}</span>
              <span className="flex-shrink-0">{320 - value.custom_message.length} left</span>
            </div>
          </div>

          <label className="flex items-center justify-between text-xs gap-2 min-w-0">
            <span className="text-gray-700 truncate min-w-0 flex-1">Add reply instructions</span>
            <button
              onClick={() => onChange({ include_reply_instructions: !value.include_reply_instructions })}
              className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${value.include_reply_instructions ? 'bg-[#7c3aed]' : 'bg-gray-200'}`}
              aria-pressed={value.include_reply_instructions}
              data-testid={`toggle-reply-${cfg.key}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value.include_reply_instructions ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 min-w-0">
            <p className="text-[10px] text-gray-500 mb-1">Preview</p>
            <p
              className="text-xs text-gray-800 break-words whitespace-pre-wrap"
              data-testid={`text-preview-${cfg.key}`}
            >
              {preview}
            </p>
          </div>

          <p className="text-[10px] text-gray-400 break-words">
            CANCEL replies become cancellation requests. They never auto-cancel a lesson.
          </p>

          <button
            onClick={onSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 bg-[#7c3aed] text-white rounded-lg py-2 text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
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

// Phase A.5.2: readiness panel sourced from canonical eligibility RPC.
// Groups learners by `ineligible_reason` so Erica can see exactly why each
// learner won't receive an SMS.
const REASON_LABEL: Record<NonNullable<EligibilityRow['ineligible_reason']>, string> = {
  opted_out:                'Opted out',
  not_linked_to_instructor: 'No longer linked',
  status_blocks_sms:        'Pending or declined',
  no_phone:                 'No phone on file',
  invalid_phone:            'Phone format invalid',
};

const PhoneReadinessPanel: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: rows = [], isLoading } = useStudentsPhoneReadiness(userId);

  const { eligibleCount, missingList, byReason } = useMemo(() => {
    let eligibleCount = 0;
    const missingList: { id: string; name: string; reason: string }[] = [];
    const byReason: Record<string, number> = {
      opted_out: 0, not_linked_to_instructor: 0, status_blocks_sms: 0,
      no_phone: 0, invalid_phone: 0,
    };
    for (const r of rows) {
      const name = r.full_name ?? 'Unnamed learner';
      if (r.ineligible_reason === null) {
        // Belt-and-braces UK-mobile check, mirrors the format the scheduler
        // will require at Twilio time. RPC accepts a looser regex; surface
        // any extra rejections here so Erica fixes them now.
        if (isValidUkMobile(r.phone)) {
          eligibleCount += 1;
        } else {
          byReason.invalid_phone += 1;
          missingList.push({ id: r.student_id, name, reason: 'invalid_phone' });
        }
      } else {
        byReason[r.ineligible_reason] += 1;
        missingList.push({ id: r.student_id, name, reason: r.ineligible_reason });
      }
    }
    return { eligibleCount, missingList, byReason };
  }, [rows]);
  const missing = missingList.length;

  if (isLoading) return <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2 min-w-0 overflow-hidden"
      data-testid="panel-phone-readiness"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
        <p className="font-semibold text-xs text-gray-900 truncate">Learner phone readiness</p>
      </div>
      <div className="grid grid-cols-2 gap-2 min-w-0">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center min-w-0">
          <p className="text-lg font-bold text-green-700" data-testid="text-valid-phone-count">{eligibleCount}</p>
          <p className="text-[10px] text-green-700 truncate">Eligible</p>
        </div>
        <div className={`rounded-lg p-2 text-center border min-w-0 ${missing > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-lg font-bold ${missing > 0 ? 'text-red-600' : 'text-gray-400'}`} data-testid="text-missing-phone-count">{missing}</p>
          <p className={`text-[10px] truncate ${missing > 0 ? 'text-red-600' : 'text-gray-500'}`}>Won't receive SMS</p>
        </div>
      </div>
      {missing > 0 && (
        <div className="space-y-1 text-[11px]" data-testid="readiness-reason-breakdown">
          {(Object.keys(REASON_LABEL) as (keyof typeof REASON_LABEL)[]).map(k =>
            byReason[k] > 0 ? (
              <div key={k} className="flex justify-between text-gray-700" data-testid={`row-reason-${k}`}>
                <span>{REASON_LABEL[k]}</span>
                <span className="font-semibold">{byReason[k]}</span>
              </div>
            ) : null
          )}
          <details className="pt-1" data-testid="details-missing-phones">
            <summary className="cursor-pointer text-gray-700 font-medium">Show {missing} learner{missing === 1 ? '' : 's'}</summary>
            <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto min-w-0">
              {missingList.slice(0, 50).map(s => (
                <li key={s.id} className="text-[11px] text-gray-600 px-2 py-1 bg-gray-50 rounded break-words flex justify-between gap-2" data-testid={`item-missing-phone-${s.id}`}>
                  <span className="truncate">{s.name}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{REASON_LABEL[s.reason as keyof typeof REASON_LABEL] ?? s.reason}</span>
                </li>
              ))}
              {missingList.length > 50 && <li className="text-[11px] text-gray-400 italic">…and {missingList.length - 50} more</li>}
            </ul>
          </details>
        </div>
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

  const handleChange = (key: ActiveKey, patch: Partial<FormState>) =>
    setForm(f => ({ ...f, [key]: { ...f[key], ...patch } }));

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

  if (isLoading) return <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-3 min-w-0">
      <CreditsBanner userId={userId} />
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
      <PhoneReadinessPanel userId={userId} />
      <details className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 min-w-0" data-testid="details-coming-soon">
        <summary className="cursor-pointer font-semibold text-xs text-gray-600 flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">Advanced reminders — coming soon</span>
        </summary>
        <div className="mt-2 space-y-1.5">
          {COMING_SOON.map(c => (
            <div
              key={c.key}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 opacity-60 min-w-0 gap-2"
              data-testid={`item-coming-soon-${c.key}`}
            >
              <span className="text-xs text-gray-600 truncate min-w-0 flex-1">{c.label}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full flex-shrink-0">Soon</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Waiting List tab — placeholder (coming soon)
// ---------------------------------------------------------------------------
const WaitingListTab: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center space-y-2 min-w-0" data-testid="panel-waiting-list">
    <Clock className="w-8 h-8 text-gray-300 mx-auto" />
    <p className="font-semibold text-sm text-gray-700">Waiting List — coming soon</p>
    <p className="text-xs text-gray-500 break-words max-w-xs mx-auto">
      Soon you'll be able to text learners on a waiting list when a slot opens up. Setup-only for now — no automation runs yet.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Broadcast tab — preserved behaviour, mobile-fixed
// ---------------------------------------------------------------------------
const BroadcastTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: credits } = useSMSCreditsRaw(userId);
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
    <div className="space-y-3 min-w-0">
      <CreditsBanner userId={userId} />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between text-xs gap-2 min-w-0">
          <span className="text-gray-500 truncate min-w-0 flex-1">{students.length} learner{students.length !== 1 ? 's' : ''} with phone</span>
          <span className="text-gray-400 flex-shrink-0" data-testid="text-broadcast-charcount">{message.length}/320 · {segs} seg{segs === 1 ? '' : 's'}</span>
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 320))}
          placeholder="Type your broadcast..."
          rows={4}
          className="w-full max-w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-[#7c3aed] resize-none break-words"
          data-testid="input-broadcast-message"
        />
        {message.length > 0 && students.length > 0 && (
          <p className="text-[10px] text-gray-400 break-words" data-testid="text-broadcast-estimate">
            Est. ~{estimatedCredits} credits ({students.length} × {Math.max(segs, 1)} seg)
          </p>
        )}
        <button
          onClick={handleSend}
          disabled={sending || !message.trim() || students.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] text-white rounded-lg py-2.5 font-semibold text-xs hover:bg-purple-700 transition-colors disabled:opacity-50"
          data-testid="button-send-broadcast"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Sending…' : `Send to ${students.length} learner${students.length !== 1 ? 's' : ''}`}
        </button>
      </div>
      {results.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-700">Results</p>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs min-w-0" data-testid={`row-broadcast-result-${i}`}>
              {r.ok ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
              <span className={`truncate min-w-0 ${r.ok ? 'text-gray-700' : 'text-red-600'}`}>{r.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// PR-4-B: BundleConfirmModal — required by Erica before any Stripe redirect.
// Always renders 3 lines (SMS delivery cost / Service & processing fee /
// Total today). Uses the per-pack `breakdown` from useSmsCredits as the
// single source of truth. Mobile-safe: max-w-sm + w-[90vw] + overflow-hidden,
// fixed inset overlay so it never causes horizontal page scroll.
// ---------------------------------------------------------------------------
const BundleConfirmModal: React.FC<{
  pack: typeof SMS_PACKS[PackSize];
  isPurchasing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ pack, isPurchasing, onCancel, onConfirm }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bundle-confirm-title"
      data-testid="modal-confirm-purchase"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm w-[90vw] max-h-[90vh] overflow-hidden flex flex-col min-w-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 p-4 border-b border-gray-100 min-w-0">
          <div className="min-w-0 flex-1">
            <p id="bundle-confirm-title" className="text-base font-bold text-gray-900 truncate">
              Confirm purchase
            </p>
            <p className="text-xs text-gray-500 truncate" data-testid="text-modal-pack-label">
              {pack.label} — {pack.credits} credits
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isPurchasing}
            className="flex-shrink-0 -m-1 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label="Close"
            data-testid="button-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 min-w-0 overflow-y-auto">
          <div className="flex items-center justify-between text-sm gap-2 min-w-0">
            <span className="text-gray-600 truncate min-w-0 flex-1">SMS delivery cost</span>
            <span className="text-gray-900 font-medium flex-shrink-0" data-testid="text-modal-delivery">
              {fmtGbp(pack.breakdown.deliveryPence)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm gap-2 min-w-0">
            <span className="text-gray-600 truncate min-w-0 flex-1">Service &amp; processing fee</span>
            <span className="text-gray-900 font-medium flex-shrink-0" data-testid="text-modal-service">
              {fmtGbp(pack.breakdown.servicePence)}
            </span>
          </div>
          <div className="border-t border-gray-100 pt-2 mt-1 flex items-center justify-between gap-2 min-w-0">
            <span className="text-sm font-semibold text-gray-900 truncate min-w-0 flex-1">Total today</span>
            <span className="text-base font-bold text-gray-900 flex-shrink-0" data-testid="text-modal-total">
              {fmtGbp(pack.breakdown.totalPence)}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 break-words pt-1">
            Credits never expire · Secure payment via Stripe
          </p>
        </div>

        <div className="p-4 pt-2 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2 min-w-0">
          <button
            onClick={onCancel}
            disabled={isPurchasing}
            className="w-full sm:flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 min-w-0"
            data-testid="button-modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPurchasing}
            className="w-full sm:flex-1 flex items-center justify-center gap-1.5 bg-[#7c3aed] text-white rounded-lg py-2.5 text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 min-w-0"
            data-testid="button-modal-continue"
          >
            {isPurchasing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
              : <CreditCard className="w-3.5 h-3.5 flex-shrink-0" />}
            <span className="truncate">Continue to secure checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Bundles tab — Stripe flow preserved, mobile-fixed layout.
// PR-4-B: 3 → 6 packs, "p each" labels removed, BundleConfirmModal inserted
// between the per-pack Buy click and the Stripe redirect. The actual Stripe
// purchase still routes through purchase-sms-credits v18 unchanged.
// ---------------------------------------------------------------------------
const BundlesTab: React.FC<{ userId: string }> = ({ userId: _userId }) => {
  const { credits, isLoading, isPurchasing, purchaseCredits } = useSmsCredits();
  const [pendingPack, setPendingPack] = useState<PackSize | null>(null);

  const handleConfirm = async () => {
    if (!pendingPack) return;
    const size = pendingPack;
    try {
      await purchaseCredits(size);
    } finally {
      setPendingPack(null);
    }
  };

  return (
    <div className="space-y-3 min-w-0">
      {isLoading ? (
        <div className="h-14 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-green-700 font-medium truncate">Current balance</p>
          </div>
          <span className="text-2xl font-black text-green-700 flex-shrink-0" data-testid="text-bundles-balance">{credits ?? 0}</span>
        </div>
      )}
      <div className="space-y-2">
        {(Object.entries(SMS_PACKS) as [PackSize, typeof SMS_PACKS[PackSize]][]).map(([size, pack]) => {
          const highlight = pack.popular || pack.bestValue;
          return (
            <div
              key={size}
              className={`bg-white rounded-xl border shadow-sm p-3 flex items-center justify-between gap-3 min-w-0 overflow-hidden ${highlight ? 'border-[#7c3aed]' : 'border-gray-100'}`}
              data-testid={`card-pack-${size}`}
            >
              <div className="min-w-0 flex-1">
                {pack.popular && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide" data-testid={`badge-popular-${size}`}>
                    <Star className="w-3 h-3" /> Popular
                  </span>
                )}
                {pack.bestValue && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7c3aed] uppercase tracking-wide" data-testid={`badge-best-value-${size}`}>
                    <Trophy className="w-3 h-3" /> Best Value
                  </span>
                )}
                <p className="font-bold text-sm text-gray-900 truncate">{pack.label}</p>
                <p className="text-[11px] text-gray-500 truncate">{pack.credits} credits</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm text-gray-900 mb-1.5">{pack.price}</p>
                <button
                  onClick={() => setPendingPack(size)}
                  disabled={isPurchasing || pendingPack !== null}
                  className="flex items-center gap-1 bg-[#7c3aed] text-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  data-testid={`button-buy-pack-${size}`}
                >
                  <CreditCard className="w-3 h-3" />
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[10px] text-gray-400 break-words">Credits never expire · Secure payment via Stripe</p>

      {pendingPack && (
        <BundleConfirmModal
          pack={SMS_PACKS[pendingPack]}
          isPurchasing={isPurchasing}
          onCancel={() => { if (!isPurchasing) setPendingPack(null); }}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// History tab — reporting only
// ---------------------------------------------------------------------------
const HistoryTab: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: history = [], isLoading, error } = useSMSHistory(userId);
  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">Failed to load history.</div>;
  if (history.length === 0) return (
    <div className="text-center py-12">
      <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="font-semibold text-xs text-gray-500">No SMS history yet</p>
    </div>
  );
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-[10px] text-gray-400">Reporting only.</p>
      {(history as any[]).map(tx => (
        <div key={tx.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 min-w-0 overflow-hidden" data-testid={`row-history-${tx.id}`}>
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 truncate">{tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits</p>
              <p className="text-[11px] text-gray-400 truncate">{new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {tx.price_paid != null && <p className="text-xs font-semibold text-gray-700">£{Number(tx.price_paid).toFixed(2)}</p>}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
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
// Page shell — mobile-first, no horizontal overflow
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'reminders', label: 'Reminders', icon: MessageSquare },
  { id: 'waiting',   label: 'Waiting',   icon: Clock },
  { id: 'broadcast', label: 'Broadcast', icon: Send },
  { id: 'bundles',   label: 'Bundles',   icon: CreditCard },
  { id: 'history',   label: 'History',   icon: History },
];

const InstructorSMS: React.FC<Props> = ({ userId }) => {
  const [tab, setTab] = useState<'reminders'|'waiting'|'broadcast'|'bundles'|'history'>('reminders');

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3 min-w-0" data-testid="page-instructor-sms">
      <div className="min-w-0">
        <h1 className="text-base font-bold text-gray-900 truncate" data-testid="text-page-title">SMS</h1>
      </div>

      <SetupOnlyNote />

      <div className="grid grid-cols-5 gap-1 bg-white rounded-xl border border-gray-100 p-1 min-w-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors min-w-0 ${
              tab === t.id ? 'bg-[#7c3aed] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid={`tab-${t.id}`}
          >
            <t.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate w-full text-center leading-none">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'reminders' && <RemindersTab userId={userId} />}
      {tab === 'waiting'   && <WaitingListTab />}
      {tab === 'broadcast' && <BroadcastTab userId={userId} />}
      {tab === 'bundles'   && <BundlesTab userId={userId} />}
      {tab === 'history'   && <HistoryTab userId={userId} />}
    </div>
  );
};

export default InstructorSMS;
