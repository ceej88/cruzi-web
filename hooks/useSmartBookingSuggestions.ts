// Cruzi AI - Smart Booking Suggestions Hook
// Generates AI-powered booking shortcuts based on student history and patterns

import { useMemo } from 'react';
import { Lesson, StudentProfile, SkillProgress } from '@/hooks/useInstructorData';
import { SYLLABUS_TOPICS, CORE_SKILLS_GROUPS } from '@/constants';

interface SmartSuggestion {
  id: 'repeat' | 'next_level' | 'adjust_time';
  label: string;
  subtitle: string;
  icon: 'repeat' | 'trending_up' | 'clock';
  data: {
    time?: string;
    duration?: number;
    topic?: string;
    day?: string;
    dayOfWeek?: number;
  };
}

interface StudentPattern {
  preferredDay: string;
  preferredDayOfWeek: number;
  preferredTime: string;
  preferredDuration: number;
  lastTopic: string | null;
  lessonCount: number;
  isRegular: boolean; // Books same day/time consistently
  alternativeDays: string[]; // Other days they've booked on
}

interface BulkBookingStudent {
  student: StudentProfile;
  pattern: StudentPattern;
  suggestedDate: Date;
}

export function useSmartBookingSuggestions(
  selectedStudentId: string | null,
  students: StudentProfile[],
  lessons: Lesson[],
  skillProgress: SkillProgress[],
  baseDate: Date = new Date()
) {
  // Analyze student's booking patterns
  const studentPattern = useMemo((): StudentPattern | null => {
    if (!selectedStudentId) return null;
    
    const studentLessons = lessons
      .filter(l => l.student_id === selectedStudentId && l.status !== 'CANCELLED')
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
    
    if (studentLessons.length === 0) return null;
    
    // Analyze day preferences
    const dayFrequency: Record<number, number> = {};
    const timeFrequency: Record<string, number> = {};
    const durationFrequency: Record<number, number> = {};
    
    studentLessons.slice(0, 10).forEach(lesson => {
      const date = new Date(lesson.scheduled_at);
      const dayOfWeek = date.getDay();
      const time = date.toTimeString().slice(0, 5);
      
      dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
      timeFrequency[time] = (timeFrequency[time] || 0) + 1;
      durationFrequency[lesson.duration_minutes] = (durationFrequency[lesson.duration_minutes] || 0) + 1;
    });
    
    // Find most common day
    const preferredDayOfWeek = Object.entries(dayFrequency)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Find alternative days (other days they've booked on)
    const alternativeDays = Object.entries(dayFrequency)
      .filter(([day]) => day !== preferredDayOfWeek)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([day]) => dayNames[parseInt(day)]);
    
    // Check if they're "regular" (same day/time pattern)
    const topDayCount = dayFrequency[parseInt(preferredDayOfWeek || '0')] || 0;
    const isRegular = studentLessons.length >= 3 && topDayCount >= studentLessons.length * 0.6;
    
    const preferredTime = Object.entries(timeFrequency)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '09:00';
    
    const preferredDuration = parseInt(Object.entries(durationFrequency)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '60');
    
    const lastLesson = studentLessons[0];
    const lastDate = new Date(lastLesson.scheduled_at);
    
    return {
      preferredDay: dayNames[parseInt(preferredDayOfWeek || '0')],
      preferredDayOfWeek: parseInt(preferredDayOfWeek || '0'),
      preferredTime,
      preferredDuration,
      lastTopic: lastLesson.topic,
      lessonCount: studentLessons.length,
      isRegular,
      alternativeDays,
    };
  }, [selectedStudentId, lessons]);

  // Get student's skill progress to suggest next topic
  const nextLevelTopic = useMemo(() => {
    if (!selectedStudentId) return null;
    
    const studentSkills = skillProgress.filter(s => s.student_id === selectedStudentId);
    
    // Find skills that need work (levels 1-3) ordered by level
    const needsWork = studentSkills
      .filter(s => s.level < 4)
      .sort((a, b) => a.level - b.level);
    
    if (needsWork.length > 0) {
      // Return the lowest level skill
      return needsWork[0].topic;
    }
    
    // If no skills recorded, suggest based on syllabus order
    const recordedTopics = new Set(studentSkills.map(s => s.topic));
    const nextSyllabusTopic = SYLLABUS_TOPICS.find(t => !recordedTopics.has(t));
    
    return nextSyllabusTopic || 'Test Prep';
  }, [selectedStudentId, skillProgress]);

  // Get selected student info
  const selectedStudent = useMemo(() => 
    students.find(s => s.user_id === selectedStudentId)
  , [selectedStudentId, students]);

  // Generate smart suggestions
  const suggestions = useMemo((): SmartSuggestion[] => {
    if (!studentPattern || !selectedStudent) return [];
    
    const studentFirstName = selectedStudent.full_name?.split(' ')[0] || 'Student';
    const results: SmartSuggestion[] = [];
    
    // 1. Repeat Last - contextual label
    if (studentPattern.isRegular) {
      results.push({
        id: 'repeat',
        label: `Regular Slot`,
        subtitle: `Every ${studentPattern.preferredDay} ${formatTime(studentPattern.preferredTime)}`,
        icon: 'repeat',
        data: {
          time: studentPattern.preferredTime,
          duration: studentPattern.preferredDuration,
          topic: studentPattern.lastTopic || undefined,
          day: studentPattern.preferredDay,
          dayOfWeek: studentPattern.preferredDayOfWeek,
        },
      });
    } else {
      results.push({
        id: 'repeat',
        label: `Book ${studentFirstName} Again`,
        subtitle: `Usually ${studentPattern.preferredDay}s`,
        icon: 'repeat',
        data: {
          time: studentPattern.preferredTime,
          duration: studentPattern.preferredDuration,
          topic: studentPattern.lastTopic || undefined,
          day: studentPattern.preferredDay,
          dayOfWeek: studentPattern.preferredDayOfWeek,
        },
      });
    }
    
    // 2. Next Level - suggest harder topic based on progress
    if (nextLevelTopic) {
      results.push({
        id: 'next_level',
        label: `Level Up`,
        subtitle: `Focus on ${nextLevelTopic}`,
        icon: 'trending_up',
        data: {
          time: studentPattern.preferredTime,
          duration: studentPattern.preferredDuration,
          topic: nextLevelTopic,
        },
      });
    }
    
    // 3. Adjust Time - show if they have alternative days
    if (studentPattern.alternativeDays.length > 0) {
      const altDay = studentPattern.alternativeDays[0];
      results.push({
        id: 'adjust_time',
        label: `Different Day`,
        subtitle: `They're also free ${altDay}s`,
        icon: 'clock',
        data: {
          time: studentPattern.preferredTime,
          duration: studentPattern.preferredDuration,
          topic: studentPattern.lastTopic || undefined,
          day: altDay,
        },
      });
    }
    
    return results;
  }, [studentPattern, selectedStudent, nextLevelTopic]);

  // Bulk booking: find all students with regular patterns
  const bulkBookingStudents = useMemo((): BulkBookingStudent[] => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: BulkBookingStudent[] = [];
    
    students.forEach(student => {
      const studentLessons = lessons
        .filter(l => l.student_id === student.user_id && l.status !== 'CANCELLED')
        .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
      
      if (studentLessons.length < 2) return; // Need at least 2 lessons for pattern
      
      // Analyze pattern
      const dayFrequency: Record<number, number> = {};
      const timeFrequency: Record<string, number> = {};
      const durationFrequency: Record<number, number> = {};
      
      studentLessons.slice(0, 10).forEach(lesson => {
        const date = new Date(lesson.scheduled_at);
        const dayOfWeek = date.getDay();
        const time = date.toTimeString().slice(0, 5);
        
        dayFrequency[dayOfWeek] = (dayFrequency[dayOfWeek] || 0) + 1;
        timeFrequency[time] = (timeFrequency[time] || 0) + 1;
        durationFrequency[lesson.duration_minutes] = (durationFrequency[lesson.duration_minutes] || 0) + 1;
      });
      
      const preferredDayOfWeek = parseInt(Object.entries(dayFrequency)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '0');
      
      const preferredTime = Object.entries(timeFrequency)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '09:00';
      
      const preferredDuration = parseInt(Object.entries(durationFrequency)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '60');
      
      // Calculate next occurrence of their preferred day
      const today = baseDate;
      const daysUntilPreferred = (preferredDayOfWeek - today.getDay() + 7) % 7 || 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilPreferred);
      const [hours, minutes] = preferredTime.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);
      
      // Check if this slot is already booked
      const isSlotTaken = lessons.some(l => {
        if (l.status === 'CANCELLED') return false;
        const lessonDate = new Date(l.scheduled_at);
        return Math.abs(lessonDate.getTime() - nextDate.getTime()) < 60 * 60 * 1000; // Within 1 hour
      });
      
      if (!isSlotTaken) {
        result.push({
          student,
          pattern: {
            preferredDay: dayNames[preferredDayOfWeek],
            preferredDayOfWeek,
            preferredTime,
            preferredDuration,
            lastTopic: studentLessons[0].topic,
            lessonCount: studentLessons.length,
            isRegular: true,
            alternativeDays: [],
          },
          suggestedDate: nextDate,
        });
      }
    });
    
    // Sort by suggested date
    return result.sort((a, b) => a.suggestedDate.getTime() - b.suggestedDate.getTime());
  }, [students, lessons, baseDate]);

  return {
    suggestions,
    studentPattern,
    nextLevelTopic,
    bulkBookingStudents,
    hasSuggestions: suggestions.length > 0,
    hasBulkOptions: bulkBookingStudents.length > 0,
  };
}

// Helper to format time nicely
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return minutes === 0 ? `${displayHours}${period}` : `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
}
