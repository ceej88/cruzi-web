import React, { useState, useMemo } from 'react';
import { useInstructorData, StudentProfile } from '@/hooks/useInstructorData';
import { useSubscription } from '@/hooks/useSubscription';
import { useInstructorStudentPricing } from '@/hooks/useStudentPricing';
import { CANONICAL_TOPICS, normalizeTopicName } from '@/hooks/useUnifiedSkillProgress';
import { Users, GraduationCap, Wallet, Calendar, Clock, X, Mail, Phone, UserCheck, Award, StickyNote, Plus, Loader2, Search, MessageSquare, ChevronRight, AlertTriangle, CheckCircle2, Send, Key, Copy, Crown, Tag, FileText } from 'lucide-react';
import PupilPlansTab from './PupilPlansTab';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LevelBadge } from '@/components/ui/LevelBadge';
import { PupilLevel } from '@/types';
import { toast } from '@/hooks/use-toast';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import StudentPricingModal from '@/components/pricing/StudentPricingModal';
interface InstructorPupilsProps {
  onNavigate?: (tab: string) => void;
}
type StatusTab = 'ACTIVE' | 'PENDING' | 'PASSED';
const InstructorPupils: React.FC<InstructorPupilsProps> = ({
  onNavigate
}) => {
  const {
    students,
    skillProgress,
    updateStudentProfile,
    updateStudentStatus,
    addCredits,
    sendMessage,
    generateStudentSecurePin,
    isLoading
  } = useInstructorData();
  const {
    isLiteTier,
    studentCount,
    studentLimit,
    canAddStudent
  } = useSubscription();
  const {
    data: studentPricingList
  } = useInstructorStudentPricing();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [activePupil, setActivePupil] = useState<StudentProfile | null>(null);
  const [pricingStudent, setPricingStudent] = useState<StudentProfile | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<'profile' | 'wallet' | 'progress' | 'plans'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    notes: '',
    parent_email: '',
    email: '',
    phone: '',
    address: ''
  });
  const [topUpAmount, setTopUpAmount] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('ACTIVE');

  // Calculate mastery percentage for a student using unified 190-point system
  // Matches the logic in useUnifiedSkillProgress for consistency
  const calculateMastery = (studentId: string) => {
    const studentSkills = skillProgress.filter(s => s.student_id === studentId);
    const totalSkills = CANONICAL_TOPICS.length; // 38
    const maxPoints = totalSkills * 5; // 190
    
    // Build a map of canonical topic -> level, handling aliases
    const skillMap: Record<string, number> = {};
    for (const topic of CANONICAL_TOPICS) {
      skillMap[topic] = 0;
    }
    
    // Map each skill record to its canonical topic
    for (const skill of studentSkills) {
      const normalized = normalizeTopicName(skill.topic);
      if (normalized && skillMap[normalized] !== undefined) {
        // Take the highest level if there are duplicates
        skillMap[normalized] = Math.max(skillMap[normalized], skill.level);
      }
    }
    
    // Sum all levels to get earned points
    const earnedPoints = Object.values(skillMap).reduce((sum, level) => sum + level, 0);
    
    return Math.round((earnedPoints / maxPoints) * 100);
  };

  // Segment students by status
  const {
    activeStudents,
    pendingStudents,
    passedStudents,
    lowCreditCount
  } = useMemo(() => {
    const active = students.filter(s => s.status === 'ACTIVE' || !s.status);
    const pending = students.filter(s => s.status === 'PENDING');
    const passed = students.filter(s => s.status === 'PASSED' || s.status === 'ARCHIVED');
    const lowCredit = active.filter(s => (s.credit_balance || 0) < 2).length;
    return {
      activeStudents: active,
      pendingStudents: pending,
      passedStudents: passed,
      lowCreditCount: lowCredit
    };
  }, [students]);

  // Get students for current tab filtered by search
  const displayedStudents = useMemo(() => {
    let list: StudentProfile[] = [];
    switch (activeTab) {
      case 'ACTIVE':
        list = activeStudents;
        break;
      case 'PENDING':
        list = pendingStudents;
        break;
      case 'PASSED':
        list = passedStudents;
        break;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(s => s.full_name?.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query));
    }
    return list;
  }, [activeTab, activeStudents, pendingStudents, passedStudents, searchQuery]);
  const handleOpenDossier = (pupil: StudentProfile) => {
    setActivePupil(pupil);
    setActiveDossierTab('profile');
    setEditForm({
      notes: pupil.notes || '',
      parent_email: pupil.parent_email || '',
      email: pupil.email || '',
      phone: pupil.phone || '',
      address: pupil.address || ''
    });
    setIsEditing(false);
  };
  const handleSaveProfile = () => {
    if (!activePupil) return;
    updateStudentProfile.mutate({
      id: activePupil.id,
      ...editForm
    });
    setActivePupil({
      ...activePupil,
      ...editForm
    });
    setIsEditing(false);
  };
  const handleTopUp = (hours: number) => {
    if (!activePupil) return;
    addCredits.mutate({
      studentId: activePupil.id,
      hours
    });
    setActivePupil({
      ...activePupil,
      credit_balance: (activePupil.credit_balance || 0) + hours
    });
  };
  const handleMarkPassed = () => {
    if (!activePupil) return;
    updateStudentStatus.mutate({
      studentId: activePupil.id,
      status: 'PASSED'
    });
    setActivePupil({
      ...activePupil,
      status: 'PASSED'
    });
  };
  const handleRestoreActive = () => {
    if (!activePupil) return;
    updateStudentStatus.mutate({
      studentId: activePupil.id,
      status: 'ACTIVE'
    });
    setActivePupil({
      ...activePupil,
      status: 'ACTIVE'
    });
  };
  const handleAddNewPupil = () => {
    // Check tier limit before proceeding
    if (isLiteTier && !canAddStudent) {
      setUpgradeReason(`Lite Tier limit reached (${studentLimit} Students). Upgrade to Elite to expand your roster.`);
      setIsUpgradeModalOpen(true);
      return;
    }

    // Navigate to Connection Hub for student onboarding
    onNavigate?.('connection-hub');
  };
  const handleQuickMessage = (e: React.MouseEvent, student: StudentProfile) => {
    e.stopPropagation();
    // Navigate to messages with this student pre-selected
    onNavigate?.('messages');
  };
  const handleSendPinInvite = async (e: React.MouseEvent, student: StudentProfile) => {
    e.stopPropagation();

    // Check tier limit before generating PIN for new students
    if (isLiteTier && !student.onboarded_at && !canAddStudent) {
      setUpgradeReason(`Lite Tier limit reached (${studentLimit} Students). Upgrade to Elite to expand your roster.`);
      setIsUpgradeModalOpen(true);
      return;
    }
    try {
      const pin = await generateStudentSecurePin.mutateAsync(student.user_id);
      // Copy SMS template to clipboard
      const studentName = student.full_name?.split(' ')[0] || 'there';
      const sms = `CRUZI PORTAL: Hi ${studentName}, your instructor has invited you to the academy hub. Your secure PIN is: ${pin}`;
      await navigator.clipboard.writeText(sms);
      toast({
        title: 'PIN Generated & Copied!',
        description: `PIN: ${pin} - SMS template copied to clipboard.`
      });
    } catch (error) {
      toast({
        title: 'Failed to generate PIN',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };
  const handleCopyPin = async (e: React.MouseEvent, student: StudentProfile) => {
    e.stopPropagation();
    if (student.secure_pin) {
      await navigator.clipboard.writeText(student.secure_pin);
      toast({
        title: 'PIN copied to clipboard!'
      });
    }
  };
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">Roster Logic</h1>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Fleet Management System</p>
        </div>
        <button onClick={handleAddNewPupil} className="w-full md:w-auto bg-foreground text-background px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> New Pupil
        </button>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-3 px-2">
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <div>
            <p className="text-lg font-black text-foreground leading-none">{activeStudents.length}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          <div>
            <p className="text-lg font-black text-foreground leading-none">{lowCreditCount}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Low Credit</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div>
            <p className="text-lg font-black text-foreground leading-none">{passedStudents.length}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Passed</p>
          </div>
        </div>
      </div>

      {/* Search + Tabs Filter Bar */}
      <div className="space-y-3 px-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Quick search student name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as StatusTab)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-10">
            <TabsTrigger value="ACTIVE" className="text-[10px] font-bold uppercase tracking-wider">
              Active ({activeStudents.length})
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="text-[10px] font-bold uppercase tracking-wider">
              Pending ({pendingStudents.length})
            </TabsTrigger>
            <TabsTrigger value="PASSED" className="text-[10px] font-bold uppercase tracking-wider">
              Passed ({passedStudents.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* High-Density Student List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mx-2">
        {/* Table Header - Desktop only */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div className="col-span-4">Student</div>
          <div className="col-span-3">Mastery</div>
          <div className="col-span-2">Balance</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* Student Rows */}
        {displayedStudents.length === 0 ? <div className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground">No students in this category</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {activeTab === 'ACTIVE' && 'Use the "New Pupil" button to add your first student'}
              {activeTab === 'PENDING' && 'Students waiting to be approved will appear here'}
              {activeTab === 'PASSED' && 'Celebrate! Students who passed their test appear here'}
            </p>
          </div> : displayedStudents.map(student => {
        const mastery = calculateMastery(student.user_id);
        const balance = student.credit_balance || 0;
        const isLowCredit = balance < 2;
        const level = (student.level || 'BEGINNER') as PupilLevel;
        return <div key={student.id} onClick={() => handleOpenDossier(student)} className="flex items-center gap-3 px-3 py-3 md:px-4 md:grid md:grid-cols-12 md:gap-4 border-b border-border last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors active:bg-muted/50">
                {/* Avatar */}
                <Avatar className="h-10 w-10 rounded-xl shrink-0 md:hidden">
                  <AvatarImage src={student.avatar_url || `https://picsum.photos/80/80?random=${student.id}`} />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(student.full_name)}
                  </AvatarFallback>
                </Avatar>

                {/* Mobile: Name + Level stacked, then Balance + Actions on right */}
                <div className="flex-1 min-w-0 md:hidden">
                  <p className="font-bold text-sm text-foreground truncate">
                    {student.full_name || student.email || 'Unnamed Student'}
                  </p>
                  <LevelBadge level={level} size="sm" className="mt-0.5" />
                </div>

                {/* Mobile: Balance Badge + Actions grouped */}
                <div className="flex items-center gap-2 shrink-0 md:hidden">
                  {/* Onboarding status */}
                  {!student.onboarded_at ? student.secure_pin ? <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={e => handleCopyPin(e, student)}>
                        <Copy className="h-3 w-3" />
                      </Button> : <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={e => handleSendPinInvite(e, student)}>
                        <Key className="h-3 w-3" />
                      </Button> : <UserCheck className="h-4 w-4 text-green-500" />}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${isLowCredit ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                    {isLowCredit && <AlertTriangle className="h-3 w-3" />}
                    <span>{balance}h</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Desktop: Avatar + Name + Level */}
                <div className="hidden md:flex items-center gap-3 md:col-span-4">
                  <Avatar className="h-10 w-10 rounded-xl shrink-0">
                    <AvatarImage src={student.avatar_url || `https://picsum.photos/80/80?random=${student.id}`} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground truncate">
                      {student.full_name || student.email || 'Unnamed Student'}
                    </p>
                    <LevelBadge level={level} size="sm" className="mt-0.5" />
                  </div>
                </div>

                {/* Desktop: Mastery Progress */}
                <div className="hidden md:flex md:col-span-3 items-center gap-2">
                  <div className="flex-1">
                    <Progress value={mastery} className="h-1.5" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground w-10">{mastery}%</span>
                </div>

                {/* Desktop: Balance Badge */}
                <div className="hidden md:block md:col-span-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${isLowCredit ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                    {isLowCredit && <AlertTriangle className="h-3 w-3" />}
                    <span>■</span>
                    <span>{balance}h</span>
                  </div>
                </div>

                {/* Desktop: Actions */}
                <div className="hidden md:flex items-center gap-1 md:col-span-3 justify-end">
                  {/* PIN Invite Button */}
                  {!student.onboarded_at && (student.secure_pin ? <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:text-primary/80" onClick={e => handleCopyPin(e, student)} title={`Copy PIN: ${student.secure_pin}`}>
                        <Copy className="h-4 w-4" />
                      </Button> : <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-500 hover:text-amber-600" onClick={e => handleSendPinInvite(e, student)} disabled={generateStudentSecurePin.isPending} title="Send PIN Invite">
                        {generateStudentSecurePin.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                      </Button>)}
                  {student.onboarded_at && <div className="h-9 w-9 flex items-center justify-center text-green-500" title="Onboarded">
                      <UserCheck className="h-4 w-4" />
                    </div>}
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={e => handleQuickMessage(e, student)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>;
      })}
      </div>
      
      {/* Detailed Profile Modal */}
      {activePupil && <div className="fixed inset-0 z-[150] bg-foreground/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-foreground p-6 md:p-10 text-background flex justify-between items-start shrink-0">
              <div className="flex items-center gap-4 md:gap-8">
                <Avatar className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] ring-4 ring-foreground/80 shadow-2xl">
                  <AvatarImage src={activePupil.avatar_url || `https://picsum.photos/200/200?random=${activePupil.id}`} />
                  <AvatarFallback className="rounded-2xl md:rounded-[2rem] bg-primary text-primary-foreground text-xl font-bold">
                    {getInitials(activePupil.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 md:space-y-2 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <h2 className="text-xl md:text-4xl font-black tracking-tighter text-background truncate">{activePupil.full_name || 'Student'}</h2>
                    <LevelBadge level={(activePupil.level || 'BEGINNER') as PupilLevel} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                    <p className="text-xs md:text-sm font-bold text-primary uppercase tracking-[0.2em]">Student Dossier</p>
                    <div className="flex items-center gap-2 text-green-400">
                      <Wallet className="h-3 w-3" />
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{activePupil.credit_balance || 0}h Banked</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setActivePupil(null)} className="w-10 h-10 md:w-12 md:h-12 bg-background/10 rounded-full flex items-center justify-center text-background hover:bg-destructive transition-all shrink-0">
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="bg-muted flex p-1.5 mx-4 md:mx-12 rounded-xl md:rounded-2xl mt-4 md:mt-8">
              <button onClick={() => setActiveDossierTab('profile')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeDossierTab === 'profile' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground'}`}>
                Profile
              </button>
              <button onClick={() => setActiveDossierTab('wallet')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeDossierTab === 'wallet' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground'}`}>
                Wallet
              </button>
              <button onClick={() => setActiveDossierTab('plans')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeDossierTab === 'plans' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground'}`}>
                Plans
              </button>
              <button onClick={() => setActiveDossierTab('progress')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeDossierTab === 'progress' ? 'bg-card shadow-md text-primary' : 'text-muted-foreground'}`}>
                Medals
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
              
              {activeDossierTab === 'profile' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 animate-in fade-in duration-300">
                  <div className="space-y-6 md:space-y-10">
                    <section className="space-y-4 md:space-y-6">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                        <Mail className="h-4 w-4 text-primary" /> Contact Information
                      </h4>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 md:gap-4 group">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Email</p>
                            {isEditing ? <input type="email" value={editForm.email} onChange={e => setEditForm({
                        ...editForm,
                        email: e.target.value
                      })} className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-bold" /> : <p className="text-xs md:text-sm font-bold text-foreground truncate">{activePupil.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 group">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Phone className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Phone</p>
                            {isEditing ? <input type="tel" value={editForm.phone} onChange={e => setEditForm({
                        ...editForm,
                        phone: e.target.value
                      })} className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-bold" /> : <p className="text-xs md:text-sm font-bold text-foreground">{activePupil.phone || 'Not set'}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 group">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Parent Email</p>
                            {isEditing ? <input type="email" value={editForm.parent_email} onChange={e => setEditForm({
                        ...editForm,
                        parent_email: e.target.value
                      })} className="w-full bg-card border border-border rounded-lg px-2 py-1 text-xs font-bold" /> : <p className="text-xs md:text-sm font-bold text-foreground truncate">{activePupil.parent_email || 'N/A'}</p>}
                          </div>
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4 md:space-y-6">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-green-500" /> Onboarding
                      </h4>
                      <div className="grid grid-cols-1 gap-2 md:gap-3">
                        <div className="p-3 md:p-4 bg-muted rounded-xl md:rounded-2xl flex items-center justify-between border border-border">
                          <span className="text-[10px] md:text-[11px] font-bold text-foreground">License Verified</span>
                          <UserCheck className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="p-3 md:p-4 bg-muted rounded-xl md:rounded-2xl flex items-center justify-between border border-border">
                          <span className="text-[10px] md:text-[11px] font-bold text-foreground">Terms Accepted</span>
                          <UserCheck className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-2 space-y-6 md:space-y-10">
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                      <div className="bg-primary/10 p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-primary/20 relative overflow-hidden">
                        <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest mb-2 md:mb-4">Mastery Curve</p>
                        <h5 className="text-2xl md:text-4xl font-black text-primary leading-none mb-1">{calculateMastery(activePupil.user_id)}%</h5>
                        <p className="text-[9px] md:text-xs font-bold text-foreground/60 uppercase tracking-widest">Syllabus Complete</p>
                      </div>
                      <div className="bg-foreground p-4 md:p-8 rounded-2xl md:rounded-[2rem] text-background flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest mb-2 md:mb-4">Wallet Balance</p>
                          <h5 className="text-2xl md:text-4xl font-black text-background leading-none mb-1">{activePupil.credit_balance || 0}h</h5>
                          <p className="text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Prepaid Remaining</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                          <StickyNote className="h-4 w-4 text-amber-400" /> Instructor Notes
                        </h4>
                        {!isEditing ? <button onClick={() => setIsEditing(true)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Edit Profile</button> : <div className="flex gap-4">
                            <button onClick={() => setIsEditing(false)} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cancel</button>
                            <button onClick={handleSaveProfile} className="text-[10px] font-black text-green-600 uppercase tracking-widest">Save</button>
                          </div>}
                      </div>
                      {isEditing ? <textarea value={editForm.notes} onChange={e => setEditForm({
                  ...editForm,
                  notes: e.target.value
                })} className="w-full h-24 md:h-32 bg-muted border border-border rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm font-medium resize-none" placeholder="Add notes about this student..." /> : <div className="bg-muted p-4 md:p-6 rounded-xl md:rounded-2xl border border-border min-h-[80px] md:min-h-[100px]">
                          <p className="text-xs md:text-sm text-foreground/80 whitespace-pre-wrap">
                            {activePupil.notes || 'No notes yet. Click "Edit Profile" to add notes.'}
                          </p>
                        </div>}
                    </div>
                  </div>
                </div>}

              {activeDossierTab === 'wallet' && <div className="space-y-6 md:space-y-10 animate-in fade-in duration-300">
                  <div className="bg-foreground p-6 md:p-10 rounded-2xl md:rounded-[2rem] text-background text-center">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Current Balance</p>
                    <h3 className="text-4xl md:text-6xl font-black text-background">{activePupil.credit_balance || 0}h</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Prepaid Hours Remaining</p>
                  </div>

                  {/* Custom Pricing Button */}
                  <button onClick={() => {
              setPricingStudent(activePupil);
            }} className="w-full flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-black text-foreground">Custom Pricing</p>
                        <p className="text-[10px] text-muted-foreground">
                          {studentPricingList?.find(p => p.student_id === activePupil.user_id) ? `${studentPricingList.find(p => p.student_id === activePupil.user_id)?.label || 'Custom rate set'}` : 'Set family/friend discount'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Quick Top-Up</h4>
                    <div className="grid grid-cols-4 gap-2 md:gap-3">
                      {[5, 10, 20, 30].map(hours => <button key={hours} onClick={() => handleTopUp(hours)} className="bg-card border border-border p-3 md:p-4 rounded-xl md:rounded-2xl text-center hover:bg-primary/10 hover:border-primary transition-all">
                          <p className="text-lg md:text-2xl font-black text-foreground">{hours}h</p>
                          <p className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Add</p>
                        </button>)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Usage Stats</h4>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-muted p-4 md:p-6 rounded-xl md:rounded-2xl border border-border">
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2" />
                        <p className="text-xl md:text-2xl font-black text-foreground">{activePupil.total_hours || 0}h</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Logged</p>
                      </div>
                      <div className="bg-muted p-4 md:p-6 rounded-xl md:rounded-2xl border border-border">
                        <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary mb-2" />
                        <p className="text-sm md:text-lg font-black text-foreground truncate">{activePupil.next_lesson ? new Date(activePupil.next_lesson).toLocaleDateString() : 'None'}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Lesson</p>
                      </div>
                    </div>
                  </div>
                </div>}

              {activeDossierTab === 'plans' && (
                <PupilPlansTab
                  studentId={activePupil.user_id}
                  studentName={activePupil.full_name || 'Student'}
                  skillProgress={skillProgress}
                  onNavigate={onNavigate}
                />
              )}

              {activeDossierTab === 'progress' && <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                  <div className="text-center p-6 md:p-10">
                    <Award className="h-12 w-12 md:h-16 md:w-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">Medal Case</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">Track achievements and milestones</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-secondary font-light">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-4 md:p-6 rounded-xl md:rounded-2xl border border-amber-500/30 text-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <p className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest">First Lesson</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 md:p-6 rounded-xl md:rounded-2xl border border-green-500/30 text-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
                      </div>
                      <p className="text-[10px] md:text-xs font-black text-foreground uppercase tracking-widest">10 Hours</p>
                    </div>
                    <div className="bg-muted p-4 md:p-6 rounded-xl md:rounded-2xl border border-border text-center opacity-50">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-muted-foreground/30 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                      </div>
                      <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">Mock Pass</p>
                    </div>
                  </div>
                </div>}
            </div>

            {/* Modal Footer - Status Actions */}
            <div className="p-4 md:p-6 border-t border-border bg-muted/50 flex flex-col sm:flex-row gap-3">
              {activePupil.status === 'PASSED' ? <Button variant="outline" onClick={handleRestoreActive} className="flex-1 text-[10px] font-black uppercase tracking-widest">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Restore to Active
                </Button> : <Button variant="outline" onClick={handleMarkPassed} className="flex-1 text-[10px] font-black uppercase tracking-widest text-green-600 border-green-600/30 hover:bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Passed
                </Button>}
              <Button onClick={() => onNavigate?.('core-skills')} className="flex-1 text-[10px] font-black uppercase tracking-widest">
                <GraduationCap className="h-4 w-4 mr-2" />
                Plan Next Lesson
              </Button>
            </div>
          </div>
        </div>}

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} reason={upgradeReason} />

      {/* Student Pricing Modal */}
      <StudentPricingModal isOpen={!!pricingStudent} onClose={() => setPricingStudent(null)} student={pricingStudent} />
    </div>;
};
export default InstructorPupils;