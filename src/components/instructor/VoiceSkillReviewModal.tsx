// VoiceSkillReviewModal - Human-in-the-loop review for voice skill updates
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveSkillUpdates } from '@/services/voiceActionExecutor';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SkillUpdate {
  topic: string;
  level: number;
}

interface VoiceSkillReviewData {
  studentId: string;
  studentName: string;
  skillUpdates: SkillUpdate[];
  unmatchedSkills: string[];
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Introduced',
  2: 'Practiced',
  3: 'Prompted',
  4: 'Consistent',
  5: 'Independent',
};

const VoiceSkillReviewModal: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<VoiceSkillReviewData | null>(null);
  const [editableSkills, setEditableSkills] = useState<SkillUpdate[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Listen for cruzi:skill-review events
  useEffect(() => {
    const handleSkillReview = (event: CustomEvent<VoiceSkillReviewData>) => {
      console.log('Skill review event received:', event.detail);
      setData(event.detail);
      setEditableSkills([...event.detail.skillUpdates]);
      setOpen(true);
    };

    window.addEventListener('cruzi:skill-review', handleSkillReview as EventListener);
    return () => {
      window.removeEventListener('cruzi:skill-review', handleSkillReview as EventListener);
    };
  }, []);

  const handleLevelChange = useCallback((topic: string, newLevel: number) => {
    setEditableSkills(prev =>
      prev.map(skill =>
        skill.topic === topic ? { ...skill, level: newLevel } : skill
      )
    );
  }, []);

  const handleCommit = async () => {
    if (!data || !user?.id) return;
    
    setIsSaving(true);
    try {
      const result = await saveSkillUpdates(user.id, data.studentId, editableSkills);
      
      if (result.success) {
        toast({
          title: 'Skills Updated',
          description: `${editableSkills.length} skill(s) saved for ${data.studentName}`,
        });
        
        // Emit event so other components can refresh
        window.dispatchEvent(new CustomEvent('cruzi:skill-updated', {
          detail: {
            studentId: data.studentId,
            updates: editableSkills,
          },
        }));
        
        setOpen(false);
        setData(null);
      } else {
        toast({
          title: 'Failed to Save',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save skills:', error);
      toast({
        title: 'Error',
        description: 'Could not save skill updates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setOpen(false);
    setData(null);
    navigator.vibrate?.(30);
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Review Skills for {data.studentName}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Verify the extracted skills before saving
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-2">
          <div className="space-y-4">
            {editableSkills.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No skills were detected.</p>
              </div>
            ) : (
              editableSkills.map((skill) => (
                <motion.div
                  key={skill.topic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        DVSA Skill
                      </p>
                      <h4 className="text-base font-semibold text-white">
                        {skill.topic}
                      </h4>
                    </div>

                    {/* Level selector */}
                    <div className="flex items-center gap-1 bg-black/30 p-1 rounded-full">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleLevelChange(skill.topic, lvl)}
                          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
                            skill.level === lvl
                              ? 'bg-white text-slate-900'
                              : 'text-slate-500 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-xs text-slate-500 text-center">
                      {LEVEL_LABELS[skill.level]}
                    </p>
                  </div>
                </motion.div>
              ))
            )}

            {/* Unmatched skills warning */}
            {data.unmatchedSkills.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  Could not match
                </p>
                <p className="text-sm text-slate-300">
                  {data.unmatchedSkills.join(', ')}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={handleDiscard}
            disabled={isSaving}
            className="flex-1 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            onClick={handleCommit}
            disabled={isSaving || editableSkills.length === 0}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
          >
            <Check className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Commit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSkillReviewModal;
