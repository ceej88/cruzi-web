import { Link } from 'react-router-dom';
import { AlertCircle, type LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface AlertCardProps {
  label: string;
  count: number | null;
  loading?: boolean;
  severity?: 'info' | 'warn' | 'critical';
  to?: string;
  icon?: LucideIcon;
  testId?: string;
}

const severityClasses: Record<NonNullable<AlertCardProps['severity']>, string> = {
  info:     'border-border',
  warn:     'border-amber-500/40 bg-amber-500/5',
  critical: 'border-red-500/40 bg-red-500/5',
};

export function AlertCard({
  label, count, loading, severity = 'info', to, icon: Icon, testId,
}: AlertCardProps) {
  const isActionable = (count ?? 0) > 0;
  const sev = isActionable ? severity : 'info';
  const id = testId ?? `alert-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const inner = (
    <div
      className={cn(
        'rounded-lg border p-3 lg:p-4 flex items-center gap-3 transition-shadow',
        severityClasses[sev],
        to && isActionable && 'hover:shadow-sm hover:border-primary/40'
      )}
      data-testid={id}
    >
      {Icon ? (
        <Icon className={cn(
          'h-5 w-5 shrink-0',
          isActionable && severity === 'critical' && 'text-red-500',
          isActionable && severity === 'warn' && 'text-amber-500',
          !isActionable && 'text-muted-foreground'
        )} />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-10" />
      ) : (
        <div className="text-xl font-semibold tabular-nums">{count ?? '—'}</div>
      )}
    </div>
  );

  if (to && isActionable) {
    return <Link to={to} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">{inner}</Link>;
  }
  return inner;
}
