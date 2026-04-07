// Lesson Plan Card - Displays lesson plan with share functionality

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, FileText, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { triggerHaptic } from './utils';
import { formatDistanceToNow } from 'date-fns';

export interface SharedPlan {
  id: string;
  title: string;
  objective: string;
  bundled_skills: string[] | null;
  student_summary: string | null;
  date_shared: string;
}

interface LessonPlanCardProps {
  plan: SharedPlan;
  studentName: string;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export const LessonPlanCard: React.FC<LessonPlanCardProps> = ({
  plan,
  studentName,
  compact = false,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);
    triggerHaptic('medium');

    const planText = `
📋 Lesson Plan for ${studentName}
${plan.title}

Skills to focus on:
${plan.bundled_skills?.map(s => `• ${s}`).join('\n') || '• General training'}

${plan.objective}

${plan.student_summary ? `Note for lesson:\n${plan.student_summary}` : ''}

Shared via Cruzi
`.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: plan.title,
          text: planText,
        });
        toast({ title: 'Plan shared!' });
      } else {
        await navigator.clipboard.writeText(planText);
        toast({ title: 'Plan copied to clipboard!' });
      }
      triggerHaptic('success');
    } catch (error) {
      // If user cancelled, do nothing
      if ((error as Error).name === 'AbortError') {
        setIsSharing(false);
        return;
      }
      
      // Share failed (permission denied in iframe, etc) - fallback to clipboard
      try {
        await navigator.clipboard.writeText(planText);
        toast({ 
          title: 'Plan copied to clipboard!',
          description: 'The lesson plan has been saved to your clipboard.'
        });
        triggerHaptic('success');
      } catch (clipboardError) {
        toast({ 
          title: 'Could not save plan', 
          description: 'Please try again or copy manually.',
          variant: 'destructive' 
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const relativeDate = formatDistanceToNow(new Date(plan.date_shared), { addSuffix: true });
  const displayDate = relativeDate.includes('less than') ? 'Just now' : 
    relativeDate.replace('about ', '').replace('in ', '');

  if (compact) {
    // Compact mode for UpNextCard - just a tappable indicator
    return (
      <div className="space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl hover:bg-muted transition-colors w-full text-left"
        >
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground truncate flex-1">
            {plan.title}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                {plan.bundled_skills && plan.bundled_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.bundled_skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
                        {skill}
                      </Badge>
                    ))}
                    {plan.bundled_skills.length > 4 && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        +{plan.bundled_skills.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
                {plan.student_summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    "{plan.student_summary}"
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground/70">
                    {displayDate}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="h-7 text-xs gap-1.5 rounded-lg"
                  >
                    <Share2 className="h-3 w-3" />
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full mode for StudentDetailsSheet
  return (
    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <h4 className="font-bold text-sm text-foreground truncate">
              {plan.title}
            </h4>
          </div>
          <p className="text-[10px] text-muted-foreground/70">{displayDate}</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleShare}
          disabled={isSharing}
          className="h-8 text-xs gap-1.5 rounded-lg shrink-0"
        >
          <Share2 className="h-3.5 w-3.5" />
          Save to Phone
        </Button>
      </div>

      {plan.bundled_skills && plan.bundled_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {plan.bundled_skills.map((skill, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {plan.student_summary && (
        <p className="text-xs text-muted-foreground italic">
          "{plan.student_summary}"
        </p>
      )}
    </div>
  );
};
