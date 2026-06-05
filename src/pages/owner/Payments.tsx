import { useMemo, useState } from 'react';
import { AlertTriangle, Banknote, CheckCircle2, CreditCard } from 'lucide-react';
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
import { formatCurrency, formatDateTime, useOperationsModel } from './_data/useOperationsData';

const valueStatus: MetricStatus = 'value';

export default function Payments() {
  const { model, isLoading, isError, error } = useOperationsModel();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    if (!model) return [];
    const q = query.trim().toLowerCase();
    return model.payments.filter((payment) => {
      const matchesQuery = !q
        || payment.studentName.toLowerCase().includes(q)
        || payment.instructorName.toLowerCase().includes(q)
        || payment.method.toLowerCase().includes(q)
        || payment.status.toLowerCase().includes(q);
      const isPendingBank = payment.method === 'BANK_TRANSFER'
        && ['pending', 'pending_verification', 'pending bank transfer', 'pending_bank_transfer'].includes(payment.status);
      const matchesFilter =
        filter === 'all'
        || (filter === 'pending-bank' && isPendingBank)
        || (filter === 'completed' && payment.status === 'completed')
        || (filter === 'failed' && payment.status === 'failed')
        || (filter === 'rejected' && payment.status === 'rejected')
        || (filter === 'warnings' && payment.qualityFlags.length > 0);
      return matchesQuery && matchesFilter;
    });
  }, [filter, model, query]);

  if (isLoading) {
    return (
      <OperationsPage title="Payments" description="Read-only payment and credit transaction operations.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Payments" description="Read-only payment and credit transaction operations.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  return (
    <OperationsPage title="Payments" description="Monitor credit purchases, bank transfer status, failures, and data quality.">
      <ReadOnlyNotice>
        Verification and rejection actions are intentionally hidden here. This PR does not call payment Edge Functions or write to transaction rows.
      </ReadOnlyNotice>

      <section>
        <SectionHeader title="Payment Operations" hint="Based on credit_transactions, not SMS/subscription-only shortcuts." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Pending bank transfers" value={model.counts.pendingBankTransfers} status={valueStatus} icon={Banknote} hint={formatCurrency(model.money.pendingBankTransferAmount)} />
          <MetricCard label="Completed purchases" value={model.counts.completedPurchases} status={valueStatus} icon={CheckCircle2} hint={formatCurrency(model.money.completedPurchaseAmount)} />
          <MetricCard label="Failed payments" value={model.counts.failedPayments} status={valueStatus} icon={CreditCard} hint={formatCurrency(model.money.failedPaymentAmount)} />
          <MetricCard label="Data warnings" value={model.counts.paymentsWithQualityWarnings} status={valueStatus} icon={AlertTriangle} />
        </div>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Credit Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Shows operational payment rows only. No manual verification buttons are exposed.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <SearchBox value={query} onChange={setQuery} placeholder="Search payments" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="pending-bank">Pending bank transfers</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="warnings">Data warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <EmptyState label="No payment rows match this filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(payment.created_at)}</TableCell>
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell>{payment.instructorName}</TableCell>
                    <TableCell>
                      <StatusPill value={payment.method} tone="neutral" />
                    </TableCell>
                    <TableCell>
                      <StatusPill value={payment.status} />
                    </TableCell>
                    <TableCell>{payment.hours}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {payment.qualityFlags.length === 0 ? (
                        <StatusPill value="ok" tone="good" />
                      ) : (
                        <div className="space-y-1">
                          {payment.qualityFlags.map((flag) => (
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
