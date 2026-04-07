// Cruzi AI - Quick Lesson Setup Component
// Allows rapid lesson scheduling with student picker, date/time, duration, and day view

import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, User, ChevronDown, Plus, Repeat, X, Coffee, Plane, Loader2, AlertTriangle } from 'lucide-react';
import { useInstructorData, StudentProfile, Lesson, LessonTypeEnum } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { checkLessonConflicts, CONFLICT_WARNING } from '@/utils/conflictDetector';
import { LESSON_COLORS, LessonColor, getLessonColorConfig } from '@/constants/lessonColors';
type ScheduleType = 'lesson' | 'gap' | 'away';
const FREQUENCY_OPTIONS = [{
  value: 1,
  label: '1x/wk'
}, {
  value: 2,
  label: '2x/wk'
}, {
  value: 3,
  label: '3x/wk'
}];
const WEEKS_OPTIONS = [{
  value: 1,
  label: '1 wk'
}, {
  value: 2,
  label: '2 wks'
}, {
  value: 4,
  label: '4 wks'
}, {
  value: 6,
  label: '6 wks'
}, {
  value: 8,
  label: '8 wks'
}, {
  value: 12,
  label: '12 wks'
}];
interface QuickLessonSetupProps {
  students: StudentProfile[];
  lessons: Lesson[];
  isModal?: boolean;
  onClose?: () => void;
}
const QuickLessonSetup: React.FC<QuickLessonSetupProps> = ({
  students,
  lessons,
  isModal = false,
  onClose,
}) => {
  const {
    user
  } = useAuth();
  const {
    createLesson
  } = useInstructorData();

  // Form state
  const [scheduleType, setScheduleType] = useState<ScheduleType>('lesson');
  const [lessonColor, setLessonColor] = useState<LessonColor>('purple');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [lessonDate, setLessonDate] = useState<Date>(new Date());
  const [lessonHour, setLessonHour] = useState('09');
  const [lessonMinute, setLessonMinute] = useState('00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Repeat booking state
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [frequency, setFrequency] = useState(1); // lessons per week
  const [weeks, setWeeks] = useState(4); // how many weeks
  const [secondDayOffset, setSecondDayOffset] = useState(3); // days after first lesson (for 2x/week)
  const [thirdDayOffset, setThirdDayOffset] = useState(5); // days after first lesson (for 3x/week)

  // Calculate hours from minutes
  const durationHours = (durationMinutes / 60).toFixed(1);

  // Total lessons for repeat booking
  const totalLessons = repeatEnabled ? frequency * weeks : 1;

  // Filter lessons for selected date - string compare in local time to avoid UTC day-shift
  const lessonsForDate = useMemo(() => {
    const selectedYmd = format(lessonDate, 'yyyy-MM-dd');
    return lessons
      .filter((lesson) => {
        const lessonYmd = format(parseISO(lesson.scheduled_at), 'yyyy-MM-dd');
        return lessonYmd === selectedYmd && lesson.status === 'SCHEDULED';
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [lessons, lessonDate]);

  const conflictResult = useMemo(() => {
    const newStart = new Date(lessonDate.getTime());
    newStart.setHours(parseInt(lessonHour, 10), parseInt(lessonMinute, 10), 0, 0);
    return checkLessonConflicts(newStart, durationMinutes, lessons);
  }, [lessons, lessonDate, lessonHour, lessonMinute, durationMinutes]);

  const conflictingLesson = conflictResult.conflictingLesson;

  // Get student name by ID (with email fallback), handles null for gap/away
  const getStudentName = (studentId: string | null) => {
    if (!studentId) return 'Block';
    const student = students.find(s => s.user_id === studentId);
    return student?.full_name || student?.email?.split('@')[0] || 'Student';
  };

  // Generate lesson dates for repeat booking
  const generateLessonDates = (): Date[] => {
    const dates: Date[] = [];
    const startDate = new Date(lessonDate);
    startDate.setHours(parseInt(lessonHour), parseInt(lessonMinute), 0, 0);
    for (let week = 0; week < weeks; week++) {
      // First lesson of the week
      const firstLesson = new Date(startDate);
      firstLesson.setDate(firstLesson.getDate() + week * 7);
      dates.push(firstLesson);

      // Second lesson of the week (if 2x or 3x)
      if (frequency >= 2) {
        const secondLesson = new Date(startDate);
        secondLesson.setDate(secondLesson.getDate() + week * 7 + secondDayOffset);
        dates.push(secondLesson);
      }

      // Third lesson of the week (if 3x)
      if (frequency >= 3) {
        const thirdLesson = new Date(startDate);
        thirdLesson.setDate(thirdLesson.getDate() + week * 7 + thirdDayOffset);
        dates.push(thirdLesson);
      }
    }
    return dates;
  };

  // Handle lesson creation
  const handleCreateLesson = async () => {
    if (!user?.id) return;
    if (scheduleType === 'lesson' && !selectedStudent) {
      return; // Need student for lesson type
    }
    setIsSubmitting(true);
    try {
      if (repeatEnabled && scheduleType === 'lesson') {
        // Create multiple lessons for repeat booking
        const lessonDates = generateLessonDates();
        for (const date of lessonDates) {
          await createLesson.mutateAsync({
            instructor_id: user.id,
            student_id: selectedStudent?.user_id || user.id,
            scheduled_at: date.toISOString(),
            duration_minutes: durationMinutes,
            status: 'SCHEDULED',
            topic: null,
            notes: null,
            payment_method: null,
            lesson_type: 'lesson',
            color: lessonColor
          });
        }
        toast({
          title: `${lessonDates.length} Lessons Created`,
          description: `Recurring lessons scheduled for ${weeks} weeks`
        });
        onClose?.();
      } else {
        // Single lesson creation
        const scheduledAt = new Date(lessonDate);
        scheduledAt.setHours(parseInt(lessonHour), parseInt(lessonMinute), 0, 0);
        await createLesson.mutateAsync({
          instructor_id: user.id,
          student_id: scheduleType === 'lesson' ? (selectedStudent?.user_id || user.id) : null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: durationMinutes,
          status: 'SCHEDULED',
          topic: scheduleType === 'gap' ? 'Break' : scheduleType === 'away' ? 'Away' : null,
          notes: scheduleType !== 'lesson' ? `Type: ${scheduleType}` : null,
          payment_method: null,
          lesson_type: scheduleType === 'lesson' ? 'lesson' : scheduleType,
          ...(scheduleType === 'lesson' ? { color: lessonColor } : {})
        });
      }

      // Reset form — bump time forward by duration to avoid self-conflict
      const nextHour = parseInt(lessonHour) + Math.ceil(durationMinutes / 60);
      setSelectedStudent(null);
      setLessonHour(String(Math.min(nextHour, 21)).padStart(2, '0'));
      setLessonMinute('00');
      setDurationMinutes(60);
      setRepeatEnabled(false);
      setFrequency(1);
      setWeeks(4);
      setLessonColor('purple');
      onClose?.();
    } catch (error) {
      console.error('Failed to create lesson:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const tabConfig = [{
    id: 'lesson' as ScheduleType,
    label: 'Lesson',
    icon: User
  }, {
    id: 'gap' as ScheduleType,
    label: 'Gap',
    icon: Coffee
  }, {
    id: 'away' as ScheduleType,
    label: 'Away',
    icon: Plane
  }];
  return <div className={cn("space-y-8 max-w-full overflow-hidden", !isModal && "mt-12 pt-12 border-t border-border")}>
      {/* Section Header */}
      {!isModal && <div>
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3 mb-2">
          <Calendar className="h-4 w-4 text-primary" /> Quick Lesson Setup
        </h4>
        <p className="text-sm text-secondary-foreground">Schedule lessons, breaks, and time off.</p>
      </div>}

      {/* Tab Bar */}
      <div className="flex gap-2 bg-muted p-1.5 rounded-2xl max-w-full overflow-hidden">
        {tabConfig.map(tab => {
        const Icon = tab.icon;
        return <button key={tab.id} onClick={() => setScheduleType(tab.id)} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black transition-all min-h-[44px]", scheduleType === tab.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground hover:bg-background/50")}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>;
      })}
      </div>

      {/* Form Fields */}
      <div className="space-y-4 max-w-full overflow-hidden">
        
        {/* Student Picker - Only for lesson type */}
        {scheduleType === 'lesson' && <>
            <div className="bg-muted border border-border rounded-2xl p-4 flex items-center justify-between gap-4 min-h-[56px]">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
                Student
              </label>
              <button onClick={() => setShowStudentPicker(true)} className="flex items-center gap-2 text-foreground font-bold text-right">
                <span className="truncate max-w-[150px] sm:max-w-[200px]">
                  {selectedStudent?.full_name || 'Select Student'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Colour Picker */}
            <div className="bg-muted border border-border rounded-2xl p-4 space-y-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Colour
              </label>
              <div className="flex gap-3 justify-center">
                {LESSON_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setLessonColor(color.id)}
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
          </>}

        {/* Date Picker */}
        <div className="bg-muted border border-border rounded-2xl p-4 flex items-center justify-between gap-4 min-h-[56px]">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 text-foreground font-bold">
                <span>{format(lessonDate, 'EEE, d MMM yyyy')}</span>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 bg-popover" align="end">
              <CalendarUI mode="single" selected={lessonDate} onSelect={date => date && setLessonDate(date)} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker - 24 Hour */}
        <div className="bg-muted border border-border rounded-2xl p-4 flex items-center justify-between gap-4 min-h-[56px]">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">
            Start Time
          </label>
          <div className="flex items-center gap-2">
            <select value={lessonHour} onChange={e => setLessonHour(e.target.value)} className="bg-background border border-border rounded-xl px-3 py-2 font-bold text-foreground text-center min-h-[44px] min-w-[60px]">
              {Array.from({
              length: 24
            }, (_, i) => i.toString().padStart(2, '0')).map(hour => <option key={hour} value={hour}>{hour}</option>)}
            </select>
            <span className="text-xl font-black text-muted-foreground">:</span>
            <select value={lessonMinute} onChange={e => setLessonMinute(e.target.value)} className="bg-background border border-border rounded-xl px-3 py-2 font-bold text-foreground text-center min-h-[44px] min-w-[60px]">
              {['00', '15', '30', '45'].map(minute => <option key={minute} value={minute}>{minute}</option>)}
            </select>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-2">
              24hr
            </span>
          </div>
        </div>

        {/* Duration - Google/Material Design Style */}
        <div className="bg-muted border border-border rounded-2xl p-5 space-y-5">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
            Duration
          </label>
          
          {/* Segmented Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[{
            mins: 60,
            label: '1 hr'
          }, {
            mins: 90,
            label: '1.5 hr'
          }, {
            mins: 120,
            label: '2 hr'
          }, {
            mins: 150,
            label: '2.5 hr'
          }].map(preset => <button key={preset.mins} onClick={() => setDurationMinutes(preset.mins)} className={cn("py-3 px-2 rounded-xl text-sm font-bold transition-all min-h-[48px]", durationMinutes === preset.mins ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" : "bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50")}>
                {preset.label}
              </button>)}
          </div>

          {/* Live Value Display */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <span className="text-4xl font-black text-foreground tracking-tight">{durationMinutes}</span>
              <span className="text-sm font-bold text-muted-foreground ml-2">mins</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="text-4xl font-black text-primary tracking-tight">{durationHours}</span>
              <span className="text-sm font-bold text-primary ml-2">hrs</span>
            </div>
          </div>

          {/* Custom Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>30 min</span>
              <span>3 hrs</span>
            </div>
            <input type="range" min="30" max="180" step="15" value={durationMinutes} onChange={e => setDurationMinutes(parseInt(e.target.value))} className="w-full accent-primary h-2 rounded-full cursor-pointer" />
          </div>
        </div>

        {/* Repeat Toggle - Only for lessons */}
        {scheduleType === 'lesson' && <div className="border-t border-border pt-4 space-y-4">
            <button type="button" onClick={() => setRepeatEnabled(!repeatEnabled)} className={cn("w-full flex items-center justify-between p-4 rounded-2xl border transition-all min-h-[56px]", repeatEnabled ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground")}>
              <div className="flex items-center gap-3">
                <Repeat className="h-5 w-5" />
                <span className="font-bold">Repeat Weekly</span>
              </div>
              <div className={cn("w-12 h-7 rounded-full transition-all relative", repeatEnabled ? "bg-primary" : "bg-muted-foreground/30")}>
                <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all", repeatEnabled ? "left-6" : "left-1")} />
              </div>
            </button>

            {/* Repeat Options */}
            {repeatEnabled && <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Frequency */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                    How Often?
                  </label>
                  <div className="flex gap-2">
                    {FREQUENCY_OPTIONS.map(opt => <button key={opt.value} type="button" onClick={() => setFrequency(opt.value)} className={cn("flex-1 py-3 px-2 rounded-xl text-sm font-bold border transition-all min-h-[44px]", frequency === opt.value ? "bg-primary/20 text-primary border-primary/30" : "bg-muted border-border text-muted-foreground hover:text-foreground")}>
                        {opt.label}
                      </button>)}
                  </div>
                </div>

                {/* Additional day selectors for 2x or 3x weekly */}
                {frequency >= 2 && <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                      2nd Lesson (days after 1st)
                    </label>
                    <select value={secondDayOffset} onChange={e => setSecondDayOffset(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-bold text-foreground min-h-[44px]">
                      <option value={1}>+1 day (Next day)</option>
                      <option value={2}>+2 days</option>
                      <option value={3}>+3 days</option>
                      <option value={4}>+4 days</option>
                    </select>
                  </div>}

                {frequency >= 3 && <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                      3rd Lesson (days after 1st)
                    </label>
                    <select value={thirdDayOffset} onChange={e => setThirdDayOffset(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-3 font-bold text-foreground min-h-[44px]">
                      <option value={2}>+2 days</option>
                      <option value={3}>+3 days</option>
                      <option value={4}>+4 days</option>
                      <option value={5}>+5 days</option>
                      <option value={6}>+6 days</option>
                    </select>
                  </div>}

                {/* Duration in weeks */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">
                    For How Long?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WEEKS_OPTIONS.map(opt => <button key={opt.value} type="button" onClick={() => setWeeks(opt.value)} className={cn("py-3 px-2 rounded-xl text-sm font-bold border transition-all min-h-[44px]", weeks === opt.value ? "bg-primary/20 text-primary border-primary/30" : "bg-muted border-border text-muted-foreground hover:text-foreground")}>
                        {opt.label}
                      </button>)}
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">Total Lessons</span>
                    <span className="text-2xl font-black text-primary">{totalLessons}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {frequency}x per week for {weeks} weeks
                  </p>
                </div>
              </div>}
          </div>}

        {/* Conflict Warning */}
        {conflictingLesson && <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-600">{CONFLICT_WARNING}</p>
              <p className="text-xs text-muted-foreground">
                Overlaps with {conflictingLesson.lesson_type === 'away' ? 'away time' : `${getStudentName(conflictingLesson.student_id)}'s lesson`} at {format(parseISO(conflictingLesson.scheduled_at), 'HH:mm')} ({conflictingLesson.duration_minutes} mins)
              </p>
            </div>
          </div>}

      </div>

      {/* Day View Timeline */}
      <div className="space-y-4">
        <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Day View • {format(lessonDate, 'EEEE, d MMMM')}
        </h5>
        
        <div className="bg-muted/50 border border-border rounded-2xl p-4 overflow-x-auto scrollbar-hide">
          {lessonsForDate.length === 0 ? <p className="text-sm text-muted-foreground italic text-center py-4">
              No lessons scheduled for this day
            </p> : <div className="flex gap-3 min-w-max">
              {lessonsForDate.map(lesson => {
            const startTime = parseISO(lesson.scheduled_at);
            const isGapOrAway = lesson.lesson_type === 'gap' || lesson.lesson_type === 'away';
            const colorConfig = !isGapOrAway ? getLessonColorConfig((lesson as any).color) : null;
            return <div key={lesson.id} className={cn("px-4 py-3 rounded-xl border min-w-[120px] shrink-0", isGapOrAway ? "bg-muted border-border" : `${colorConfig!.bg}/10 border-${colorConfig!.id}-500/20`)}>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {format(startTime, 'HH:mm')}
                    </p>
                    <p className={cn("text-sm font-bold truncate", isGapOrAway ? "text-muted-foreground" : "text-foreground")}>
                      {isGapOrAway ? lesson.topic : getStudentName(lesson.student_id)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-muted-foreground">
                        {lesson.duration_minutes} mins
                      </p>
                      {!isGapOrAway && colorConfig && (
                        <div className={cn("w-3 h-3 rounded-full shrink-0", colorConfig.bg)} />
                      )}
                    </div>
                  </div>;
          })}
            </div>}
        </div>
      </div>

      {/* Add Button */}
      <button onClick={handleCreateLesson} disabled={isSubmitting || (scheduleType === 'lesson' && !selectedStudent)} className={cn("w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all min-h-[56px]", "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95", "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100")}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {scheduleType === 'lesson' ? repeatEnabled ? `Create ${totalLessons} Lessons` : 'Add Lesson' : scheduleType === 'gap' ? 'Add Break' : 'Mark Away'}
      </button>

      {/* Student Picker Modal */}
      <Dialog open={showStudentPicker} onOpenChange={setShowStudentPicker}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Select Student</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-2">
            {students.length === 0 ? <p className="text-center text-muted-foreground py-8">
                No students found. Add students first.
              </p> : students.map(student => <button key={student.id} onClick={() => {
            setSelectedStudent(student);
            setShowStudentPicker(false);
          }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all min-h-[56px]", selectedStudent?.id === student.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground")}>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0", selectedStudent?.id === student.id ? "bg-primary-foreground text-primary" : "bg-primary/10 text-primary")}>
                    {(student.full_name || 'S').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-bold truncate">{student.full_name || 'Unnamed Student'}</p>
                    <p className={cn("text-xs truncate", selectedStudent?.id === student.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {student.level || 'Beginner'} • {student.total_hours || 0} hrs
                    </p>
                  </div>
                </button>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default QuickLessonSetup;