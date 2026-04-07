import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { CORE_SKILLS_GROUPS } from '@/constants';
import { normalizeTopicName } from '@/hooks/useUnifiedSkillProgress';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, Check, Wand2, Loader2, Mail, Send, LayoutDashboard, Calendar, Rocket, Bot, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import LessonPlanPreviewModal from '@/components/instructor/LessonPlanPreviewModal';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
// LEVELS array aligned with DVSA official proficiency scale (1-5)
const LEVELS = [
  { val: 1, label: 'Introduced', color: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' },
  { val: 2, label: 'Helped', color: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600' },
  { val: 3, label: 'Prompted', color: 'bg-violet-200 dark:bg-violet-900/30', text: 'text-violet-700' },
  { val: 4, label: 'Independent', color: 'bg-green-400', text: 'text-white' },
  { val: 5, label: 'Reflection', color: 'bg-green-600', text: 'text-white' }
];

// Mastery calculation (unified with Neural Scribe - 38 skills × 5 levels = 190 max points)
const calculateMasteryPercent = (skills: Record<string, number>): number => {
  const totalSkills = CORE_SKILLS_GROUPS.reduce((sum, g) => sum + g.skills.length, 0);
  const maxPoints = totalSkills * 5;
  const earnedPoints = Object.values(skills).reduce((sum, level) => sum + level, 0);
  return Math.round((earnedPoints / maxPoints) * 100);
};

// Detect milestone crossings (25%, 50%, 75%, 90%)
const detectMilestone = (before: number, after: number): string | null => {
  const thresholds = [90, 75, 50, 25];
  for (const t of thresholds) {
    if (before < t && after >= t) return `${t}%`;
  }
  return null;
};

const InstructorCoreSkills: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { students, skillProgress, updateSkillProgress, isLoading, refresh } = useInstructorData();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  const [flashingSkills, setFlashingSkills] = useState<string[]>([]);
  
  // Skill notes state - tracks which skill has its notes input open and the draft text
  const [activeNoteSkill, setActiveNoteSkill] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Lesson Plan Modal state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planSkills, setPlanSkills] = useState<string[]>([]);
  const [planSentState, setPlanSentState] = useState<'idle' | 'sent'>('idle');

  // Fetch instructor profile for name (used in parent emails)
  const [instructorName, setInstructorName] = useState<string>('Your instructor');
  React.useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setInstructorName(data.full_name || data.email || 'Your instructor');
          }
        });
    }
  }, [user?.id]);

  // Set default selected student
  React.useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].user_id);
    }
  }, [students, selectedStudentId]);

  // Reset "plan sent" flag when student changes
  React.useEffect(() => {
    setPlanSentState('idle');
  }, [selectedStudentId]);

  // Listen for Cruzi voice skill updates
  React.useEffect(() => {
    const handleSkillUpdate = (e: CustomEvent<{ studentId: string; updates: { topic: string; level: number }[] }>) => {
      // Only flash if it's for the currently selected student
      if (e.detail.studentId === selectedStudentId) {
        const topicNames = e.detail.updates.map(u => u.topic);
        setFlashingSkills(topicNames);
        
        // Refetch skill progress to show updated data
        refresh();
        
        // Clear flash after 2 seconds
        setTimeout(() => setFlashingSkills([]), 2000);
      }
    };
    
    window.addEventListener('cruzi:skill-updated', handleSkillUpdate as EventListener);
    return () => window.removeEventListener('cruzi:skill-updated', handleSkillUpdate as EventListener);
  }, [selectedStudentId, refresh]);

  const selectedStudent = useMemo(() => 
    students.find(p => p.user_id === selectedStudentId) || students[0]
  , [students, selectedStudentId]);

  const currentSkills = useMemo(() => {
    const skills: Record<string, number> = {};
    skillProgress
      .filter(s => s.student_id === selectedStudentId)
      .forEach(s => {
        const canonical = normalizeTopicName(s.topic);
        const key = canonical || s.topic;
        // Keep the highest level if multiple records map to the same canonical name
        skills[key] = Math.max(skills[key] || 0, s.level);
      });
    return skills;
  }, [skillProgress, selectedStudentId]);

  // Build existing skill notes lookup
  const currentSkillNotes = useMemo(() => {
    const notes: Record<string, string> = {};
    skillProgress
      .filter(s => s.student_id === selectedStudentId && s.notes)
      .forEach(s => {
        const canonical = normalizeTopicName(s.topic);
        notes[canonical || s.topic] = s.notes!;
      });
    return notes;
  }, [skillProgress, selectedStudentId]);

  const allSkills = useMemo(() => CORE_SKILLS_GROUPS.flatMap(g => g.skills), []);

  const readinessScore = useMemo(() => {
    const skillValues = Object.values(currentSkills);
    const totalSkills = allSkills.length;
    
    const l4Count = skillValues.filter(v => v === 4).length;
    const l5Count = skillValues.filter(v => v === 5).length;
    
    const rawReadiness = ((l4Count * 0.75) + (l5Count * 1.0)) / totalSkills;
    const hourBoost = (selectedStudent?.total_hours || 0) * 0.02;
    const score = Math.min(100, Math.round((rawReadiness + hourBoost) * 100));
    return score;
  }, [currentSkills, allSkills, selectedStudent]);

  const completionPercentage = useMemo(() => {
    const completedCount = Object.values(currentSkills).filter(v => v >= 4).length;
    return Math.round((completedCount / allSkills.length) * 100);
  }, [currentSkills, allSkills]);

  const filteredGroups = useMemo(() => {
    return CORE_SKILLS_GROUPS.map(group => ({
      ...group,
      skills: group.skills.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(group => group.skills.length > 0);
  }, [searchQuery]);

  // Send parent update email via edge function
  const sendParentEmail = async (params: {
    studentName: string;
    parentEmail: string;
    instructorName: string;
    progressPercentage: number;
    skillsWorked: { topic: string; level: number }[];
    reflectiveLog: string;
    nextFocus: string;
    milestone?: string;
  }) => {
    try {
      const { error } = await supabase.functions.invoke('send-parent-update', {
        body: params,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to send parent email:', err);
      return false;
    }
  };

  // Get all skills needing work (Level 1-3) for the selected student
  const allSkillsNeedingWork = useMemo(() => {
    return allSkills.filter(skill => {
      const level = currentSkills[skill] || 0;
      return level > 0 && level <= 3;
    });
  }, [allSkills, currentSkills]);

  // Open the lesson plan modal with selected skills
  const openPlanModal = (skills: string[]) => {
    if ('vibrate' in navigator) navigator.vibrate(20);
    setPlanSkills(skills);
    setShowPlanModal(true);
  };

  // Handle plan submission from modal
  const handlePlanSubmit = async (title: string, summary: string) => {
    if (!user?.id || !selectedStudentId) return;
    
    const { error } = await supabase.from('shared_plans').insert({
      instructor_id: user.id,
      student_id: selectedStudentId,
      title,
      objective: planSkills.length === 1 
        ? `Improve ${planSkills[0]} proficiency from current level to next stage`
        : `Improve proficiency: ${planSkills.join(', ')}`,
      student_summary: summary,
      bundled_skills: planSkills,
    });
    
    if (error) throw error;
    setPlanSentState('sent');
    setTimeout(() => setPlanSentState('idle'), 3500);
    toast.success('Lesson plan sent to student!', {
      description: `${selectedStudent?.full_name} will see this in their Learning Path`,
    });
  };

  const handleUpdateSkill = async (skill: string, level: number) => {
    if (!selectedStudentId || updatingSkill) return;
    
    setUpdatingSkill(skill);
    
    try {
      // Calculate mastery before update
      const beforeMastery = calculateMasteryPercent(currentSkills);
      
      // Execute the skill update
      await updateSkillProgress.mutateAsync({
        student_id: selectedStudentId,
        topic: skill,
        level,
      });
      
      // Calculate mastery after update
      const updatedSkills = { ...currentSkills, [skill]: level };
      const afterMastery = calculateMasteryPercent(updatedSkills);
      
      // Check for milestone crossing
      const milestone = detectMilestone(beforeMastery, afterMastery);
      
      // Get level label for feedback
      const levelLabel = LEVELS.find(l => l.val === level)?.label || `Level ${level}`;
      
      // Send parent email if parent_email is configured and milestone reached
      if (selectedStudent?.parent_email && milestone) {
        const emailSent = await sendParentEmail({
          studentName: selectedStudent.full_name || 'Student',
          parentEmail: selectedStudent.parent_email,
          instructorName,
          progressPercentage: afterMastery,
          skillsWorked: [{ topic: skill, level }],
          reflectiveLog: `${skill} updated to ${levelLabel}`,
          nextFocus: skill,
          milestone,
        });
        
        if (emailSent) {
          toast.success(`🎉 ${milestone} milestone reached! Parent notified.`, {
            description: `${skill} → ${levelLabel}`,
            duration: 3000,
          });
        } else {
          toast.success(`🎉 ${milestone} milestone reached!`, {
            description: `${skill} → ${levelLabel}`,
            duration: 3000,
          });
        }
      } else {
        // Simple confirmation toast - no action button
        toast.success(`${skill} → ${levelLabel}`, {
          duration: 2000,
        });
      }
      
      // Open notes input for this skill after scoring
      setActiveNoteSkill(skill);
      setNoteText(currentSkillNotes[skill] || '');
    } catch (err) {
      console.error('Failed to update skill:', err);
      toast.error('Failed to update skill', {
        description: 'Please try again',
      });
    } finally {
      setUpdatingSkill(null);
    }
  };

  // Save a note for the active skill
  const handleSaveNote = async () => {
    if (!activeNoteSkill || !selectedStudentId) return;
    const trimmed = noteText.trim();
    
    try {
      await updateSkillProgress.mutateAsync({
        student_id: selectedStudentId,
        topic: activeNoteSkill,
        level: currentSkills[activeNoteSkill] || 1,
        notes: trimmed || undefined,
      });
      if (trimmed) {
        toast.success('Note saved', { duration: 1500 });
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
    setActiveNoteSkill(null);
    setNoteText('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg font-bold">No students linked yet</p>
        <p className="text-sm">Students will appear here once they connect via PIN</p>
      </div>
    );
  }

  const mobileNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'diary', icon: Calendar, label: 'Diary' },
    { id: 'growth-lab', icon: Rocket, label: 'Growth' },
    { id: 'admin-helper', icon: Bot, label: 'Admin' },
  ];

  const handleNavChange = (tab: string) => {
    const path = tab === 'dashboard' ? '/instructor' : `/instructor/${tab}`;
    navigate(path);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background lg:relative lg:inset-auto">
      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain pb-4">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pt-safe">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4 pt-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">Syllabus Matrix</h1>
          <p className="text-muted-foreground font-bold text-xs md:text-sm uppercase tracking-widest mt-1">
            DVSA Scoring Matrix (1-5). Target: <span className="text-green-600">Level 4+</span>.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <GlassCard className="flex items-center p-4 min-w-[200px]">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-black text-xs mr-4 shadow-lg">
              {readinessScore}%
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Pass Chance</p>
              <p className="text-sm font-black text-foreground leading-none">Ready</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center p-4 min-w-[200px]">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-xs mr-4 shadow-lg">
              {completionPercentage}%
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Mastery</p>
              <p className="text-sm font-black text-foreground leading-none">Syllabus</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Student & Search Selector */}
      <div className="bg-foreground rounded-[3rem] p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 mx-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.75rem] overflow-hidden ring-4 ring-foreground/80 shadow-2xl">
            <img src={`https://picsum.photos/200/200?random=${selectedStudentId}`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <select 
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-background font-black text-xl md:text-2xl border-none p-0 focus:ring-0 cursor-pointer hover:text-primary transition-colors appearance-none pr-8"
            >
              {students.map(p => <option key={p.user_id} value={p.user_id} className="text-foreground">{p.full_name || 'Student'}</option>)}
            </select>
            <div className="flex items-center gap-3">
              <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em]">{selectedStudent?.level?.replace('_', ' ') || 'Beginner'}</span>
              <span className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em]">{selectedStudent?.total_hours || 0}H Logged</span>
              {selectedStudent?.parent_email && (
                <span className="text-green-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5" /> Parent linked
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-background/20" />
          <input 
            type="text"
            placeholder="Search core skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/5 border border-background/10 rounded-2xl py-4 pl-16 pr-6 text-background placeholder-background/20 focus:ring-2 focus:ring-primary outline-none transition-all text-xs md:text-sm font-bold"
          />
        </div>
      </div>

      {/* Grouped Skills List */}
      <div className="space-y-12 px-4">
        {filteredGroups.map((group) => (
          <div key={group.category} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px bg-border flex-1"></div>
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">{group.category}</h2>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.skills.map((skill) => {
                const currentLevel = currentSkills[skill] || 0;
                const isCompleted = currentLevel >= 4;
                const isUpdating = updatingSkill === skill;
                const needsFocus = currentLevel > 0 && currentLevel <= 3;
                const isFlashing = flashingSkills.includes(skill);
                
                return (
                  <GlassCard key={skill} className={`p-6 md:p-8 transition-all duration-500 group relative ${isCompleted ? 'border-green-500/30 shadow-xl shadow-green-500/10' : ''} ${isUpdating ? 'opacity-70' : ''} ${isFlashing ? 'animate-pulse ring-4 ring-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.4)]' : ''}`}>
                    
                    {isCompleted && (
                      <div className="absolute top-6 right-8">
                        <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className={`text-lg md:text-xl font-black tracking-tight leading-tight mb-1 ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>
                        {skill}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {currentLevel === 0 ? 'Not Scored' : LEVELS.find(l => l.val === currentLevel)?.label || `Level ${currentLevel}`}
                        </span>
                      </div>
                    </div>

                    {/* Scoring Row (1-5) */}
                    <div className="flex justify-between items-center gap-2">
                      {LEVELS.map((level) => {
                        const isSelected = currentLevel === level.val;
                        return (
                          <button
                            key={level.val}
                            onClick={() => handleUpdateSkill(skill, level.val)}
                            disabled={isUpdating}
                            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all ${
                              isSelected 
                                ? `${level.val >= 4 ? 'bg-green-500 text-white' : 'bg-foreground text-background'} shadow-lg scale-105 z-10` 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            } ${isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {isUpdating && updatingSkill === skill ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span className="text-base font-black leading-none">{level.val}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Notes Input - appears after scoring */}
                    {activeNoteSkill === skill && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(); }}
                            placeholder="Add a quick note (optional)..."
                            className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-xs font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveNote}
                            className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setActiveNoteSkill(null); setNoteText(''); }}
                            className="px-2 py-2 text-muted-foreground hover:text-foreground text-[10px] font-bold"
                          >
                            Skip
                          </button>
                        </div>
                        {currentSkillNotes[skill] && noteText === '' && (
                          <p className="text-[10px] text-muted-foreground italic mt-1 ml-1">
                            Previous: "{currentSkillNotes[skill]}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Existing note indicator (when not editing) */}
                    {activeNoteSkill !== skill && currentSkillNotes[skill] && (
                      <button
                        onClick={() => { setActiveNoteSkill(skill); setNoteText(currentSkillNotes[skill]); }}
                        className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <StickyNote className="h-3 w-3" />
                        <span className="italic truncate max-w-[200px]">"{currentSkillNotes[skill]}"</span>
                      </button>
                    )}

                    <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                      <div className="flex gap-1.5 shrink-0">
                        {[1, 2, 3, 4, 5].map(dot => (
                          <div key={dot} className={`w-1.5 h-1.5 rounded-full ${currentLevel >= dot ? (dot >= 4 ? 'bg-green-400' : 'bg-primary') : 'bg-muted'}`}></div>
                        ))}
                      </div>
                      
                      <button className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-2 transition-all px-3 py-2 hover:bg-primary/10 rounded-xl">
                        <Wand2 className="h-3 w-3" />
                        Focus AI
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button - Create Lesson Plan */}
      {allSkillsNeedingWork.length > 0 && (
        <button
          onClick={() => planSentState === 'idle' && openPlanModal(allSkillsNeedingWork)}
          className={cn(
            "fixed bottom-24 right-4 z-40 flex items-center gap-2 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm transition-all duration-500 touch-manipulation",
            planSentState === 'sent'
              ? "bg-emerald-500 text-white shadow-emerald-500/30 scale-105"
              : "bg-primary text-primary-foreground shadow-primary/30 active:scale-95"
          )}
          disabled={planSentState === 'sent'}
        >
          {planSentState === 'sent' ? (
            <>
              <Check className="h-5 w-5" />
              <span>Plan Sent ✓</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Plan {allSkillsNeedingWork.length} Skill{allSkillsNeedingWork.length > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      )}

      </div>{/* end max-w-6xl */}
      </main>{/* end scrollable */}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <MobileBottomNav 
          items={mobileNavItems} 
          activeTab="core-skills" 
          onTabChange={handleNavChange} 
        />
      </div>

      {/* Lesson Plan Preview Modal */}
      <LessonPlanPreviewModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        studentName={selectedStudent?.full_name || 'Student'}
        studentAvatar={`https://picsum.photos/200/200?random=${selectedStudentId}`}
        skills={planSkills}
        onSubmit={handlePlanSubmit}
      />
    </div>
  );
};

export default InstructorCoreSkills;
