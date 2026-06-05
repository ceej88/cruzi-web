import { type ReactNode } from 'react';
import { AlertTriangle, Lock, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function OperationsPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto space-y-7" data-testid={`page-${slug(title)}`}>
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function ReadOnlyNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 px-4 py-3 text-sm text-muted-foreground flex gap-3">
      <Lock className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
      <p>
        {children ?? 'Read-only operations view. This page does not write to Supabase or call Edge Functions.'}
      </p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <Card className="border-red-500/35 bg-red-500/5">
      <CardContent className="p-5 flex gap-3 text-sm">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="font-medium">Could not load operations data</p>
          <p className="text-muted-foreground mt-1">{message ?? 'Try refreshing the page.'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

export function StatusPill({ value, tone }: { value: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  const resolvedTone = tone ?? toneForValue(value);
  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize',
        resolvedTone === 'good' && 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700',
        resolvedTone === 'warn' && 'border-amber-500/35 bg-amber-500/10 text-amber-700',
        resolvedTone === 'bad' && 'border-red-500/35 bg-red-500/10 text-red-700',
        resolvedTone === 'neutral' && 'border-border bg-muted/40 text-muted-foreground',
      )}
    >
      {pretty(value)}
    </Badge>
  );
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-GB').format(value);
}

export function formatPercent(value: number, total: number) {
  if (total <= 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function pretty(value: string | null | undefined) {
  return (value || 'unknown').replace(/_/g, ' ');
}

function toneForValue(value: string): 'good' | 'warn' | 'bad' | 'neutral' {
  const normalized = value.toLowerCase();
  if (['active', 'completed', 'approved', 'ok', 'success', 'paid'].includes(normalized)) return 'good';
  if (['pending', 'pending_verification', 'requested', 'trialing', 'scheduled'].includes(normalized)) return 'warn';
  if (['failed', 'rejected', 'cancelled', 'missing-student', 'missing-instructor', 'broken'].includes(normalized)) return 'bad';
  return 'neutral';
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
