import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useInstructorData, LessonTypeEnum } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, Repeat, AlertTriangle, Sparkles, RotateCcw, ChevronDown, ChevronUp, TrendingUp, Clock, Search } from 'lucide-react';
import { checkLessonConflicts, CONFLICT_WARNING } from '@/utils/conflictDetector';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSmartBookingSuggestions } from '@/hooks/useSmartBookingSuggestions';
import { LESSON_COLORS, LessonColor } from '@/constants/lessonColors';

const DURATION_BLOCKS = [
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1.5h' },
  { value: 120, label: '2h' },
];

const QUICK_TOPICS = [
  'Roundabouts',
  'Parking',
  'Junctions',
  'Motorways',
  'Night Driving',
  'Test Prep',
  'Manoeuvres',
  'Dual Carriageways',
];

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1x/week' },
  { value: 2, label: '2x/week' },
  { value: 3, label: '3x/week' },
];

const WEEKS_OPTIONS = [
  { value: 1, label: '1w' },
  { value: 2, label: '2w' },
  { value: 4, label: '4w' },
  { value: 6, label: '6w' },
  { value: 8, label: '8w' },
  { value: 12, label: '12w' },
];

interface InstructorBookingModalProps {
  isOpen: boolean;
  initialDate?: string;
  initialTime?: string;
  initialStudentId?: string;
  onClose: () => void;
}

// Haptic feedback helper
const haptic = (type: 'light' | 'medium' | 'success' | 'error' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      success: [10, 50, 20],
      error: [50, 30, 50],
    };
    navigator.vibrate(patterns[type]);
  }
};

