// Later Today Row - Compact swipeable lesson row

import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Navigation, MapPin, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudentProfile, Lesson } from '@/hooks/useInstructorData';
import { formatLessonTime, LESSON_TYPE_CONFIG, triggerHaptic } from './utils';

interface LaterTodayRowProps {
  lesson: Lesson;
  student: StudentProfile | undefined;
  onNavigate: () => void;
  onTap: () => void;
  onSwipeComplete: () => void;
  onSwipeNoShow: () => void;
  isNavigating: boolean;
}

export const LaterTodayRow: React.FC<LaterTodayRowProps> = ({
  lesson,
  student,
  onNavigate,
  onTap,
  onSwipeComplete,
  onSwipeNoShow,
  isNavigating,
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      'rgb(239, 68, 68)',   // Red for no-show
      'rgb(239, 68, 68)',
      'transparent',
      'rgb(34, 197, 94)',
      'rgb(34, 197, 94)',   // Green for complete
    ]
  );
  const opacity = useTransform(x, [-100, 0, 100], [0.3, 1, 0.3]);

  const lessonConfig = LESSON_TYPE_CONFIG[lesson.lesson_type] || LESSON_TYPE_CONFIG.lesson;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - Complete
      triggerHaptic('success');
      setIsRemoving(true);
      setTimeout(onSwipeComplete, 200);
    } else if (info.offset.x < -threshold) {
      // Swipe left - No Show
      triggerHaptic('error');
      setIsRemoving(true);
      setTimeout(onSwipeNoShow, 200);
    }
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onNavigate();
  };

  if (isRemoving) {
    return (
      <motion.div
        initial={{ height: 'auto', opacity: 1 }}
        animate={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <motion.div style={{ background }} className="relative overflow-hidden">
      {/* Swipe action indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <X className="h-6 w-6 text-white" />
        <Check className="h-6 w-6 text-white" />
      </div>

      {/* Draggable content */}
      <motion.div
        style={{ x, opacity, touchAction: 'manipulation' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="relative bg-card flex items-center gap-2 px-3 py-3 cursor-pointer active:bg-muted active:scale-[0.98] transition-transform overflow-hidden"
        onClick={() => {
          triggerHaptic('light');
          onTap();
        }}
      >
        {/* Time Column - Compact */}
        <div className="w-11 shrink-0">
          <span className="text-sm font-black text-foreground">
            {formatLessonTime(lesson.scheduled_at)}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground uppercase truncate text-sm">
            {student?.full_name || 'Unknown Student'}
          </p>
          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {student?.address ? student.address.split(',')[0] : 'No address'}
            </span>
          </div>
        </div>

        {/* Badge (if not standard lesson) - Hide on mobile */}
        {lesson.lesson_type !== 'lesson' && (
          <Badge 
            variant="secondary" 
            className={`hidden sm:flex shrink-0 text-[10px] whitespace-nowrap px-1.5 py-0.5 ${lessonConfig.color}`}
          >
            {lessonConfig.label}
          </Badge>
        )}

        {/* GO Button - Icon only on mobile, with text on larger screens */}
        <Button
          onClick={handleNavigate}
          disabled={!student?.address || isNavigating}
          size="icon"
          className="shrink-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          style={{ touchAction: 'manipulation' }}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
