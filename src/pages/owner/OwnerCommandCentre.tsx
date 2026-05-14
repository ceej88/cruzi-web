import React, { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  ChevronLeft,
  LogOut,
  RefreshCw,
  Users,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Bell,
  Building2,
  FileText,
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  UserPlus,
  Send,
  Activity,
  PoundSterling,
  GraduationCap,
  Brain,
  ClipboardList,
  Car,
  ArrowRight,
} from 'lucide-react';

// Lazy-load existing admin sub-pages so the landing dashboard stays fast.
const AdminUserManagement = lazy(() => import('./AdminUserManagement'));
const AdminInstructorVerification = lazy(() => import('./AdminInstructorVerification'));
const AdminSubscriptionOverview = lazy(() => import('./AdminSubscriptionOverview'));
const AdminFeedback = lazy(() => import('./AdminFeedback'));
const AdminMessaging = lazy(() => import('./AdminMessaging'));
const AdminNotificationHub = lazy(() => import('./AdminNotificationHub'));
const AdminSchoolManagement = lazy(() => import('./AdminSchoolManagement'));
const AdminSupportAudit = lazy(() => import('./AdminSupportAudit'));
const BlogAdmin = lazy(() => import('./BlogAdmin'));
const GrowthLab = lazy(() => import('./GrowthLab'));

// ---- Sub-route registry. Single source of truth for nav + Quick Links. ----
const SUB_ROUTES = [
  { path: 'users', title: 'User Management', icon: Users, description: 'View, edit and manage all users', element: <AdminUserManagement /> },
  { path: 'instructors', title: 'Instructor Verification', icon: ShieldCheck, description: 'Approve pending instructor sign-ups', element: <AdminInstructorVerification /> },
  { path: 'subscriptions', title: 'Subscriptions', icon: CreditCard, description: 'Stripe plans and billing status', element: <AdminSubscriptionOverview /> },
  { path: 'schools', title: 'Schools', icon: Building2, description: 'Driving school accounts and admins', element: <AdminSchoolManagement /> },
  { path: 'feedback', title: 'Feedback', icon: MessageSquare, description: 'Parent and student feedback inbox', element: <AdminFeedback /> },
  { path: 'messaging', title: 'Messaging', icon: Send, description: 'Broadcast and direct messages', element: <AdminMessaging /> },
  { path: 'notifications', title: 'Notification Hub', icon: Bell, description: 'Push and email notification controls', element: <AdminNotificationHub /> },
  { path: 'audit', title: 'Support & Audit', icon: FileText, description: 'Audit log and support tooling', element: <AdminSupportAudit /> },
  { path: 'blog', title: 'Blog', icon: ClipboardList, description: 'Blog post management', element: <BlogAdmin /> },
  { path: 'growth', title: 'Growth Lab', icon: TrendingUp, description: 'Growth experiments and analytics', element: <GrowthLab /> },
] as const;

// =============================================================================
// Header — shared across landing + sub-pages.
// =============================================================================
const OwnerHeader: React.FC<{ subtitle?: string }> = ({ subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const isLanding = location.pathname === '/owner' || location.pathname === '/owner/';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20" data-testid="header-owner">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {!isLanding && (
            <button
              onClick={() => navigate('/owner')}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Back to dashboard"
              data-testid="button-back-dashboard"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium leading-none">
              {isLanding ? 'Admin' : <Link to="/owner" className="hover:text-slate-700">Admin</Link>}
            </p>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate" data-testid="text-page-title">
              {isLanding ? 'Dashboard' : (subtitle || 'Admin')}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg sm:text-xl font-black text-[#7c3aed]">Cruzi</span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-1 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

// =============================================================================
// Helpers
// =============================================================================
const startOfTodayISO = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const endOfTodayISO = (): string => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};
const sevenDaysAgoISO = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const fmtNum = (n: number | null | undefined): string =>
  n === null || n === undefined || Number.isNaN(n) ? '—' : n.toLocaleString();

// Count helper using a head=true select. Returns null on error so the UI can show "—".
const countTable = async (
  table: 'profiles' | 'lessons' | 'lesson_plans' | 'co_pilot_sessions' | 'mock_test_results' | 'practice_sessions' | 'sms_credits' | 'sms_transactions' | 'parent_feedback' | 'user_roles',
  filter?: (q: any) => any,
): Promise<number | null> => {
  let q: any = (supabase as any).from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) return null;
  return count ?? 0;
};

// =============================================================================
// Section: Today
// =============================================================================
const TodaySection: React.FC = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['owner-dashboard', 'today'],
    queryFn: async () => {
      const today0 = startOfTodayISO();
      const today1 = endOfTodayISO();
      const [lessonsToday, signupsToday, smsToday] = await Promise.all([
        countTable('lessons', q => q.gte('scheduled_at', today0).lte('scheduled_at', today1)),
        countTable('profiles', q => q.gte('created_at', today0)),
        countTable('sms_transactions', q => q.gte('created_at', today0)),
      ]);
      return { lessonsToday, signupsToday, smsToday };
    },
  });

  return (
    <SectionCard
      title="Today"
      icon={CalendarDays}
      onRefresh={refetch}
      refreshing={isFetching}
      subtitle={format(new Date(), 'EEEE, d MMMM yyyy')}
      testId="section-today"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Lessons scheduled" value={data?.lessonsToday ?? null} loading={isLoading} icon={Car} testId="stat-lessons-today" />
        <Stat label="New sign-ups" value={data?.signupsToday ?? null} loading={isLoading} icon={UserPlus} testId="stat-signups-today" />
        <Stat label="SMS transactions" value={data?.smsToday ?? null} loading={isLoading} icon={MessageSquare} testId="stat-sms-today" />
      </div>
    </SectionCard>
  );
};

