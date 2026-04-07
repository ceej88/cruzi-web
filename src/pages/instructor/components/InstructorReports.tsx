import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isAfter, isBefore, eachDayOfInterval, eachWeekOfInterval } from 'date-fns';
import { BarChart3, TrendingUp, Users, Calendar, PoundSterling, Clock, BookOpen, Target, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface ReportData {
  totalEarnings: number;
  totalLessons: number;
  totalHours: number;
  avgLessonsPerWeek: number;
  activeStudents: number;
  pendingStudents: number;
  completionRate: number;
  earningsByWeek: { week: string; amount: number }[];
  lessonsByDay: { day: string; count: number }[];
  topStudents: { name: string; lessons: number; hours: number }[];
}

type Period = '7d' | '30d' | '90d';

const InstructorReports: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadReports();
  }, [user?.id, period]);

  const loadReports = async () => {
    if (!user?.id) return;
    setLoading(true);

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const since = subDays(new Date(), days).toISOString();

    const [lessonsRes, studentsRes, transactionsRes] = await Promise.all([
      supabase
        .from('lessons')
        .select('id, scheduled_at, duration_minutes, status, student_id')
        .eq('instructor_id', user.id)
        .gte('scheduled_at', since)
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('user_id, full_name, status')
        .eq('instructor_id', user.id),
      supabase
        .from('credit_transactions')
        .select('amount_paid, hours, created_at, student_id, status')
        .eq('instructor_id', user.id)
        .gte('created_at', since),
    ]);

    const lessons = lessonsRes.data || [];
    const students = studentsRes.data || [];
    const transactions = (transactionsRes.data || []).filter(t => t.status === 'completed');

    const completedLessons = lessons.filter(l => l.status === 'COMPLETED' || l.status === 'completed');
    const totalLessons = lessons.filter(l => l.status !== 'cancelled').length;
    const totalHours = lessons.filter(l => l.status !== 'cancelled').reduce((sum, l) => sum + (l.duration_minutes || 60) / 60, 0);
    const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0);
    const activeStudents = students.filter(s => s.status === 'ACTIVE' || !s.status).length;
    const pendingStudents = students.filter(s => s.status === 'PENDING').length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
    const weeks = Math.max(1, days / 7);
    const avgLessonsPerWeek = Math.round((totalLessons / weeks) * 10) / 10;

    // Earnings by week
    const start = subDays(new Date(), days);
    const weekStarts = eachWeekOfInterval({ start, end: new Date() }, { weekStartsOn: 1 });
    const earningsByWeek = weekStarts.map(ws => {
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      const weekTransactions = transactions.filter(t => {
        const d = new Date(t.created_at);
        return isAfter(d, ws) && isBefore(d, we);
      });
      return {
        week: format(ws, 'dd MMM'),
        amount: weekTransactions.reduce((sum, t) => sum + (t.amount_paid || 0), 0),
      };
    });

    // Lessons by day of week
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    lessons.filter(l => l.status !== 'cancelled').forEach(l => {
      const d = new Date(l.scheduled_at);
      const dayIndex = (d.getDay() + 6) % 7; // Mon=0
      dayCounts[dayIndex]++;
    });
    const lessonsByDay = dayNames.map((day, i) => ({ day, count: dayCounts[i] }));

    // Top students by lesson count
    const studentLessonMap: Record<string, { name: string; lessons: number; hours: number }> = {};
    lessons.filter(l => l.status !== 'cancelled' && l.student_id).forEach(l => {
      if (!studentLessonMap[l.student_id!]) {
        const student = students.find(s => s.user_id === l.student_id);
        studentLessonMap[l.student_id!] = {
          name: student?.full_name || 'Unknown',
          lessons: 0,
          hours: 0,
        };
      }
      studentLessonMap[l.student_id!].lessons++;
      studentLessonMap[l.student_id!].hours += (l.duration_minutes || 60) / 60;
    });
    const topStudents = Object.values(studentLessonMap)
      .sort((a, b) => b.lessons - a.lessons)
      .slice(0, 5);

    setData({
      totalEarnings,
      totalLessons,
      totalHours: Math.round(totalHours * 10) / 10,
      avgLessonsPerWeek,
      activeStudents,
      pendingStudents,
      completionRate,
      earningsByWeek,
      lessonsByDay,
      topStudents,
    });
    setLoading(false);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Earnings', value: `£${data.totalEarnings.toLocaleString()}`, icon: PoundSterling, color: '#22C55E', bg: '#E8F8F0' },
    { label: 'Total Lessons', value: data.totalLessons, icon: Calendar, color: '#3B82F6', bg: '#EBF5FF' },
    { label: 'Total Hours', value: `${data.totalHours}h`, icon: Clock, color: '#7C3AED', bg: '#F3EFFE' },
    { label: 'Avg/Week', value: data.avgLessonsPerWeek, icon: TrendingUp, color: '#F59E0B', bg: '#FEF9E7' },
    { label: 'Active Students', value: data.activeStudents, icon: Users, color: '#34C759', bg: '#E8F8F0' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, icon: Target, color: '#EC4899', bg: '#FDF2F8' },
  ];

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === p.key
                ? 'bg-[#7C3AED] text-white shadow-md'
                : 'bg-white text-[#6B7280] hover:bg-[#F3EFFE]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: card.bg }}
            >
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
            </div>
            <p className="text-lg font-black text-[#1A1A2E]">{card.value}</p>
            <p className="text-[11px] text-[#6B7280] font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Earnings chart */}
      {data.earningsByWeek.length > 1 && (
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.earningsByWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
              <Tooltip
                formatter={(value: number) => [`£${value}`, 'Earnings']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lessons by day of week */}
      <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">Busiest Days</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.lessonsByDay}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              formatter={(value: number) => [value, 'Lessons']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top students */}
      {data.topStudents.length > 0 && (
        <div className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-bold text-[#1A1A2E] mb-3">Most Active Students</h3>
          <div className="space-y-3">
            {data.topStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3EFFE] flex items-center justify-center text-xs font-bold text-[#7C3AED]">
                    {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold text-[#1A1A2E]">{s.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#1A1A2E]">{s.lessons} lessons</p>
                  <p className="text-[11px] text-[#9CA3AF]">{Math.round(s.hours * 10) / 10}h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorReports;
