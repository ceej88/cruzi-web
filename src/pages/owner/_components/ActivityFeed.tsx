import { Skeleton } from '@/components/ui/skeleton';
import { useActivityFeed } from '../_data/useAdminData';
import { format, formatDistanceToNow } from 'date-fns';
import { UserPlus, CreditCard, AlertTriangle, Coins } from 'lucide-react';

const iconMap = {
  signup:  UserPlus,
  topup:   Coins,
  sub:     CreditCard,
  failure: AlertTriangle,
} as const;

export function ActivityFeed() {
  const { data, isLoading, isError } = useActivityFeed();

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="activity-feed-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="activity-feed-error">
        Couldn't load recent activity.
      </p>
    );
  }
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="activity-feed-empty">
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border" data-testid="activity-feed">
      {data.map(ev => {
        const Icon = iconMap[ev.kind] ?? UserPlus;
        return (
          <li
            key={ev.id}
            className="py-2.5 flex items-start gap-3"
            data-testid={`activity-${ev.kind}-${ev.id}`}
          >
            <Icon className={
              'h-4 w-4 mt-0.5 shrink-0 ' +
              (ev.kind === 'failure' ? 'text-red-500' : 'text-muted-foreground')
            } />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{ev.title}</p>
              {ev.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{ev.subtitle}</p>
              )}
            </div>
            <time
              className="text-[11px] text-muted-foreground shrink-0"
              title={format(new Date(ev.at), 'PPpp')}
            >
              {formatDistanceToNow(new Date(ev.at), { addSuffix: true })}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