// =============================================================================
// Section: Needs Attention
// =============================================================================
const NeedsAttentionSection: React.FC = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['owner-dashboard', 'needs-attention'],
    queryFn: async () => {
      const [{ data: pendingRows, error: pendingErr }, lowCredits, failedSms] = await Promise.all([
        (supabase as any).rpc('admin_list_pending_instructors'),
        countTable('sms_credits', q => q.lt('balance', 10)),
        countTable('sms_transactions', q => q.eq('status', 'failed').gte('created_at', sevenDaysAgoISO())),
      ]);
      const pendingCount = pendingErr ? null : (Array.isArray(pendingRows) ? pendingRows.length : 0);
      const pendingPreview = Array.isArray(pendingRows) ? pendingRows.slice(0, 3) : [];
      return { pendingCount, pendingPreview, lowCredits, failedSms };
    },
  });

  const items = [
    { label: 'Instructors awaiting approval', value: data?.pendingCount ?? null, link: '/owner/instructors', tone: (data?.pendingCount ?? 0) > 0 ? 'warn' as const : 'ok' as const },
    { label: 'Instructors with < 10 SMS credits', value: data?.lowCredits ?? null, link: '/owner/users', tone: (data?.lowCredits ?? 0) > 0 ? 'warn' as const : 'ok' as const },
    { label: 'Failed SMS (last 7 days)', value: data?.failedSms ?? null, link: '/owner/audit', tone: (data?.failedSms ?? 0) > 0 ? 'alert' as const : 'ok' as const },
  ];

  return (
    <SectionCard title="Needs Attention" icon={AlertTriangle} onRefresh={refetch} refreshing={isFetching} testId="section-needs-attention">
      <ul className="divide-y divide-slate-100">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.link}
              className="flex items-center justify-between py-3 px-1 -mx-1 hover:bg-slate-50 rounded transition-colors"
              data-testid={`link-attention-${it.link.split('/').pop()}`}
            >
              <span className="text-sm text-slate-700 pr-2 min-w-0 truncate">{it.label}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={
                    'inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-full text-sm font-semibold ' +
                    (it.tone === 'alert'
                      ? 'bg-rose-100 text-rose-700'
                      : it.tone === 'warn'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600')
                  }
                >
                  {isLoading ? '…' : fmtNum(it.value)}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {(data?.pendingPreview?.length ?? 0) > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pending instructors (preview)</p>
          <ul className="space-y-1.5">
            {data!.pendingPreview.map((p: any) => (
              <li key={p.user_id} className="text-sm text-slate-700 flex items-center justify-between gap-2">
                <span className="truncate min-w-0">{p.full_name || p.email || p.user_id}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{p.adi_number || '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
};

// =============================================================================
// Section: User Base
// =============================================================================
const UserBaseSection: React.FC = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['owner-dashboard', 'user-base'],
    queryFn: async () => {
      const { data: rows, error } = await (supabase as any)
        .from('user_roles')
        .select('role');
      const counts: Record<string, number> = {};
      if (!error && Array.isArray(rows)) {
        for (const r of rows) counts[r.role] = (counts[r.role] || 0) + 1;
      }
      const totalProfiles = await countTable('profiles');
      const newWeek = await countTable('profiles', q => q.gte('created_at', sevenDaysAgoISO()));
      return {
        counts,
        totalProfiles,
        newWeek,
        rolesAvailable: !error,
      };
    },
  });

  const tiles: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'admin', label: 'Admins', icon: ShieldCheck },
    { key: 'instructor', label: 'Instructors', icon: GraduationCap },
    { key: 'student', label: 'Students', icon: Users },
    { key: 'parent', label: 'Parents', icon: UserPlus },
    { key: 'school_admin', label: 'School admins', icon: Building2 },
  ];

  return (
    <SectionCard title="User Base" icon={Users} onRefresh={refetch} refreshing={isFetching} testId="section-user-base">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <Stat
            key={t.key}
            label={t.label}
            value={data?.rolesAvailable ? (data.counts[t.key] ?? 0) : null}
            loading={isLoading}
            icon={t.icon}
            testId={`stat-role-${t.key}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Stat label="Total profiles" value={data?.totalProfiles ?? null} loading={isLoading} icon={Users} testId="stat-total-profiles" />
        <Stat label="New this week" value={data?.newWeek ?? null} loading={isLoading} icon={UserPlus} testId="stat-new-week" />
      </div>
    </SectionCard>
  );
};

// =============================================================================
// Section: Product Usage
// =============================================================================
const ProductUsageSection: React.FC = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['owner-dashboard', 'product-usage'],
    queryFn: async () => {
      const [lessons, lessonPlans, copilot, mocks, practice, copilotWeek] = await Promise.all([
        countTable('lessons'),
        countTable('lesson_plans'),
        countTable('co_pilot_sessions'),
        countTable('mock_test_results'),
        countTable('practice_sessions'),
        countTable('co_pilot_sessions', q => q.gte('created_at', sevenDaysAgoISO())),
      ]);
      return { lessons, lessonPlans, copilot, mocks, practice, copilotWeek };
    },
  });

  return (
    <SectionCard title="Product Usage" icon={Activity} onRefresh={refetch} refreshing={isFetching} testId="section-product-usage">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Lessons (all-time)" value={data?.lessons ?? null} loading={isLoading} icon={Car} testId="stat-lessons-total" />
        <Stat label="Lesson plans" value={data?.lessonPlans ?? null} loading={isLoading} icon={ClipboardList} testId="stat-lesson-plans" />
        <Stat label="Co-Pilot sessions" value={data?.copilot ?? null} loading={isLoading} icon={Brain} testId="stat-copilot" />
        <Stat label="Mock tests" value={data?.mocks ?? null} loading={isLoading} icon={GraduationCap} testId="stat-mocks" />
        <Stat label="Practice sessions" value={data?.practice ?? null} loading={isLoading} icon={Activity} testId="stat-practice" />
        <Stat label="Co-Pilot (last 7 days)" value={data?.copilotWeek ?? null} loading={isLoading} icon={TrendingUp} testId="stat-copilot-week" />
      </div>
    </SectionCard>
  );
};

// =============================================================================
// Section: Money / SMS
// =============================================================================
const MoneySmsSection: React.FC = () => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['owner-dashboard', 'money-sms'],
    queryFn: async () => {
      const [{ data: credits, error: cErr }, { data: txns, error: tErr }] = await Promise.all([
        (supabase as any).from('sms_credits').select('balance, lifetime_purchased, lifetime_used'),
        (supabase as any).from('sms_transactions').select('id, amount, price_paid, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      let totalBalance: number | null = null;
      let totalPurchased: number | null = null;
      let totalUsed: number | null = null;
      if (!cErr && Array.isArray(credits)) {
        totalBalance = credits.reduce((acc: number, r: any) => acc + (r.balance || 0), 0);
        totalPurchased = credits.reduce((acc: number, r: any) => acc + (r.lifetime_purchased || 0), 0);
        totalUsed = credits.reduce((acc: number, r: any) => acc + (r.lifetime_used || 0), 0);
      }

      let recentTxns: any[] = [];
      let revenuePence: number | null = null;
      if (!tErr && Array.isArray(txns)) {
        recentTxns = txns;
      }
      // Lifetime SMS revenue (all-time, not just last 5)
      const { data: allTxns, error: allErr } = await (supabase as any)
        .from('sms_transactions')
        .select('price_paid, status')
        .eq('status', 'completed');
      if (!allErr && Array.isArray(allTxns)) {
        revenuePence = allTxns.reduce((acc: number, r: any) => acc + (r.price_paid || 0), 0);
      }

      // Subscription overview (existing RPC). Optional — do not crash if blocked.
      const { data: subRows, error: subErr } = await (supabase as any).rpc('admin_subscription_overview');
      const activeSubs = !subErr && Array.isArray(subRows)
        ? subRows.filter((r: any) => r.status === 'active' || r.subscription_status === 'active').length
        : null;

      return { totalBalance, totalPurchased, totalUsed, recentTxns, revenuePence, activeSubs };
    },
  });

  const fmtPence = (p: number | null): string =>
    p === null || p === undefined ? '—' : '£' + (p / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <SectionCard title="Money & SMS" icon={PoundSterling} onRefresh={refetch} refreshing={isFetching} testId="section-money-sms">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="SMS credits in circulation" value={data?.totalBalance ?? null} loading={isLoading} icon={MessageSquare} testId="stat-sms-balance" />
        <Stat label="SMS purchased (lifetime)" value={data?.totalPurchased ?? null} loading={isLoading} icon={Send} testId="stat-sms-purchased" />
        <Stat label="SMS used (lifetime)" value={data?.totalUsed ?? null} loading={isLoading} icon={Activity} testId="stat-sms-used" />
        <Stat label="Active subscriptions" value={data?.activeSubs ?? null} loading={isLoading} icon={CreditCard} testId="stat-active-subs" />
      </div>

      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">SMS revenue (lifetime, completed only)</p>
        <p className="text-2xl font-bold text-slate-900" data-testid="text-sms-revenue">{isLoading ? '…' : fmtPence(data?.revenuePence ?? null)}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent SMS transactions</p>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (data?.recentTxns?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-400">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-sm" data-testid="table-recent-sms">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left font-semibold py-1.5 px-2">Date</th>
                  <th className="text-right font-semibold py-1.5 px-2">Credits</th>
                  <th className="text-right font-semibold py-1.5 px-2">Paid</th>
                  <th className="text-left font-semibold py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data!.recentTxns.map((t: any) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">{format(new Date(t.created_at), 'd MMM HH:mm')}</td>
                    <td className="py-1.5 px-2 text-right text-slate-700">{t.amount ?? '—'}</td>
                    <td className="py-1.5 px-2 text-right text-slate-700">{fmtPence(t.price_paid)}</td>
                    <td className="py-1.5 px-2">
                      <span
                        className={
                          'inline-block px-2 py-0.5 rounded text-xs font-medium ' +
                          (t.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : t.status === 'failed'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600')
                        }
                      >
                        {t.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

// =============================================================================
// Section: Quick Links
// =============================================================================
const QuickLinksSection: React.FC = () => (
  <SectionCard title="Quick Links" icon={ArrowRight} testId="section-quick-links">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {SUB_ROUTES.map((r) => (
        <Link
          key={r.path}
          to={`/owner/${r.path}`}
          className="group flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-[#7c3aed] hover:shadow-sm transition-all min-w-0"
          data-testid={`link-quick-${r.path}`}
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-violet-50 flex items-center justify-center flex-shrink-0">
            <r.icon className="w-4 h-4 text-slate-700 group-hover:text-[#7c3aed]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm leading-tight">{r.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>
          </div>
        </Link>
      ))}
    </div>
  </SectionCard>
);

// =============================================================================
// Reusable primitives
// =============================================================================
const SectionCard: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  testId?: string;
  children: React.ReactNode;
}> = ({ title, icon: Icon, subtitle, onRefresh, refreshing, testId, children }) => (
  <Card data-testid={testId}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </CardTitle>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
            aria-label={`Refresh ${title}`}
            data-testid={`button-refresh-${(testId || title).toLowerCase().replace(/\s+/g, '-')}`}
            disabled={refreshing}
          >
            <RefreshCw className={'w-4 h-4 ' + (refreshing ? 'animate-spin' : '')} />
          </button>
        )}
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const Stat: React.FC<{
  label: string;
  value: number | null;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  testId?: string;
}> = ({ label, value, loading, icon: Icon, testId }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 min-w-0" data-testid={testId}>
    <div className="flex items-center gap-2 mb-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
    </div>
    {loading ? (
      <Skeleton className="h-7 w-16" />
    ) : (
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{fmtNum(value)}</p>
    )}
  </div>
);

// =============================================================================
// Landing page (index route at /owner)
// =============================================================================
const OwnerLanding: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
    <TodaySection />
    <NeedsAttentionSection />
    <UserBaseSection />
    <ProductUsageSection />
    <MoneySmsSection />
    <QuickLinksSection />
  </div>
);

// =============================================================================
// Sub-page wrapper (lazy loading + per-page header subtitle)
// =============================================================================
const SubPageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <>
    <OwnerHeader subtitle={title} />
    <main className="max-w-6xl mx-auto px-4 py-6">
      <Suspense fallback={<div className="space-y-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>}>
        {children}
      </Suspense>
    </main>
  </>
);

// =============================================================================
// Top-level component (mounted at /owner/*)
// =============================================================================
const OwnerCommandCentre: React.FC = () => (
  <div className="min-h-screen bg-slate-50">
    <Routes>
      <Route
        index
        element={
          <>
            <OwnerHeader />
            <main>
              <OwnerLanding />
            </main>
          </>
        }
      />
      {SUB_ROUTES.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={<SubPageWrapper title={r.title}>{r.element}</SubPageWrapper>}
        />
      ))}
      <Route
        path="*"
        element={
          <>
            <OwnerHeader subtitle="Not found" />
            <main className="max-w-6xl mx-auto px-4 py-12 text-center">
              <p className="text-slate-600 mb-4">That admin page does not exist.</p>
              <Button onClick={() => window.history.back()}>Go back</Button>
            </main>
          </>
        }
      />
    </Routes>
  </div>
);

export default OwnerCommandCentre;
