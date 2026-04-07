// Cruzi AI - Advanced Instructor Settings
// Master-detail settings panel with profile, business rates, payments, notifications

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useInstructorData } from '@/hooks/useInstructorData';
import QuickLessonSetup from './QuickLessonSetup';
import { createConnectAccount, getConnectStatus, openBillingPortal, type ConnectStatus } from '@/services/stripeService';
import { useSubscription } from '@/hooks/useSubscription';
import StudentPricingModal from '@/components/pricing/StudentPricingModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, PieChart, CreditCard, Bell, ChevronLeft, ChevronRight, Camera, Save, Loader2, ExternalLink, CheckCircle2, AlertCircle, Crown, UserCog, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
interface InstructorSettings {
  full_name: string;
  adi_number: string;
  grade: string;
  bio: string;
  hourly_rate: number;
  block_rates: {
    tenHours: number;
    twentyHours: number;
    thirtyHours: number;
  };
  bank_details: {
    accountName: string;
    sortCode: string;
    accountNumber: string;
  };
  show_bank_details: boolean;
  notification_prefs: {
    lessonReminders: boolean;
    financialSummaries: boolean;
    pulseScan: boolean;
    socialPrompts: boolean;
  };
}

// Student-Specific Rates Section Component
const StudentRatesSection: React.FC<{
  students: any[];
}> = ({
  students
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const selectedStudent = students.find(s => s.user_id === selectedStudentId);
  const handleOpenPricing = () => {
    if (selectedStudentId) {
      setIsPricingOpen(true);
    }
  };
  return <div className="space-y-6 pt-8 border-t border-border">
      <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
        <UserCog className="h-4 w-4 text-primary" /> Student-Specific Rates
      </h4>
      
      <div className="p-6 bg-muted border border-border rounded-3xl space-y-4">
        <p className="text-xs text-foreground">
          Set custom discounts, fixed rates, or gift free hours to individual students.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="flex-1 h-12 rounded-xl bg-background border-border">
              <SelectValue placeholder="Select a student..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              {students.length === 0 ? <div className="p-4 text-center text-sm text-muted-foreground">
                  No students linked yet
                </div> : students.map(student => <SelectItem key={student.user_id} value={student.user_id} className="cursor-pointer">
                    {student.full_name || student.email}
                  </SelectItem>)}
            </SelectContent>
          </Select>
          
          <button onClick={handleOpenPricing} disabled={!selectedStudentId} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap">
            Set Custom Rate
          </button>
        </div>
      </div>

      {selectedStudent && <StudentPricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} student={selectedStudent} />}
    </div>;
};
const InstructorSettingsAdvanced: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    students,
    lessons
  } = useInstructorData();
  const {
    subscription
  } = useSubscription();
  const [activeSection, setActiveSection] = useState<'profile' | 'business' | 'payments' | 'notifications' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [isLoadingConnect, setIsLoadingConnect] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const queryClient = useQueryClient();

  const handleClearAllLessons = async () => {
    if (!user?.id) return;
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('instructor_id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
      toast({ title: 'All lessons cleared', description: 'Your calendar is now empty.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsClearing(false);
    }
  };
  const [settings, setSettings] = useState<InstructorSettings>({
    full_name: '',
    adi_number: '',
    grade: 'A',
    bio: '',
    hourly_rate: 45,
    block_rates: {
      tenHours: 430,
      twentyHours: 840,
      thirtyHours: 1200
    },
    bank_details: {
      accountName: '',
      sortCode: '',
      accountNumber: ''
    },
    show_bank_details: false,
    notification_prefs: {
      lessonReminders: true,
      financialSummaries: true,
      pulseScan: true,
      socialPrompts: false
    }
  });

  // Load settings from profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setSettings(prev => ({
          ...prev,
          full_name: data.full_name || '',
          adi_number: data.adi_number || '',
          grade: data.grade || 'A',
          bio: data.bio || '',
          hourly_rate: data.hourly_rate || 45
        }));
      }
    };
    loadProfile();
  }, [user?.id]);

  // Load Connect status
  useEffect(() => {
    const loadConnectStatus = async () => {
      if (!user?.id) return;
      setIsLoadingConnect(true);
      try {
        const status = await getConnectStatus();
        setConnectStatus(status);
      } catch (error) {
        console.error('Failed to load Connect status:', error);
      } finally {
        setIsLoadingConnect(false);
      }
    };
    loadConnectStatus();
  }, [user?.id]);

  // Default to profile on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setActiveSection('profile');
    }
  }, []);
  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        full_name: settings.full_name,
        adi_number: settings.adi_number,
        grade: settings.grade,
        bio: settings.bio,
        hourly_rate: settings.hourly_rate,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been synchronized across devices.'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save failed',
        description: 'Could not update your settings.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const {
        url
      } = await createConnectAccount();
      if (url) {
        window.open(url, '_blank');
        toast({
          title: 'Stripe Setup Opened',
          description: 'Complete your onboarding in the new tab to receive payments.'
        });
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast({
        title: 'Setup Failed',
        description: error instanceof Error ? error.message : 'Could not start Stripe setup.',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };
  const handleOpenDashboard = async () => {
    if (connectStatus?.dashboardUrl) {
      window.open(connectStatus.dashboardUrl, '_blank');
    } else {
      try {
        const status = await getConnectStatus();
        if (status.dashboardUrl) {
          window.open(status.dashboardUrl, '_blank');
        }
      } catch (error) {
        toast({
          title: 'Dashboard Unavailable',
          description: 'Could not open Stripe dashboard. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };
  const handleManageSubscription = async () => {
    try {
      const {
        url
      } = await openBillingPortal();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Portal Unavailable',
        description: error instanceof Error ? error.message : 'Could not open billing portal.',
        variant: 'destructive'
      });
    }
  };
  const navItems = [{
    id: 'profile' as const,
    label: 'Identity',
    icon: User,
    color: 'bg-primary'
  }, {
    id: 'business' as const,
    label: 'Business Rates',
    icon: PieChart,
    color: 'bg-accent'
  }, {
    id: 'payments' as const,
    label: 'Financial Matrix',
    icon: CreditCard,
    color: 'bg-emerald-500'
  }, {
    id: 'notifications' as const,
    label: 'Alerts',
    icon: Bell,
    color: 'bg-amber-500'
  }];
  const currentSection = activeSection || 'profile';
  const getConnectStatusBadge = () => {
    if (!connectStatus) return null;
    if (connectStatus.status === 'active' && connectStatus.payoutsEnabled) {
      return <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <CheckCircle2 className="h-3 w-3" /> Active
        </span>;
    } else if (connectStatus.status === 'pending' || !connectStatus.onboardingComplete) {
      return <span className="flex items-center gap-1.5 text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Pending
        </span>;
    } else if (connectStatus.status === 'restricted') {
      return <span className="flex items-center gap-1.5 text-red-600 bg-red-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Action Needed
        </span>;
    }
    return null;
  };
  return <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row bg-background rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700 relative">
      
      {/* SIDEBAR / MASTER LIST */}
      <aside className={`
        w-full md:w-72 bg-muted/50 border-r border-border flex flex-col shrink-0 p-8 transition-transform duration-500
        ${activeSection !== null ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="mb-10 px-4">
          <h2 className="text-2xl font-black text-foreground tracking-tighter">Settings</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Cruzi Cloud v4.5</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
          const Icon = item.icon;
          return <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeSection === item.id ? 'bg-background shadow-lg text-primary font-black scale-[1.02]' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}>
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-primary-foreground shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm tracking-tight">{item.label}</span>
                <ChevronRight className="h-3 w-3 ml-auto opacity-20 group-hover:opacity-100 md:hidden" />
                {activeSection === item.id && <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full hidden md:block" />}
              </button>;
        })}
        </nav>

        <div className="mt-auto pt-8 border-t border-border hidden md:block">
          <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Apply Changes
          </button>
        </div>
      </aside>

      {/* CONTENT STAGE / DETAIL VIEW */}
      <main className={`
        flex-1 overflow-y-auto custom-scrollbar p-8 md:p-20 bg-background relative transition-transform duration-500
        ${activeSection === null ? 'hidden md:block' : 'block'}
      `}>
        
        {/* MOBILE HEADER */}
        <div className="flex items-center gap-4 mb-10 md:hidden">
          <button onClick={() => setActiveSection(null)} className="w-10 h-10 bg-muted border border-border rounded-full flex items-center justify-center text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-xl font-black text-foreground capitalize">{activeSection}</h3>
        </div>

        {/* BRAND BLUR BACKGROUNDS */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-16">
          
          {currentSection === 'profile' && <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <section className="flex flex-col md:flex-row items-center gap-10 border-b border-border pb-12">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-[3rem] overflow-hidden shadow-2xl ring-4 ring-background ring-offset-4 ring-offset-muted">
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-black text-primary-foreground">
                      {settings.full_name.slice(0, 2).toUpperCase() || 'IN'}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-foreground/40 rounded-[3rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-black text-foreground tracking-tight mb-2">{settings.full_name || 'Instructor'}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Grade {settings.grade} ADI
                    </span>
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      License: {settings.adi_number || 'Not Set'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Legal Name</label>
                    <input type="text" value={settings.full_name} onChange={e => setSettings({
                  ...settings,
                  full_name: e.target.value
                })} className="w-full bg-muted border border-border rounded-2xl px-6 py-4 font-bold text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">ADI Number</label>
                    <input type="text" value={settings.adi_number} onChange={e => setSettings({
                  ...settings,
                  adi_number: e.target.value
                })} className="w-full bg-muted border border-border rounded-2xl px-6 py-4 font-bold text-foreground focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Instructor Bio</label>
                  <textarea value={settings.bio} onChange={e => setSettings({
                ...settings,
                bio: e.target.value
              })} className="w-full bg-muted border border-border rounded-[2rem] px-6 py-5 font-medium text-foreground leading-relaxed focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner min-h-[160px]" />
                </div>
              </section>
            </div>}

          {currentSection === 'business' && <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tight">Standard Rates</h3>
                <p className="text-foreground font-medium mt-2">Set your hourly and block booking prices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-background rounded-[2.5rem] border border-border shadow-xl group hover:-translate-y-1 transition-all">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Base Hourly</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-foreground">£</span>
                    <input type="number" value={settings.hourly_rate} onChange={e => setSettings({
                  ...settings,
                  hourly_rate: parseFloat(e.target.value) || 0
                })} className="w-full text-5xl font-black text-primary bg-transparent outline-none" />
                  </div>
                </div>

                <div className="p-8 bg-foreground rounded-[2.5rem] text-background shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">Market Insights</p>
                  <p className="text-sm font-medium leading-relaxed italic text-primary-foreground">"Your rate is 5% below average for your area. Adjusting to £{settings.hourly_rate + 3} would maximize yield without impacting conversion."</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <PieChart className="h-4 w-4 text-primary" /> Active Block Discounts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[{
                key: 'tenHours',
                label: '10 Hours',
                val: settings.block_rates.tenHours
              }, {
                key: 'twentyHours',
                label: '20 Hours',
                val: settings.block_rates.twentyHours
              }, {
                key: 'thirtyHours',
                label: '30 Hours',
                val: settings.block_rates.thirtyHours
              }].map(block => <div key={block.key} className="p-6 bg-muted border border-border rounded-3xl space-y-2 shadow-inner">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center">{block.label}</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-black text-muted-foreground">£</span>
                        <input type="number" value={block.val} onChange={e => setSettings({
                    ...settings,
                    block_rates: {
                      ...settings.block_rates,
                      [block.key]: parseFloat(e.target.value) || 0
                    }
                  })} className="w-full text-2xl font-black text-foreground bg-transparent text-center outline-none" />
                      </div>
                    </div>)}
                </div>
              </div>

              {/* Student-Specific Rates */}
              <StudentRatesSection students={students} />

              {/* Quick Lesson Setup */}
              <QuickLessonSetup students={students} lessons={lessons} />
            </div>}

          {currentSection === 'payments' && <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tight">Financial Matrix</h3>
                <p className="text-muted-foreground font-medium mt-2">Manage subscriptions and student payment processing.</p>
              </div>

              {/* Subscription Status */}
              <div className={`p-10 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 ${subscription?.tier === 'elite' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-muted border border-border'}`}>
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xl ${subscription?.tier === 'elite' ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'}`}>
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight leading-none">
                        {subscription?.tier === 'elite' ? 'Elite Instructor' : 'Lite Tier'}
                      </h4>
                      <p className={`text-xs font-bold mt-1 uppercase tracking-widest ${subscription?.tier === 'elite' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {subscription?.tier === 'elite' ? '£29.99/month • Unlimited' : 'Free • Limited Features'}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-medium max-w-sm mx-auto md:mx-0 ${subscription?.tier === 'elite' ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {subscription?.tier === 'elite' ? 'Unlimited students, instant AI, marketplace payments enabled.' : 'Limited to 5 students and 3 AI calls per day.'}
                  </p>
                </div>
                {subscription?.tier === 'elite' ? <button onClick={handleManageSubscription} className="w-full md:w-auto px-10 py-5 bg-white text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                    Manage Subscription <ExternalLink className="h-4 w-4" />
                  </button> : <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground mb-2">Upgrade for marketplace payments</p>
                  </div>}
              </div>

              {/* Stripe Connect Section */}
              <div className="bg-primary p-10 rounded-[3rem] text-primary-foreground shadow-xl flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary text-xl shadow-xl">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-xl font-black tracking-tight leading-none">Student Payments</h4>
                        {getConnectStatusBadge()}
                      </div>
                      <p className="text-xs font-bold text-primary-foreground/70 mt-1 uppercase tracking-widest">
                        Stripe Connect • {connectStatus?.connected ? 'Linked' : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-primary-foreground/80 max-w-sm mx-auto md:mx-0">
                    {connectStatus?.payoutsEnabled ? 'Students can purchase lesson credits directly. Payouts are processed daily.' : 'Connect your account to accept online payments from students.'}
                  </p>
                </div>
                {isLoadingConnect ? <div className="w-full md:w-auto px-10 py-5 bg-background/50 rounded-2xl">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                  </div> : connectStatus?.connected && connectStatus?.onboardingComplete ? <button onClick={handleOpenDashboard} className="w-full md:w-auto px-10 py-5 bg-background text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                    Stripe Dashboard <ExternalLink className="h-4 w-4" />
                  </button> : <button onClick={handleConnectStripe} disabled={isConnecting} className="w-full md:w-auto px-10 py-5 bg-background text-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect Stripe'}
                  </button>}
              </div>

              {/* Bank Transfer Option */}
              <div className="bg-muted border border-border rounded-[3rem] p-8 md:p-10 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-lg md:text-xl font-black text-foreground">Direct Bank Transfer</h4>
                    <p className="text-xs font-medium text-muted-foreground italic">Allow students to pay via manual transfer (fallback).</p>
                  </div>
                  <button onClick={() => setSettings({
                ...settings,
                show_bank_details: !settings.show_bank_details
              })} className={`w-16 h-9 rounded-full relative transition-all duration-500 shrink-0 ${settings.show_bank_details ? 'bg-emerald-500' : 'bg-muted-foreground/30 shadow-inner'}`}>
                    <div className={`absolute top-1.5 w-6 h-6 bg-background rounded-full shadow-md transition-all duration-500 ${settings.show_bank_details ? 'left-8' : 'left-1.5'}`} />
                  </button>
                </div>

                <div className={`space-y-8 transition-all duration-700 ${settings.show_bank_details ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none h-0 overflow-hidden md:h-auto md:overflow-visible'}`}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Account Holder</label>
                    <input type="text" value={settings.bank_details.accountName} onChange={e => setSettings({
                  ...settings,
                  bank_details: {
                    ...settings.bank_details,
                    accountName: e.target.value
                  }
                })} className="w-full bg-background border border-border rounded-2xl px-6 py-4 font-bold text-foreground outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Sort Code</label>
                      <input type="text" value={settings.bank_details.sortCode} onChange={e => setSettings({
                    ...settings,
                    bank_details: {
                      ...settings.bank_details,
                      sortCode: e.target.value
                    }
                  })} className="w-full bg-background border border-border rounded-2xl px-6 py-4 font-bold text-foreground outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Account Number</label>
                      <input type="text" value={settings.bank_details.accountNumber} onChange={e => setSettings({
                    ...settings,
                    bank_details: {
                      ...settings.bank_details,
                      accountNumber: e.target.value
                    }
                  })} className="w-full bg-background border border-border rounded-2xl px-6 py-4 font-bold text-foreground outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-3 text-muted-foreground py-4">
                <CreditCard className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Payment Processing Secured by Stripe</p>
              </div>
            </div>}

          {currentSection === 'notifications' && <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
              <div>
                <h3 className="text-3xl font-black text-foreground tracking-tight">Alert Preferences</h3>
                <p className="text-muted-foreground font-medium mt-2">Configure how Cruzi keeps you updated.</p>
              </div>

              <div className="space-y-4">
                {[{
              key: 'lessonReminders',
              label: 'Lesson Reminders',
              sub: 'Receive push notifications 24h before lessons.'
            }, {
              key: 'financialSummaries',
              label: 'Financial Summaries',
              sub: 'Weekly automated revenue reports.'
            }, {
              key: 'pulseScan',
              label: 'Cruzi Pulse Scan',
              sub: 'Enable real-time business growth suggestions.'
            }, {
              key: 'socialPrompts',
              label: 'Social Media Prompts',
              sub: 'Auto-detect shareable student milestones.'
            }].map(pref => <div key={pref.key} className="bg-muted p-6 md:p-8 rounded-[2rem] border border-border flex items-center justify-between hover:bg-background hover:shadow-xl transition-all group">
                    <div className="space-y-1 pr-4">
                      <h4 className="text-base md:text-lg font-black text-foreground leading-none">{pref.label}</h4>
                      <p className="text-[10px] md:text-sm font-medium text-muted-foreground">{pref.sub}</p>
                    </div>
                    <button onClick={() => setSettings({
                ...settings,
                notification_prefs: {
                  ...settings.notification_prefs,
                  [pref.key]: !settings.notification_prefs[pref.key as keyof typeof settings.notification_prefs]
                }
              })} className={`w-14 h-8 rounded-full relative transition-all duration-300 shrink-0 ${settings.notification_prefs[pref.key as keyof typeof settings.notification_prefs] ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-background rounded-full shadow-md transition-all ${settings.notification_prefs[pref.key as keyof typeof settings.notification_prefs] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>)}
              </div>
            </div>}

          {/* DATA MANAGEMENT */}
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Data Management</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-6 rounded-[2rem] border border-destructive/30 hover:bg-destructive/10 transition-all">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div className="text-left">
                    <span className="font-bold text-foreground block">Clear All Lessons</span>
                    <span className="text-[10px] text-muted-foreground">Remove all booked lessons from your calendar</span>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete ALL lessons from your calendar. This action cannot be undone. Student credit balances will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllLessons}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isClearing}
                  >
                    {isClearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Yes, delete all lessons
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* MOBILE SAVE BUTTON */}
          <div className="md:hidden pt-10 pb-24">
            <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-primary text-primary-foreground rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Apply Changes
            </button>
          </div>
        </div>
      </main>
    </div>;
};
export default InstructorSettingsAdvanced;