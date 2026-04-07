// Daily Command Center Utilities
import { format } from 'date-fns';

// Haptic feedback patterns
export const triggerHaptic = (type: 'light' | 'medium' | 'error' | 'success') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error':
        navigator.vibrate([10, 30, 10, 30, 10]);
        break;
    }
  }
};

// Time status for styling
export type TimeStatus = 'past' | 'imminent' | 'soon' | 'later';

export const getTimeStatus = (lessonTime: Date): TimeStatus => {
  const now = new Date();
  const diffMs = lessonTime.getTime() - now.getTime();
  const diffMins = diffMs / 1000 / 60;

  if (diffMins < 0) return 'past';
  if (diffMins < 30) return 'imminent';
  if (diffMins < 60) return 'soon';
  return 'later';
};

// Format time for display
export const formatLessonTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Check if date is today
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return isSameDay(date, today);
};

// Check if date is tomorrow
export const isTomorrow = (dateString: string): boolean => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

// Get friendly day label (Today, Tomorrow, or day name)
export const getDayLabel = (date: Date): string => {
  const today = new Date();
  if (isSameDay(date, today)) {
    return `Today, ${format(date, 'MMM d')}`;
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(date, tomorrow)) {
    return `Tomorrow, ${format(date, 'MMM d')}`;
  }
  
  return format(date, 'EEEE, MMM d'); // "Wednesday, Feb 6"
};

// Get date key for grouping (YYYY-MM-DD)
export const getDateKey = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd');
};

// Native maps navigation
export const openMapsNavigation = (address: string) => {
  const encoded = encodeURIComponent(address);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isIOS) {
    window.location.href = `maps://?daddr=${encoded}`;
  } else if (isAndroid) {
    window.location.href = `geo:0,0?q=${encoded}`;
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank');
  }
};

// Lesson type display config
export const LESSON_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lesson: { label: 'Lesson', color: 'bg-primary/20 text-primary' },
  mocktest: { label: 'Mock Test', color: 'bg-orange-500/20 text-orange-500' },
  testday: { label: 'Test Day', color: 'bg-red-500/20 text-red-500' },
  assessment: { label: 'Assessment', color: 'bg-purple-500/20 text-purple-500' },
};

// Format duration
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
