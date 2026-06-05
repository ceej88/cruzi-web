import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardCheck, Clock, Send } from 'lucide-react';
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

export default function TestBooking() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const studentNames = new Map(model.students.map((student) => [student.user_id, student.name]));
    const instructorNames = new Map(model.instructors.map((instructor) => [instructor.user_id, instructor.name]));
    const now = new Date();
    const q = query.trim().toLowerCase();

    const readyRows = model.raw.testReadyEntries
      .filter((entry) => entry.enabled)
      .map((entry) => ({
        id: `ready-${entry.instructor_id}-${entry.student_id}`,
        type: 'test ready',
        studentName: studentNames.get(entry.student_id) ?? 'Unknown student',
        instructorName: instructorNames.get(entry.instructor_id) ?? 'Unknown instructor',
        status: 'enabled',
        date: entry.updated_at,
        detail: 'Instructor has marked this student test-ready.',
      }));

    const passRows = model.raw.bookingPasses.map((pass) => {
      const expired = Boolean(pass.expires_at && new Date(pass.expires_at) < now);
      const used = pass.use_count >= pass.max_uses;
      return {
        id: `pass-${pass.id}`,
        type: 'approval pass',
        studentName: studentNames.get(pass.student_id) ?? 'Unknown student',
        instructorName: instructorNames.get(pass.instructor_id) ?? 'Unknown instructor',
        status: expired ? 'expired' : used ? 'used' : pass.status,
        date: pass.requested_at ?? pass.approved_at ?? pass.selected_date,
        detail: `Uses ${pass.use_count}/${pass.max_uses}`,
      };
    });

    const slotRows = model.raw.testSlots.map((slot, index) => ({
      id: `slot-${slot.instructor_id}-${slot.date ?? 'unknown'}-${index}`,
      type: 'test slot',
      studentName: 'Not assigned',
      instructorName: instructorNames.get(slot.instructor_id) ?? 'Unknown instructor',
      status: slot.status ?? 'available',
      date: slot.date,
      detail: `${slot.start_time ?? 'unknown'} - ${slot.end_time ?? 'unknown'}`,
    }));

    return [...readyRows, ...passRows, ...slotRows]
      .filter((row) => {
        const matchesQuery = !q
          || row.studentName.toLowerCase().includes(q)
          || row.instructorName.toLowerCase().includes(q)
          || row.type.toLowerCase().includes(q)
          || row.status.toLowerCase().includes(q);
        const matchesFilter =
          filter === 'all'
          || (filter === 'ready' && row.type === 'test ready')
          || (filter === 'requested' && row.status === 'requested')
          || (filter === 'approved' && row.status === 'approved')
          || (filter === 'expired' && row.status === 'expired')
          || (filter === 'slots' && row.type === 'test slot');
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Test Booking" description="Read-only test readiness and approval state.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Test Booking" description="Read-only test readiness and approval state.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Test Booking" description="Monitor test-ready students, approval passes, and instructor availability slots.">
      <ReadOnlyNotice>
        This page intentionally does not show private reference numbers or raw instructor booking metadata. Students must book and manage tests through GOV.UK.
      </ReadOnlyNotice>

      <section>
        <SectionHeader title="Booking Signals" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label="Test-ready students" value={model.counts.testReadyStudents} status={valueStatus} icon={ClipboardCheck} />
          <MetricCard label="Requested approvals" value={model.counts.requestedBookingPasses} status={valueStatus} icon={Send} />
          <MetricCard label="Approved passes" value={model.counts.approvedBookingPasses} status={valueStatus} icon={CheckCircle2} />
          <MetricCard label="Expired passes" value={model.counts.expiredBookingPasses} status={valueStatus} icon={Clock} />
          <MetricCard label="Calendar test slots" value={model.raw.testSlots.length} status={valueStatus} icon={CalendarClock} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Test Booking Operations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Approvals remain instructor-managed in mobile; this web view only observes state.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search booking state" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All signals</SelectItem>
                  <SelectItem value="ready">Test-ready</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="slots">Slots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No test booking records match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="capitalize">{row.type}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>{row.instructorName}</TableCell>
                    <TableCell>
                      <StatusPill value={row.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(row.date)}</TableCell>
                    <TableCell>{row.detail}</TableCell>
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
