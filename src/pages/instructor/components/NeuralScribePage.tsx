import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Brain, Loader2, HelpCircle, Check, Trash2, ArrowLeft, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processAudioWithAI } from '@/services/neuralScribeService';
import { saveSnippet, generateSnippetId, AudioSnippet, clearLessonSnippets } from '@/services/audioStorage';
import { NeuralSessionResult } from '@/types';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ScribeGuide from './ScribeGuide';
import { normalizeTopicName, CANONICAL_TOPICS, CanonicalTopic } from '@/hooks/useUnifiedSkillProgress';
import LessonPlanPreviewModal from '@/components/instructor/LessonPlanPreviewModal';

type PageMode = 'RECORD' | 'RESULT' | 'GUIDE';

interface RecordedSegment {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: string;
}

const MAX_SEGMENTS = 4;

const NeuralScribePage: React.FC = () => {
  const { user } = useAuth();
  const { students, skillProgress, saveSessionLog, isLoading } = useInstructorData();
  
  // Fetch instructor's own profile for name
  const [instructorName, setInstructorName] = useState<string>('Instructor');
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('profiles').select('full_name, email').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setInstructorName(data.full_name || data.email || 'Instructor');
      });
  }, [user?.id]);
  
  // Student selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Page mode
  const [mode, setMode] = useState<PageMode>('RECORD');
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [segments, setSegments] = useState<RecordedSegment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  
  // Result state
  const [sessionResult, setSessionResult] = useState<NeuralSessionResult | null>(null);
  const [skillsDiscussed, setSkillsDiscussed] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  
  // Lesson plan generation state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const segmentStartTimeRef = useRef<number>(0);

  // Set default selected student
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].user_id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(() => 
    students.find(p => p.user_id === selectedStudentId) || students[0]
  , [students, selectedStudentId]);

  // Compute current skills for passing to AI (still needed for context)
  const currentSkills = useMemo(() => {
    const skills: Record<string, number> = {};
    const studentSkills = skillProgress.filter(s => s.student_id === selectedStudentId);
    for (const skill of studentSkills) {
      const normalizedTopic = normalizeTopicName(skill.topic);
      if (normalizedTopic) {
        skills[normalizedTopic] = Math.max(skills[normalizedTopic] || 0, skill.level);
      }
    }
    return skills;
  }, [skillProgress, selectedStudentId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Navigate back to dashboard
  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'dashboard' } }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    if (segments.length >= MAX_SEGMENTS) {
      setError(`Maximum ${MAX_SEGMENTS} segments allowed.`);
      return;
    }
    
    try {
      setError(null);
      chunksRef.current = [];
      segmentStartTimeRef.current = Date.now();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const duration = Math.round((Date.now() - segmentStartTimeRef.current) / 1000);
        const segmentId = generateSnippetId();
        const timestamp = new Date().toISOString();
        
        const newSegment: RecordedSegment = {
          id: segmentId,
          blob,
          duration,
          timestamp,
        };
        
        const snippet: AudioSnippet = {
          id: segmentId,
          lessonId: sessionId,
          studentId: selectedStudentId,
          blob,
          timestamp,
          duration,
          isProcessed: false,
        };
        
        try {
          await saveSnippet(snippet);
        } catch (err) {
          console.error('[Neural Scribe] Failed to save segment:', err);
        }
        
        setSegments(prev => [...prev, newSegment]);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setCurrentDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setCurrentDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  }, [segments.length, sessionId, selectedStudentId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setCurrentDuration(0);
    }
  }, [isRecording]);

  const deleteSegment = useCallback((segmentId: string) => {
    setSegments(prev => prev.filter(s => s.id !== segmentId));
  }, []);

  const synthesizeAll = useCallback(async () => {
    if (segments.length === 0) {
      setError('No recordings to process. Record at least one segment.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const allBlobs = segments.map(s => s.blob);
      const combinedBlob = new Blob(allBlobs, { type: segments[0].blob.type || 'audio/webm' });
      
      const response = await processAudioWithAI(
        combinedBlob, 
        selectedStudent?.full_name || 'Student', 
        currentSkills
      );
      
      if (response.success && response.result) {
        await clearLessonSnippets(sessionId);
        setSessionResult(response.result);
        // Handle both new skillsDiscussed and legacy suggestedSkills format
        const skills = response.result.skillsDiscussed || 
          ((response.result as any).suggestedSkills || []).map((s: any) => typeof s === 'string' ? s : s.topic);
        setSkillsDiscussed(skills);
        setMode('RESULT');
      } else if (response.error === 'no_speech_detected') {
        toast.error('No speech detected', {
          description: 'Please speak clearly about the lesson when recording. Try again with audible commentary.',
        });
        setError('No speech detected in the recording. Please speak clearly when recording.');
      } else {
        setError(response.error || 'Failed to process audio');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [segments, selectedStudent, currentSkills, sessionId]);

  const handleCommit = useCallback(async () => {
    if (!sessionResult || !selectedStudent) return;
    
    setIsCommitting(true);
    
    try {
      // Save session log only — NO skill_progress updates
      await saveSessionLog.mutateAsync({
        student_id: selectedStudentId,
        lesson_id: null,
        summary: sessionResult.summary,
        reflective_log: sessionResult.reflectiveLog,
        next_focus: sessionResult.nextLessonFocus,
        skill_updates: skillsDiscussed.map(topic => ({ topic })),
      });
      
      toast.success('Session saved');
      
      // Reset and go back
      setSessionResult(null);
      setSkillsDiscussed([]);
      setSegments([]);
      setMode('RECORD');
      
    } catch (err) {
      console.error('Commit error:', err);
      toast.error('Failed to save session');
    } finally {
      setIsCommitting(false);
    }
  }, [sessionResult, selectedStudent, selectedStudentId, skillsDiscussed, saveSessionLog]);

  const handleDiscard = useCallback(() => {
    setSessionResult(null);
    setSkillsDiscussed([]);
    setSegments([]);
    setGeneratedPlan(null);
    setMode('RECORD');
  }, []);

  const handleGeneratePlan = useCallback(async () => {
    if (!sessionResult || !selectedStudent || !user?.id) return;
    setIsGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          studentId: selectedStudentId,
          skillTopics: skillsDiscussed,
          voiceScribeSummary: sessionResult.summary,
          reflectiveLog: sessionResult.reflectiveLog,
          nextFocus: sessionResult.nextLessonFocus,
          instructorId: user.id,
          studentName: selectedStudent.full_name || 'Student',
        },
      });
      if (error) throw error;
      if (data?.plan) {
        setGeneratedPlan(data.plan);
        setShowPlanModal(true);
        toast.success('Lesson plan generated!');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (err) {
      console.error('Plan generation error:', err);
      toast.error('Failed to generate lesson plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [sessionResult, selectedStudent, selectedStudentId, skillsDiscussed, user?.id]);

  const totalDuration = segments.reduce((acc, s) => acc + s.duration, 0);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617] text-white">
        <Brain className="h-16 w-16 mb-4 text-slate-600" />
        <p className="text-xl font-bold text-slate-300">No students linked yet</p>
        <p className="text-sm text-slate-500 mt-2">Students will appear here once they connect via PIN</p>
        <Button onClick={handleBack} variant="ghost" className="mt-6 text-slate-400">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#020617]">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-[#8b5cf6]/10 rounded-full blur-[150px]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#2dd4bf]/10 rounded-full blur-[150px]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 shrink-0 p-6 pt-10 md:p-8 md:pt-12 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="text-slate-400 hover:text-white hover:bg-white/10 h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center">
            <Brain className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">Voice Scribe</h1>
            <div className="flex items-center gap-1 mt-1">
              <select 
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setSegments([]);
                  setSessionResult(null);
                  setSkillsDiscussed([]);
                  setMode('RECORD');
                }}
                className="bg-transparent text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-none p-0 focus:ring-0 cursor-pointer appearance-none pr-4"
              >
                {students.map(p => (
                  <option key={p.user_id} value={p.user_id} className="text-foreground bg-background">
                    {p.full_name || 'Student'}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-3 w-3 text-indigo-400" />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMode(mode === 'GUIDE' ? 'RECORD' : 'GUIDE')}
          className="text-slate-400 hover:text-white hover:bg-white/10 h-10 w-10"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </header>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-44">
        
        {mode === 'GUIDE' && (
          <div className="p-6 max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white text-center mb-8">How to Use</h2>
            <div className="space-y-4">
              {[
                { label: 'RECORD', desc: '"Narrate what happened during the lesson."' },
                { label: 'SKILLS', desc: '"Voice Scribe identifies which DVSA skills were discussed."' },
                { label: 'PLAN', desc: '"Generate a lesson plan from identified skills & templates."' },
                { label: 'SAVE', desc: '"Save the session log for your records."' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-medium italic text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setMode('RECORD')} 
              variant="ghost"
              className="w-full mt-6 text-slate-400 hover:text-white"
            >
              Back to Recording
            </Button>
          </div>
        )}

        {mode === 'RECORD' && (
          <div className="flex flex-col items-center py-8 px-4">
            {/* Segment Stepper */}
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all border ${
                    segments.length >= i
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                      : isRecording && segments.length + 1 === i
                      ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/30'
                      : 'bg-white/5 border-white/10 text-slate-600'
                  }`}
                >
                  {segments.length >= i ? <Check className="h-4 w-4" /> : i}
                </div>
              ))}
            </div>

            {/* Status Text */}
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse mb-2 h-4">
              {isRecording ? 'Recording...' : segments.length > 0 ? `${segments.length} Segments Logged` : 'Ready to Record'}
            </p>

            {/* Timer Display */}
            <motion.div
              className="text-7xl md:text-[10rem] font-black text-white tracking-[-0.04em] tabular-nums leading-none mb-8"
              animate={isRecording ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
              transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
            >
              {formatTime(isRecording ? currentDuration : 0)}
            </motion.div>

            {/* Record Button with Neural Rings */}
            <div className="relative mb-8">
              <div className={`absolute inset-[-24px] rounded-full border transition-all duration-1000 ${
                isRecording ? 'animate-ping scale-150 border-indigo-500/20' : 'border-white/5 scale-100 opacity-0'
              }`} />
              <div className={`absolute inset-[-12px] rounded-full border transition-all duration-700 ${
                isRecording ? 'animate-pulse border-indigo-500/40' : 'border-white/10'
              }`} />
              
              <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.90 }}
                className={`relative z-10 w-40 h-40 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border-[10px] border-[#020617] overflow-hidden ${
                  isRecording
                    ? 'bg-rose-600'
                    : isProcessing
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-br from-violet-500 via-purple-500 to-teal-500'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                ) : isRecording ? (
                  <>
                    <div className="w-8 h-8 bg-white rounded-lg mb-3 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-10 w-10 text-white mb-3 drop-shadow-lg" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Start Narrating</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold px-4 py-2 rounded-xl mb-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved Segments */}
            {segments.length > 0 && (
              <div className="w-full max-w-sm space-y-3">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Saved Segments • {formatTime(totalDuration)} total
                </h3>
                <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                  {segments.map((seg, idx) => (
                    <div
                      key={seg.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-indigo-600/20 text-indigo-400 text-[10px] font-black rounded flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-300">{formatTime(seg.duration)}</p>
                          <p className="text-[9px] text-slate-500">
                            {new Date(seg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSegment(seg.id)}
                        className="text-slate-500 hover:text-rose-400 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'RESULT' && sessionResult && (
          <div className="p-6 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="text-center mb-8 space-y-3">
              <span className="inline-block px-4 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-indigo-500/20">
                Analysis Complete
              </span>
              <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Review Results</h2>
            </div>

            {/* Summary Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] space-y-4 mb-6">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Lesson Summary</p>
              <p className="text-lg font-medium text-slate-200 leading-relaxed italic border-l-4 border-indigo-600 pl-4">
                "{sessionResult.summary}"
              </p>
              {sessionResult.reflectiveLog && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Reflective Log</p>
                  <p className="text-sm text-slate-400 italic">"{sessionResult.reflectiveLog}"</p>
                </div>
              )}
            </div>

            {/* Skills Discussed — Simple Tags */}
            <div className="space-y-4 mb-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Skills Discussed
              </h3>
              
              {skillsDiscussed.length === 0 ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center">
                  <p className="text-sm text-slate-400">No skills detected from this session.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillsDiscussed.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-4 py-2 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-sm font-bold text-indigo-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Next Focus */}
            {sessionResult.nextLessonFocus && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 mb-6">
                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Next Focus</p>
                <p className="text-base font-bold text-slate-200">{sessionResult.nextLessonFocus}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Footer Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent z-30"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 24px)' }}
      >
        <div className="max-w-sm mx-auto">
          {mode === 'RECORD' ? (
            <Button
              onClick={synthesizeAll}
              disabled={segments.length === 0 || isProcessing || isRecording}
              className={`w-full py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all flex items-center justify-center gap-3 ${
                segments.length > 0 && !isProcessing && !isRecording
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30'
                  : 'bg-white/5 text-slate-600 border border-white/5'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                `Process ${segments.length} Recording${segments.length !== 1 ? 's' : ''}`
              )}
            </Button>
          ) : mode === 'RESULT' ? (
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={handleDiscard}
                disabled={isCommitting || isGeneratingPlan}
                className="flex-1 py-5 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[9px]"
              >
                Resume
              </Button>
              <Button 
                onClick={handleGeneratePlan}
                disabled={isCommitting || isGeneratingPlan || skillsDiscussed.length === 0}
                className="flex-1 py-5 bg-white/5 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-xl font-black uppercase tracking-widest text-[9px]"
              >
                {isGeneratingPlan ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                {isGeneratingPlan ? 'Generating...' : 'Generate Plan'}
              </Button>
              <Button 
                onClick={handleCommit}
                disabled={isCommitting || isGeneratingPlan}
                className="flex-[2] py-5 bg-gradient-to-r from-violet-500 via-purple-500 to-teal-500 hover:opacity-90 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-2xl"
              >
                {isCommitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {isCommitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Lesson Plan Preview Modal */}
      {selectedStudent && (
        <LessonPlanPreviewModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          studentName={selectedStudent.full_name || 'Student'}
          studentAvatar={selectedStudent.avatar_url || undefined}
          skills={skillsDiscussed}
          plan={generatedPlan ? {
            title: generatedPlan.title,
            objective: generatedPlan.objective,
            warm_up: generatedPlan.warm_up,
            main_activities: generatedPlan.main_activities,
            common_faults: generatedPlan.common_faults,
            student_summary: generatedPlan.student_summary,
            instructor_tips: generatedPlan.instructor_tips,
          } : null}
          onSubmit={async (title, summary) => {
            if (!user?.id) return;
            // Build student-friendly activities (strip durations, faults, instructor tips)
            const studentActivities = generatedPlan?.main_activities?.map((a: any) => ({
              skill: a.skill,
              activity: a.activity,
              key_points: a.key_points || [],
            })) || null;
            await supabase.from('shared_plans').insert({
              instructor_id: user.id,
              student_id: selectedStudentId,
              title,
              objective: generatedPlan?.objective || `Focus areas: ${skillsDiscussed.join(', ')}`,
              student_summary: summary,
              bundled_skills: skillsDiscussed,
              student_activities: studentActivities ? JSON.stringify(studentActivities) : null,
            } as any);
            if (generatedPlan?.id) {
              await supabase.from('lesson_plans').update({ status: 'sent' }).eq('id', generatedPlan.id);
            }
            toast.success('Plan sent to student!');
          }}
        />
      )}
    </div>
  );
};

export default NeuralScribePage;
