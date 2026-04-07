// Cruzi AI — Shared Conflict Detection Utility
// Single source of truth for lesson overlap checks across all booking surfaces

import { areIntervalsOverlapping } from 'date-fns';

export interface ConflictCheckLesson {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  lesson_type: string;
  student_id?: string | null;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingLesson: ConflictCheckLesson | null;
}

/**
 * Check whether a proposed lesson time overlaps with any existing lesson.
 *
 * Rules:
 * - `gap` slots are transparent — they never trigger a conflict.
 * - `away` slots always trigger a conflict.
 * - Cancelled / requested lessons are ignored.
 * - If `editingLessonId` is provided the lesson with that id is skipped (edit mode).
 * - Back-to-back lessons (end === start) are allowed (half-open interval).
 */
export function checkLessonConflicts(
  newStart: Date,
  newDurationMinutes: number,
  allLessons: ConflictCheckLesson[],
  editingLessonId?: string,
): ConflictResult {
  const newEnd = new Date(newStart.getTime() + newDurationMinutes * 60_000);

  const newInterval = { start: newStart, end: newEnd };

  for (const lesson of allLessons) {
    // Skip self when editing
    if (editingLessonId && lesson.id === editingLessonId) continue;

    // Skip cancelled / requested lessons
    if (lesson.status === 'CANCELLED' || lesson.status === 'REQUESTED') continue;

    // Gap slots are transparent — never conflict
    if (lesson.lesson_type === 'gap') continue;

    const existingStart = new Date(lesson.scheduled_at);
    const existingEnd = new Date(existingStart.getTime() + lesson.duration_minutes * 60_000);

    const existingInterval = { start: existingStart, end: existingEnd };

    // areIntervalsOverlapping with inclusive=false treats touching endpoints as non-overlapping
    if (areIntervalsOverlapping(newInterval, existingInterval, { inclusive: false })) {
      return { hasConflict: true, conflictingLesson: lesson };
    }
  }

  return { hasConflict: false, conflictingLesson: null };
}

/** Standard warning message used across all booking surfaces */
export const CONFLICT_WARNING = '⚠️ Note: This overlaps with another booking.';
