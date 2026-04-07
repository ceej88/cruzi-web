import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { generateDailyPulse } from '@/services/instructorAIService';
import { CruziNotification, InstructorProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Layout Components - Three-Mode Responsive System
import DesktopSidebar from '@/components/layout/DesktopSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import MobileHeader from '@/components/layout/MobileHeader';
import DesktopHeader from '@/components/layout/DesktopHeader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

// Content Components
import InstructorHome from './components/InstructorHome';
import InstructorSchedule from './components/InstructorSchedule';
import InstructorPupils from './components/InstructorPupils';
import InstructorCoreSkills from './components/InstructorCoreSkills';
import InstructorTemplateVault from './components/InstructorTemplateVault';
import InstructorMockTest from './components/MockTest';
import InstructorMessages from './components/InstructorMessages';
import InstructorSettings from './components/InstructorSettings';
import InstructorSettingsAdvanced from './components/InstructorSettingsAdvanced';
import InstructorGrowthLab from './components/InstructorGrowthLab';
import InstructorCompliance from './components/InstructorCompliance';
import StudentConnectionHub from './components/StudentConnectionHub';
import BroadcastModal from './components/BroadcastModal';
import AdminHelper from '@/components/shared/AdminHelper';
import NeuralScribePage from './components/NeuralScribePage';
import InstructorBroadcast from './components/InstructorBroadcast';
import SmsHub from './components/SmsHub';
import InstructorReports from './components/InstructorReports';
import NavigationCenter from './components/NavigationCenter';
import FinancialNode from './components/FinancialNode';
import VoiceCommandCenter from '@/components/shared/VoiceCommandCenter';
import VoiceSkillReviewModal from '@/components/instructor/VoiceSkillReviewModal';
import { VoiceClarificationModal } from '@/components/instructor/VoiceClarificationModal';
import { StudentMatch } from '@/types/voiceCommands';

// Lucide icons
import { LayoutDashboard, Calendar, Users, GraduationCap, BookOpen, ClipboardCheck, MessageCircle, Settings, Bell, X, Mic, Rocket, Shield, Bot, UserPlus, Navigation, Wallet, Megaphone, MessageSquare, BarChart2 } from 'lucide-react';

// Tabs that render their own full-page UI (hide dashboard shell)
const FULL_PAGE_TABS = ['sms-hub', 'broadcast', 'connection-hub', 'neural-scribe', 'diary', 'growth-lab', 'mock-test', 'nav-command', 'messages', 'core-skills', 'reports'];

// URL path to tab ID mapping
const PATH_TO_TAB: Record<string, string> = {
  '': 'dashboard',
  'dashboard': 'dashboard',
  'diary': 'diary',
  'capital': 'capital',
  'nav-command': 'nav-command',
  'pupils': 'pupils',
  'messages': 'messages',
  'broadcast': 'broadcast',
  'sms-hub': 'sms-hub',
  'reports': 'reports',
  'connection-hub': 'connection-hub',
  'growth-lab': 'growth-lab',
  'neural-scribe': 'neural-scribe',
  'core-skills': 'core-skills',
  'teaching-vault': 'teaching-vault',
  'mock-test': 'mock-test',
  'compliance': 'compliance',
  'admin-helper': 'admin-helper',
  'settings': 'settings',
};

const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Derive activeTab from URL path
  const activeTab = useMemo(() => {
    const pathSegment = location.pathname.replace('/instructor/', '').replace('/instructor', '');
    return PATH_TO_TAB[pathSegment] || 'dashboard';
  }, [location.pathname]);
  
  // Navigation function that updates URL (creates history entries)
  const setActiveTab = useCallback((tab: string) => {
    const path = tab === 'dashboard' ? '/instructor' : `/instructor/${tab}`;
    navigate(path);
  }, [navigate]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<CruziNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPulseLoading, setIsPulseLoading] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);

  // Voice clarification state
  const [clarificationState, setClarificationState] = useState<{
    isOpen: boolean;
    candidates: StudentMatch[];
    heardPhrase: string;
    originalCommand: string;
    onConfirm: ((student: StudentMatch) => void) | null;
  }>({
    isOpen: false,
    candidates: [],
    heardPhrase: '',
    originalCommand: '',
    onConfirm: null,
  });
  
  const { user, signOut } = useAuth();
  const instructorData = useInstructorData();

  // Fetch profile from database when user session is available
  const loadProfileFromDatabase = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.warn('No profile found for user:', userId);
        return;
      }
      
      // Map database profile to InstructorProfile interface
      const profile: InstructorProfile = {
        name: data.full_name || data.email?.split('@')[0] || '',
        email: data.email,
        instructorPin: data.instructor_pin || undefined,
        adiNumber: data.adi_number || '',
        grade: data.grade || '',
        bio: data.bio || '',
        termsOfBusiness: data.terms_of_business || undefined,
        hourlyRate: data.hourly_rate || 0,
        blockRates: { tenHours: 0, twentyHours: 0, thirtyHours: 0 },
        showBankDetailsToStudents: false,
        stripeConnected: !!data.stripe_account_id,
        isVerified: !!data.adi_number,
        verificationStatus: data.adi_number ? 'VERIFIED' : 'NONE',
        subscriptionTier: 'lite',
      };
      
      setInstructorProfile(profile);
      localStorage.setItem('cruzi_settings', JSON.stringify(profile));
      window.dispatchEvent(new Event('cruzi_data_update'));
    } catch (err) {
      console.error('Failed to load profile from database:', err);
    }
  }, []);
  
  // Trigger fresh profile load when user changes
  useEffect(() => {
    if (user?.id) {
      loadProfileFromDatabase(user.id);
    } else {
      setInstructorProfile(null);
    }
  }, [user?.id, loadProfileFromDatabase]);
  
  // Listen for profile updates from other components (e.g. Settings save)
  useEffect(() => {
    const handleUpdate = () => {
      const settings = localStorage.getItem('cruzi_settings');
      if (settings) {
        setInstructorProfile(JSON.parse(settings));
      }
    };
    window.addEventListener('cruzi_data_update', handleUpdate);
    return () => window.removeEventListener('cruzi_data_update', handleUpdate);
  }, []);
  
  // Listen for tab navigation events from child components
  useEffect(() => {
    const handleNavigate = (e: CustomEvent<{ tab: string }>) => {
      setActiveTab(e.detail.tab);
    };
    window.addEventListener('navigate-tab', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate-tab', handleNavigate as EventListener);
  }, [setActiveTab]);

  // Handle Stripe subscription upgrade return
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('upgrade') !== 'success') return;
    window.history.replaceState({}, '', location.pathname);
    (async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('tier')
        .eq('user_id', user?.id)
        .single();
      const tier = data?.tier || 'pro';
      const label = tier === 'premium'
        ? 'Premium — unlimited students unlocked'
        : tier === 'pro'
        ? 'Pro — 15 students unlocked'
        : 'plan upgraded';
      toast({ title: `You're now on ${label}`, duration: 4000 });
    })();
  }, [location.search]);

  const runPulse = async () => {
    setIsPulseLoading(true);
    try {
      const newNotifs = await generateDailyPulse();
      setNotifications([...newNotifs, ...notifications]);
      setIsNotifOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPulseLoading(false);
    }
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifs = () => setNotifications([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Full menu items for sidebar
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'diary', icon: Calendar, label: 'Diary' },
    { id: 'capital', icon: Wallet, label: 'Money Hub' },
    { id: 'nav-command', icon: Navigation, label: 'Nav Command' },
    { id: 'pupils', icon: Users, label: 'Pupils' },
    // Communications section
    { type: 'section' as const, label: 'Communications' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'sms-hub', icon: MessageSquare, label: 'SMS Hub' },
    { id: 'connection-hub', icon: UserPlus, label: 'Connection Hub' },
    // Analytics section
    { type: 'section' as const, label: 'Analytics' },
    { id: 'reports', icon: BarChart2, label: 'Reports' },
    // Tools section
    { type: 'section' as const, label: 'Tools' },
    { id: 'growth-lab', icon: Rocket, label: 'Growth Lab' },
    { id: 'neural-scribe', icon: Mic, label: 'Voice Scribe' },
    { id: 'core-skills', icon: GraduationCap, label: 'Core Skills' },
    { id: 'teaching-vault', icon: BookOpen, label: 'Teaching Vault' },
    { id: 'mock-test', icon: ClipboardCheck, label: 'Mock Test' },
    { id: 'compliance', icon: Shield, label: 'Compliance' },
    { id: 'admin-helper', icon: Bot, label: 'Admin Helper' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
  
  // Mobile bottom nav - only 4 primary items
  const mobileNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'diary', icon: Calendar, label: 'Diary' },
    { id: 'growth-lab', icon: Rocket, label: 'Growth' },
    { id: 'admin-helper', icon: Bot, label: 'Admin' },
  ];

  // Check if current tab is full-page (has its own header/nav)
  const isFullPageTab = FULL_PAGE_TABS.includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InstructorHome onRunPulse={runPulse} isPulseLoading={isPulseLoading} onNavigate={setActiveTab} localInsights={notifications.slice(0, 2)} />;
      case 'diary':
        return <InstructorSchedule onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'capital':
        return <FinancialNode />;
      case 'nav-command':
        return <NavigationCenter />;
      case 'pupils':
        return <InstructorPupils onNavigate={setActiveTab} />;
      case 'connection-hub':
        return <StudentConnectionHub />;
      case 'core-skills':
        return <InstructorCoreSkills />;
      case 'neural-scribe':
        return <NeuralScribePage />;
      case 'teaching-vault':
        return <InstructorTemplateVault onNavigate={setActiveTab} />;
      case 'mock-test':
        return <InstructorMockTest setActiveTab={setActiveTab} />;
      case 'messages':
        return <InstructorMessages />;
      case 'sms-hub':
        return <SmsHub />;
      case 'broadcast':
        return <InstructorBroadcast onNavigate={setActiveTab} />;
      case 'reports':
        return <InstructorReports />;
      case 'growth-lab':
        return <InstructorGrowthLab />;
      case 'compliance':
        return <InstructorCompliance />;
      case 'admin-helper':
        return <AdminHelper />;
      case 'settings':
        return <InstructorSettingsAdvanced />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Settings className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Coming Soon</h2>
            <p className="text-center mt-2">We're working hard on the {activeTab} section.</p>
          </div>
        );
    }
  };

  const userName = instructorProfile?.name || user?.email?.split('@')[0] || 'Instructor';

  return (
    <div className="min-h-screen bg-background">
      {/* ========== MOBILE/TABLET (< 1024px) ========== */}
      <div className="lg:hidden fixed inset-0 flex flex-col overflow-hidden">
        {/* Only show dashboard shell for non-full-page tabs */}
        {!isFullPageTab && (
          <>
            {/* Safe area top */}
            <div className="h-safe-area-top shrink-0" />
            
            {/* Mobile Header */}
            <MobileHeader 
              onMenuOpen={() => setIsSidebarOpen(true)} 
              onBellClick={() => setIsNotifOpen(!isNotifOpen)}
              unreadCount={unreadCount}
            />
          </>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto overscroll-contain ${isFullPageTab ? 'overflow-hidden' : ''}`}>
          {renderContent()}
        </main>
        
        {/* Mobile Bottom Nav - Hide for full-page tabs */}
        {!isFullPageTab && (
          <MobileBottomNav 
            items={mobileNavItems} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        )}
      </div>
      
      {/* Mobile Sidebar Drawer */}
      <MobileSidebarDrawer 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userName={userName}
        onLogout={signOut}
      />

      {/* ========== DESKTOP (>= 1024px) ========== */}
      <div className="hidden lg:flex h-screen">
        {/* Persistent Left Sidebar */}
        <DesktopSidebar 
          menuItems={menuItems} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          userName={userName}
          onLogout={signOut}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50/30">
          {/* Desktop Header */}
          <DesktopHeader 
            userName={userName} 
            onBellClick={() => setIsNotifOpen(!isNotifOpen)}
            unreadCount={unreadCount}
            onLogout={signOut}
          />
          
          {/* Content Container */}
          <div className={`${activeTab === 'dashboard' || activeTab === 'diary' || activeTab === 'messages' ? '' : 'p-6 max-w-7xl mx-auto'}`}>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ========== SHARED OVERLAYS ========== */}
      
      {/* Notifications Panel */}
      {isNotifOpen && (
        <div className="fixed inset-0 z-[100] lg:relative lg:inset-auto lg:z-auto">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm lg:hidden" onClick={() => setIsNotifOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-card shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300 lg:fixed lg:top-0 lg:h-screen lg:border-l lg:border-border">
            <div className="p-6 border-b border-border flex justify-between items-center bg-card sticky top-0">
              <h3 className="text-xl font-black text-foreground tracking-tight">Cruzi Pulse</h3>
              <div className="flex gap-3 items-center">
                <button onClick={clearNotifs} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-destructive transition-colors">Clear</button>
                <button onClick={() => setIsNotifOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Bell className="h-8 w-8 mb-4 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => markRead(notif.id)} 
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.read ? 'bg-muted/50 border-border opacity-60' : 'bg-card border-primary/20 shadow-sm hover:border-primary/40'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                        notif.type === 'ALERT' ? 'bg-destructive/20 text-destructive' : 
                        notif.type === 'SUCCESS' ? 'bg-green-500/20 text-green-600' : 
                        notif.type === 'GROWTH' ? 'bg-amber-500/20 text-amber-600' : 
                        'bg-primary/20 text-primary'
                      }`}>
                        {notif.type}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-foreground leading-tight mb-1">{notif.title}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      <BroadcastModal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} onComplete={() => setActiveTab('messages')} />

      {/* Cruzi Co-Pilot - Floating Voice Command Center */}
      {!FULL_PAGE_TABS.includes(activeTab) && (
        <VoiceCommandCenter />
      )}
      
      {/* Voice Skill Review Modal */}
      <VoiceSkillReviewModal />
      
      {/* Voice Clarification Modal */}
      <VoiceClarificationModal
        isOpen={clarificationState.isOpen}
        onClose={() => setClarificationState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(student) => {
          clarificationState.onConfirm?.(student);
          setClarificationState(prev => ({ ...prev, isOpen: false }));
        }}
        heardPhrase={clarificationState.heardPhrase}
        candidates={clarificationState.candidates}
        originalCommand={clarificationState.originalCommand}
      />
    </div>
  );
};

export default InstructorDashboard;
