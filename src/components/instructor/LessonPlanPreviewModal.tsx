import React, { useState } from 'react';
import { X, Send, FileText, User, Sparkles, BookOpen, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';

interface MainActivity {
  skill: string;
  activity: string;
  duration_minutes: number;
  key_points: string[];
}

interface CommonFault {
  fault: string;
  correction: string;
}

interface LessonPlanData {
  title: string;
  objective: string;
  warm_up?: string;
  main_activities?: MainActivity[];
  common_faults?: CommonFault[];
  student_summary?: string;
  instructor_tips?: string;
}

interface LessonPlanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentAvatar?: string;
  skills: string[];
  plan?: LessonPlanData | null;
  onSubmit: (title: string, summary: string) => Promise<void>;
}

const LessonPlanPreviewModal: React.FC<LessonPlanPreviewModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentAvatar,
  skills,
  plan,
  onSubmit,
}) => {
  const [personalNote, setPersonalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = plan?.title || (skills.length === 1 
    ? `Focus: ${skills[0]}` 
    : `Focus: ${skills.length} Skills`);

  const objective = plan?.objective || (skills.length === 1
    ? `Improve ${skills[0]} proficiency from current level to next stage`
    : `Improve proficiency: ${skills.join(', ')}`);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const summary = personalNote.trim() 
        ? personalNote 
        : plan?.student_summary || `Your instructor has identified ${skills.length === 1 ? skills[0] : `${skills.length} skills`} as focus areas for upcoming lessons.`;
      
      await onSubmit(title, summary);
      setPersonalNote('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPersonalNote('');
      onClose();
    }
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-foreground text-background pt-safe">
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={() => { triggerHaptic(); handleClose(); }}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-background/10 active:scale-95 transition-transform touch-manipulation"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest">Lesson Plan</span>
              </div>
              <div className="w-11" />
            </div>
            <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-teal-400" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-safe">
            {/* Student Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/30 shadow-lg">
                    <img src={studentAvatar || `https://picsum.photos/200/200?random=${studentName}`} alt={studentName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sending to</p>
                    <h3 className="text-lg font-black text-foreground">{studentName}</h3>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Plan Content with Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {plan ? (
                <Tabs defaultValue="student" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="student" className="text-xs font-bold">Student View</TabsTrigger>
                    <TabsTrigger value="instructor" className="text-xs font-bold">Instructor View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="student">
                    <GlassCard className="p-5 border-primary/30 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">What Student Will See</span>
                      </div>
                      <h2 className="text-xl font-black text-foreground">{title}</h2>
                      <p className="text-sm text-muted-foreground">{objective}</p>

                      {plan.student_summary && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                          <p className="text-sm text-foreground leading-relaxed">{plan.student_summary}</p>
                        </div>
                      )}

                      {/* Student-friendly activities */}
                      {plan.warm_up && (
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                          <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">We'll Start With</p>
                          <p className="text-sm text-foreground">{plan.warm_up}</p>
                        </div>
                      )}

                      {plan.main_activities && plan.main_activities.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest">What We'll Cover</p>
                          {plan.main_activities.map((activity, idx) => (
                            <div key={idx} className="bg-muted/50 rounded-xl p-4 space-y-2">
                              <h4 className="text-sm font-black text-foreground">{activity.skill}</h4>
                              <p className="text-xs text-muted-foreground">{activity.activity}</p>
                              {activity.key_points.length > 0 && (
                                <ul className="space-y-1">
                                  {activity.key_points.map((point, pIdx) => (
                                    <li key={pIdx} className="text-xs text-foreground/80 flex items-start gap-2">
                                      <span className="text-primary mt-0.5">•</span> {point}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{skill}</span>
                        ))}
                      </div>
                    </GlassCard>
                  </TabsContent>

                  <TabsContent value="instructor" className="space-y-4">
                    {/* Warm Up */}
                    {plan.warm_up && (
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Warm-Up</span>
                        </div>
                        <p className="text-sm text-foreground">{plan.warm_up}</p>
                      </GlassCard>
                    )}

                    {/* Main Activities */}
                    {plan.main_activities && plan.main_activities.length > 0 && (
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Main Activities</span>
                        </div>
                        <div className="space-y-4">
                          {plan.main_activities.map((activity, idx) => (
                            <div key={idx} className="bg-muted/50 rounded-xl p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-foreground">{activity.skill}</h4>
                                <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">{activity.duration_minutes} min</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{activity.activity}</p>
                              {activity.key_points.length > 0 && (
                                <ul className="space-y-1">
                                  {activity.key_points.map((point, pIdx) => (
                                    <li key={pIdx} className="text-xs text-foreground/80 flex items-start gap-2">
                                      <span className="text-primary mt-0.5">•</span> {point}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                    {/* Common Faults */}
                    {plan.common_faults && plan.common_faults.length > 0 && (
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Common Faults</span>
                        </div>
                        <div className="space-y-3">
                          {plan.common_faults.map((fault, idx) => (
                            <div key={idx} className="border-l-2 border-orange-400 pl-3">
                              <p className="text-xs font-bold text-foreground">{fault.fault}</p>
                              <p className="text-xs text-muted-foreground mt-1">→ {fault.correction}</p>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                    {/* Instructor Tips */}
                    {plan.instructor_tips && (
                      <GlassCard className="p-5 border-violet-500/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-violet-500" />
                          <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Your Tips (Private)</span>
                        </div>
                        <p className="text-sm text-foreground/80 italic">{plan.instructor_tips}</p>
                      </GlassCard>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                /* Fallback: simple skill list view */
                <GlassCard className="p-5 border-primary/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">What Student Will See</span>
                  </div>
                  <h2 className="text-xl font-black text-foreground mb-3">{title}</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Skills Included</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Objective</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{objective}</p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>

            {/* Personal Note */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personal Note (Optional)</span>
                </div>
                <Textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add a personal message for your student..."
                  className="min-h-[100px] bg-muted/50 border-muted resize-none text-sm"
                  disabled={isSubmitting}
                />
              </GlassCard>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-background/80 backdrop-blur-xl px-4 py-4 pb-safe">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { triggerHaptic(); handleClose(); }}
                className="flex-1 h-14 text-base font-bold rounded-2xl touch-manipulation active:scale-95 transition-transform"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => { triggerHaptic(); handleSubmit(); }}
                className="flex-1 h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 touch-manipulation active:scale-95 transition-transform gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send to Student
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LessonPlanPreviewModal;
