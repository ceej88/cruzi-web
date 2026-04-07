import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { PanInfo } from 'framer-motion';
import { useInstructorData, LessonTypeEnum, Lesson, StudentProfile } from '@/hooks/useInstructorData';
import { checkLessonConflicts } from '@/utils/conflictDetector';
import { useWeatherAlert } from '@/hooks/useWeatherAlert';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, Sparkles, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getLessonColorConfig } from '@/constants/lessonColors';
import InstructorBookingModal from './InstructorBookingModal';
import QuickPlanWeek from './QuickPlanWeek';
import BroadcastModal from './BroadcastModal';
import { DraggableLessonCard } from './Schedule/DraggableLessonCard';
import QuickLessonSetup from './QuickLessonSetup';
import { StudentDetailsSheet } from './NavigationCenter/StudentDetailsSheet';
import { LessonDetailsSheet } from './Schedule/LessonDetailsSheet';
import { toast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
type ViewMode = '3DAY' | 'WEEK' | 'MONTH';

const HOUR_HEIGHT = 80;
const START_HOUR = 7;
const END_HOUR = 21;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Lesson type configuration for colors and labels
const LESSON_TYPE_CONFIG: Record<LessonTypeEnum, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  lesson: { 
    label: 'Lesson', 
    bgClass: 'bg-primary', 
    textClass: 'text-primary-foreground',
    dotClass: 'bg-primary'
  },
  mocktest: { 
    label: 'Mock', 
    bgClass: 'bg-orange-500', 
    textClass: 'text-white',
    dotClass: 'bg-orange-500'
  },
  testday: { 
    label: 'Test', 
    bgClass: 'bg-red-500', 
    textClass: 'text-white',
    dotClass: 'bg-red-500'
  },
  assessment: { 
    label: 'Assess', 
    bgClass: 'bg-purple-500', 
    textClass: 'text-white',
    dotClass: 'bg-purple-500'
  },
  gap: {
    label: 'Break',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground'
  },
  away: {
    label: 'Away',
    bgClass: 'bg-muted',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground'
  },
};

interface InstructorScheduleProps {
  onOpenSidebar: () => void;
}

