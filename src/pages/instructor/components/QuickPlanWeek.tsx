// Cruzi AI - Quick Plan Week Component
// Bulk booking for regular student slots

import React, { useState, useMemo } from 'react';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartBookingSuggestions } from '@/hooks/useSmartBookingSuggestions';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Users, CheckCircle2, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface QuickPlanWeekProps {
  isOpen: boolean;
  onClose: () => void;
}

// Haptic feedback
const haptic = (type: 'light' | 'medium' | 'success' | 'error' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, success: [10, 50, 20], error: [50, 30, 50] };
    navigator.vibrate(patterns[type]);
  }
};

const QuickPlanWeek: React.FC<QuickPlanWeekProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { students, lessons, skillProgress, createLesson } = useInstructorData();
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get bulk booking suggestions
  const { bulkBookingStudents, hasBulkOptions } = useSmartBookingSuggestions(
    null,
    students,
    lessons,
    skillProgress || []
  );
  
  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    haptic('light');
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };
  
  // Select all
  const selectAll = () => {
    haptic('medium');
    setSelectedStudentIds(new Set(bulkBookingStudents.map(b => b.student.user_id)));
  };
  
  // Deselect all
  const deselectAll = () => {
    haptic('light');
    setSelectedStudentIds(new Set());
  };
  
  // Get selected students with their patterns
  const selectedForBooking = useMemo(() => {
    return bulkBookingStudents.filter(b => selectedStudentIds.has(b.student.user_id));
  }, [bulkBookingStudents, selectedStudentIds]);
  
  // Format date nicely
  const formatSlot = (date: Date, duration: number): string => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const hours = duration / 60;
    return `${day} ${time} (${hours}h)`;
  };
  
  // Book all selected lessons
  const handleBookAll = async () => {
    if (!user?.id || selectedForBooking.length === 0) return;
    
    setIsSubmitting(true);
    haptic('success');
    
    try {
      for (const booking of selectedForBooking) {
        await createLesson.mutateAsync({
          instructor_id: user.id,
          student_id: booking.student.user_id,
          scheduled_at: booking.suggestedDate.toISOString(),
          duration_minutes: booking.pattern.preferredDuration,
          topic: booking.pattern.lastTopic || 'Driving Lesson',
          notes: null,
          status: 'SCHEDULED',
          payment_method: null,
          lesson_type: 'lesson',
        });
      }
      
      toast({
        title: `${selectedForBooking.length} Lessons Booked!`,
        description: 'Week planned successfully',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to book lessons:', error);
      haptic('error');
      toast({
        title: 'Booking Failed',
        description: 'Some lessons could not be created',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] bg-foreground/60 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div className="relative bg-card w-full max-w-lg rounded-t-[2rem] shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground tracking-tight">Plan Week</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Book regular slots in one tap</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {!hasBulkOptions ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">No regular patterns found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Students need at least 2 lessons to detect patterns</p>
            </div>
          ) : (
            <>
              {/* Select All Row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-muted-foreground">
                  {bulkBookingStudents.length} students with regular slots
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={deselectAll}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={selectAll}
                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors px-2 py-1"
                  >
                    Select All
                  </button>
                </div>
              </div>
              
              {/* Student List */}
              <div className="space-y-2">
                {bulkBookingStudents.map(({ student, pattern, suggestedDate }) => {
                  const isSelected = selectedStudentIds.has(student.user_id);
                  const firstName = student.full_name?.split(' ')[0] || 'Student';
                  const avatarUrl = student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name || 'S')}&background=6366f1&color=fff&bold=true`;
                  
                  return (
                    <button
                      key={student.user_id}
                      onClick={() => toggleStudent(student.user_id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-[0.98]",
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-muted border-transparent hover:border-border"
                      )}
                    >
                      {/* Avatar with check overlay */}
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {firstName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* Student info */}
                      <div className="flex-1 text-left">
                        <p className={cn("text-sm font-bold", isSelected ? "text-primary" : "text-foreground")}>
                          {firstName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatSlot(suggestedDate, pattern.preferredDuration)}
                        </p>
                      </div>
                      
                      {/* Topic badge */}
                      {pattern.lastTopic && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg truncate max-w-[80px]">
                          {pattern.lastTopic}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        {hasBulkOptions && (
          <div className="p-6 bg-card border-t border-border flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-muted rounded-2xl text-sm font-bold text-foreground hover:bg-muted/80 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleBookAll}
              disabled={isSubmitting || selectedForBooking.length === 0}
              className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black shadow-xl hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Book {selectedForBooking.length} Lesson{selectedForBooking.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickPlanWeek;
