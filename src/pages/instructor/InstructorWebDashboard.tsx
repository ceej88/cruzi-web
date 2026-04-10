import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Users, MessageSquare, Wallet, BarChart2, Settings, ChevronLeft, LogOut
} from 'lucide-react';
import InstructorOverview from './InstructorOverview';
import InstructorStudents from './InstructorStudents';
import InstructorSMS from './InstructorSMS';
import InstructorPayments from './InstructorPayments';
import InstructorReports from './InstructorReports';
import InstructorSettings from './InstructorSettings';

const tabs = [
  { path: '/instructor', label: 'Home', icon: Home, exact: true },
  { path: '/instructor/students', label: 'Students', icon: Users },
  { path: '/instructor/sms', label: 'SMS', icon: MessageSquare },
  { path: '/instructor/payments', label: 'Payments', icon: Wallet },
  { path: '/instructor/reports', label: 'Reports', icon: BarChart2 },
  { path: '/instructor/settings', label: 'Settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  '/instructor': '',
  '/instructor/students': 'Students',
  '/instructor/sms': 'SMS Hub',
  '/instructor/payments': 'Payments',
  '/instructor/reports': 'Reports',
  '/instructor/settings': 'Settings',
  '/instructor/diary': 'Diary',
};

export function DashHeader({ name }: { name: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isHome = location.pathname === '/instructor';
  const title = pageTitles[location.pathname] ?? '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="min-w-0">
            {isHome ? (
              <>
                <p className="text-xs text-gray-400 font-medium leading-none">Welcome back</p>
                <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
                  {name || 'Instructor'}
                </h1>
              </>
            ) : (
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-black text-[#7c3aed]">Cruzi</span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

const InstructorWebDashboard: React.FC = () => {
  const { user, role, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ['dash-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user!.id)
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || role !== 'instructor')) {
      navigate('/auth', { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
      </div>
    );
  }

  const instructorName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Instructor';
  const userId = user?.id ?? '';

  const isActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) return location.pathname === tab.path;
    return location.pathname.startsWith(tab.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashHeader name={instructorName} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-24">
        <Routes>
          <Route path="" element={<InstructorOverview userId={userId} instructorName={instructorName} />} />
          <Route path="students" element={<InstructorStudents userId={userId} />} />
          <Route path="sms" element={<InstructorSMS userId={userId} />} />
          <Route path="payments" element={<InstructorPayments userId={userId} />} />
          <Route path="reports" element={<InstructorReports userId={userId} />} />
          <Route path="settings" element={<InstructorSettings userId={userId} userEmail={user?.email ?? ''} />} />
          <Route path="diary" element={
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-2xl mb-2">📅</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Diary is in the app</h2>
              <p className="text-gray-500 text-sm mb-6">Manage your lesson diary from the Cruzi mobile app.</p>
              <a href="https://apps.apple.com/gb/app/cruzi/id6759689036" target="_blank" rel="noopener noreferrer"
                className="bg-[#7c3aed] text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-purple-700 transition-colors">
                Download on App Store
              </a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/instructor" replace />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map(tab => {
            const active = isActive(tab);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                  active ? 'text-[#7c3aed]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default InstructorWebDashboard;
