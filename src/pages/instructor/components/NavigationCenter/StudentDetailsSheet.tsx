// Student Details Bottom Sheet with Lesson Plans

import React from 'react';
import { Navigation, Car, Phone, Mail, MapPin, X, Bell, FileText } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StudentProfile } from '@/hooks/useInstructorData';
import { triggerHaptic } from './utils';
import { LessonPlanCard, SharedPlan } from './LessonPlanCard';

interface StudentDetailsSheetProps {
  student: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onOutside: () => void;
  onSendOnMyWay: () => void;
  isNavigating: boolean;
  isSendingOutside: boolean;
  isSendingNotification: boolean;
  plans: SharedPlan[];
}

export const StudentDetailsSheet: React.FC<StudentDetailsSheetProps> = ({
  student,
  isOpen,
  onClose,
  onNavigate,
  onOutside,
  onSendOnMyWay,
  isNavigating,
  isSendingOutside,
  isSendingNotification,
  plans,
}) => {
  if (!student) return null;

  const handleNavigate = () => {
    triggerHaptic('medium');
    onNavigate();
  };

  const handleOutside = () => {
    triggerHaptic('light');
    onOutside();
  };

  const handleNotify = () => {
    triggerHaptic('medium');
    onSendOnMyWay();
  };

  const handleCall = () => {
    if (student.phone) {
      triggerHaptic('light');
      window.location.href = `tel:${student.phone}`;
    }
  };

  const handleEmail = () => {
    if (student.email) {
      triggerHaptic('light');
      window.location.href = `mailto:${student.email}`;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="text-center pb-2">
          <DrawerClose className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
          <DrawerTitle className="sr-only">Student Details</DrawerTitle>
        </DrawerHeader>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 pb-4 space-y-6">
            {/* Student Photo & Name */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={student.avatar_url || `https://picsum.photos/200/200?random=${student.user_id}`}
                  alt={student.full_name || 'Student'}
                />
                <AvatarFallback className="text-2xl font-bold bg-muted">
                  {student.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-black text-foreground">
                  {student.full_name || 'Unknown Student'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {student.credit_balance?.toFixed(1) || 0} hours remaining
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-3 justify-center">
              {student.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCall}
                  className="rounded-full gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              )}
              {student.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmail}
                  className="rounded-full gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}
            </div>

            {/* Address Section */}
            {student.address && (
              <div className="bg-muted rounded-2xl p-4 space-y-3">
                {/* Static Map Preview Placeholder */}
                <div className="aspect-[16/9] rounded-xl bg-background overflow-hidden border border-border flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Map Preview</p>
                  </div>
                </div>
                <p className="text-sm text-foreground flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                  {student.address}
                </p>
              </div>
            )}

            {/* Current Lesson Plan - Only show most recent */}
            {plans.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Current Lesson Plan
                </h3>
                <LessonPlanCard
                  plan={plans[0]}
                  studentName={student.full_name || 'Student'}
                />
              </div>
            )}

            {/* Notes */}
            {student.notes && (
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Notes
                </p>
                <p className="text-sm text-foreground">{student.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* STICKY FOOTER - Always visible */}
        <div className="px-6 pb-6 pt-4 border-t border-border bg-background space-y-3 pb-safe">
          <div className="flex gap-3">
            <Button
              onClick={handleNavigate}
              disabled={!student.address || isNavigating}
              variant="secondary"
              className="flex-1 h-14 rounded-2xl font-bold text-base gap-3"
              style={{ touchAction: 'manipulation' }}
            >
              <Navigation className="h-5 w-5" />
              {isNavigating ? 'Opening...' : 'Navigate'}
            </Button>
            <Button
              onClick={handleNotify}
              disabled={isSendingNotification}
              className="flex-1 h-14 rounded-2xl font-bold text-base gap-3"
              style={{ touchAction: 'manipulation' }}
            >
              <Bell className="h-5 w-5" />
              {isSendingNotification ? 'Sending...' : 'On My Way'}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleOutside}
            disabled={isSendingOutside}
            className="w-full h-14 rounded-2xl font-bold text-base gap-3"
            style={{ touchAction: 'manipulation' }}
          >
            <Car className="h-5 w-5" />
            {isSendingOutside ? 'Sending...' : "I'm Outside"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
