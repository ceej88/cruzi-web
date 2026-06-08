import { useMemo, useState } from 'react';
import { CalendarDays, CreditCard, GraduationCap, MessageCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard, type MetricStatus } from './_components/MetricCard';
import { SectionHeader } from './_components/SectionHeader';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OperationsPage,
  ReadOnlyNotice,
  SearchBox,
  StatusPill,
  formatPercent,
} from './_components/OperationsUI';
import { formatDateTime, useOperationsModel } from './_data/useOperationsData';

const valueStatus: MetricStatus = 'value';

export default function Instructors() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const q = query.trim().toLowerCase();
    return model.instructors.filter((instructor) => {
      const matchesQuery = !q
        || instructor.name.toLowerCase().includes(q)
        || instructor.email.toLowerCase().includes(q)
        || instructor.phone.toLowerCase().includes(q)
        || instructor.status.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all'
        || (filter === 'pending' && instructor.status === 'pending')
        || (filter === 'active' && instructor.status === 'active')
        || (filter === 'low-sms' && (instructor.smsBalance ?? 0) < 10)
        || (filter === 'with-students' && instructor.studentCount > 0)
        || (filter === 'stripe-ready' && instructor.stripeReady);
      return matchesQuery && matchesFilter;
    });
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Instructors" description="Read-only instructor readiness and activity.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Instructors" description="Read-only instructor readiness and activity.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Instructors" description="Track verification, students, SMS credits, subscriptions, and lesson activity.">
      <ReadOnlyNotice>
        This page shows instructor state only. Verification, suspension, and account mutation tools are isolated in Admin Tools.
      </ReadOnlyNotice>

      <section>
        <SectionHeader title="Instructor Health" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Instructors" value={model.counts.instructors} status={valueStatus} icon={GraduationCap} />
          <MetricCard label="Onboarded" value={model.counts.instructorsOnboarded} status={valueStatus} icon={GraduationCap} hint={formatPercent(model.counts.instructorsOnboarded, model.counts.instructors)} />
          <MetricCard label="With students" value={model.counts.instructorsWithStudents} status={valueStatus} icon={Users} />
          <MetricCard label="Low SMS credits" value={model.counts.lowSmsCredits} status={valueStatus} icon={MessageCircle} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Instructor Directory</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Only basic contact details are shown. Private reference numbers and raw instructor metadata are hidden.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search instructors" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All instructors</SelectItem>
                  <SelectItem value="pending">Pending status</SelectItem>
                  <SelectItem value="active">Active status</SelectItem>
                  <SelectItem value="low-sms">Low SMS credits</SelectItem>
                  <SelectItem value="with-students">With students</SelectItem>
                  <SelectItem value="stripe-ready">Stripe ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No instructors match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>SMS</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((instructor) => (
                  <TableRow key={instructor.user_id}>
                    <TableCell>
                      <div className="font-medium">{instructor.name}</div>
                      <div className="text-xs text-muted-foreground">{instructor.email}</div>
                      <div className="text-xs text-muted-foreground">Phone: {instructor.phone}</div>
                    </TableCell>
                    <TableCell>
                      <StatusPill value={instructor.status} />
                    </TableCell>
                    <TableCell>{instructor.studentCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {instructor.lessonCount}
                      </div>
                      <div className="text-xs text-muted-foreground">{instructor.upcomingLessons} upcoming</div>
                    </TableCell>
                    <TableCell>
                      <StatusPill value={`${instructor.smsBalance ?? 0} credits`} tone={(instructor.smsBalance ?? 0) < 10 ? 'warn' : 'good'} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>{instructor.subscriptionTier}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{instructor.subscriptionStatus}</div>
                    </TableCell>
                    <TableCell>
                      <StatusPill value={instructor.stripeReady ? 'ready' : 'not ready'} tone={instructor.stripeReady ? 'good' : 'warn'} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(instructor.latestActivityAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </OperationsPage>
  );
}
