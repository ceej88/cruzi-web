import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Users, MessageSquare, Wallet, BarChart2, Settings,
  Download, LogOut, ChevronRight, Clock, AlertCircle, Smartphone,
  Apple
} from 'lucide-react';

// ─── Data hooks ───────────────────────────────────────────────────────────────

function useInstructorStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['web-instructor-stats', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

      // Week boundaries (Mon–Sun)
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const [todayRes, weekRes, studentsRes, notifRes, profileRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId)
          .gte('scheduled_at', todayStart)
          .lte('scheduled_at', todayEnd)
          .neq('status', 'cancelled'),
        supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId)
          .gte('scheduled_at', weekStart.toISOString())
          .lte('scheduled_at', weekEnd.toISOString())
          .neq('status', 'cancelled'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('instructor_id', userId)
          .eq('status', 'active'),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
        supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', userId)
          .single(),
      ]);

      return {
        todayLessons: todayRes.count ?? 0,
        weekLessons: weekRes.count ?? 0,
        activeStudents: studentsRes.count ?? 0,
        pendingActions: notifRes.count ?? 0,
        instructorName: profileRes.data?.full_name ?? null,
      };
    },
  });
}

function useStudentList(userId: string | undefined) {
  return useQuery({
    queryKey: ['web-instructor-students', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, status, total_hours, progress, next_lesson')
        .eq('instructor_id', userId)
        .order('full_name');
      return data ?? [];
    },
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const AppDownloadCard = ({ compact = false }: { compact?: boolean }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${compact ? 'p-4' : 'p-6'}`}>
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Smartphone className="w-5 h-5 text-purple-700" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-base">Download the Cruzi App</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {compact
            ? 'Log in to manage your students from anywhere.'
            : 'Complete your profile, manage your students, run lessons, track skills and record mock tests — all from the mobile app.'}
        </p>
      </div>
    </div>
    <div className="space-y-2">
      <a
        href="https://apps.apple.com/gb/app/cruzi/id6742619354"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        <Apple className="w-4 h-4" />
        Download on the App Store
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.cruzi.app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        Get it on Google Play
      </a>
    </div>
  </div>
);

const MobileOnlyCard = ({ feature }: { feature: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6 max-w-sm mx-auto">
    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
      <Smartphone className="w-8 h-8 text-purple-600" />
    </div>
    <h2 className="text-xl font-bold text-gray-900 mb-2">{feature} is in the app</h2>
    <p className="text-gray-500 text-sm mb-6">
      Log in to the Cruzi mobile app to manage your {feature.toLowerCase()}, track student progress, and run your lessons.
    </p>
    <div className="w-full space-y-2">
      <a
        href="https://apps.apple.com/gb/app/cruzi/id6742619354"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        <Apple className="w-4 h-4" />
        Download on the App Store
      </a>
      <a
        href="https://play.google.com/store/apps/details?id=com.cruzi.app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        <Download className="w-4 h-4" />
        Get it on Google Play
      </a>
    </div>
  </div>
);

// ─── Tab: Overview ────────────────────────────────────────────────────────────

const OverviewTab = ({
  stats,
  isLoading,
  onTabChange,
}: {
  stats: ReturnType<typeof useInstructorStats>['data'];
  isLoading: boolean;
  onTabChange: (tab: string) => void;
}) => {
  const statTiles = [
    { label: "Today's Lessons", value: stats?.todayLessons ?? 0, icon: Calendar },
    { label: 'This Week', value: stats?.weekLessons ?? 0, icon: Clock },
    { label: 'Active Students', value: stats?.activeStudents ?? 0, icon: Users },
    { label: 'Pending Actions', value: stats?.pendingActions ?? 0, icon: AlertCircle },
  ];

  const quickActions = [
    { id: 'students', label: 'Students', icon: Users, color: 'bg-purple-50 text-purple-600' },
    { id: 'diary', label: 'Diary', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { id: 'sms', label: 'SMS Hub', icon: MessageSquare, color: 'bg-pink-50 text-pink-600' },
    { id: 'payments', label: 'Payments', icon: Wallet, color: 'bg-green-50 text-green-600' },
    { id: 'reports', label: 'Reports', icon: BarChart2, color: 'bg-orange-50 text-orange-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        {statTiles.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Icon className="w-6 h-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{isLoading ? '—' : value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
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

      {/* App download card */}
      <AppDownloadCard />
    </div>
  );
};

// ─── Tab: Students ────────────────────────────────────────────────────────────

const StudentsTab = ({ userId }: { userId: string }) => {
  const { data: students = [], isLoading } = useStudentList(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-semibold text-gray-500">No students yet</p>
        <p className="text-sm text-gray-400 mt-1">Add students from the Cruzi mobile app</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{students.length} active student{students.length !== 1 ? 's' : ''}</p>
      {students.map(s => (
        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-purple-700">
              {s.full_name ? s.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{s.full_name ?? 'Unnamed student'}</p>
            <p className="text-sm text-gray-400 truncate">{s.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {s.status ?? 'active'}
            </span>
            {s.total_hours != null && (
              <p className="text-xs text-gray-400 mt-1">{s.total_hours}h</p>
            )}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <AppDownloadCard compact />
      </div>
    </div>
  );
};

// ─── Tab: Settings (profile only) ────────────────────────────────────────────

const SettingsTab = ({ userId }: { userId: string }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; phone: string; adi_number: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('full_name, phone, adi_number').eq('user_id', userId).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? '', phone: data.phone ?? '', adi_number: (data as any).adi_number ?? '' });
    });
  }, [userId]);

  const handleSave = async () => {
    if (!userId || !profile) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('user_id', userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900">Your Profile</h3>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Full name</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            value={profile?.full_name ?? ''}
            onChange={e => setProfile(p => p ? { ...p, full_name: e.target.value } : p)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Phone number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            value={profile?.phone ?? ''}
            onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)}
            placeholder="+44 7700 000000"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#7c3aed] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-1">More settings in the app</h3>
        <p className="text-sm text-gray-400 mb-4">Pricing, lesson types, payment settings, notifications and more are managed in the Cruzi mobile app.</p>
        <AppDownloadCard compact />
      </div>

      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'students' | 'diary' | 'sms' | 'payments' | 'reports' | 'settings';

const MOBILE_ONLY_TABS: Record<string, string> = {
  diary: 'Diary',
  sms: 'SMS Hub',
  payments: 'Payments',
  reports: 'Reports',
};

const InstructorWebDashboard: React.FC = () => {
  const { user, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data: stats, isLoading: statsLoading } = useInstructorStats(user?.id);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || role !== 'instructor')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const firstName = stats?.instructorName?.split(' ')[0] ?? 'Instructor';

  const tabNav: { id: Tab; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Welcome back</p>
            <h1 className="text-lg font-bold text-gray-900">{firstName}</h1>
          </div>
          <span className="text-xl font-black text-[#7c3aed]">Cruzi</span>
        </div>
      </header>

      {/* Mobile-style CTA banner */}
      <div className="bg-[#7c3aed] text-white">
        <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Manage students &amp; lessons in the app</p>
          <a
            href="https://apps.apple.com/gb/app/cruzi/id6742619354"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 hover:bg-purple-50 transition-colors"
          >
            Download
          </a>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-5">
          {tabNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === id
                  ? 'bg-[#7c3aed] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            isLoading={statsLoading}
            onTabChange={(tab) => setActiveTab(tab as Tab)}
          />
        )}

        {activeTab === 'students' && user && (
          <StudentsTab userId={user.id} />
        )}

        {activeTab === 'settings' && user && (
          <SettingsTab userId={user.id} />
        )}

        {MOBILE_ONLY_TABS[activeTab] && (
          <MobileOnlyCard feature={MOBILE_ONLY_TABS[activeTab]} />
        )}
      </main>
    </div>
  );
};

export default InstructorWebDashboard;
