import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Clock, Calendar, CheckCircle, BarChart2 } from 'lucide-react';

interface Props { userId: string; }

type Period = 7 | 30 | 90;

function usePeriodData(userId: string, days: Period) {
  return useQuery({
    queryKey: ['reports', userId, days],
    enabled: !!userId,
    queryFn: async () => {
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      const [lessonsRes, incomeRes, studentsRes] = await Promise.all([
        supabase.from('lessons')
          .select('id, status, duration_minutes, scheduled_at, student_id')
          .eq('instructor_id', userId)
          .gte('scheduled_at', from)
          .lte('scheduled_at', now),
        supabase.from('credit_transactions')
          .select('instructor_earnings, amount_paid, created_at')
          .eq('instructor_id', userId)
          .eq('status', 'completed')
          .gte('created_at', from),
        supabase.from('profiles')
          .select('id, full_name')
          .eq('instructor_id', userId)
          .or('status.eq.ACTIVE,status.is.null'),
      ]);

      const lessons = lessonsRes.data ?? [];
      const income = incomeRes.data ?? [];
      const students = studentsRes.data ?? [];

      const nonCancelled = lessons.filter(l => l.status !== 'cancelled');
      const completed = lessons.filter(l => l.status === 'completed');
      const totalHours = nonCancelled.reduce((s, l) => s + (l.duration_minutes ?? 60) / 60, 0);
      const totalEarnings = income.reduce((s, t) => s + Number(t.instructor_earnings ?? t.amount_paid ?? 0), 0);
      const weeks = days / 7;
      const completionRate = nonCancelled.length > 0 ? (completed.length / nonCancelled.length) * 100 : 0;

      const weeklyMap: Record<string, number> = {};
      income.forEach(tx => {
        const d = new Date(tx.created_at);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        weeklyMap[key] = (weeklyMap[key] ?? 0) + Number(tx.instructor_earnings ?? tx.amount_paid ?? 0);
      });
      const weeklyEarnings = Object.entries(weeklyMap)
        .map(([week, amount]) => ({ week, amount: parseFloat(amount.toFixed(2)) }))
        .slice(-8);

      const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      lessons.forEach(l => {
        const d = new Date(l.scheduled_at);
        const name = DAY_NAMES[d.getDay()];
        dayMap[name] = (dayMap[name] ?? 0) + 1;
      });
      const busyDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, lessons: dayMap[day] }));

      const studentLessonMap: Record<string, { name: string; count: number; minutes: number }> = {};
      lessons.forEach(l => {
        if (!l.student_id) return;
        if (!studentLessonMap[l.student_id]) {
          const s = students.find(s => s.id === l.student_id);
          studentLessonMap[l.student_id] = { name: s?.full_name ?? 'Unknown', count: 0, minutes: 0 };
        }
        studentLessonMap[l.student_id].count += 1;
        studentLessonMap[l.student_id].minutes += l.duration_minutes ?? 60;
      });
      const topStudents = Object.values(studentLessonMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(s => ({ name: s.name, lessons: s.count, hours: parseFloat((s.minutes / 60).toFixed(1)) }));

      return {
        totalEarnings,
        totalLessons: nonCancelled.length,
        totalHours: parseFloat(totalHours.toFixed(1)),
        avgPerWeek: parseFloat((nonCancelled.length / weeks).toFixed(1)),
        activeStudents: students.length,
        completionRate: parseFloat(completionRate.toFixed(0)),
        weeklyEarnings,
        busyDays,
        topStudents,
      };
    },
  });
}

const InstructorReports: React.FC<Props> = ({ userId }) => {
  const [period, setPeriod] = useState<Period>(30);
  const { data, isLoading, error } = usePeriodData(userId, period);

  const stats = [
    { label: 'Total Earnings', value: data ? `£${data.totalEarnings.toFixed(2)}` : '—', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Lessons', value: data?.totalLessons ?? '—', icon: Calendar, color: 'text-blue-500' },
    { label: 'Total Hours', value: data ? `${data.totalHours}h` : '—', icon: Clock, color: 'text-purple-500' },
    { label: 'Avg / Week', value: data?.avgPerWeek ?? '—', icon: BarChart2, color: 'text-orange-500' },
    { label: 'Active Students', value: data?.activeStudents ?? '—', icon: Users, color: 'text-pink-500' },
    { label: 'Completion Rate', value: data ? `${data.completionRate}%` : '—', icon: CheckCircle, color: 'text-teal-500' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {([7, 30, 90] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              period === p
                ? 'bg-[#7c3aed] text-white border-[#7c3aed]'
                : 'bg-white text-gray-500 border-gray-200 hover:border-[#7c3aed] hover:text-[#7c3aed]'
            }`}
          >
            {p} days
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          Failed to load reports. Please refresh.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-xl font-bold text-gray-900">
              {isLoading ? <span className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse" /> : value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Weekly Earnings (£)</h3>
        {isLoading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : !data?.weeklyEarnings?.length ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">No earnings data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.weeklyEarnings} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => [`£${v.toFixed(2)}`, 'Earnings']} />
              <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Busiest Days</h3>
        {isLoading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data?.busyDays ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Lessons']} />
              <Bar dataKey="lessons" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Most Active Students</h3>
        {isLoading ? (
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ) : !data?.topStudents?.length ? (
          <div className="py-8 text-center text-sm text-gray-400">No lesson data for this period</div>
        ) : (
          <div className="space-y-3">
            {data.topStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#7c3aed]">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-[#7c3aed] h-1.5 rounded-full"
                      style={{ width: `${Math.min((s.lessons / (data.topStudents[0]?.lessons || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 flex-shrink-0">
                  <p className="font-semibold text-gray-700">{s.lessons} lessons</p>
                  <p>{s.hours}h</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorReports;
