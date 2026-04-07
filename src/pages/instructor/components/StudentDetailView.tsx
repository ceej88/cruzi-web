import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StudentProfile, Lesson } from '@/hooks/useInstructorData';
import { useUnifiedInstructorSkillProgress } from '@/hooks/useUnifiedSkillProgress';
import { CORE_SKILLS_GROUPS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft, Calendar, PoundSterling, User, BarChart3,
  MessageSquare, Phone, Mail, MapPin, Clock, CheckCircle2,
  XCircle, AlertCircle, Send
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

type Tab = 'lessons' | 'payments' | 'profile' | 'progress';

interface Props {
  student: StudentProfile;
  lessons: Lesson[];
  onBack: () => void;
}

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'lessons', label: 'Lessons', icon: Calendar },
  { key: 'payments', label: 'Payments', icon: PoundSterling },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'progress', label: 'Progress', icon: BarChart3 },
];

const LEVEL_LABELS: Record<number, string> = {
  0: 'Not Started',
  1: 'Introduced',
  2: 'Under Guidance',
  3: 'Prompted',
  4: 'Independent',
  5: 'Secure',
};

const LEVEL_COLORS: Record<number, string> = {
  0: '#D1D5DB',
  1: '#F59E0B',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#22C55E',
  5: '#22C55E',
};

