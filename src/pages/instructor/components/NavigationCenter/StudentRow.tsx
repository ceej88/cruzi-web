// Student Row - Compact roster row for All Students section

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StudentProfile } from '@/hooks/useInstructorData';
import { triggerHaptic } from './utils';

interface StudentRowProps {
  student: StudentProfile;
  onTap: () => void;
  hasLessonToday?: boolean;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  onTap,
  hasLessonToday = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 p-4 cursor-pointer active:bg-muted/50 active:scale-[0.98] transition-all min-h-[56px]"
      style={{ touchAction: 'manipulation' }}
      onClick={() => {
        triggerHaptic('light');
        onTap();
      }}
    >
      {/* Avatar */}
      <Avatar className="h-10 w-10 border border-border">
        <AvatarImage
          src={student.avatar_url || `https://picsum.photos/100/100?random=${student.user_id}`}
          alt={student.full_name || 'Student'}
        />
        <AvatarFallback className="text-sm font-bold bg-muted">
          {student.full_name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>

      {/* Name & Address */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">
          {student.full_name || 'Unnamed Student'}
        </p>
        {student.address && (
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {student.address.split(',')[0]}
          </p>
        )}
      </div>

      {/* Status Badge */}
      {!hasLessonToday && (
        <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
          <Calendar className="h-3 w-3 mr-1" />
          Not scheduled
        </Badge>
      )}
    </motion.div>
  );
};
