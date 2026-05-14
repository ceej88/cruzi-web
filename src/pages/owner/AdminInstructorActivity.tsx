import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Activity, Search, Loader2, RefreshCw, ArrowUpDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

type ActivityStatus = 'active' | 'warming_up' | 'at_risk' | 'dormant';

interface ActivityRow {
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
  activity_status: ActivityStatus;
}

const STATUS_LABEL: Record<ActivityStatus, string> = {
  active:     'Active',
  warming_up: 'Warming up',
  at_risk:    'At risk',
  dormant:    'Dormant',
};

const STATUS_VARIANT: Record<ActivityStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active:     'default',
  warming_up: 'secondary',
  at_risk:    'outline',
  dormant:    'destructive',
};

type SortKey =
  | 'status' | 'name' | 'email' | 'last_login' | 'signup'
  | 'students' | 'lessons' | 'sched_week' | 'plans_sent'
  | 'mocks' | 'copilot' | 'sms' | 'last_active';

const STATUS_RANK: Record<ActivityStatus, number> = {
  at_risk: 1, dormant: 2, warming_up: 3, active: 4,
};

const fmtDate = (iso: string | null) => (iso ? format(new Date(iso), 'd MMM yy') : '—');
const fmtAgo  = (iso: string | null) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : '—';

const AdminInstructorActivity: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ActivityStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading, isError, refetch, isFetching } = useQuery<ActivityRow[]>({
    queryKey: ['admin', 'instructor-activity'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('admin_instructor_activity');
      if (error) throw error;
      return (data as ActivityRow[]) ?? [];
    },
  });

  const rows = data ?? [];

  const counts = useMemo(() => {
    const c = { all: rows.length, active: 0, warming_up: 0, at_risk: 0, dormant: 0 };
    rows.forEach((r) => { c[r.activity_status] += 1; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let out = rows;
    if (statusFilter !== 'all') out = out.filter((r) => r.activity_status === statusFilter);
    if (term) {
      out = out.filter(
        (r) =>
          (r.full_name ?? '').toLowerCase().includes(term) ||
          (r.email ?? '').toLowerCase().includes(term),
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    const cmp = (a: ActivityRow, b: ActivityRow): number => {
      switch (sortKey) {
        case 'status':      return (STATUS_RANK[a.activity_status] - STATUS_RANK[b.activity_status]) * dir;
        case 'name':        return ((a.full_name ?? '').localeCompare(b.full_name ?? '')) * dir;
        case 'email':       return a.email.localeCompare(b.email) * dir;
        case 'last_login':  return ((new Date(a.last_sign_in_at ?? 0).getTime()) - (new Date(b.last_sign_in_at ?? 0).getTime())) * dir;
        case 'signup':      return ((new Date(a.signup_at ?? 0).getTime()) - (new Date(b.signup_at ?? 0).getTime())) * dir;
        case 'students':    return (a.students_count - b.students_count) * dir;
        case 'lessons':     return (a.lessons_total - b.lessons_total) * dir;
        case 'sched_week':  return (a.lessons_scheduled_week - b.lessons_scheduled_week) * dir;
        case 'plans_sent':  return (a.lesson_plans_sent - b.lesson_plans_sent) * dir;
        case 'mocks':       return (a.mock_tests - b.mock_tests) * dir;
        case 'copilot':     return (a.copilot_sessions - b.copilot_sessions) * dir;
        case 'sms':         return (a.sms_credit_balance - b.sms_credit_balance) * dir;
        case 'last_active': return ((new Date(a.last_activity_at ?? 0).getTime()) - (new Date(b.last_activity_at ?? 0).getTime())) * dir;
        default:            return 0;
      }
    };
    return [...out].sort(cmp);
  }, [rows, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir(k === 'status' || k === 'name' || k === 'email' ? 'asc' : 'desc'); }
  };

  const SortHeader: React.FC<{ k: SortKey; label: string; align?: 'left' | 'right' }> = ({ k, label, align = 'left' }) => (
    <TableHead className={align === 'right' ? 'text-right' : ''}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className={`inline-flex items-center gap-1 font-medium hover:text-foreground ${
          sortKey === k ? 'text-foreground' : 'text-muted-foreground'
        }`}
        data-testid={`button-sort-${k}`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4" data-testid="page-instructor-activity">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" data-testid="text-page-title">
            <Activity className="h-6 w-6" />
            Instructor activity
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            One row per instructor. Attention-needed accounts shown first.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh"
        >
          {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">
              Showing {filtered.length} of {counts.all} instructors ·{' '}
              <span className="text-muted-foreground font-normal">
                {counts.active} active · {counts.warming_up} warming up · {counts.at_risk} at risk · {counts.dormant} dormant
              </span>
            </CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {(['all', 'active', 'warming_up', 'at_risk', 'dormant'] as const).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={statusFilter === k ? 'default' : 'outline'}
                onClick={() => setStatusFilter(k)}
                data-testid={`button-filter-${k}`}
              >
                {k === 'all' ? `All (${counts.all})` : `${STATUS_LABEL[k]} (${counts[k]})`}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground" data-testid="status-loading">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading instructor activity…
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-destructive" data-testid="status-error">
              Failed to load instructor activity. You may not have admin access.
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground" data-testid="status-empty">
              No instructors match the current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader k="status"      label="Status" />
                    <SortHeader k="name"        label="Name" />
                    <SortHeader k="email"       label="Email" />
                    <SortHeader k="last_login"  label="Last login" />
                    <SortHeader k="signup"      label="Signed up" />
                    <SortHeader k="students"    label="Students"     align="right" />
                    <SortHeader k="lessons"     label="Lessons"      align="right" />
                    <SortHeader k="sched_week"  label="Sched. week"  align="right" />
                    <SortHeader k="plans_sent"  label="Plans (sent/total)" align="right" />
                    <SortHeader k="mocks"       label="Mocks"        align="right" />
                    <SortHeader k="copilot"     label="Co-Pilot"     align="right" />
                    <TableHead className="text-right">Parents</TableHead>
                    <SortHeader k="sms"         label="SMS bal."     align="right" />
                    <SortHeader k="last_active" label="Last active" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.user_id} data-testid={`row-instructor-${r.user_id}`}>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[r.activity_status]} data-testid={`status-${r.user_id}`}>
                          {STATUS_LABEL[r.activity_status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-name-${r.user_id}`}>
                        {r.full_name || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`text-email-${r.user_id}`}>
                        {r.email}
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`text-last-login-${r.user_id}`}>
                        {fmtAgo(r.last_sign_in_at)}
                      </TableCell>
                      <TableCell className="text-sm">{fmtDate(r.signup_at)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.students_count}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.lessons_total}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.lessons_scheduled_week}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.lesson_plans_sent} / {r.lesson_plans_created}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.mock_tests}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.copilot_sessions}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground italic" title="Linkage requires parent to sign up with the same email used in the invite. Coming next iteration.">
                        Unavailable
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{r.sms_credit_balance}</TableCell>
                      <TableCell className="text-sm" data-testid={`text-last-active-${r.user_id}`}>
                        {fmtAgo(r.last_activity_at)}
                      </TableCell>
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

export default AdminInstructorActivity;
