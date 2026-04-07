import React, { useRef, useState, useMemo } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Lesson, LessonTypeEnum, StudentProfile } from '@/hooks/useInstructorData';
import { getLessonColorConfig } from '@/constants/lessonColors';

const GAP_AWAY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  gap: { label: 'Break', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
  away: { label: 'Away', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
};

interface DraggableLessonCardProps {
  lesson: Lesson;
  student: StudentProfile | undefined;
  top: number;
  height: number;
  dayIndex: number;
  totalDays: number;
  columnWidth: number;
  overlapIndex?: number;
  overlapCount?: number;
  onDragEnd: (lesson: Lesson, info: PanInfo, dayIndex: number) => void;
  onStudentTap: (student: StudentProfile) => void;
  onLessonTap: (lesson: Lesson) => void;
}

export const DraggableLessonCard: React.FC<DraggableLessonCardProps> = ({
  lesson,
  student,
  top,
  height,
  dayIndex,
  totalDays,
  columnWidth,
  overlapIndex = 0,
  overlapCount = 1,
  onDragEnd,
  onStudentTap,
  onLessonTap,
}) => {
  const isRequested = lesson.status === 'REQUESTED';
  const isGapAway = lesson.lesson_type === 'gap' || lesson.lesson_type === 'away';
  const gapAwayConfig = isGapAway ? GAP_AWAY_CONFIG[lesson.lesson_type] : null;
  const colorConfig = !isGapAway ? getLessonColorConfig(lesson.color) : null;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Adaptive content tiers based on pixel height and width
  const isCompact = height < 36;
  const isNarrow = overlapCount > 1;

  const startTime = useMemo(() => {
    const d = new Date(lesson.scheduled_at);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, [lesson.scheduled_at]);

  const endTime = useMemo(() => {
    const d = new Date(lesson.scheduled_at);
    d.setMinutes(d.getMinutes() + lesson.duration_minutes);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }, [lesson.scheduled_at, lesson.duration_minutes]);


  const handleStudentNameTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (student && !isDragging) {
      if (navigator.vibrate) navigator.vibrate(20);
      onStudentTap(student);
    }
  };

  // Calculate drag constraints to keep within visible calendar area
  const dragConstraints = {
    left: -dayIndex * columnWidth,
    right: (totalDays - dayIndex - 1) * columnWidth,
    top: -top,
    bottom: 1120 - top - height, // 14 hours * 80px
  };

  const handleDragStart = (_: any, info: PanInfo) => {
    setIsDragging(true);
    dragStartRef.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const start = dragStartRef.current;
    const wasTap = start && Math.abs(info.offset.x) < 5 && Math.abs(info.offset.y) < 5;
    
    if (wasTap) {
      // This was a tap, not a drag
      if (navigator.vibrate) navigator.vibrate(20);
      onLessonTap(lesson);
    } else {
      // This was a real drag
      onDragEnd(lesson, info, dayIndex);
    }
    
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if not dragging (backup for non-drag taps)
    if (!isDragging) {
      e.stopPropagation();
      if (navigator.vibrate) navigator.vibrate(20);
      onLessonTap(lesson);
    }
  };

  // Side-by-side positioning for overlapping lessons
  const widthPercent = 100 / overlapCount;
  const leftPercent = overlapIndex * widthPercent;
  const gap = overlapCount > 1 ? 1 : 2;

  return (
    <motion.div
      ref={cardRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      whileDrag={{ scale: 1.05, zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleCardClick}
      className={`
        absolute ${isNarrow ? 'rounded-md' : 'rounded-lg'} shadow-lg overflow-hidden cursor-grab active:cursor-grabbing
        transition-colors touch-none flex flex-col
        ${isCompact ? 'px-1 py-0.5' : isNarrow ? 'p-1' : 'p-2'}
        z-10
        ${isRequested 
          ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 opacity-90' 
          : isGapAway
            ? `${gapAwayConfig!.bgClass} ${gapAwayConfig!.textClass}`
            : `${colorConfig!.bg} ${colorConfig!.text}`
        }
      `}
      style={{ 
        top: top + 1, 
        height: height - 2,
        left: `calc(${leftPercent}% + ${gap}px)`,
        width: `calc(${widthPercent}% - ${gap * 2}px)`,
      }}
    >
      {/* Compact: single line with name + time */}
      {isCompact ? (
        <div className="min-w-0 overflow-hidden">
          {isGapAway ? (
            <span className={`${isNarrow ? 'text-[8px]' : 'text-[10px]'} font-semibold`}>{lesson.lesson_type === 'gap' ? 'Break' : 'Away'}</span>
          ) : (
            <span className={`${isNarrow ? 'text-[8px]' : 'text-[10px]'} font-semibold truncate`}>{student?.full_name?.split(' ')[0] || 'Student'}</span>
          )}
          {!isNarrow && <span className="text-[9px] opacity-70 ml-1">{startTime}</span>}
          {isRequested && <Clock className="h-2.5 w-2.5 animate-pulse inline ml-0.5" />}
        </div>
      ) : (
        <>
          {/* Name row */}
          <div className="min-w-0">
              {isGapAway && (
                <Badge 
                  variant="secondary" 
                  className="text-[8px] px-1 py-0 h-4 mb-0.5 bg-white/20 text-inherit border-0"
                >
                  {gapAwayConfig!.label}
                </Badge>
              )}
              {isGapAway ? (
                <p className={`${isNarrow ? 'text-[9px]' : 'text-[11px]'} font-semibold leading-snug`}>
                  {lesson.lesson_type === 'gap' ? 'Break' : 'Away'}
                </p>
              ) : (
                <div className="flex items-start gap-1">
                  <button
                    onClick={handleStudentNameTap}
                    onTouchEnd={handleStudentNameTap}
                    className={`${isNarrow ? 'text-[9px]' : 'text-[11px]'} font-semibold leading-snug text-left min-w-0 ${isNarrow ? 'line-clamp-1' : 'line-clamp-2'} hover:opacity-80 active:scale-95 transition-all`}
                  >
                    {isNarrow 
                      ? (student?.full_name?.split(' ')[0] || 'Student')
                      : (student?.full_name || 'Student')}
                  </button>
                  {isRequested && <Clock className="h-3 w-3 animate-pulse shrink-0 mt-0.5" />}
                </div>
              )}
          </div>

          {/* Time range */}
          <p className={`${isNarrow ? 'text-[8px]' : 'text-[10px]'} font-normal opacity-70`}>
            {startTime}-{endTime}
          </p>

        </>
      )}
    </motion.div>
  );
};
