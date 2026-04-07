// Up Next Card - Prominent next lesson display with lesson plan and separate notification

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Car, MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StudentProfile, Lesson } from '@/hooks/useInstructorData';
import { getTimeStatus, formatLessonTime, formatDuration, LESSON_TYPE_CONFIG, triggerHaptic } from './utils';
import { LessonPlanCard, SharedPlan } from './LessonPlanCard';

interface UpNextCardProps {
  lesson: Lesson;
  student: StudentProfile | undefined;
  onNavigate: () => void;
  onOutside: () => void;
  onTap: () => void;
  onSendOnMyWay: () => void;
  isNavigating: boolean;
  isSendingOutside: boolean;
  isSendingNotification: boolean;
  plan: SharedPlan | null;
}

export const UpNextCard: React.FC<UpNextCardProps> = ({
  lesson,
  student,
  onNavigate,
  onOutside,
  onTap,
  onSendOnMyWay,
  isNavigating,
  isSendingOutside,
  isSendingNotification,
  plan,
}) => {
  const timeStatus = getTimeStatus(new Date(lesson.scheduled_at));
  const isImminent = timeStatus === 'imminent';
  const lessonConfig = LESSON_TYPE_CONFIG[lesson.lesson_type] || LESSON_TYPE_CONFIG.lesson;

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onNavigate();
  };

  const handleOutside = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onOutside();
  };

  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onSendOnMyWay();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl border border-border p-5 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ touchAction: 'manipulation' }}
      onClick={() => {
        triggerHaptic('light');
        onTap();
      }}
    >
      <div className="flex gap-4">
        {/* Time Badge */}
        <div
          className={`shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${
            isImminent ? 'bg-primary animate-pulse' : 'bg-muted'
          }`}
        >
          <span className={`text-2xl font-black ${isImminent ? 'text-primary-foreground' : 'text-foreground'}`}>
            {formatLessonTime(lesson.scheduled_at)}
          </span>
          <span className={`text-xs font-bold ${isImminent ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {formatDuration(lesson.duration_minutes)}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage
                src={student?.avatar_url || `https://picsum.photos/100/100?random=${student?.user_id}`}
                alt={student?.full_name || 'Student'}
              />
              <AvatarFallback className="text-sm font-bold">
                {student?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-lg truncate">
                {student?.full_name || 'Unknown Student'}
              </p>
              {lesson.lesson_type !== 'lesson' && (
                <Badge variant="secondary" className={`text-[10px] ${lessonConfig.color}`}>
                  {lessonConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {/* Address */}
          {student?.address && (
            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {student.address}
            </p>
          )}

          {/* Lesson Plan Section */}
          {plan && (
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
              <LessonPlanCard
                plan={plan}
                studentName={student?.full_name || 'Student'}
                compact
              />
            </div>
          )}

          {/* Action Buttons - Three buttons: GO (maps only), Notify (send message), Outside */}
          {/* All buttons meet 44px minimum touch target */}
          <div className="flex gap-2">
            <Button
              onClick={handleNavigate}
              disabled={!student?.address || isNavigating}
              variant="secondary"
              className="flex-1 h-12 min-h-[48px] rounded-xl font-black text-xs uppercase tracking-wider gap-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Navigation className="h-4 w-4" />
              {isNavigating ? 'Opening...' : 'GO'}
            </Button>
            <Button
              onClick={handleNotify}
              disabled={isSendingNotification}
              className={`flex-1 h-12 min-h-[48px] rounded-xl font-black text-xs uppercase tracking-wider gap-2 ${
                isImminent ? 'animate-pulse' : ''
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Bell className="h-4 w-4" />
              {isSendingNotification ? 'Sending...' : 'On My Way'}
            </Button>
            <Button
              variant="outline"
              onClick={handleOutside}
              disabled={isSendingOutside}
              className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-xl p-0"
              style={{ touchAction: 'manipulation' }}
            >
              <Car className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
