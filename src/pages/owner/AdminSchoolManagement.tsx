import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SchoolRow {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  coverage_area: string | null;
  is_active: boolean;
  max_instructors: number;
  created_at: string;
  owner_name: string | null;
  active_instructors: number;
  owner_tier: string | null;
}

const AdminSchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('admin_list_schools');
    if (!error && data) setSchools((data as unknown as SchoolRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const toggleActive = async (school: SchoolRow) => {
    const newActive = !school.is_active;
    const { error } = await (supabase as any).rpc('admin_suspend_school', { _school_id: school.id, _active: newActive });
    if (error) {
      toast.error('Failed to update school');
    } else {
      toast.success(`${school.name} ${newActive ? 'activated' : 'suspended'}`);
      setSchools(schools.map(s => s.id === school.id ? { ...s, is_active: newActive } : s));
    }
  };

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Driving Schools ({schools.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : schools.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No driving schools registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Instructors</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.coverage_area || '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{s.owner_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{s.active_instructors}/{s.max_instructors}</Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize">{s.owner_tier || 'free'}</TableCell>
                    <TableCell className="text-xs">{format(new Date(s.created_at), 'dd MMM yy')}</TableCell>
                    <TableCell>
                      <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSchoolManagement;
