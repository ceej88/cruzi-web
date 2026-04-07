import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, CheckCircle, XCircle, Flag } from 'lucide-react';
import { format } from 'date-fns';

interface PendingInstructor {
  user_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  adi_number: string | null;
  grade: string | null;
  years_experience: string | null;
  car_make: string | null;
  car_model: string | null;
  car_registration: string | null;
  transmission: string | null;
  coverage_area: string | null;
  status: string | null;
  created_at: string;
}

const AdminInstructorVerification: React.FC = () => {
  const [instructors, setInstructors] = useState<PendingInstructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{ action: string; instructor: PendingInstructor } | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetch = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('admin_list_pending_instructors');
    if (!error && data) {
      setInstructors((data as unknown as PendingInstructor[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleVerify = async () => {
    if (!actionModal) return;
    setProcessing(true);
    const { error } = await (supabase as any).rpc('admin_verify_instructor', {
      _user_id: actionModal.instructor.user_id,
      _action: actionModal.action,
      _reason: reason || null,
    });
    if (error) {
      toast.error('Action failed');
    } else {
      toast.success(`Instructor ${actionModal.action}ed`);
      setActionModal(null);
      setReason('');
      fetch();
    }
    setProcessing(false);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Instructor Verification ({instructors.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : instructors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No pending instructors.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {instructors.map((ins) => (
              <div key={ins.user_id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{ins.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground">{ins.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{ins.status || 'PENDING'}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">ADI:</span> {ins.adi_number || '—'}</div>
                  <div><span className="text-muted-foreground">Grade:</span> {ins.grade || '—'}</div>
                  <div><span className="text-muted-foreground">Experience:</span> {ins.years_experience || '—'}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {ins.phone || '—'}</div>
                  <div><span className="text-muted-foreground">Car:</span> {[ins.car_make, ins.car_model].filter(Boolean).join(' ') || '—'}</div>
                  <div><span className="text-muted-foreground">Reg:</span> {ins.car_registration || '—'}</div>
                  <div><span className="text-muted-foreground">Trans:</span> {ins.transmission || '—'}</div>
                  <div><span className="text-muted-foreground">Area:</span> {ins.coverage_area || '—'}</div>
                </div>
                <p className="text-[10px] text-muted-foreground">Registered: {format(new Date(ins.created_at), 'dd MMM yyyy')}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setActionModal({ action: 'approve', instructor: ins })}>
                    <CheckCircle className="h-3 w-3" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={() => setActionModal({ action: 'reject', instructor: ins })}>
                    <XCircle className="h-3 w-3" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setActionModal({ action: 'flag', instructor: ins })}>
                    <Flag className="h-3 w-3" /> Flag
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!actionModal} onOpenChange={() => { setActionModal(null); setReason(''); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="capitalize">{actionModal?.action} Instructor</DialogTitle>
              <DialogDescription>
                {actionModal?.action === 'approve' ? 'This will activate the instructor account.' :
                  actionModal?.action === 'reject' ? 'This will reject the instructor. They will be notified.' :
                    'This will flag the instructor for further review.'}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Optional reason / message to instructor..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActionModal(null); setReason(''); }}>Cancel</Button>
              <Button onClick={handleVerify} disabled={processing}
                variant={actionModal?.action === 'reject' ? 'destructive' : 'default'}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminInstructorVerification;
