import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TierCount {
  tier: string;
  status: string;
  count: number;
}

interface RecentChange {
  user_id: string;
  full_name: string | null;
  email: string | null;
  tier: string;
  status: string;
  updated_at: string;
  trial_ends_at: string | null;
}

const AdminSubscriptionOverview: React.FC = () => {
  const [tiers, setTiers] = useState<TierCount[]>([]);
  const [recent, setRecent] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await (supabase as any).rpc('admin_subscription_overview');
      if (!error && data) {
        const parsed = data as unknown as { tiers: TierCount[]; recent_changes: RecentChange[] };
        setTiers(parsed.tiers || []);
        setRecent(parsed.recent_changes || []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const tierTotals = tiers.reduce((acc, t) => {
    acc[t.tier] = (acc[t.tier] || 0) + t.count;
    return acc;
  }, {} as Record<string, number>);

  const tierColors: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-blue-100 text-blue-700',
    premium: 'bg-amber-100 text-amber-700',
    school: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(tierTotals).map(([tier, count]) => (
                <div key={tier} className={`rounded-lg p-3 ${tierColors[tier] || 'bg-muted'}`}>
                  <p className="text-2xl font-black">{count}</p>
                  <p className="text-xs font-medium capitalize">{tier}</p>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold pt-2">Recent Changes</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent subscription changes.</p>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((r) => (
                      <TableRow key={r.user_id}>
                        <TableCell>
                          <p className="text-sm font-medium">{r.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{r.tier}</Badge>
                        </TableCell>
                        <TableCell className="text-xs capitalize">{r.status}</TableCell>
                        <TableCell className="text-xs">{format(new Date(r.updated_at), 'dd MMM yy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSubscriptionOverview;
