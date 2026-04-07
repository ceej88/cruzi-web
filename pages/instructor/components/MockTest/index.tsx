import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { DVSA_CATEGORIES } from '@/constants';
import { parseVoiceCommand } from '@/services/instructorAIService';
import { ScoringCard } from './ScoringCard';
import {
  ChevronLeft,
  Mic,
  Search,
  RotateCcw,
  CloudUpload,
  Clock,
  Loader2,
  ChevronDown,
  Bell,
  MoreVertical,
} from 'lucide-react';

interface DL25FaultMarker {
  category: string;
  minors: number;
  serious: boolean;
  dangerous: boolean;
  etaPhysical: boolean;
  etaVerbal: boolean;
}

interface InstructorMockTestProps {
  setActiveTab?: (tab: string) => void;
}

const triggerHaptic = () => {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

const InstructorMockTest: React.FC<InstructorMockTestProps> = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, mockTests, saveMockTest, isLoading } = useInstructorData();
  const [viewMode, setViewMode] = useState<'marking' | 'history'>('marking');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  // Set default selected student
  React.useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].user_id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(() => 
    students.find(p => p.user_id === selectedStudentId) || students[0]
  , [students, selectedStudentId]);

  const [markers, setMarkers] = useState<Record<string, DL25FaultMarker>>(
    DVSA_CATEGORIES.reduce((acc, cat) => ({
      ...acc,
      [cat]: { 
        category: cat, 
        minors: 0, 
        serious: false, 
        dangerous: false,
        etaPhysical: false,
        etaVerbal: false
      }
    }), {})
  );

  const stats = useMemo(() => {
    const values = Object.values(markers) as DL25FaultMarker[];
    const totalMinors = values.reduce((sum, m) => sum + m.minors, 0);
    const hasSerious = values.some(m => m.serious);
    const hasDangerous = values.some(m => m.dangerous);
    const seriousCount = values.filter(m => m.serious).length;
    const dangerousCount = values.filter(m => m.dangerous).length;
    const passed = totalMinors <= 15 && !hasSerious && !hasDangerous;
    
    return { totalMinors, seriousCount, dangerousCount, hasSerious, hasDangerous, passed };
  }, [markers]);

  const updateFault = (category: string, updates: Partial<DL25FaultMarker>) => {
    setMarkers(prev => ({
      ...prev,
      [category]: { ...prev[category], ...updates }
    }));
  };

  const handleBack = () => {
    triggerHaptic();
    navigate('/instructor');
  };

  const handleSaveResult = () => {
    triggerHaptic();
    if (!user?.id || !selectedStudentId) return;
    
    saveMockTest.mutate({
      instructor_id: user.id,
      student_id: selectedStudentId,
      date: new Date().toISOString(),
      markers: Object.values(markers),
      total_minors: stats.totalMinors,
      has_serious: stats.hasSerious,
      has_dangerous: stats.hasDangerous,
      passed: stats.passed,
      notes: null,
    });
    
    handleResetNoConfirm();
    setViewMode('history');
  };

  const handleResetNoConfirm = () => {
    setMarkers(DVSA_CATEGORIES.reduce((acc, cat) => ({
      ...acc,
      [cat]: { 
        category: cat, 
        minors: 0, 
        serious: false, 
        dangerous: false,
        etaPhysical: false,
        etaVerbal: false
      }
    }), {}));
  };

  const handleReset = () => {
    triggerHaptic();
    if (!confirm("Are you sure you want to reset this test?")) return;
    handleResetNoConfirm();
  };

  const handleVoiceMark = async () => {
    if (!voiceInput.trim()) return;
    triggerHaptic();
    setIsProcessingVoice(true);
    try {
      const result = await parseVoiceCommand(voiceInput, DVSA_CATEGORIES);
      if (result && markers[result.category]) {
        const current = markers[result.category];
        if (result.type === 'minor') updateFault(result.category, { minors: current.minors + result.count });
        if (result.type === 'serious') updateFault(result.category, { serious: true });
        if (result.type === 'dangerous') updateFault(result.category, { dangerous: true });
        setVoiceInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const filteredCategories = DVSA_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStudentForMockTest = (studentId: string) => {
    return students.find(s => s.user_id === studentId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3 pt-safe">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="h-12 w-12 flex items-center justify-center text-muted-foreground bg-card shadow-sm border border-border rounded-2xl active:scale-95 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-base font-black tracking-tighter leading-none bg-gradient-to-r from-[hsl(var(--neural-violet))] via-[hsl(var(--neural-purple))] to-[hsl(var(--neural-teal))] bg-clip-text text-transparent">
                Cruzi
              </span>
              <span className="uppercase tracking-widest leading-none mt-0.5 text-muted-foreground font-bold text-[9px]">
                V4.5
              </span>
            </div>
            <div className="w-12" />
          </div>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground px-6">
          <p className="text-lg font-bold">No students linked yet</p>
          <p className="text-sm text-center mt-2">Students will appear here once they connect via PIN</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {viewMode === 'marking' ? (
        <>
          {/* Premium Sticky Summary Bar */}
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3 pt-safe">
            <div className="flex items-center justify-between gap-3">
              {/* Back Button */}
              <button 
                onClick={handleBack}
                className="h-12 w-12 flex-shrink-0 flex items-center justify-center text-muted-foreground bg-card shadow-sm border border-border rounded-2xl active:scale-95 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Stats Row */}
              <div className="flex items-center gap-3 md:gap-6">
                <div className="text-center">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">MINORS</p>
                  <p className={`text-xl md:text-2xl font-black leading-none mt-1 ${stats.totalMinors > 15 ? 'text-destructive' : 'text-foreground'}`}>
                    {stats.totalMinors}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">SERIOUS</p>
                  <p className={`text-xl md:text-2xl font-black leading-none mt-1 ${stats.seriousCount > 0 ? 'text-amber-500' : 'text-muted-foreground/30'}`}>
                    {stats.seriousCount}
                  </p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">DANGER</p>
                  <p className={`text-xl md:text-2xl font-black leading-none mt-1 ${stats.dangerousCount > 0 ? 'text-destructive' : 'text-muted-foreground/30'}`}>
                    {stats.dangerousCount}
                  </p>
                </div>
              </div>

              {/* Pass/Fail Pill */}
              <div className={`px-5 md:px-8 py-3 md:py-3.5 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg ${
                stats.passed ? 'bg-green-500 shadow-green-500/20' : 'bg-destructive shadow-destructive/20'
              }`}>
                <span className="font-black tracking-[0.15em] text-sm uppercase leading-none">
                  {stats.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 py-6 space-y-6">
              {/* Student Selector Card */}
              <div className="bg-card rounded-[2rem] p-5 shadow-xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-background bg-gradient-to-br from-[hsl(var(--neural-violet))] to-[hsl(var(--neural-purple))]">
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedStudent?.full_name || 'Student'}`} 
                      className="w-full h-full object-cover" 
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStudentId}
                        onChange={(e) => {
                          triggerHaptic();
                          setSelectedStudentId(e.target.value);
                        }}
                        className="text-lg font-black text-foreground bg-transparent border-none p-0 focus:ring-0 cursor-pointer appearance-none"
                      >
                        {students.map(p => (
                          <option key={p.user_id} value={p.user_id}>
                            {p.full_name || 'Student'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                      {selectedStudent?.level?.replace('_', ' ') || 'Beginner'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleReset} 
                  className="h-12 w-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center active:rotate-180 transition-all duration-500"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Voice Command Input */}
              <div className="bg-foreground p-4 rounded-[2rem] shadow-xl flex items-center gap-3">
                <Mic className="h-5 w-5 text-muted flex-shrink-0" />
                <input 
                  type="text" 
                  value={voiceInput}
                  onChange={(e) => setVoiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVoiceMark()}
                  placeholder='Voice command: "Add a minor..."'
                  className="flex-1 bg-transparent border-none text-sm text-background placeholder-muted focus:ring-0 focus:outline-none"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search DL25 Category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-card border border-border rounded-[1.75rem] text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Scoring Categories */}
              <div className="space-y-4">
                {filteredCategories.map((cat) => (
                  <ScoringCard
                    key={cat}
                    title={cat}
                    data={markers[cat]}
                    onUpdate={(updates) => updateFault(cat, updates)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Save FAB - Left side */}
          <button 
            onClick={handleSaveResult}
            className="fixed bottom-24 left-6 w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-2xl active:scale-90 transition-all z-40"
          >
            <CloudUpload className="h-5 w-5" />
          </button>

        </>
      ) : (
        <>
          {/* History View Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3 pt-safe">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="h-12 w-12 flex items-center justify-center text-muted-foreground bg-card shadow-sm border border-border rounded-2xl active:scale-95 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-base font-black tracking-tighter leading-none bg-gradient-to-r from-[hsl(var(--neural-violet))] via-[hsl(var(--neural-purple))] to-[hsl(var(--neural-teal))] bg-clip-text text-transparent">
                  Cruzi
                </span>
                <span className="uppercase tracking-widest leading-none mt-0.5 text-muted-foreground font-bold text-[9px]">
                  V4.5
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="h-11 w-11 flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="h-11 w-11 flex items-center justify-center text-muted-foreground active:scale-95 transition-all">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {/* History Content */}
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 py-6 space-y-6">
              {/* View Toggle */}
              <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Test History</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-1">Historical Mock Performance</p>
                  </div>
                </div>
                <div className="flex bg-muted p-1 rounded-2xl">
                  <button 
                    onClick={() => {
                      triggerHaptic();
                      setViewMode('marking');
                    }} 
                    className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      viewMode !== 'history' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Marking
                  </button>
                  <button 
                    onClick={() => {
                      triggerHaptic();
                      setViewMode('history');
                    }} 
                    className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                      viewMode === 'history' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>

              {mockTests.length === 0 ? (
                <div className="bg-card rounded-[2rem] p-16 text-center border-4 border-dashed border-border">
                  <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-black text-lg">No test archives found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockTests.map((res) => {
                    const student = getStudentForMockTest(res.student_id);
                    return (
                      <div key={res.id} className="bg-card rounded-[2rem] p-6 shadow-xl border border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border-2 border-background bg-gradient-to-br from-[hsl(var(--neural-violet))] to-[hsl(var(--neural-purple))]">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${student?.full_name || 'Student'}`} 
                              className="w-full h-full object-cover" 
                              alt="Avatar"
                            />
                          </div>
                          <div>
                            <p className="text-lg font-black text-foreground">{student?.full_name || 'Student'}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(res.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Minors</p>
                            <p className="text-xl font-black text-foreground">{res.total_minors}</p>
                          </div>
                          <div className={`px-4 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-widest ${
                            res.passed ? 'bg-green-500' : 'bg-destructive'
                          }`}>
                            {res.passed ? 'PASS' : 'FAIL'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstructorMockTest;
