import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, Phone, MessageSquare, Navigation, Pencil, Trash2, Check, User, Star, Search, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Lesson, LessonTypeEnum, StudentProfile } from '@/hooks/useInstructorData';
import { useInstructorData } from '@/hooks/useInstructorData';
import { checkLessonConflicts, CONFLICT_WARNING } from '@/utils/conflictDetector';
import { CORE_SKILLS_GROUPS } from '@/constants';
import { normalizeTopicName, CanonicalTopic } from '@/hooks/useUnifiedSkillProgress';
import { LESSON_COLORS, getLessonColorConfig, LessonColor } from '@/constants/lessonColors';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Config ──────────────────────────────────────────────────────
const GAP_AWAY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  gap: { label: 'Break', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
  away: { label: 'Away', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
};

const DURATION_OPTIONS = [30, 60, 90, 120];
const QUICK_TOPICS = ['Roundabouts', 'Parking', 'Junctions', 'Motorways', 'Manoeuvres', 'Test Prep', 'Bay Parking', 'Parallel Park'];
const LEVEL_LABELS = ['', 'Intro', 'Guided', 'Prompted', 'Independent', 'Mastered'];

// ─── Types ───────────────────────────────────────────────────────
type SheetMode = 'preview' | 'edit' | 'scoring';

interface LessonDetailsSheetProps {
  lesson: Lesson | null;
  student: StudentProfile | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Lesson>) => void;
  onDelete: () => void;
  onNavigate: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

// ─── Scoring Sub-component ───────────────────────────────────────
const SkillScoringPanel: React.FC<{
  studentId: string;
  lessonTopic?: string | null;
  onDone: () => void;
}> = ({ studentId, lessonTopic, onDone }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [skillSearch, setSkillSearch] = useState('');
  const [localSkills, setLocalSkills] = useState<Record<string, number>>({});
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      const { data, error } = await supabase
        .from('skill_progress')
        .select('topic, level')
        .eq('student_id', studentId);

      if (!error && data) {
        const map: Record<string, number> = {};
        for (const record of data) {
          const canonical = normalizeTopicName(record.topic);
          if (canonical) {
            map[canonical] = Math.max(map[canonical] || 0, record.level);
          }
        }
        setLocalSkills(map);
      }
      setIsLoadingSkills(false);
    };
    fetchSkills();
  }, [studentId]);

  const handleSetLevel = useCallback(async (topic: CanonicalTopic, level: number) => {
    if (!user?.id) return;
    setUpdatingSkill(topic);
    setLocalSkills(prev => ({ ...prev, [topic]: level }));

    try {
      const { data: existing } = await supabase
        .from('skill_progress')
        .select('id')
        .eq('student_id', studentId)
        .eq('topic', topic)
        .maybeSingle();

      if (existing) {
        await supabase.from('skill_progress')
          .update({ level, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('skill_progress')
          .insert({ student_id: studentId, instructor_id: user.id, topic, level });
      }

      queryClient.invalidateQueries({ queryKey: ['unified-instructor-skills', studentId] });
      queryClient.invalidateQueries({ queryKey: ['unified-student-skills'] });
      toast.success(`${topic}: Level ${level}`, { duration: 1500 });
    } catch {
      setLocalSkills(prev => ({ ...prev, [topic]: prev[topic] || 0 }));
      toast.error('Failed to save skill');
    } finally {
      setUpdatingSkill(null);
    }
  }, [user?.id, studentId, queryClient]);

  const highlightTopic = lessonTopic ? normalizeTopicName(lessonTopic) : null;
  const searchLower = skillSearch.toLowerCase();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="relative shrink-0 pb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 -mt-1.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={skillSearch}
          onChange={(e) => setSkillSearch(e.target.value)}
          className="pl-10 min-h-[44px] text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {isLoadingSkills ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading skills...</div>
        ) : (
          CORE_SKILLS_GROUPS.map(group => {
            const filteredSkills = group.skills.filter(s =>
              !searchLower || s.toLowerCase().includes(searchLower)
            );
            if (filteredSkills.length === 0) return null;

            return (
              <div key={group.category}>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                  {group.category}
                </p>
                <div className="space-y-1.5">
                  {filteredSkills.map(skill => {
                    const currentLevel = localSkills[skill] || 0;
                    const isHighlighted = highlightTopic === skill;
                    const isUpdating = updatingSkill === skill;

                    return (
                      <div
                        key={skill}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          isHighlighted ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-muted/30'
                        }`}
                      >
                        <span className={`text-xs font-semibold flex-1 min-w-0 truncate ${
                          isUpdating ? 'opacity-50' : ''
                        }`}>
                          {skill}
                        </span>
                        <div className="flex gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <button
                              key={lvl}
                              onClick={() => {
                                if (navigator.vibrate) navigator.vibrate(10);
                                handleSetLevel(skill as CanonicalTopic, lvl);
                              }}
                              disabled={isUpdating}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-90 ${
                                currentLevel >= lvl
                                  ? lvl >= 4
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                              style={{ touchAction: 'manipulation' }}
                              title={LEVEL_LABELS[lvl]}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="shrink-0 pt-3">
        <Button
          onClick={onDone}
          className="w-full min-h-[48px] font-bold gap-2"
          style={{ touchAction: 'manipulation' }}
        >
          <Check className="h-4 w-4" />
          Done
        </Button>
      </div>
    </div>
  );
};

// ─── Edit Mode with Conflict Detection ───────────────────────────
const EditModeWithConflict: React.FC<{
  lesson: Lesson;
  editedLesson: Partial<Lesson> & { color?: string | null };
  setEditedLesson: React.Dispatch<React.SetStateAction<Partial<Lesson> & { color?: string | null }>>;
  handleSave: () => void;
  handleCancel: () => void;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dateInputValue: string;
  timeInputValue: string;
  isUpdating: boolean;
}> = ({ lesson, editedLesson, setEditedLesson, handleSave, handleCancel, handleDateChange, handleTimeChange, dateInputValue, timeInputValue, isUpdating }) => {
  const { lessons } = useInstructorData();

  const conflictResult = useMemo(() => {
    const editedDate = new Date(editedLesson.scheduled_at || lesson.scheduled_at);
    const dur = editedLesson.duration_minutes || lesson.duration_minutes;
    return checkLessonConflicts(editedDate, dur, lessons, lesson.id);
  }, [editedLesson.scheduled_at, editedLesson.duration_minutes, lesson, lessons]);

  return (
    <div className="space-y-4">
      {/* Date Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="date" value={dateInputValue} onChange={handleDateChange} className="pl-10 min-h-[48px] text-base" />
        </div>
      </div>

      {/* Time Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="time" value={timeInputValue} onChange={handleTimeChange} className="pl-10 min-h-[48px] text-base" />
        </div>
      </div>

      {/* Conflict Warning */}
      {conflictResult.hasConflict && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{CONFLICT_WARNING}</p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">You can still save — this is advisory only</p>
          </div>
        </div>
      )}

      {/* Duration Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration</label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map(dur => (
            <button
              key={dur}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setEditedLesson(prev => ({ ...prev, duration_minutes: dur }));
              }}
              className={`min-h-[48px] rounded-xl font-bold text-sm transition-all active:scale-95 ${
                editedLesson.duration_minutes === dur
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {dur >= 60 ? `${dur / 60}h` : `${dur}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Colour Picker (replaces lesson type) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Colour</label>
        <div className="flex gap-3">
          {LESSON_COLORS.map(c => {
            const isSelected = (editedLesson.color || 'purple') === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  setEditedLesson(prev => ({ ...prev, color: c.id }));
                }}
                className={`w-12 h-12 rounded-full transition-all active:scale-90 ${
                  isSelected ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex, touchAction: 'manipulation' }}
                aria-label={c.id}
              />
            );
          })}
        </div>
      </div>

      {/* Topic Input with Quick Picks */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Topic</label>
        <Input
          type="text"
          placeholder="Enter topic..."
          value={editedLesson.topic || ''}
          onChange={(e) => setEditedLesson(prev => ({ ...prev, topic: e.target.value }))}
          className="min-h-[48px] text-base"
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setEditedLesson(prev => ({ ...prev, topic }));
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 ${
                editedLesson.topic === topic
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={handleCancel} className="flex-1 min-h-[48px] font-bold" style={{ touchAction: 'manipulation' }}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isUpdating} className="flex-1 min-h-[48px] font-bold" style={{ touchAction: 'manipulation' }}>
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
export const LessonDetailsSheet: React.FC<LessonDetailsSheetProps> = ({
  lesson,
  student,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onNavigate,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [mode, setMode] = useState<SheetMode>('preview');
  const [editedLesson, setEditedLesson] = useState<Partial<Lesson> & { color?: string | null }>({});

  // Reset on lesson change
  useEffect(() => {
    if (lesson) {
      setEditedLesson({
        scheduled_at: lesson.scheduled_at,
        duration_minutes: lesson.duration_minutes,
        lesson_type: lesson.lesson_type,
        topic: lesson.topic || '',
        color: (lesson as any).color || 'purple',
      });
    }
    setMode('preview');
  }, [lesson?.id]);

  if (!lesson || !isOpen) return null;

  const lessonDate = new Date(lesson.scheduled_at);
  const isGapAway = lesson.lesson_type === 'gap' || lesson.lesson_type === 'away';
  const gapAwayConfig = isGapAway ? GAP_AWAY_CONFIG[lesson.lesson_type] : null;
  const colorConfig = !isGapAway ? getLessonColorConfig((lesson as any).color) : null;
  const isRequested = lesson.status === 'REQUESTED';

  const handleSave = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    onUpdate(editedLesson);
    setMode('preview');
  };

  const handleCancel = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setEditedLesson({
      scheduled_at: lesson.scheduled_at,
      duration_minutes: lesson.duration_minutes,
      lesson_type: lesson.lesson_type,
      topic: lesson.topic || '',
      color: (lesson as any).color || 'purple',
    });
    setMode('preview');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(editedLesson.scheduled_at || lesson.scheduled_at);
    const [year, month, day] = e.target.value.split('-').map(Number);
    newDate.setFullYear(year, month - 1, day);
    setEditedLesson(prev => ({ ...prev, scheduled_at: newDate.toISOString() }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(editedLesson.scheduled_at || lesson.scheduled_at);
    const [hours, minutes] = e.target.value.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    setEditedLesson(prev => ({ ...prev, scheduled_at: newDate.toISOString() }));
  };

  const editedDate = new Date(editedLesson.scheduled_at || lesson.scheduled_at);
  const dateInputValue = `${editedDate.getFullYear()}-${String(editedDate.getMonth() + 1).padStart(2, '0')}-${String(editedDate.getDate()).padStart(2, '0')}`;
  const timeInputValue = `${String(editedDate.getHours()).padStart(2, '0')}:${String(editedDate.getMinutes()).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
          style={{ height: '100dvh' }}
        >
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border pt-safe">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  if (mode === 'edit') handleCancel();
                  else if (mode === 'scoring') setMode('preview');
                  else onClose();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted active:scale-95 transition-all"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <h1 className="text-lg font-black">
                {mode === 'edit' ? 'Edit Lesson' : mode === 'scoring' ? 'Score Skills' : 'Lesson Details'}
              </h1>
            </div>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                onClose();
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-muted active:scale-95 transition-all"
              style={{ touchAction: 'manipulation' }}
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </header>

          {/* Content */}
          <div className={`flex-1 min-h-0 ${mode === 'scoring' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'} p-4 space-y-4 pb-safe`}>
            {/* Student Info - Always visible */}
            {isGapAway ? (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground">{lesson.lesson_type === 'gap' ? 'Break' : 'Away'}</p>
                  <p className="text-sm text-muted-foreground">Blocked time slot</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {student?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{student?.full_name || 'Student'}</p>
                  <p className="text-sm text-muted-foreground">
                    {student?.credit_balance !== undefined ? `${student.credit_balance} hrs remaining` : 'No credits info'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isRequested && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300">
                      Pending
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={`font-bold ${
                      (student?.credit_balance ?? 0) > 0
                        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                    }`}
                  >
                    {(student?.credit_balance ?? 0) > 0 ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
            )}

            {/* ─── Scoring Mode ─── */}
            {mode === 'scoring' && student?.user_id && (
              <div className="flex-1 min-h-0 flex flex-col">
                <SkillScoringPanel
                  studentId={student.user_id}
                  lessonTopic={lesson.topic}
                  onDone={() => setMode('preview')}
                />
              </div>
            )}

            {/* ─── Edit Mode ─── */}
            {mode === 'edit' && <EditModeWithConflict
              lesson={lesson}
              editedLesson={editedLesson}
              setEditedLesson={setEditedLesson}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleDateChange={handleDateChange}
              handleTimeChange={handleTimeChange}
              dateInputValue={dateInputValue}
              timeInputValue={timeInputValue}
              isUpdating={isUpdating}
            />}

            {/* ─── Preview Mode ─── */}
            {mode === 'preview' && (
              <div className="space-y-4">
                {/* Lesson Details Card */}
                <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {lessonDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {lesson.duration_minutes} mins
                      </p>
                    </div>
                  </div>

                  {/* Colour indicator (replaces lesson type) */}
                  {!isGapAway && colorConfig && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: colorConfig.hex }}
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground capitalize">{colorConfig.id}</p>
                        <p className="text-xs text-muted-foreground">{lesson.topic || 'No topic set'}</p>
                      </div>
                    </div>
                  )}

                  {isGapAway && gapAwayConfig && (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${gapAwayConfig.bgClass} flex items-center justify-center`}>
                        <span className={`text-sm font-black ${gapAwayConfig.textClass}`}>
                          {gapAwayConfig.label[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{gapAwayConfig.label}</p>
                        <p className="text-xs text-muted-foreground">Blocked time slot</p>
                      </div>
                    </div>
                  )}

                  {student?.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{student.address}</p>
                        <p className="text-xs text-muted-foreground">Pickup location</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  {student?.phone && (
                    <a
                      href={`tel:${student.phone}`}
                      className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl active:scale-95 transition-all"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Call</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                      window.dispatchEvent(new CustomEvent('open-messages', { detail: { studentId: student?.user_id } }));
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl active:scale-95 transition-all"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message</span>
                  </button>
                  {student?.address && (
                    <button
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(20);
                        onNavigate();
                      }}
                      className="flex flex-col items-center gap-2 p-3 bg-muted rounded-xl active:scale-95 transition-all"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Navigation className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Navigate</span>
                    </button>
                  )}
                </div>

                {/* Main Actions */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                      setMode('scoring');
                    }}
                    className="w-full min-h-[48px] font-bold gap-2"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Star className="h-4 w-4" />
                    Score Skills
                  </Button>

                  <Button 
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                      setMode('edit');
                    }}
                    variant="outline"
                    className="w-full min-h-[48px] font-bold gap-2"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Lesson
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline"
                        className="w-full min-h-[48px] font-bold gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        style={{ touchAction: 'manipulation' }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel Lesson
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the lesson with {student?.full_name || 'this student'} on{' '}
                          {lessonDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at{' '}
                          {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="min-h-[44px]">Keep Lesson</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(30);
                            onDelete();
                          }}
                          className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Cancelling...' : 'Yes, Cancel Lesson'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
