// Daily Command Center - iOS-style Navigation Hub
// Features: Multi-day schedule, swipe actions, pull-down search, bottom sheet, lesson plans

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstructorData, useStudentSharedPlans, StudentProfile, Lesson } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import {
  Search,
  X,
  Loader2,
  CalendarOff,
  CalendarDays,
  Home,
  Calendar,
  Users,
  MessageSquare,
} from 'lucide-react';

import { DaySection } from './DaySection';
import { StudentRow } from './StudentRow';
import { StudentDetailsSheet } from './StudentDetailsSheet';
import {
  openMapsNavigation,
  triggerHaptic, 
  getDayLabel, 
  getDateKey,
  isSameDay 
} from './utils';

interface ScheduledLesson {
  lesson: Lesson;
  student: StudentProfile | undefined;
  time: Date;
}

interface DayGroup {
  dateKey: string;
  date: Date;
  dateLabel: string;
  lessons: ScheduledLesson[];
  isToday: boolean;
}

const DailyCommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, lessons, sendMessage, updateLesson, isLoading } = useInstructorData();
  
  // Fetch instructor profile
  const { data: instructorProfile } = useQuery({
    queryKey: ['instructor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, 'go' | 'outside' | 'notifying' | 'complete' | 'noshow' | null>>({});
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group lessons by day for the next 7 days
  const groupedByDay = useMemo<DayGroup[]>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    // Filter and map lessons within the next 7 days
    const scheduledLessons = lessons
      .filter(l => {
        if (l.status !== 'SCHEDULED') return false;
        const lessonDate = new Date(l.scheduled_at);
        return lessonDate >= today && lessonDate <= maxDate;
      })
      .map(l => ({
        lesson: l,
        student: students.find(s => s.user_id === l.student_id),
        time: new Date(l.scheduled_at),
      }))
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    // Group by date
    const groups: Record<string, ScheduledLesson[]> = {};
    scheduledLessons.forEach(item => {
      const key = getDateKey(item.lesson.scheduled_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    // Convert to array with labels
    return Object.entries(groups)
      .map(([dateKey, dayLessons]) => {
        const date = dayLessons[0].time;
        return {
          dateKey,
          date,
          dateLabel: getDayLabel(date),
          lessons: dayLessons,
          isToday: isSameDay(date, new Date()),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [lessons, students]);

  // Get today's data for header
  const todayData = useMemo(() => {
    const today = new Date();
    const todayGroup = groupedByDay.find(g => g.isToday);
    const count = todayGroup?.lessons.length || 0;
    return {
      label: getDayLabel(today),
      count,
      upNextLesson: todayGroup?.lessons.find(l => l.time > new Date()) || null,
    };
  }, [groupedByDay]);

  // Fetch plans for the up-next student
  const { data: upNextPlans } = useStudentSharedPlans(
    todayData.upNextLesson?.student?.user_id
  );

  // Fetch plans for selected student in sheet
  const { data: selectedStudentPlans } = useStudentSharedPlans(
    selectedStudent?.user_id
  );

  // Total lessons in next 7 days
  const totalUpcoming = useMemo(() => {
    return groupedByDay.reduce((acc, g) => acc + g.lessons.length, 0);
  }, [groupedByDay]);

  // Students not scheduled in next 7 days
  const unscheduledStudents = useMemo(() => {
    const scheduledIds = new Set(
      groupedByDay.flatMap(g => g.lessons.map(l => l.student?.user_id))
    );
    return students.filter(s => !scheduledIds.has(s.user_id));
  }, [students, groupedByDay]);

  // Filtered results when searching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    return students.filter(s =>
      s.full_name?.toLowerCase().includes(query) ||
      s.address?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Handler: Open maps navigation only (NO notification)
  const handleGoNavigation = useCallback((student: StudentProfile | undefined) => {
    if (!student?.address) return;
    
    const key = student.user_id;
    setLoadingStates(prev => ({ ...prev, [key]: 'go' }));
    
    triggerHaptic('medium');
    openMapsNavigation(student.address);
    
    toast({
      title: `Navigating to ${student.full_name}`,
      description: 'Maps opened. Use "On My Way" to notify student.',
    });
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: null }));
    }, 1000);
  }, []);

  // Handler: Send "On my way" notification (SEPARATE from navigation)
  const handleSendOnMyWay = useCallback(async (student: StudentProfile | undefined) => {
    if (!student || !user?.id) return;
    
    const key = student.user_id;
    setLoadingStates(prev => ({ ...prev, [key]: 'notifying' }));

    try {
      await sendMessage.mutateAsync({
        receiverId: student.user_id,
        content: '🚗 Your instructor is on their way! See you soon.',
      });
      await supabase.from('notifications').insert({
        user_id: student.user_id,
        type: 'INFO',
        title: 'Instructor En Route',
        message: 'Your instructor has departed and is heading to your location.',
        action_label: 'View Messages',
        target_tab: 'messages',
      });
      toast({
        title: 'On my way notification sent',
        description: `${student.full_name} has been notified.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Could not send notification',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: null }));
    }
  }, [user, sendMessage]);

  const handleOutsideNotification = useCallback(async (student: StudentProfile | undefined) => {
    if (!student || !user?.id) return;
    
    const key = student.user_id;
    setLoadingStates(prev => ({ ...prev, [key]: 'outside' }));

    try {
      await sendMessage.mutateAsync({
        receiverId: student.user_id,
        content: '🚙 Instructor is outside. Ready when you are!',
      });
      await supabase.from('notifications').insert({
        user_id: student.user_id,
        type: 'ALERT',
        title: 'Instructor Has Arrived',
        message: 'Your instructor is outside and ready for your lesson.',
        action_label: 'Acknowledge',
      });
      toast({
        title: 'Arrival notification sent',
        description: `${student.full_name} has been notified.`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Could not send notification', variant: 'destructive' });
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: null }));
    }
  }, [user, sendMessage]);

  const handleSwipeComplete = useCallback(async (lesson: Lesson) => {
    try {
      await updateLesson.mutateAsync({ id: lesson.id, status: 'COMPLETED' });
      toast({ title: 'Lesson marked complete ✓' });
    } catch (error) {
      toast({ title: 'Failed to update lesson', variant: 'destructive' });
    }
  }, [updateLesson]);

  const handleSwipeNoShow = useCallback(async (lesson: Lesson) => {
    try {
      await updateLesson.mutateAsync({ id: lesson.id, status: 'NO_SHOW' });
      toast({ title: 'Marked as no-show', variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Failed to update lesson', variant: 'destructive' });
    }
  }, [updateLesson]);

  const openStudentSheet = useCallback((student: StudentProfile | undefined) => {
    if (student) {
      setSelectedStudent(student);
      setIsSheetOpen(true);
      triggerHaptic('light');
    }
  }, []);

  const toggleSearch = () => {
    triggerHaptic('light');
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) setSearchQuery('');
  };

  // Bottom nav items
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'diary', icon: Calendar, label: 'Diary' },
    { id: 'pupils', icon: Users, label: 'Pupils' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
  ];

  const handleNavChange = (tab: string) => {
    navigate(`/instructor/${tab === 'home' ? '' : tab}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSearching = !!searchQuery.trim();

  return (
    <div className="h-full flex flex-col">
      {/* iOS-style Large Title Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-0 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground italic tracking-tight">
              {todayData.label}
            </h1>
            <p className="text-sm font-semibold mt-1">
              <span className="text-primary">{todayData.count} {todayData.count === 1 ? 'Lesson' : 'Lessons'} today</span>
              {totalUpcoming > todayData.count && (
                <span className="text-primary ml-1">
                  • {totalUpcoming - todayData.count} upcoming
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="h-10 w-10 rounded-full"
            >
              {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>
            <Avatar className="h-10 w-10 border-2 border-border">
              <AvatarImage src={instructorProfile?.avatar_url || undefined} />
              <AvatarFallback className="text-sm font-bold">
                {instructorProfile?.full_name?.charAt(0) || 'I'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden px-4 md:px-8"
          >
            <div className="relative pb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-11 h-12 rounded-2xl bg-muted border-0 text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-full text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-8">
        {isSearching ? (
          // Search Results
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {searchResults && searchResults.length > 0 ? (
              <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
                {searchResults.map(student => (
                  <StudentRow
                    key={student.user_id}
                    student={student}
                    onTap={() => openStudentSheet(student)}
                    hasLessonToday={groupedByDay.some(g => 
                      g.isToday && g.lessons.some(l => l.student?.user_id === student.user_id)
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-bold text-foreground">No students found</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </motion.div>
        ) : (
          // Multi-day Schedule View
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-32"
          >
            {/* Day Sections */}
            {groupedByDay.map((dayGroup) => (
              <DaySection
                key={dayGroup.dateKey}
                dateLabel={dayGroup.dateLabel}
                lessons={dayGroup.lessons}
                isToday={dayGroup.isToday}
                upNextLesson={dayGroup.isToday ? todayData.upNextLesson : null}
                onNavigate={handleGoNavigation}
                onOutside={handleOutsideNotification}
                onSendOnMyWay={handleSendOnMyWay}
                onTap={openStudentSheet}
                onSwipeComplete={handleSwipeComplete}
                onSwipeNoShow={handleSwipeNoShow}
                loadingStates={loadingStates}
                upNextPlan={dayGroup.isToday && upNextPlans?.[0] ? upNextPlans[0] : null}
              />
            ))}

            {/* All Students Section */}
            {unscheduledStudents.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-3 px-1">
                  All Students ({unscheduledStudents.length})
                </h2>
                <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
                  {unscheduledStudents.map(student => (
                    <StudentRow
                      key={student.user_id}
                      student={student}
                      onTap={() => openStudentSheet(student)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty States */}
            {totalUpcoming === 0 && students.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
                  <CalendarOff className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Ready to Start!</h3>
                <p className="text-sm text-muted-foreground">
                  Add students and schedule lessons to get going.
                </p>
              </div>
            )}

            {totalUpcoming === 0 && students.length > 0 && (
              <div className="py-12 text-center bg-muted/30 rounded-3xl">
                <CalendarDays className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-black text-foreground mb-1">Diary is clear</h3>
                <p className="text-sm text-muted-foreground">
                  No lessons scheduled for the next 7 days.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </ScrollArea>

      {/* Student Details Bottom Sheet */}
      <StudentDetailsSheet
        student={selectedStudent}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onNavigate={() => {
          if (selectedStudent) handleGoNavigation(selectedStudent);
        }}
        onOutside={() => {
          if (selectedStudent) handleOutsideNotification(selectedStudent);
        }}
        onSendOnMyWay={() => {
          if (selectedStudent) handleSendOnMyWay(selectedStudent);
        }}
        isNavigating={loadingStates[selectedStudent?.user_id || ''] === 'go'}
        isSendingOutside={loadingStates[selectedStudent?.user_id || ''] === 'outside'}
        isSendingNotification={loadingStates[selectedStudent?.user_id || ''] === 'notifying'}
        plans={selectedStudentPlans || []}
      />

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <MobileBottomNav
          items={navItems}
          activeTab="nav-command"
          onTabChange={handleNavChange}
        />
      </div>
    </div>
  );
};

export default DailyCommandCenter;