const InstructorSchedule: React.FC<InstructorScheduleProps> = ({ onOpenSidebar }) => {
  const { lessons, students, updateLesson, deleteLesson, refresh } = useInstructorData();
  const weatherAlert = useWeatherAlert();
  const queryClient = useQueryClient();
  
  // Listen for voice-booked lessons to refresh calendar
  useEffect(() => {
    const handler = () => {
      // Refetch lessons when a voice booking is made
      refresh?.();
      queryClient.invalidateQueries({ queryKey: ['instructor-lessons'] });
    };
    window.addEventListener('cruzi:lesson-created', handler);
    return () => window.removeEventListener('cruzi:lesson-created', handler);
  }, [refresh, queryClient]);
  // Student details sheet state
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isStudentSheetOpen, setIsStudentSheetOpen] = useState(false);
  
  // Lesson details sheet state
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonSheetOpen, setIsLessonSheetOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState<ViewMode>('3DAY');
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  
  const [bookingState, setBookingState] = useState<{isOpen: boolean, date?: string, time?: string}>({
    isOpen: false
  });

  // Quick Plan Week modal
  const [showQuickPlanWeek, setShowQuickPlanWeek] = useState(false);

  // Quick Broadcast modal for FAB
  const [showQuickBroadcast, setShowQuickBroadcast] = useState(false);
  const [broadcastTemplate, setBroadcastTemplate] = useState<string | undefined>(undefined);
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeRulerRef = useRef<HTMLDivElement>(null);

  // Stable "today" reference for date comparisons
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayDateString = today.toDateString();

  const getStartOfWeek = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, []);

  // Single segment (no prev/next for swipe)
  const segment = useMemo(() => {
    const curr = viewMode === 'MONTH'
      ? new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
      : viewMode === 'WEEK'
        ? getStartOfWeek(baseDate)
        : new Date(baseDate);
    
    return { key: `${viewMode}-${curr.toISOString()}`, date: curr };
  }, [baseDate.getTime(), viewMode, getStartOfWeek]);

  // Simple scroll handler - only syncs time ruler for vertical scrolling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;

    // Sync vertical scroll with time ruler
    if (viewMode !== 'MONTH' && timeRulerRef.current) {
      timeRulerRef.current.scrollTop = scrollTop;
    }
  }, [viewMode]);

  // Direct navigation handlers with haptic feedback
  const navigatePrev = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(20);
    
    setBaseDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'MONTH') {
        next.setMonth(next.getMonth() - 1);
      } else if (viewMode === 'WEEK') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 3);
      }
      next.setHours(0, 0, 0, 0);
      return next;
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(20);
    
    setBaseDate(prev => {
      const next = new Date(prev);
      if (viewMode === 'MONTH') {
        next.setMonth(next.getMonth() + 1);
      } else if (viewMode === 'WEEK') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 3);
      }
      next.setHours(0, 0, 0, 0);
      return next;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(20);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    setBaseDate(todayDate);
  }, []);

  // Format date range for display in nav bar
  const formatDateRange = useCallback(() => {
    if (viewMode === 'MONTH') {
      return baseDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'WEEK') {
      const weekStart = getStartOfWeek(baseDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleString('default', { month: 'short' })}`;
    } else {
      const startDate = new Date(baseDate);
      const end = new Date(baseDate);
      end.setDate(end.getDate() + 2);
      return `${startDate.getDate()} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
    }
  }, [baseDate, viewMode, getStartOfWeek]);

  // Get label for navigation buttons
  const getNavLabel = useCallback(() => {
    if (viewMode === 'MONTH') return 'Month';
    if (viewMode === 'WEEK') return 'Week';
    return '3 Days';
  }, [viewMode]);

  const handleCellClick = (day: Date, hour?: number) => {
    const timeStr = hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00';
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    setBookingState({
      isOpen: true,
      date: dateStr,
      time: timeStr
    });
  };

  const getStudentForLesson = useCallback((studentId: string | null) => {
    if (!studentId) return undefined;
    return students.find(s => s.user_id === studentId);
  }, [students]);

  // Handle student tap to open details sheet
  const handleStudentTap = useCallback((student: StudentProfile) => {
    setSelectedStudent(student);
    setIsStudentSheetOpen(true);
  }, []);

  // Handle lesson tap to open lesson details sheet
  const handleLessonTap = useCallback((lesson: Lesson) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setSelectedLesson(lesson);
    setIsLessonSheetOpen(true);
  }, []);

  // Handle lesson update from sheet
  const handleLessonUpdate = useCallback((updates: Partial<Lesson>) => {
    if (!selectedLesson) return;
    
    updateLesson.mutate({
      id: selectedLesson.id,
      ...updates,
    }, {
      onSuccess: () => {
        setIsLessonSheetOpen(false);
        setSelectedLesson(null);
        toast({ title: 'Lesson updated' });
      },
    });
  }, [selectedLesson, updateLesson]);

  // Handle lesson delete/cancel
  const handleLessonDelete = useCallback(() => {
    if (!selectedLesson) return;
    
    deleteLesson.mutate(selectedLesson.id, {
      onSuccess: () => {
        setIsLessonSheetOpen(false);
        setSelectedLesson(null);
        toast({ title: 'Lesson cancelled' });
      },
    });
  }, [selectedLesson, deleteLesson]);

  // Handle drag end to reschedule lesson with 2D support
  const handleLessonDragEnd = useCallback((lesson: Lesson, info: PanInfo, dayIndex: number) => {
    // Get the column width based on view mode
    const daysCount = viewMode === '3DAY' ? 3 : 7;
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth;
    const columnWidth = containerWidth / daysCount;
    
    // Calculate day offset from horizontal movement
    const dayOffset = Math.round(info.offset.x / columnWidth);
    
    // Calculate minute offset from vertical movement
    const offsetMinutes = Math.round(info.offset.y / HOUR_HEIGHT * 60);
    
    // Only trigger if moved meaningfully (at least 15 minutes or 1 day)
    if (Math.abs(offsetMinutes) < 15 && dayOffset === 0) return;
    
    const currentDate = new Date(lesson.scheduled_at);
    
    // Apply day offset first
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + dayOffset);
    
    // Apply time offset
    newDate.setTime(newDate.getTime() + offsetMinutes * 60 * 1000);
    
    // Snap to nearest 15 minutes
    const minutes = newDate.getMinutes();
    const snappedMinutes = Math.round(minutes / 15) * 15;
    newDate.setMinutes(snappedMinutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    
    // Validate time is within business hours (7am-9pm)
    const hour = newDate.getHours();
    if (hour < START_HOUR || hour >= END_HOUR) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      toast({
        title: 'Invalid time',
        description: `Lessons must be scheduled between ${START_HOUR}:00 and ${END_HOUR}:00`,
        variant: 'destructive',
      });
      return;
    }
    
    // Check for conflicts using shared utility
    const result = checkLessonConflicts(newDate, lesson.duration_minutes, lessons, lesson.id);
    
    if (result.hasConflict) {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      const proceed = window.confirm('⚠️ Note: This overlaps with another booking.\n\nMove it anyway?');
      if (!proceed) return;
    }
    
    // Perform update
    if (navigator.vibrate) navigator.vibrate(20);
    updateLesson.mutate({
      id: lesson.id,
      scheduled_at: newDate.toISOString(),
    }, {
      onSuccess: () => {
        const dateStr = newDate.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
        const timeStr = newDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        toast({
          title: 'Lesson rescheduled',
          description: `Moved to ${dateStr} at ${timeStr}`,
        });
      },
    });
  }, [lessons, updateLesson, viewMode]);

  const getMonthDays = (monthStart: Date) => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6; // Sunday becomes 6
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    // Fill remaining slots to complete the grid (6 rows max)
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    
    return days;
  };

  const getLessonsForDay = (day: Date) => {
    return lessons.filter(l => new Date(l.scheduled_at).toDateString() === day.toDateString());
  };

  const renderMonthView = (monthStart: Date) => {
    const days = getMonthDays(monthStart);
    
    return (
      <div className="min-w-full h-full flex flex-col bg-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 bg-card/95 backdrop-blur-md z-20 sticky top-0 border-b border-border shadow-sm">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-3 text-center border-r border-border/50 last:border-r-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{day}</p>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const isToday = day && day.toDateString() === todayDateString;
            const dayLessons = day ? getLessonsForDay(day) : [];
            
            return (
              <div 
                key={idx} 
                onClick={() => day && handleCellClick(day)}
                className={`
                  border-r border-b border-border/30 p-1.5 min-h-[80px] cursor-pointer transition-colors
                  ${day ? 'hover:bg-muted/50' : 'bg-muted/20'}
                  ${isToday ? 'bg-primary/5' : ''}
                `}
              >
                {day && (
                  <>
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1
                      ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                    `}>
                      {day.getDate()}
                    </div>
                    
                    {/* Lesson indicators */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayLessons.slice(0, 3).map(lesson => {
                        const student = getStudentForLesson(lesson.student_id);
                        const isRequested = lesson.status === 'REQUESTED';
                        const time = new Date(lesson.scheduled_at);
                        const isGapAway = lesson.lesson_type === 'gap' || lesson.lesson_type === 'away';
                        const gapAwayConfig = isGapAway ? LESSON_TYPE_CONFIG[lesson.lesson_type] : null;
                        const colorConfig = !isGapAway ? getLessonColorConfig((lesson as any).color) : null;
                        
                        return (
                          <button 
                            key={lesson.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonTap(lesson);
                            }}
                            className={`
                              text-[9px] font-bold px-1.5 py-0.5 rounded truncate flex items-center gap-1
                              w-full text-left active:scale-95 transition-transform
                              ${isRequested 
                                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                : isGapAway
                                  ? `${gapAwayConfig!.bgClass} ${gapAwayConfig!.textClass}`
                                  : `${colorConfig!.bg} ${colorConfig!.text}`
                              }
                            `}
                            style={{ touchAction: 'manipulation' }}
                          >
                            {isGapAway && (
                              <span className="shrink-0">{gapAwayConfig!.label[0]}</span>
                            )}
                            {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')} {lesson.lesson_type === 'gap' ? 'Break' : lesson.lesson_type === 'away' ? 'Away' : student?.full_name?.split(' ')[0] || 'Lesson'}
                          </button>
                        );
                      })}
                      {dayLessons.length > 3 && (
                        <div className="text-[9px] font-bold text-muted-foreground px-1.5">
                          +{dayLessons.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTemporalSegment = (startDate: Date, daysCount: number) => {
    const startKey = startDate.toISOString();
    const days = Array.from({ length: daysCount }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return { date: d, key: `${viewMode}-${startKey}-day-${i}`, dayIndex: i };
    });
    
    // Calculate column width for drag calculations
    const containerWidth = scrollContainerRef.current?.offsetWidth || window.innerWidth;
    const columnWidth = containerWidth / daysCount;

    return (
      <div className="min-w-full h-full flex flex-col bg-card">
        <div className="flex bg-card/95 backdrop-blur-md z-20 sticky top-0 border-b border-border shadow-sm">
          {days.map(({ date: day, key }) => (
            <div key={key} className="flex-1 py-3 text-center border-r border-border/50 last:border-r-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{day.toLocaleString('default', { weekday: 'short' })}</p>
              <p className={`text-xl font-black ${day.toDateString() === todayDateString ? 'text-primary' : 'text-foreground'}`}>{day.getDate()}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-1 min-h-[1120px]">
          {days.map(({ date: day, key, dayIndex }) => (
            <div key={key} className="flex-1 border-r border-border/50 last:border-r-0 relative">
              {HOURS.map(hour => {
                const dayLessons = lessons.filter(l => new Date(l.scheduled_at).toDateString() === day.toDateString());
                const isOccupied = dayLessons.some(lesson => {
                  const lessonStart = new Date(lesson.scheduled_at);
                  const startHour = lessonStart.getHours() + lessonStart.getMinutes() / 60;
                  const endHour = startHour + lesson.duration_minutes / 60;
                  return hour >= startHour && hour < endHour;
                });
                return (
                  <div 
                    key={hour} 
                    style={{ height: HOUR_HEIGHT }} 
                    onClick={() => handleCellClick(day, hour)}
                    className={`border-b border-border/30 cursor-pointer transition-colors ${isOccupied ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  ></div>
                );
              })}
              {(() => {
                const dayLessonsForCards = lessons.filter(l => new Date(l.scheduled_at).toDateString() === day.toDateString());
                
                // Calculate overlap groups (Google Calendar style)
                const sorted = [...dayLessonsForCards].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
                const overlapMap = new Map<string, { overlapIndex: number; overlapCount: number }>();
                
                // Group overlapping lessons
                const groups: typeof sorted[] = [];
                for (const lesson of sorted) {
                  const lStart = new Date(lesson.scheduled_at).getTime();
                  const lEnd = lStart + lesson.duration_minutes * 60 * 1000;
                  
                  // Find existing group this lesson overlaps with
                  let placed = false;
                  for (const group of groups) {
                    const overlapsGroup = group.some(g => {
                      const gStart = new Date(g.scheduled_at).getTime();
                      const gEnd = gStart + g.duration_minutes * 60 * 1000;
                      return lStart < gEnd && lEnd > gStart;
                    });
                    if (overlapsGroup) {
                      group.push(lesson);
                      placed = true;
                      break;
                    }
                  }
                  if (!placed) groups.push([lesson]);
                }
                
                // Assign indices within each group
                for (const group of groups) {
                  group.forEach((lesson, idx) => {
                    overlapMap.set(lesson.id, { overlapIndex: idx, overlapCount: group.length });
                  });
                }
                
                return dayLessonsForCards.map(lesson => {
                  const start = new Date(lesson.scheduled_at);
                  const student = getStudentForLesson(lesson.student_id);
                  const top = (start.getHours() - START_HOUR + start.getMinutes() / 60) * HOUR_HEIGHT;
                  const height = (lesson.duration_minutes / 60) * HOUR_HEIGHT;
                  const overlap = overlapMap.get(lesson.id) || { overlapIndex: 0, overlapCount: 1 };

                  return (
                    <DraggableLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      student={student}
                      top={top}
                      height={height}
                      dayIndex={dayIndex}
                      totalDays={daysCount}
                      columnWidth={columnWidth}
                      overlapIndex={overlap.overlapIndex}
                      overlapCount={overlap.overlapCount}
                      onDragEnd={handleLessonDragEnd}
                      onStudentTap={handleStudentTap}
                      onLessonTap={handleLessonTap}
                    />
                  );
                });
              })()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col animate-in fade-in duration-500 overflow-hidden bg-card pt-safe">
      {/* Main Header */}
      <div className="flex justify-between items-center px-4 py-3 shrink-0 bg-card border-b border-border z-[60]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenSidebar}
            className="w-10 h-10 flex items-center justify-center text-foreground bg-muted border border-border rounded-xl active:scale-95 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex bg-muted p-1 rounded-xl">
            {(['3DAY', 'WEEK', 'MONTH'] as ViewMode[]).map(mode => (
              <button 
                key={mode} 
                onClick={() => setViewMode(mode)} 
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-4 py-2 bg-foreground text-background rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            Today
          </button>
          <button 
            onClick={() => setShowQuickPlanWeek(true)} 
            className="h-9 w-9 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>


      <div className="flex-1 flex overflow-hidden relative">
        {viewMode !== 'MONTH' && (
          <div 
            ref={timeRulerRef} 
            className="w-12 shrink-0 bg-muted border-r border-border overflow-hidden z-30 pointer-events-none"
          >
            <div className="h-[65px] bg-card border-b border-border"></div>
            {HOURS.map(hour => (
              <div 
                key={hour} 
                style={{ height: HOUR_HEIGHT }} 
                className="relative text-center"
              >
                <span className="inline-block pt-1 text-[12px] font-bold text-muted-foreground">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Single segment view - vertical scroll only */}
        <div 
          ref={scrollContainerRef} 
          onScroll={handleScroll}
          className="flex-1 flex flex-col overflow-y-auto custom-scrollbar" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none', 
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="flex flex-col min-h-full">
            {viewMode === 'MONTH' 
              ? renderMonthView(segment.date)
              : renderTemporalSegment(segment.date, viewMode === 'WEEK' ? 7 : 3)
            }
          </div>
        </div>
      </div>

      {/* FAB - Quick Lesson Setup */}
      <button
        onClick={() => { if (navigator.vibrate) navigator.vibrate(20); setShowQuickSetup(true); }}
        className="absolute bottom-[90px] right-3 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center active:scale-90 transition-all md:hidden"
        style={{ touchAction: 'manipulation' }}
        aria-label="Quick Lesson Setup"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Combined Bottom Navigation - Calendar Nav + Main App Nav */}
      <div className="shrink-0 bg-card border-t border-border z-40 md:hidden pb-safe">
        {/* Calendar Navigation Row */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-border/50">
          {/* Previous Button */}
          <button
            onClick={navigatePrev}
            className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 bg-muted rounded-xl active:scale-95 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              {getNavLabel()}
            </span>
          </button>

          {/* Center: Current Range Indicator */}
          <button
            onClick={goToToday}
            className="flex flex-col items-center min-h-[44px] px-3 py-1.5 rounded-xl active:scale-95 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-sm font-black text-foreground">
              {formatDateRange()}
            </span>
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
              Tap for Today
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={navigateNext}
            className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 bg-muted rounded-xl active:scale-95 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              {getNavLabel()}
            </span>
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>

      </div>
      
      <InstructorBookingModal 
        isOpen={bookingState.isOpen}
        initialDate={bookingState.date}
        initialTime={bookingState.time}
        onClose={() => setBookingState({isOpen: false})}
      />
      
      <QuickPlanWeek 
        isOpen={showQuickPlanWeek}
        onClose={() => setShowQuickPlanWeek(false)}
      />


      <BroadcastModal 
        isOpen={showQuickBroadcast}
        onClose={() => {
          setShowQuickBroadcast(false);
          setBroadcastTemplate(undefined);
        }}
        initialTemplate={broadcastTemplate}
      />

      {/* Student Details Sheet */}
      <StudentDetailsSheet
        student={selectedStudent}
        isOpen={isStudentSheetOpen}
        onClose={() => {
          setIsStudentSheetOpen(false);
          setSelectedStudent(null);
        }}
        onNavigate={() => {
          // Navigate to student's address
          if (selectedStudent?.address) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const url = isIOS
              ? `maps://maps.apple.com/?daddr=${encodeURIComponent(selectedStudent.address)}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedStudent.address)}`;
            window.open(url, '_blank');
          }
          setIsStudentSheetOpen(false);
        }}
        onOutside={() => {
          // "I'm Outside" action - could send notification
          toast({ title: 'Student notified', description: "You're outside notification sent" });
          setIsStudentSheetOpen(false);
        }}
        onSendOnMyWay={() => {
          toast({ title: 'On my way sent', description: 'Student has been notified' });
        }}
        isNavigating={false}
        isSendingOutside={false}
        isSendingNotification={false}
        plans={[]}
      />

      {/* Lesson Details Sheet */}
      <LessonDetailsSheet
        lesson={selectedLesson}
        student={selectedLesson ? getStudentForLesson(selectedLesson.student_id) : undefined}
        isOpen={isLessonSheetOpen}
        onClose={() => {
          setIsLessonSheetOpen(false);
          setSelectedLesson(null);
        }}
        onUpdate={handleLessonUpdate}
        onDelete={handleLessonDelete}
        onNavigate={() => {
          const student = selectedLesson ? getStudentForLesson(selectedLesson.student_id) : null;
          if (student?.address) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const url = isIOS
              ? `maps://maps.apple.com/?daddr=${encodeURIComponent(student.address)}`
              : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(student.address)}`;
            window.open(url, '_blank');
          }
        }}
        isUpdating={updateLesson.isPending}
        isDeleting={deleteLesson.isPending}
      />
      {/* Quick Lesson Setup Full Page */}
      <AnimatePresence>
        {showQuickSetup && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 pt-safe">
              <button
                onClick={() => { if (navigator.vibrate) navigator.vibrate(20); setShowQuickSetup(false); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted active:scale-95 transition-all"
                style={{ touchAction: 'manipulation' }}
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <h2 className="text-lg font-black text-foreground">Quick Lesson Setup</h2>
              <div className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
              <QuickLessonSetup
                students={students}
                lessons={lessons}
                isModal
                onClose={() => setShowQuickSetup(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstructorSchedule;
