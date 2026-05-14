import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertTriangle, type LucideIcon } from 'lucide-react';

export type MetricStatus = 'loading' | 'value' | 'unavailable';

export interface MetricCardProps {
  label: string;
  value?: number | string | null;
  status: MetricStatus;
  icon?: LucideIcon;
  to?: string;
  hint?: string;
  delta?: string;
  unavailableReason?: string;
  testId?: string;
}

export function MetricCard({
  label, value, status, icon: Icon, to, hint, delta, unavailableReason, testId,
}: MetricCardProps) {
  const id = testId ?? `metric-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const inner = (
    <div
      className={cn(
        'h-full rounded-xl border bg-card p-4 lg:p-5 transition-shadow flex flex-col',
        to && status !== 'unavailable' && 'hover:shadow-md hover:border-primary/40',
        status === 'unavailable' && 'opacity-70'
      )}
      data-testid={id}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      <div className="mt-2 min-h-[2.25rem] flex items-baseline gap-2">
        {status === 'loading' && <Skeleton className="h-8 w-20" />}
        {status === 'value' && (
          <span className="text-3xl font-semibold tabular-nums" data-testid={`${id}-value`}>
            {value ?? '—'}
          </span>
        )}
        {status === 'unavailable' && (
          <span className="inline-flex items-center gap-1.5 text-amber-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Unavailable
          </span>
        )}
        {delta && status === 'value' && (
          <span className="text-xs text-muted-foreground">{delta}</span>
        )}
      </div>
      {hint && status !== 'unavailable' && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
      {status === 'unavailable' && unavailableReason && (
        <p className="mt-1 text-xs text-muted-foreground">{unavailableReason}</p>
      )}
    </div>
  );

  if (to && status !== 'unavailable') {
    return (
      <Link
        to={to}
        className="block h-full focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
        data-testid={`${id}-link`}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
