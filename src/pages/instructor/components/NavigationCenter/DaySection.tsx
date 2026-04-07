// Day Section - Renders a day's header and lesson list

import React from 'react';
import { motion } from 'framer-motion';
import { StudentProfile, Lesson } from '@/hooks/useInstructorData';
import { LaterTodayRow } from './LaterTodayRow';
import { UpNextCard } from './UpNextCard';
import { SharedPlan } from './LessonPlanCard';

interface ScheduledLesson {
  lesson: Lesson;
  student: StudentProfile | undefined;
  time: Date;
}

interface DaySectionProps {
  dateLabel: string;
  lessons: ScheduledLesson[];
  isToday: boolean;
  upNextLesson: ScheduledLesson | null;
  onNavigate: (student: StudentProfile | undefined) => void;
  onOutside: (student: StudentProfile | undefined) => void;
  onSendOnMyWay: (student: StudentProfile | undefined) => void;
  onTap: (student: StudentProfile | undefined) => void;
  onSwipeComplete: (lesson: Lesson) => void;
  onSwipeNoShow: (lesson: Lesson) => void;
  loadingStates: Record<string, 'go' | 'outside' | 'notifying' | 'complete' | 'noshow' | null>;
  upNextPlan: SharedPlan | null;
}

export const DaySection: React.FC<DaySectionProps> = ({
  dateLabel,
  lessons,
  isToday: isTodaySection,
  upNextLesson,
  onNavigate,
  onOutside,
  onSendOnMyWay,
  onTap,
  onSwipeComplete,
  onSwipeNoShow,
  loadingStates,
  upNextPlan,
}) => {
  // For today, split into "Up Next" and "Later Today"
  // For other days, show all as a simple list
  const laterLessons = isTodaySection && upNextLesson
    ? lessons.filter(l => l.lesson.id !== upNextLesson.lesson.id)
    : lessons;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Day Header */}
      {!isTodaySection && (
        <div className="pt-4 pb-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
            {dateLabel}
          </h2>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">
            {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
          </p>
        </div>
      )}

      {/* Up Next Card (Today only) */}
      {isTodaySection && upNextLesson && (
        <div className="mb-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 px-1">
            Up Next
          </h3>
          <UpNextCard
            lesson={upNextLesson.lesson}
            student={upNextLesson.student}
            onNavigate={() => onNavigate(upNextLesson.student)}
            onOutside={() => onOutside(upNextLesson.student)}
            onSendOnMyWay={() => onSendOnMyWay(upNextLesson.student)}
            onTap={() => onTap(upNextLesson.student)}
            isNavigating={loadingStates[upNextLesson.student?.user_id || ''] === 'go'}
            isSendingOutside={loadingStates[upNextLesson.student?.user_id || ''] === 'outside'}
            isSendingNotification={loadingStates[upNextLesson.student?.user_id || ''] === 'notifying'}
            plan={upNextPlan}
          />
        </div>
      )}

      {/* Later Today Header (Today only) */}
      {isTodaySection && laterLessons.length > 0 && (
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">
          Later Today
        </h3>
      )}

      {/* Lesson Rows */}
      {laterLessons.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {laterLessons.map(item => (
            <LaterTodayRow
              key={item.lesson.id}
              lesson={item.lesson}
              student={item.student}
              onNavigate={() => onNavigate(item.student)}
              onTap={() => onTap(item.student)}
              onSwipeComplete={() => onSwipeComplete(item.lesson)}
              onSwipeNoShow={() => onSwipeNoShow(item.lesson)}
              isNavigating={loadingStates[item.student?.user_id || ''] === 'go'}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};
