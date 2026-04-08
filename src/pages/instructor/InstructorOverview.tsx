import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar, Users, Clock, AlertCircle, MessageSquare,
  Wallet, BarChart2, Settings, Apple, Smartphone
} from 'lucide-react';

interface Props { userId: string; instructorName: string; }

function useOverviewStats(userId: string) {
  return useQuery({
    queryKey: ['overview-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const [todayRes, weekRes, activeRes, pendingRes] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId).gte('scheduled_at', todayStart).lte('scheduled_at', todayEnd).neq('status', 'cancelled'),
        supabase.from('lessons').select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId).gte('scheduled_at', todayStart).lte('scheduled_at', weekEnd).neq('status', 'cancelled'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId).or('status.eq.ACTIVE,status.is.null'),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId).or('status.eq.PENDING,status.eq.ENQUIRY,credit_balance.lt.0'),
      ]);

      return {
        today: todayRes.count ?? 0,
        week: weekRes.count ?? 0,
        active: activeRes.count ?? 0,
        pending: pendingRes.count ?? 0,
      };
    },
  });
}

const InstructorOverview: React.FC<Props> = ({ userId }) => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useOverviewStats(userId);

  const statCards = [
    { label: "Today's Lessons", value: stats?.today ?? 0, icon: Calendar, color: 'text-blue-500' },
    { label: 'This Week', value: stats?.week ?? 0, icon: Clock, color: 'text-purple-500' },
    { label: 'Active Students', value: stats?.active ?? 0, icon: Users, color: 'text-green-500' },
    { label: 'Pending Actions', value: stats?.pending ?? 0, icon: AlertCircle, color: 'text-orange-500' },
  ];

  const quickActions = [
    { label: 'Students', icon: Users, path: '/instructor/students', color: 'bg-purple-50 text-purple-600' },
    { label: 'Diary', icon: Calendar, path: '/instructor/diary', color: 'bg-blue-50 text-blue-600' },
    { label: 'SMS', icon: MessageSquare, path: '/instructor/sms', color: 'bg-pink-50 text-pink-600' },
    { label: 'Payments', icon: Wallet, path: '/instructor/payments', color: 'bg-green-50 text-green-600' },
    { label: 'Reports', icon: BarChart2, path: '/instructor/reports', color: 'bg-orange-50 text-orange-600' },
    { label: 'Settings', icon: Settings, path: '/instructor/settings', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Icon className={`w-5 h-5 mb-2 ${color}`} />
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" /> : value}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Download the Cruzi App</h3>
            <p className="text-sm text-gray-500">Full management: lessons, skills, mock tests and more.</p>
          </div>
        </div>
        <a
          href="https://apps.apple.com/gb/app/cruzi/id6742619354"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          <Apple className="w-4 h-4" />
          Download on the App Store
        </a>
      </div>
    </div>
  );
};

export default InstructorOverview;
