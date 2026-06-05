import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';
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
} from './_components/OperationsUI';
import { formatDateTime, useOperationsModel } from './_data/useOperationsData';

const valueStatus: MetricStatus = 'value';

function isToday(value: string) {
  const date = new Date(value);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return date >= start && date < end;
}

export default function Lessons() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const q = query.trim().toLowerCase();
    return model.lessons.filter((lesson) => {
      const matchesQuery = !q
        || lesson.studentName.toLowerCase().includes(q)
        || lesson.instructorName.toLowerCase().includes(q)
        || lesson.status.toLowerCase().includes(q);
      const scheduled = new Date(lesson.scheduled_at);
      const matchesFilter =
        filter === 'all'
        || (filter === 'today' && isToday(lesson.scheduled_at))
        || (filter === 'upcoming' && scheduled >= new Date() && lesson.status === 'scheduled')
        || (filter === 'completed' && lesson.status === 'completed')
        || (filter === 'cancelled' && lesson.status === 'cancelled')
        || (filter === 'warnings' && lesson.qualityFlags.length > 0);
      return matchesQuery && matchesFilter;
    });
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Lessons" description="Read-only lesson schedule and data health.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Lessons" description="Read-only lesson schedule and data health.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Lessons" description="Track upcoming, completed, cancelled, stale, and broken lesson records.">
      <ReadOnlyNotice />

      <section>
        <SectionHeader title="Lesson Operations" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label="Today only" value={model.counts.lessonsToday} status={valueStatus} icon={CalendarDays} />
          <MetricCard label="Upcoming" value={model.counts.upcomingLessons} status={valueStatus} icon={Clock} />
          <MetricCard label="Completed" value={model.counts.completedLessons} status={valueStatus} icon={CheckCircle2} />
          <MetricCard label="Cancelled" value={model.counts.cancelledLessons} status={valueStatus} icon={XCircle} />
          <MetricCard label="Warnings" value={model.counts.staleScheduledLessons + model.counts.brokenLessonJoins + model.counts.missingLessonStudents} status={valueStatus} icon={AlertTriangle} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Lesson Records</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Today's count uses a midnight-to-midnight UK window.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search lessons" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lessons</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="warnings">Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No lesson rows match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Student source</TableHead>
                  <TableHead>Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(lesson.scheduled_at)}</TableCell>
                    <TableCell>{lesson.studentName}</TableCell>
                    <TableCell>{lesson.instructorName}</TableCell>
                    <TableCell>
                      <StatusPill value={lesson.status} />
                    </TableCell>
                    <TableCell>{lesson.durationMinutes} mins</TableCell>
                    <TableCell>{lesson.paymentMethod}</TableCell>
                    <TableCell>
                      <StatusPill value={lesson.studentSource} tone={lesson.studentSource === 'profile' ? 'good' : lesson.studentSource === 'manual' ? 'neutral' : 'warn'} />
                    </TableCell>
                    <TableCell>
                      {lesson.qualityFlags.length === 0 ? (
                        <StatusPill value="ok" tone="good" />
                      ) : (
                        <div className="space-y-1">
                          {lesson.qualityFlags.map((flag) => (
                            <div key={flag} className="text-xs text-amber-700">{flag}</div>
                          ))}
                        </div>
                      )}
                    </TableCell>
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