/* ------------------------------------------------------------------ */
/*  Status badge                                                      */
/* ------------------------------------------------------------------ */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  const config: Record<string, { bg: string; text: string; label: string }> = {
    SCHEDULED: { bg: '#3B82F6', text: '#fff', label: 'Booked' },
    COMPLETED: { bg: '#22C55E', text: '#fff', label: 'Delivered' },
    CANCELLED: { bg: '#EF4444', text: '#fff', label: 'Cancelled' },
    PENDING: { bg: '#F59E0B', text: '#fff', label: 'Pending' },
  };
  const c = config[s] || { bg: '#6B7280', text: '#fff', label: status };
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Lessons Tab                                                       */
/* ------------------------------------------------------------------ */
const LessonsTab: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const sorted = useMemo(
    () => [...lessons].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()),
    [lessons]
  );

  const stats = useMemo(() => {
    const delivered = sorted.filter(l => l.status === 'COMPLETED');
    const booked = sorted.filter(l => l.status === 'SCHEDULED');
    const cancelled = sorted.filter(l => l.status === 'CANCELLED' || l.status === 'cancelled');
    const deliveredHrs = delivered.reduce((s, l) => s + l.duration_minutes / 60, 0);
    const bookedHrs = booked.reduce((s, l) => s + l.duration_minutes / 60, 0);
    const cancelledHrs = cancelled.reduce((s, l) => s + l.duration_minutes / 60, 0);
    return { delivered, booked, cancelled, deliveredHrs, bookedHrs, cancelledHrs };
  }, [sorted]);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Delivered', value: `${stats.deliveredHrs.toFixed(1)} hrs`, sub: `${stats.delivered.length} lessons`, color: '#22C55E' },
          { label: 'Booked', value: `${stats.bookedHrs.toFixed(1)} hrs`, sub: `${stats.booked.length} booked`, color: '#3B82F6' },
          { label: 'Cancelled', value: `${stats.cancelledHrs.toFixed(1)} hrs`, sub: `${stats.cancelled.length} lessons`, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
            <p className="text-sm font-black text-[#1A1A2E] mt-0.5">{s.value}</p>
            <p className="text-[10px] text-[#6B7280]">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Lesson list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-8 w-8 text-[#6B7280]/30 mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">No lessons yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(l => (
            <div key={l.id} className="bg-white rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A2E]">
                  {format(new Date(l.scheduled_at), 'EEE d MMM · HH:mm')}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  {l.duration_minutes} mins{l.topic ? ` · ${l.topic}` : ''}
                </p>
              </div>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Payments Tab                                                      */
/* ------------------------------------------------------------------ */
const PaymentsTab: React.FC<{ student: StudentProfile }> = ({ student }) => {
  const { user } = useAuth();
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustHours, setAdjustHours] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const { data: transactions = [], refetch } = useQuery({
    queryKey: ['student-transactions', student.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('student_id', student.user_id)
        .eq('instructor_id', user?.id || '')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const balance = student.credit_balance ?? 0;

  const handleAdjust = async () => {
    const hrs = parseFloat(adjustHours);
    if (isNaN(hrs) || hrs === 0) {
      toast({ title: 'Enter a valid number of hours', variant: 'destructive' });
      return;
    }
    setAdjusting(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-manual-credit', {
        body: {
          studentId: student.user_id,
          hours: hrs,
          amount: 0,
          method: 'CASH',
          notes: adjustReason || `Manual adjustment: ${hrs > 0 ? '+' : ''}${hrs}h`,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: data.message || 'Credits adjusted' });
      setShowAdjust(false);
      setAdjustHours('');
      setAdjustReason('');
      refetch();
    } catch (err: any) {
      toast({ title: err.message || 'Failed to adjust credits', variant: 'destructive' });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Credit Balance</p>
        <p className={`text-3xl font-black mt-1 ${balance >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {balance.toFixed(1)} hrs
        </p>
      </div>

      {/* Adjust Credits */}
      {!showAdjust ? (
        <button
          onClick={() => setShowAdjust(true)}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#6B7280]/30 text-[13px] font-bold text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
        >
          ± Adjust Credits
        </button>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)] space-y-3">
          <p className="text-[12px] font-bold text-[#1A1A2E]">Adjust Credit Balance</p>
          <p className="text-[11px] text-[#6B7280]">Use negative to remove (e.g. -2), positive to add (e.g. 1.5)</p>
          <input
            type="number"
            step="0.5"
            placeholder="Hours (e.g. -2 or 1.5)"
            value={adjustHours}
            onChange={e => setAdjustHours(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
          <input
            type="text"
            placeholder="Reason (optional)"
            value={adjustReason}
            onChange={e => setAdjustReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAdjust(false); setAdjustHours(''); setAdjustReason(''); }}
              className="flex-1 py-2 rounded-lg text-[12px] font-bold text-[#6B7280] bg-[#F3F4F6]"
            >
              Cancel
            </button>
            <button
              onClick={handleAdjust}
              disabled={adjusting || !adjustHours}
              className="flex-1 py-2 rounded-lg text-[12px] font-bold text-white bg-[#7C3AED] disabled:opacity-50"
            >
              {adjusting ? 'Adjusting…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <PoundSterling className="h-8 w-8 text-[#6B7280]/30 mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-xl px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1A1A2E]">
                  {format(new Date(t.created_at), 'EEE d MMM')}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  {t.payment_method} · {t.hours}hrs
                  {t.transaction_type === 'ADJUSTMENT' && <span className="ml-1 text-[#F59E0B]">· Adjustment</span>}
                </p>
              </div>
              <p className="text-sm font-black text-[#1A1A2E]">
                {t.transaction_type === 'ADJUSTMENT' ? `${t.hours > 0 ? '+' : '-'}${t.hours}h` : `£${Number(t.amount_paid || 0).toFixed(2)}`}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                t.status === 'completed' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                t.status === 'pending_verification' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                t.status === 'pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                'bg-[#6B7280]/10 text-[#6B7280]'
              }`}>
                {t.status === 'completed' ? 'Paid' : t.status === 'pending_verification' ? 'Verifying' : t.status === 'pending' ? 'Pending' : t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Profile Tab                                                       */
/* ------------------------------------------------------------------ */
const ProfileTab: React.FC<{ student: StudentProfile }> = ({ student }) => {
  const fields = [
    { label: 'Full Name', value: student.full_name, icon: User },
    { label: 'Phone', value: student.phone, icon: Phone },
    { label: 'Email', value: student.email, icon: Mail },
    { label: 'Address', value: student.address, icon: MapPin },
    { label: 'Parent Email', value: student.parent_email, icon: Mail },
    { label: 'Level', value: student.level, icon: BarChart3 },
    { label: 'Status', value: student.status, icon: AlertCircle },
    { label: 'Total Hours', value: `${(student.total_hours ?? 0).toFixed(1)} hrs`, icon: Clock },
  ].filter(f => f.value);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-[#F3F4F6]">
      {fields.map(f => {
        const Icon = f.icon;
        return (
          <div key={f.label} className="px-4 py-3 flex items-center gap-3">
            <Icon className="h-4 w-4 text-[#6B7280] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{f.label}</p>
              <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">{f.value}</p>
            </div>
          </div>
        );
      })}
      {student.notes && (
        <div className="px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Notes</p>
          <p className="text-[13px] text-[#1A1A2E] whitespace-pre-wrap">{student.notes}</p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Progress Tab                                                      */
/* ------------------------------------------------------------------ */
const ProgressTab: React.FC<{ studentId: string }> = ({ studentId }) => {
  const progress = useUnifiedInstructorSkillProgress(studentId);

  return (
    <div className="space-y-4">
      {/* Readiness gauge */}
      <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Test Readiness</p>
        <p className="text-4xl font-black text-[#7C3AED] mt-1">{progress.masteryPercent}%</p>
        <div className="w-full h-2 bg-[#F3F4F6] rounded-full mt-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress.masteryPercent}%`,
              background: progress.masteryPercent >= 80 ? '#22C55E' : progress.masteryPercent >= 50 ? '#F59E0B' : '#7C3AED',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-[#6B7280]">
          <span>{progress.coveredSkills}/{progress.totalSkills} covered</span>
          <span>{progress.masteredSkills} mastered</span>
        </div>
      </div>

      {/* Skills by group */}
      {CORE_SKILLS_GROUPS.map(group => (
        <div key={group.category} className="space-y-1.5">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-[#6B7280] px-1">{group.category}</h3>
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] divide-y divide-[#F3F4F6]">
            {group.skills.map(skill => {
              const level = progress.getLevel(skill);
              return (
                <div key={skill} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1A1A2E] truncate">{skill}</p>
                    <p className="text-[10px] text-[#6B7280]">{LEVEL_LABELS[level]}</p>
                  </div>
                  {/* Dot indicators */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(dot => (
                      <div
                        key={dot}
                        className="w-2.5 h-2.5 rounded-full transition-colors"
                        style={{
                          background: dot <= level ? LEVEL_COLORS[level] : '#E5E7EB',
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Detail View                                                  */
/* ------------------------------------------------------------------ */
const StudentDetailView: React.FC<Props> = ({ student, lessons, onBack }) => {
  const [tab, setTab] = useState<Tab>('lessons');

  const studentLessons = useMemo(
    () => lessons.filter(l => l.student_id === student.user_id || (l as any).manual_student_id === student.id),
    [lessons, student]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-1 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center justify-center hover:bg-[#F3EFFE] active:scale-90 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="h-4 w-4 text-[#1A1A2E]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-[#1A1A2E] tracking-tight truncate">
              {student.full_name || 'Student'}
            </h1>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            (student.credit_balance ?? 0) > 0
              ? 'bg-[#22C55E]/10 text-[#22C55E]'
              : 'bg-[#EF4444]/10 text-[#EF4444]'
          }`}>
            {(student.credit_balance ?? 0).toFixed(1)} hrs
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                  active
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-28" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tab === 'lessons' && <LessonsTab lessons={studentLessons} />}
        {tab === 'payments' && <PaymentsTab student={student} />}
        {tab === 'profile' && <ProfileTab student={student} />}
        {tab === 'progress' && <ProgressTab studentId={student.user_id} />}
      </div>
    </div>
  );
};

export default StudentDetailView;
