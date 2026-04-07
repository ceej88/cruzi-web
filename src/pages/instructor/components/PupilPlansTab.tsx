import React from 'react';
import { useStudentSharedPlans, SkillProgress } from '@/hooks/useInstructorData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Share2, GraduationCap, StickyNote } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface PupilPlansTabProps {
  studentId: string;
  studentName: string;
  skillProgress: SkillProgress[];
  onNavigate?: (tab: string) => void;
}

const PupilPlansTab: React.FC<PupilPlansTabProps> = ({
  studentId,
  studentName,
  skillProgress,
  onNavigate,
}) => {
  const { data: plans, isLoading } = useStudentSharedPlans(studentId);

  // Build skill notes lookup from skill_progress
  const skillNotesMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    skillProgress
      .filter(s => s.student_id === studentId && s.notes)
      .forEach(s => { map[s.topic.toLowerCase()] = s.notes!; });
    return map;
  }, [skillProgress, studentId]);

  const handleShare = async (plan: NonNullable<typeof plans>[0]) => {
    if ('vibrate' in navigator) navigator.vibrate(20);

    const skillNotes = plan.bundled_skills
      ?.map(skill => {
        const note = skillNotesMap[skill.toLowerCase()];
        return note ? `• ${skill}: ${note}` : `• ${skill}`;
      })
      .join('\n') || '• General training';

    const planText = `
📋 Lesson Plan for ${studentName}
${plan.title}

Skills to focus on:
${skillNotes}

${plan.objective}

${plan.student_summary ? `Note for lesson:\n${plan.student_summary}` : ''}

Shared via Cruzi
`.trim();

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: planText });
        toast({ title: 'Plan shared!' });
      } else {
        await navigator.clipboard.writeText(planText);
        toast({ title: 'Plan copied to clipboard!' });
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(planText);
        toast({ title: 'Plan copied to clipboard!' });
      } catch {
        toast({ title: 'Could not save plan', variant: 'destructive' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-10 md:py-16 space-y-4 animate-in fade-in duration-300">
        <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground/30" />
        <div>
          <h3 className="text-lg md:text-xl font-black text-foreground mb-1">No Plans Yet</h3>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xs mx-auto">
            Create a lesson plan from the Syllabus Matrix to share focus areas with your student.
          </p>
        </div>
        <Button
          onClick={() => onNavigate?.('core-skills')}
          className="text-[10px] font-black uppercase tracking-widest"
        >
          <GraduationCap className="h-4 w-4 mr-2" />
          Open Syllabus Matrix
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {plans.map((plan) => {
        const relativeDate = formatDistanceToNow(new Date(plan.date_shared), { addSuffix: true });
        const displayDate = relativeDate.includes('less than')
          ? 'Just now'
          : relativeDate.replace('about ', '').replace('in ', '');

        return (
          <div
            key={plan.id}
            className="bg-foreground text-background rounded-2xl md:rounded-[2rem] p-5 md:p-8 space-y-4 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-lg md:text-xl font-black tracking-tight truncate">
                    {plan.title}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {displayDate}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleShare(plan)}
                className="h-8 text-xs gap-1.5 rounded-xl shrink-0"
              >
                <Share2 className="h-3.5 w-3.5" />
                Save to Phone
              </Button>
            </div>

            {/* Bundled Skills as Badges with Notes */}
            {plan.bundled_skills && plan.bundled_skills.length > 0 && (
              <div className="space-y-2">
                {plan.bundled_skills.map((skill, idx) => {
                  const note = skillNotesMap[skill.toLowerCase()];
                  return (
                    <div key={idx}>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-3 py-1 bg-primary/20 text-primary border-primary/30"
                      >
                        {skill}
                      </Badge>
                      {note && (
                        <div className="flex items-start gap-2 mt-1 ml-1">
                          <StickyNote className="h-3 w-3 text-primary/60 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground italic leading-snug">
                            {note}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Personal Note */}
            {plan.student_summary && (
              <div className="bg-background/10 rounded-xl p-3 md:p-4 border border-background/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  Instructor Note
                </p>
                <p className="text-xs md:text-sm text-background/80 italic leading-relaxed">
                  "{plan.student_summary}"
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PupilPlansTab;
