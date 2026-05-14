import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay } from 'date-fns';

const STALE = 60_000;
const sevenDaysAgoIso = () =>
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

async function countTable(
  table: string,
  filter?: (q: any) => any,
): Promise<number> {
  let q: any = (supabase as any).from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

// ---------- Today ----------
export function useTodayMetrics() {
  return useQuery({
    queryKey: ['admin', 'today'],
    staleTime: STALE,
    queryFn: async () => {
      const today = startOfDay(new Date()).toISOString();
      const [signups, lessonsToday, smsTopUpsToday] = await Promise.all([
        countTable('profiles',         q => q.gte('created_at', today)),
        countTable('lessons',          q => q.gte('scheduled_at', today)),
        countTable('sms_transactions', q => q.gte('created_at', today)),
      ]);
      return { signups, lessonsToday, smsTopUpsToday };
    },
  });
}

// ---------- User Base ----------
export function useUserBaseMetrics() {
  return useQuery({
    queryKey: ['admin', 'user-base'],
    staleTime: STALE,
    queryFn: async () => {
      const sevenDays = sevenDaysAgoIso();
      const roleCount = (role: string) =>
        countTable('user_roles', q => q.eq('role', role));
      const [profilesTotal, profilesNew7d, instructors, students, parents, admins] =
        await Promise.all([
          countTable('profiles'),
          countTable('profiles', q => q.gte('created_at', sevenDays)),
          roleCount('instructor'),
          roleCount('student'),
          roleCount('parent'),
          roleCount('admin'),
        ]);
      return { profilesTotal, profilesNew7d, instructors, students, parents, admins };
    },
  });
}

// ---------- Product Usage ----------
export function useProductUsageMetrics() {
  return useQuery({
    queryKey: ['admin', 'product-usage'],
    staleTime: STALE,
    queryFn: async () => {
      const sevenDays = sevenDaysAgoIso();
      const [lessons, lessonPlans, copilot, copilot7d, practice, mockTests] = await Promise.all([
        countTable('lessons'),
        countTable('lesson_plans'),
        countTable('co_pilot_sessions'),
        countTable('co_pilot_sessions', q => q.gte('created_at', sevenDays)),
        countTable('practice_sessions'),
        countTable('mock_test_results'),
      ]);
      return { lessons, lessonPlans, copilot, copilot7d, practice, mockTests };
    },
  });
}

// ---------- SMS ----------
export function useSmsMetrics() {
  return useQuery({
    queryKey: ['admin', 'sms'],
    staleTime: STALE,
    queryFn: async () => {
      const sevenDays = sevenDaysAgoIso();
      const [creditsRes, txTotal, txTop7d, txFail7d, lifetimeRes] = await Promise.all([
        (supabase as any).from('sms_credits').select('balance, lifetime_purchased, lifetime_used'),
        countTable('sms_transactions'),
        countTable('sms_transactions', q => q.gte('created_at', sevenDays)),
        countTable('sms_transactions', q => q.eq('status', 'failed').gte('created_at', sevenDays)),
        (supabase as any).from('sms_transactions').select('price_paid, status').eq('status', 'completed'),
      ]);
      const credits: Array<{ balance: number | null; lifetime_purchased: number | null; lifetime_used: number | null }> =
        creditsRes.data ?? [];
      const balanceTotal       = credits.reduce((s, r) => s + (r.balance ?? 0), 0);
      const lowBalanceCount    = credits.filter(r => (r.balance ?? 0) < 10).length;
      const lifetimePurchased  = credits.reduce((s, r) => s + (r.lifetime_purchased ?? 0), 0);
      const lifetimeUsed       = credits.reduce((s, r) => s + (r.lifetime_used ?? 0), 0);
      const lifetimeRevenuePence = (lifetimeRes.data ?? [])
        .reduce((s: number, r: any) => s + Math.round(Number(r.price_paid ?? 0) * 100), 0);
      return {
        balanceTotal, lowBalanceCount,
        lifetimePurchased, lifetimeUsed,
        txTotal, txTop7d, txFail7d,
        lifetimeRevenuePence,
      };
    },
  });
}

// ---------- Subscriptions (uses tiers, not recent_changes) ----------
export interface SubsOverview {
  tiers: Array<{ tier: string; status: string; count: number }>;
  recent_changes: Array<{
    user_id: string;
    full_name: string | null;
    email: string | null;
    tier: string;
    status: string;
    updated_at: string;
  }>;
}

export function useSubscriptionsOverview() {
  return useQuery({
    queryKey: ['admin', 'subs-overview'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('admin_subscription_overview');
      if (error) throw error;
      const o = (data ?? { tiers: [], recent_changes: [] }) as SubsOverview;
      return o;
    },
  });
}

export function useSubscriptionStats() {
  const q = useSubscriptionsOverview();
  const tiers = q.data?.tiers ?? [];
  const active  = tiers.filter(t => t.status === 'active').reduce((s, t) => s + (t.count ?? 0), 0);
  const paying  = tiers.filter(t => t.status === 'active' && t.tier !== 'free').reduce((s, t) => s + (t.count ?? 0), 0);
  const trialing = tiers.filter(t => t.status === 'trialing').reduce((s, t) => s + (t.count ?? 0), 0);
  return { ...q, active, paying, trialing };
}

// ---------- Pending instructors ----------
export function usePendingInstructors() {
  return useQuery({
    queryKey: ['admin', 'pending-instructors'],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('admin_list_pending_instructors');
      if (error) throw error;
      return Array.isArray(data) ? data.length : 0;
    },
  });
}

