import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, Download, Loader2, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

interface AuditRow {
  user_id: string;
  full_name: string | null;
  email: string;
  status: string | null;
  updated_at: string;
  created_at: string;
  roles: string[] | null;
}

const AdminSupportAudit: React.FC = () => {
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportUserId, setExportUserId] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_audit_log', { _limit: 100 });
      if (!error && data) setAuditLog((data as unknown as AuditRow[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleExport = async (userId?: string) => {
    const targetId = userId || exportUserId;
    if (!targetId) { toast.error('Enter a user ID'); return; }
    setExporting(true);
    const { data, error } = await supabase.rpc('admin_export_user_data', { _user_id: targetId });
    if (error) {
      toast.error('Export failed');
    } else {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr_export_${targetId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported');
    }
    setExporting(false);
  };

  return (
    <div className="space-y-4">
      {/* GDPR Export */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            GDPR Data Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="User ID (UUID) for data export..."
              value={exportUserId}
              onChange={(e) => setExportUserId(e.target.value)}
              className="rounded-lg"
            />
            <Button onClick={() => handleExport()} disabled={exporting} className="rounded-lg shrink-0">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Exports all user data (profile, lessons, messages, skills, transactions) as a JSON file.
          </p>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Audit Log (Recent Updates)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No audit data.</p>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((row) => (
                    <TableRow key={row.user_id}>
                      <TableCell>
                        <p className="text-sm font-medium">{row.full_name || 'Unnamed'}</p>
                        <p className="text-[10px] text-muted-foreground">{row.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(row.roles || []).map((r) => (
                            <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{row.status || '—'}</TableCell>
                      <TableCell className="text-xs">{format(new Date(row.updated_at), 'dd MMM yy HH:mm')}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleExport(row.user_id)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSupportAudit;
