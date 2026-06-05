import { useMemo, useState } from 'react';
import { CalendarDays, ClipboardCheck, Link2, Users } from 'lucide-react';
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

export default function Students() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const q = query.trim().toLowerCase();
    return model.students.filter((student) => {
      const matchesQuery = !q
        || student.name.toLowerCase().includes(q)
        || student.email.toLowerCase().includes(q)
        || student.instructorName.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all'
        || (filter === 'linked' && student.linkedInstructor)
        || (filter === 'unlinked' && !student.linkedInstructor)
        || (filter === 'not-onboarded' && !student.onboarded)
        || (filter === 'test-ready' && student.testReady)
        || (filter === 'approved' && student.approvalStatus === 'approved');
      return matchesQuery && matchesFilter;
    });
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Students" description="Read-only student operations and linkage health.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Students" description="Read-only student operations and linkage health.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Students" description="Understand onboarding, instructor links, lessons, payments, and booking readiness.">
      <ReadOnlyNotice />

      <section>
        <SectionHeader title="Student Health" hint="Counts are based on all loaded student rows, not the visible table page." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Students" value={model.counts.students} status={valueStatus} icon={Users} />
          <MetricCard label="Onboarded" value={model.counts.studentsOnboarded} status={valueStatus} icon={Users} hint={formatPercent(model.counts.studentsOnboarded, model.counts.students)} />
          <MetricCard label="Linked to instructors" value={model.counts.studentsLinked} status={valueStatus} icon={Link2} hint={formatPercent(model.counts.studentsLinked, model.counts.students)} />
          <MetricCard label="Test-ready" value={model.counts.testReadyStudents} status={valueStatus} icon={ClipboardCheck} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Student Directory</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Sensitive profile and instructor booking data is not shown.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search students" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  <SelectItem value="linked">Linked</SelectItem>
                  <SelectItem value="unlinked">Unlinked</SelectItem>
                  <SelectItem value="not-onboarded">Not onboarded</SelectItem>
                  <SelectItem value="test-ready">Test-ready</SelectItem>
                  <SelectItem value="approved">Approved to book</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No students match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Test booking</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((student) => (
                  <TableRow key={student.user_id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell>
                      {student.linkedInstructor ? student.instructorName : <StatusPill value="unlinked" tone="warn" />}
                    </TableCell>
                    <TableCell>
                      <StatusPill value={student.onboarded ? 'completed' : 'not onboarded'} tone={student.onboarded ? 'good' : 'warn'} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        {student.lessonCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.transactionCount} transactions
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StatusPill value={student.testReady ? 'test ready' : 'not ready'} tone={student.testReady ? 'good' : 'neutral'} />
                        <div className="text-xs text-muted-foreground">Approval: {student.approvalStatus}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(student.latestActivityAt)}</TableCell>
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