// ---------- Activity feed ----------
export interface ActivityEvent {
  id: string;
  kind: 'signup' | 'topup' | 'sub' | 'failure';
  title: string;
  subtitle?: string;
  at: string;
}

export function useActivityFeed() {
  return useQuery<ActivityEvent[]>({
    queryKey: ['admin', 'activity'],
    staleTime: STALE,
    queryFn: async () => {
      const events: ActivityEvent[] = [];
      const [signupsRes, smsRes, subsRes] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select('user_id, full_name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        (supabase as any)
          .from('sms_transactions')
          .select('id, instructor_id, amount, price_paid, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        (supabase as any).rpc('admin_subscription_overview'),
      ]);

      (signupsRes.data ?? []).forEach((p: any) => {
        events.push({
          id: `signup-${p.user_id}`,
          kind: 'signup',
          title: `New sign-up: ${p.full_name || p.email || 'Unknown'}`,
          subtitle: p.email ?? undefined,
          at: p.created_at,
        });
      });

      (smsRes.data ?? []).forEach((s: any) => {
        const failed = s.status === 'failed';
        events.push({
          id: `sms-${s.id}`,
          kind: failed ? 'failure' : 'topup',
          title: failed
            ? `SMS top-up failed (${s.amount ?? '?'} credits)`
            : `SMS top-up: ${s.amount ?? '?'} credits${s.price_paid != null ? ` (£${Number(s.price_paid).toFixed(2)})` : ''}`,
          subtitle: failed ? 'Stripe purchase did not complete' : `Status: ${s.status ?? 'unknown'}`,
          at: s.created_at,
        });
      });

      const subs = (subsRes?.data ?? null) as SubsOverview | null;
      (subs?.recent_changes ?? []).slice(0, 5).forEach((c: any) => {
        events.push({
          id: `sub-${c.user_id}-${c.updated_at}`,
          kind: 'sub',
          title: `Subscription ${c.status}: ${c.full_name || c.email || c.user_id?.slice(0, 8)}`,
          subtitle: `${c.tier} · ${c.status}`,
          at: c.updated_at,
        });
      });

      events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      return events.slice(0, 15);
    },
  });
}


// ---------- Instructor Activity (per-instructor metrics) ----------
export interface InstructorActivityRow {
  user_id: string;
  full_name: string | null;
  email: string;
  last_sign_in_at: string | null;
  signup_at: string | null;
  students_count: number;
  lessons_total: number;
  lessons_scheduled_week: number;
  lesson_plans_created: number;
  lesson_plans_sent: number;
  mock_tests: number;
  copilot_sessions: number;
  parents_linked: number | null;
  sms_credit_balance: number;
  last_activity_at: string | null;
  activity_status: 'active' | 'warming_up' | 'at_risk' | 'dormant';
}

export function useInstructorActivity() {
  return useQuery<InstructorActivityRow[]>({
    queryKey: ['admin', 'instructor-activity'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('admin_instructor_activity');
      if (error) throw error;
      return (data as InstructorActivityRow[]) ?? [];
    },
  });
}