const InstructorBookingModal: React.FC<InstructorBookingModalProps> = ({
  isOpen,
  initialDate,
  initialTime,
  initialStudentId,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { students, lessons, skillProgress, createLesson } = useInstructorData();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [hasModified, setHasModified] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentPicker, setShowStudentPicker] = useState(!initialStudentId);
  
  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || '');
  const [date, setDate] = useState(initialDate || (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })());
  const [time, setTime] = useState(initialTime || '09:00');
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState('');
  const [lessonType, setLessonType] = useState<LessonTypeEnum>('lesson');
  const [lessonColor, setLessonColor] = useState<LessonColor>('purple');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Repeat booking state
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [frequency, setFrequency] = useState(1);
  const [weeks, setWeeks] = useState(4);
  const [secondDayOffset, setSecondDayOffset] = useState(3);
  const [thirdDayOffset, setThirdDayOffset] = useState(5);

  // Conflict detection
  const [conflict, setConflict] = useState<string | null>(null);

  // Reset conflict state when modal opens to prevent stale warnings
  useEffect(() => {
    if (isOpen) {
      setConflict(null);
    }
  }, [isOpen]);

  // Smart booking suggestions
  const { suggestions, hasSuggestions } = useSmartBookingSuggestions(
    selectedStudentId,
    students,
    lessons,
    skillProgress || []
  );

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(s => s.full_name?.toLowerCase().includes(q));
  }, [students, studentSearch]);

  // Update from initial props
  useEffect(() => {
    if (initialDate) setDate(initialDate);
    if (initialTime) setTime(initialTime);
    if (initialStudentId) setSelectedStudentId(initialStudentId);
  }, [initialDate, initialTime, initialStudentId]);

  const checkConflicts = useCallback(() => {
    const [hours, minutes] = time.split(':').map(Number);
    const newStart = new Date(`${date}T${time}`);
    
    const result = checkLessonConflicts(newStart, duration, lessons);
    
    if (result.hasConflict && result.conflictingLesson) {
      const student = students.find(s => s.user_id === result.conflictingLesson!.student_id);
      const conflictTime = new Date(result.conflictingLesson.scheduled_at);
      setConflict(`Overlaps with ${student?.full_name?.split(' ')[0] || 'lesson'} at ${conflictTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${result.conflictingLesson.duration_minutes} mins)`);
      haptic('error');
    } else {
      setConflict(null);
    }
  }, [date, time, duration, lessons, students]);

  useEffect(() => {
    if (date && time) {
      checkConflicts();
    }
  }, [date, time, duration, checkConflicts]);

  // Apply smart suggestion
  const applySuggestion = (suggestionId: 'repeat' | 'next_level' | 'adjust_time') => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    haptic('medium');
    
    // Apply time if provided
    if (suggestion.data.time) {
      setTime(suggestion.data.time);
    }
    
    // Apply duration if provided
    if (suggestion.data.duration) {
      setDuration(suggestion.data.duration);
    }
    
    // Apply topic if provided
    if (suggestion.data.topic) {
      setTopic(suggestion.data.topic);
    }
    
    // Calculate the next occurrence of the preferred day
    if (suggestion.data.dayOfWeek !== undefined) {
      const today = new Date();
      const daysUntilPreferred = (suggestion.data.dayOfWeek - today.getDay() + 7) % 7 || 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilPreferred);
      setDate(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`);
    }
    
    setHasModified(true);
  };

  const handleStudentSelect = (studentId: string) => {
    haptic('light');
    setSelectedStudentId(studentId);
    setShowStudentPicker(false);
    setStudentSearch('');
    setHasModified(true);
  };

  const handleDurationSelect = (value: number) => {
    haptic('light');
    setDuration(value);
    setHasModified(true);
  };

  const handleTopicSelect = (selectedTopic: string) => {
    haptic('light');
    setTopic(selectedTopic);
    setHasModified(true);
  };

  const handleColorSelect = (color: LessonColor) => {
    haptic('light');
    setLessonColor(color);
    setHasModified(true);
  };

  // Drag to dismiss
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    setIsDragging(true);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - dragStartY.current;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragOffset > 150 && !hasModified) {
      onClose();
    }
    setDragOffset(0);
  };

  const generateLessonDates = (): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(`${date}T${time}`);
    
    for (let week = 0; week < weeks; week++) {
      const firstLesson = new Date(startDate);
      firstLesson.setDate(firstLesson.getDate() + (week * 7));
      dates.push(firstLesson);
      
      if (frequency >= 2) {
        const secondLesson = new Date(startDate);
        secondLesson.setDate(secondLesson.getDate() + (week * 7) + secondDayOffset);
        dates.push(secondLesson);
      }
      
      if (frequency >= 3) {
        const thirdLesson = new Date(startDate);
        thirdLesson.setDate(thirdLesson.getDate() + (week * 7) + thirdDayOffset);
        dates.push(thirdLesson);
      }
    }
    
    return dates;
  };

  const totalLessons = repeatEnabled ? frequency * weeks : 1;

  const endTime = useMemo(() => {
    const start = new Date(`${date}T${time}`);
    return new Date(start.getTime() + duration * 60000);
  }, [date, time, duration]);

  const handleSubmit = async () => {
    if (!user?.id || !selectedStudentId) return;
    
    // Safety net: re-check conflicts against latest data before submitting
    checkConflicts();
    
    haptic('success');
    
    if (repeatEnabled) {
      const lessonDates = generateLessonDates();
      
      for (const lessonDate of lessonDates) {
        await createLesson.mutateAsync({
          instructor_id: user.id,
          student_id: selectedStudentId,
          scheduled_at: lessonDate.toISOString(),
          duration_minutes: duration,
          topic: topic || 'Driving Lesson',
          notes: null,
          status: 'SCHEDULED',
          payment_method: null,
          lesson_type: 'lesson',
          color: lessonColor,
        } as any);
      }
      
      toast({
        title: `${lessonDates.length} Lessons Created`,
        description: `Recurring lessons scheduled for ${weeks} weeks`,
      });
    } else {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      
      await createLesson.mutateAsync({
        instructor_id: user.id,
        student_id: selectedStudentId,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        topic: topic || 'Driving Lesson',
        notes: null,
        status: 'SCHEDULED',
        payment_method: null,
        lesson_type: 'lesson',
        color: lessonColor,
      } as any);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const selectedStudent = students.find(s => s.user_id === selectedStudentId);

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in fade-in duration-200">
      {/* Full-page header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 pt-safe">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted active:scale-95 transition-all"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="h-5 w-5 text-foreground" />
        </button>
        <h3 className="text-lg font-black text-foreground tracking-tight">New Lesson</h3>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-4 pt-4 space-y-5">
          
          {/* Student Picker */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Student</label>
            
            {selectedStudent && !showStudentPicker ? (
              /* Selected student row */
              <button
                onClick={() => { setShowStudentPicker(true); haptic('light'); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-primary bg-primary/10 transition-all active:scale-[0.98]"
                style={{ touchAction: 'manipulation' }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary ring-offset-2 ring-offset-background">
                  <AvatarImage src={selectedStudent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name || 'S')}&background=6366f1&color=fff&bold=true`} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {selectedStudent.full_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-bold text-primary flex-1 text-left truncate min-w-0">{selectedStudent.full_name || 'Student'}</span>
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest shrink-0">Change</span>
              </button>
            ) : (
              /* Search + list */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    autoFocus
                    className="w-full bg-muted border-0 rounded-2xl pl-10 pr-4 py-3 font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-2xl border border-border bg-card">
                  {filteredStudents.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No students found</p>
                  ) : (
                    filteredStudents.map(student => {
                      const avatarUrl = student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || 'S')}&background=6366f1&color=fff&bold=true`;
                      return (
                        <button
                          key={student.user_id}
                          onClick={() => handleStudentSelect(student.user_id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/60 active:bg-muted transition-all border-b border-border last:border-b-0"
                          style={{ touchAction: 'manipulation' }}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                              {student.full_name?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-bold text-foreground truncate min-w-0">{student.full_name || 'Student'}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedStudentId && (<>
          {/* Smart Booking Suggestions */}
          {hasSuggestions && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Smart Shortcuts</label>
              <div className="flex flex-col sm:flex-wrap sm:flex-row gap-2 overflow-hidden">
                {suggestions.map(suggestion => {
                  const IconComponent = suggestion.icon === 'repeat' ? RotateCcw 
                    : suggestion.icon === 'trending_up' ? TrendingUp 
                    : Clock;
                  
                  const gradientClass = suggestion.id === 'repeat' 
                    ? 'from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40'
                    : suggestion.id === 'next_level'
                    ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40';
                  
                  const iconColor = suggestion.id === 'repeat' 
                    ? 'text-primary bg-primary/20'
                    : suggestion.id === 'next_level'
                    ? 'text-emerald-600 bg-emerald-500/20'
                    : 'text-amber-600 bg-amber-500/20';
                  
                  const textColor = suggestion.id === 'repeat' 
                    ? 'text-primary'
                    : suggestion.id === 'next_level'
                    ? 'text-emerald-600'
                    : 'text-amber-600';
                  
                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => applySuggestion(suggestion.id)}
                      className={cn(
                        "flex-1 min-w-[140px] flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r border transition-all active:scale-[0.98]",
                        gradientClass
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", iconColor)}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className={cn("text-[11px] font-bold truncate", textColor)}>{suggestion.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{suggestion.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Time - Native Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => { setDate(e.target.value); setHasModified(true); haptic('light'); }}
                className="w-full bg-muted border-0 rounded-2xl px-4 py-4 font-bold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => { setTime(e.target.value); setHasModified(true); haptic('light'); }}
                className="w-full bg-muted border-0 rounded-2xl px-4 py-4 font-bold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Conflict Warning (advisory only — does not block booking) */}
          {conflict && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{CONFLICT_WARNING}</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">{conflict}</p>
                </div>
              </div>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-2 ml-8">You can still book — this is advisory only</p>
            </div>
          )}

          {/* Duration Blocks */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Duration</label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {DURATION_BLOCKS.map(block => (
                <button
                  key={block.value}
                  onClick={() => handleDurationSelect(block.value)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all active:scale-95",
                    duration === block.value
                      ? "bg-primary/10 border-primary text-primary shadow-md"
                      : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-lg font-black">{block.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Topic Chips */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Topic</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 overflow-hidden">
              {QUICK_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => handleTopicSelect(t)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold border transition-all active:scale-95",
                    topic === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setHasModified(true); }}
              placeholder="Or type custom topic..."
              className="w-full bg-muted border-0 rounded-2xl px-4 py-3 font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Colour Picker */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 block">Colour</label>
            <div className="flex gap-3 justify-center">
              {LESSON_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all active:scale-90",
                    color.bg,
                    lessonColor === color.id
                      ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      : "opacity-60 hover:opacity-80"
                  )}
                  aria-label={color.id}
                />
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => { setShowAdvanced(!showAdvanced); haptic('light'); }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted hover:bg-muted/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <Repeat className="h-5 w-5 text-muted-foreground" />
              <span className="font-bold text-foreground">Repeat Weekly</span>
            </div>
            {showAdvanced ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Repeat Options */}
          {showAdvanced && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 pl-2 border-l-2 border-primary/30">
              <button
                type="button"
                onClick={() => { setRepeatEnabled(!repeatEnabled); haptic('medium'); }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                  repeatEnabled 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-muted border-transparent text-muted-foreground"
                )}
              >
                <span className="font-bold">Enable Repeat</span>
                <div className={cn(
                  "w-12 h-7 rounded-full transition-all relative",
                  repeatEnabled ? "bg-primary" : "bg-muted-foreground/30"
                )}>
                  <div className={cn(
                    "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
                    repeatEnabled ? "left-6" : "left-1"
                  )} />
                </div>
              </button>

              {repeatEnabled && (
                <div className="space-y-4">
                  {/* Frequency */}
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Frequency</label>
                    <div className="flex gap-2">
                      {FREQUENCY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setFrequency(opt.value); haptic('light'); }}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95",
                            frequency === opt.value
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-muted border-transparent text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {frequency >= 2 && (
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">2nd Lesson</label>
                      <select 
                        value={secondDayOffset}
                        onChange={(e) => setSecondDayOffset(Number(e.target.value))}
                        className="w-full bg-muted border-0 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={1}>+1 day</option>
                        <option value={2}>+2 days</option>
                        <option value={3}>+3 days</option>
                        <option value={4}>+4 days</option>
                      </select>
                    </div>
                  )}

                  {frequency >= 3 && (
                    <div>
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">3rd Lesson</label>
                      <select 
                        value={thirdDayOffset}
                        onChange={(e) => setThirdDayOffset(Number(e.target.value))}
                        className="w-full bg-muted border-0 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={2}>+2 days</option>
                        <option value={3}>+3 days</option>
                        <option value={4}>+4 days</option>
                        <option value={5}>+5 days</option>
                        <option value={6}>+6 days</option>
                      </select>
                    </div>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">For How Long</label>
                    <div className="grid grid-cols-6 gap-1">
                      {WEEKS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setWeeks(opt.value); haptic('light'); }}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold border transition-all active:scale-95",
                            weeks === opt.value
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-muted border-transparent text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">Total Lessons</span>
                      <span className="text-2xl font-black text-primary">{totalLessons}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </>)}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="p-4 border-t border-border bg-card/95 backdrop-blur-sm flex gap-3 shrink-0 safe-area-bottom">
          <button 
            onClick={onClose} 
            className="flex-1 py-4 bg-muted text-muted-foreground rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={createLesson.isPending || !selectedStudentId}
            className={cn(
              "flex-[2] py-4 rounded-2xl font-bold text-sm flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.98]",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            )}
          >
            {createLesson.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>{repeatEnabled ? `Create ${totalLessons} Lessons` : 'Create'}</span>
                <span className="text-[10px] opacity-80">
                  {time} – {endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </>
            )}
          </button>
        </div>
    </div>
  );
};

export default InstructorBookingModal;
