import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInstructorData, StudentProfile, Lesson } from '@/hooks/useInstructorData';
import {
  Users, Search, MessageSquare, CalendarPlus,
  PoundSterling, UserPlus, ChevronRight
} from 'lucide-react';
import StudentDetailView from './StudentDetailView';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const isWithinDays = (d: string, days: number) => {
  const now = Date.now(); const ms = days * 86_400_000;
  const t = new Date(d).getTime();
  return t >= now && t <= now + ms;
};

const daysPast = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);

type Filter = 'all' | 'active' | 'waiting' | 'passed' | 'enquiries';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'passed', label: 'Passed' },
  { key: 'enquiries', label: 'Enquiries' },
];

/* ------------------------------------------------------------------ */
/*  Animations                                                        */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Student card                                                      */
/* ------------------------------------------------------------------ */

interface StudentCardProps {
  student: StudentProfile;
  nextLesson?: Lesson;
  attention?: string;
  borderColor?: string;
  onTap?: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student, nextLesson, attention, borderColor, onTap,
}) => {
  const paid = (student.credit_balance ?? 0) > 0;

  return (
    <motion.div
      variants={fadeUp}
      onClick={onTap}
      className={`bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all ${borderColor ? `border-l-[3px] ${borderColor}` : ''}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#F3EFFE] flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[#7C3AED]">
          {(student.full_name || 'S')[0].toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#1A1A2E] truncate">{student.full_name || 'Student'}</p>
        {attention && (
          <span className="inline-block mt-0.5 text-[11px] font-medium text-[#FF3B30] bg-[#FF3B30]/10 rounded-full px-2 py-0.5">
            {attention}
          </span>
        )}
        {!attention && nextLesson && (
          <p className="text-[11px] text-[#6B7280] mt-0.5">
            {new Date(nextLesson.scheduled_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            {' · '}
            {new Date(nextLesson.scheduled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {!attention && !nextLesson && (
          <p className="text-[11px] font-medium text-[#FF3B30] mt-0.5">Not booked</p>
        )}
      </div>

      {/* Next lesson badge */}
      {nextLesson ? (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-[#34C759]/10 text-[#34C759]">
          {new Date(nextLesson.scheduled_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      ) : (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-[#6B7280]/10 text-[#6B7280]">
          Not booked
        </span>
      )}

      <ChevronRight className="h-4 w-4 text-[#6B7280]/40 shrink-0" />
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */

const SectionHeader: React.FC<{ title: string; count: number }> = ({ title, count }) => (
  <motion.div variants={fadeUp} className="flex items-center justify-between mb-2">
    <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">{title}</h3>
    <span className="text-[10px] font-bold text-[#6B7280] bg-white rounded-full px-2.5 py-0.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">{count}</span>
  </motion.div>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

interface Props {
  onNavigate?: (tab: string) => void;
}

const SmartStudentDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { students, lessons } = useInstructorData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const now = new Date();

  // Next lesson per student
  const nextLessonMap = useMemo(() => {
    const map: Record<string, Lesson> = {};
    const sorted = [...(lessons || [])].filter(l => new Date(l.scheduled_at) >= now && l.status !== 'cancelled').sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    for (const l of sorted) {
      const key = l.student_id;
      if (key && !map[key]) map[key] = l;
    }
    return map;
  }, [lessons]);

  // Last lesson per student
  const lastLessonMap = useMemo(() => {
    const map: Record<string, Lesson> = {};
    const sorted = [...(lessons || [])].filter(l => new Date(l.scheduled_at) < now).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    for (const l of sorted) {
      const key = l.student_id;
      if (key && !map[key]) map[key] = l;
    }
    return map;
  }, [lessons]);

  /* ---- filter + search ---- */
  const filteredStudents = useMemo(() => {
    let list = students || [];
    if (filter !== 'all') {
      const statusMap: Record<string, string[]> = {
        active: ['active'],
        waiting: ['waiting', 'pending'],
        passed: ['passed'],
        enquiries: ['enquiry', 'enquiries'],
      };
      const match = statusMap[filter] || [];
      list = list.filter(s => match.includes((s.status || '').toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => (s.full_name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q));
    }
    return list;
  }, [students, filter, search]);

  /* ---- smart sections ---- */
  const needsAttention = useMemo(() => {
    return filteredStudents
      .map(s => {
        const reasons: string[] = [];
        const last = lastLessonMap[s.user_id];
        const next = nextLessonMap[s.user_id];
        if (!next && last && daysPast(last.scheduled_at) >= 14) reasons.push('No lesson in 14 days');
        if (!next && !last) reasons.push('No lessons booked');
        if ((s.credit_balance ?? 0) <= 0) reasons.push('Payment overdue');
        if ((s.status || '').toLowerCase() === 'pending' || (s.status || '').toLowerCase() === 'enquiry') reasons.push('New enquiry');
        return reasons.length ? { student: s, reason: reasons[0] } : null;
      })
      .filter(Boolean) as { student: StudentProfile; reason: string }[];
  }, [filteredStudents, lastLessonMap, nextLessonMap]);

  const upcomingLessons = useMemo(() => {
    return filteredStudents
      .filter(s => {
        const next = nextLessonMap[s.user_id];
        return next && isWithinDays(next.scheduled_at, 7) && !needsAttention.find(n => n.student.id === s.id);
      })
      .map(s => ({ student: s, lesson: nextLessonMap[s.user_id] }));
  }, [filteredStudents, nextLessonMap, needsAttention]);

  const allStudentsSorted = useMemo(() => {
    const attentionIds = new Set(needsAttention.map(n => n.student.id));
    const upcomingIds = new Set(upcomingLessons.map(u => u.student.id));
    return filteredStudents
      .filter(s => !attentionIds.has(s.id) && !upcomingIds.has(s.id))
      .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  }, [filteredStudents, needsAttention, upcomingLessons]);

  const totalCount = filteredStudents.length;

  /* ---- student detail ---- */
  if (selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        lessons={lessons}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  /* ---- render ---- */
  return (
    <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
      <motion.div
        className="max-w-lg mx-auto px-4 pt-3 pb-28 space-y-4"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Student count + Add button */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#6B7280]">
            <span className="text-lg font-black text-[#1A1A2E]">{totalCount}</span> {totalCount === 1 ? 'student' : 'students'}
          </p>
          <button
            onClick={() => onNavigate?.('pupils')}
            className="h-9 px-4 rounded-xl bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#6D28D9] active:scale-95 transition-all shadow-sm"
            style={{ touchAction: 'manipulation' }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Student
          </button>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white text-sm text-[#1A1A2E] placeholder:text-[#6B7280]/60 shadow-[0_1px_4px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#7C3AED]/40 transition-shadow"
          />
        </motion.div>

        {/* Filter tabs */}
        <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                filter === f.key
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-white text-[#6B7280] hover:bg-[#F3EFFE]'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <motion.div variants={stagger}>
            <SectionHeader title="Needs Attention" count={needsAttention.length} />
            <div className="space-y-2">
              {needsAttention.map(({ student, reason }) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  nextLesson={nextLessonMap[student.user_id]}
                  attention={reason}
                  borderColor="border-[#FF3B30]"
                  onTap={() => setSelectedStudent(student)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Lessons */}
        {upcomingLessons.length > 0 && (
          <motion.div variants={stagger}>
            <SectionHeader title="Upcoming Lessons" count={upcomingLessons.length} />
            <div className="space-y-2">
              {upcomingLessons.map(({ student, lesson }) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  nextLesson={lesson}
                  borderColor="border-[#F59E0B]"
                  onTap={() => setSelectedStudent(student)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* All Students */}
        {allStudentsSorted.length > 0 && (
          <motion.div variants={stagger}>
            <SectionHeader title="All Students" count={allStudentsSorted.length} />
            <div className="space-y-2">
              {allStudentsSorted.map(s => (
                <StudentCard
                  key={s.id}
                  student={s}
                  nextLesson={nextLessonMap[s.user_id]}
                  onTap={() => setSelectedStudent(s)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredStudents.length === 0 && (
          <motion.div variants={fadeUp} className="text-center py-16">
            <Users className="h-10 w-10 text-[#6B7280]/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B7280]">No students found</p>
            <p className="text-xs text-[#6B7280]/60 mt-1">Try a different filter or add a student</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SmartStudentDashboard;
