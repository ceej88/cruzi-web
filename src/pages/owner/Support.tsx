import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, LifeBuoy, MessageSquare } from 'lucide-react';
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

export default function Support() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const q = query.trim().toLowerCase();
    return model.supportEvents.filter((event) => {
      const matchesQuery = !q
        || event.event_type.toLowerCase().includes(q)
        || event.entity_type.toLowerCase().includes(q)
        || event.result.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all'
        || (filter === 'failed' && event.result === 'failed')
        || (filter === 'warning' && event.result === 'warning')
        || (filter === 'success' && event.result === 'success');
      return matchesQuery && matchesFilter;
    });
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Support" description="Read-only support and event health.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Support" description="Read-only support and event health.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Support" description="Review feedback counts and operational events without noisy push-token traffic.">
      <ReadOnlyNotice>
        This page does not send notifications, broadcasts, replies, or support messages. Feedback content is not shown in PR 1.
      </ReadOnlyNotice>

      <section>
        <SectionHeader title="Support Signals" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Feedback records" value={model.counts.supportFeedback} status={valueStatus} icon={MessageSquare} />
          <MetricCard label="Useful events loaded" value={model.supportEvents.length} status={valueStatus} icon={LifeBuoy} />
          <MetricCard label="Failed events 7d" value={model.counts.failedEvents7d} status={valueStatus} icon={AlertTriangle} />
          <MetricCard label="Booking notifications" value={model.counts.bookingPassNotifications} status={valueStatus} icon={Bell} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Operational Event Feed</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Filtered to exclude push-token noise and keep the feed useful.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search events" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All results</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No support events match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(event.created_at)}</TableCell>
                    <TableCell>{event.event_type}</TableCell>
                    <TableCell>{event.entity_type}</TableCell>
                    <TableCell>
                      <StatusPill value={event.result} />
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
