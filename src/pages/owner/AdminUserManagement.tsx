import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Loader2, Ban, RotateCcw, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';

interface UserRow {
  user_id: string;
  full_name: string | null;
  email: string;
  status: string | null;
  created_at: string;
  tier: string;
  sub_status: string;
  roles: string[] | null;
  phone: string | null;
  adi_number: string | null;
  instructor_onboarded_at: string | null;
  onboarded_at: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  instructor:   'Instructors',
  student:      'Students',
  parent:       'Parents',
  admin:        'Admins',
};

const AdminUserManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get('role');

  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; user: UserRow } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // When a role filter is active, fetch a wider page so client-side filter has enough rows.
  const perPage = roleFilter ? 200 : 25;

  const fetchUsers = useCallback(async (p: number = 1) => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('admin_search_users', {
      _search: search,
      _page: p,
      _per_page: perPage,
    });
    if (!error && data) {
      const parsed = data as unknown as { total: number; users: UserRow[] };
      setUsers(parsed.users || []);
      setTotal(parsed.total || 0);
      setPage(p);
    } else {
      toast.error('Failed to load users');
    }
    setLoading(false);
  }, [search, perPage]);

  // Initial load + reload when role filter changes (perPage changes)
  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    const { type, user } = confirmAction;
    try {
      if (type === 'suspend') {
        await (supabase as any).rpc('admin_update_user_status', { _user_id: user.user_id, _status: 'SUSPENDED' });
        toast.success(`${user.full_name || user.email} suspended`);
      } else if (type === 'activate') {
        await (supabase as any).rpc('admin_update_user_status', { _user_id: user.user_id, _status: 'ACTIVE' });
        toast.success(`${user.full_name || user.email} activated`);
      } else if (type === 'reset') {
        await (supabase as any).rpc('admin_reset_onboarding', { _user_id: user.user_id });
        toast.success(`Onboarding reset for ${user.full_name || user.email}`);
      } else if (type === 'delete') {
        const { error } = await supabase.functions.invoke('delete-user-account', {
          body: { userId: user.user_id },
        });
        if (error) throw error;
        toast.success(`${user.full_name || user.email} deleted`);
      }
      await fetchUsers(page);
    } catch (e: any) {
      toast.error(e?.message || `Failed to ${confirmAction.type}`);
    }
    setActionLoading(false);
    setConfirmAction(null);
  };

  const statusColor = (s: string | null) => {
    const x = s?.toLowerCase() || '';
    if (x === 'active') return 'default';
    if (x === 'suspended') return 'destructive';
    return 'secondary';
  };

  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter(u => (u.roles ?? []).includes(roleFilter));
  }, [users, roleFilter]);

  const clearRoleFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('role');
    setSearchParams(next, { replace: true });
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto" data-testid="page-users">
      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {roleFilter && (
            <div
              className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm"
              data-testid="banner-role-filter"
            >
              <span>
                Showing only <strong>{ROLE_LABELS[roleFilter] ?? roleFilter}</strong>
                {' · '}
                <span className="text-muted-foreground text-xs">
                  client-side filter on the current page; use search to find specific users
                </span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearRoleFilter}
                data-testid="button-clear-role-filter"
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                className="pl-9"
                data-testid="input-search"
              />
            </div>
            <Button onClick={() => fetchUsers(1)} disabled={loading} data-testid="button-search">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground py-8 text-center" data-testid="text-empty">
              {roleFilter
                ? `No ${ROLE_LABELS[roleFilter] ?? roleFilter} found on this page.`
                : 'No users found.'}
            </p>
          )}

          {filteredUsers.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground">
                {roleFilter
                  ? `${filteredUsers.length} on this page (of ${total} total users)`
                  : `${total} users found`}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.user_id} data-testid={`row-user-${u.user_id}`}>
                        <TableCell className="font-medium">{u.full_name || 'Unnamed'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(u.roles || []).map((r) => (
                              <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColor(u.status) as any} className="text-[10px]">
                            {u.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs capitalize">{u.tier}</TableCell>
                        <TableCell className="text-xs">{format(new Date(u.created_at), 'dd MMM yy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            {u.status?.toLowerCase() === 'suspended' ? (
                              <Button size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => setConfirmAction({ type: 'activate', user: u })}>
                                Activate
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="h-7 text-xs"
                                onClick={() => setConfirmAction({ type: 'suspend', user: u })}>
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => setConfirmAction({ type: 'reset', user: u })}>
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs"
                              onClick={() => setConfirmAction({ type: 'delete', user: u })}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => fetchUsers(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmAction?.type === 'delete' ? 'Delete User' :
                    confirmAction?.type === 'suspend' ? 'Suspend User' :
                      confirmAction?.type === 'activate' ? 'Activate User' : 'Reset Onboarding'}
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to {confirmAction?.type} <strong>{confirmAction?.user.full_name || confirmAction?.user.email}</strong>?
                  {confirmAction?.type === 'delete' && ' This action cannot be undone.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button
                  variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
                  onClick={handleAction}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
