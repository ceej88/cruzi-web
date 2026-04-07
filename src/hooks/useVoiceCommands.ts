// useVoiceCommands - Voice command execution hook for Cruzi Co-Pilot
import { useState, useCallback, useRef, useEffect } from 'react';
import { useVoiceChat, GeminiVoice } from './useVoiceChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VoiceCommandResult, VoiceCommandState, VoiceContext, StudentMatch } from '@/types/voiceCommands';
import { executeVoiceCommand, ExecutionResult } from '@/services/voiceActionExecutor';
import { 
  buildEnrichedStudentList, 
  generatePhoneticHints, 
  loadLearningData, 
  recordUsage, 
  recordCommandPattern,
  getTopCommandPatterns
} from '@/services/voiceLearningService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Gemini TTS voice for Voice Command responses
const VOICE_COMMAND_VOICE: GeminiVoice = 'Kore';

interface UseVoiceCommandsOptions {
  onCommandExecuted?: (result: ExecutionResult) => void;
  onClarificationNeeded?: (candidates: StudentMatch[], heardPhrase: string, originalCommand: string) => void;
  autoSpeak?: boolean;
}

export function useVoiceCommands(options: UseVoiceCommandsOptions = {}) {
  const { autoSpeak = true } = options;
  const { user } = useAuth();
  
  const [state, setState] = useState<VoiceCommandState>({
    status: 'idle',
    transcript: '',
    interimTranscript: '',
    parsedCommand: null,
    error: null,
    lastResponse: null,
  });
  
  const pendingTranscriptRef = useRef<string>('');
  const confirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCommandRef = useRef<{ command: VoiceCommandResult; transcript: string } | null>(null);
  
  // Refs to store functions for use in callbacks (avoids circular dependency)
  const speakFnRef = useRef<(text: string, voice?: GeminiVoice) => void>(() => {});
  const executeCommandRef = useRef<(command: VoiceCommandResult) => Promise<void>>();
  const parseCommandRef = useRef<(transcript: string) => Promise<VoiceCommandResult>>();
  
  // Build enriched context for the AI with learning data
  const buildContext = useCallback(async (): Promise<VoiceContext> => {
    if (!user?.id) {
      return {
        students: [],
        todayLessons: [],
        upcomingLessons: [],
        currentTime: format(new Date(), 'HH:mm'),
        currentDate: format(new Date(), 'EEEE, MMMM do'),
      };
    }
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const endOfWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get enriched students with learning data
    const enrichedStudents = await buildEnrichedStudentList(user.id);
    
    // Get learning data for context
    const learningData = loadLearningData();
    const topPatterns = getTopCommandPatterns(5);
    
    // Generate phonetic hints from enriched students
    const phoneticHints = generatePhoneticHints(enrichedStudents);
    
    // Fetch today's lessons
    const { data: todayLessons } = await supabase
      .from('lessons')
      .select('id, scheduled_at, status, profiles!lessons_student_id_fkey(full_name)')
      .eq('instructor_id', user.id)
      .gte('scheduled_at', startOfDay)
      .lte('scheduled_at', endOfDay)
      .order('scheduled_at', { ascending: true });
    
    // Fetch upcoming lessons
    const { data: upcomingLessons } = await supabase
      .from('lessons')
      .select('id, scheduled_at, profiles!lessons_student_id_fkey(full_name)')
      .eq('instructor_id', user.id)
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', endOfWeek)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })
      .limit(10);
    
    return {
      students: enrichedStudents.map(s => ({
        id: s.id,
        name: s.name,
        balance: s.balance,
      })),
      enrichedStudents,
      phoneticHints,
      corrections: learningData.corrections,
      topPatterns,
      todayLessons: (todayLessons || []).map(l => ({
        id: l.id,
        studentName: (l.profiles as any)?.full_name || 'Unknown',
        time: format(new Date(l.scheduled_at), 'HH:mm'),
        status: l.status,
      })),
      upcomingLessons: (upcomingLessons || []).map(l => ({
        id: l.id,
        studentName: (l.profiles as any)?.full_name || 'Unknown',
        date: format(new Date(l.scheduled_at), 'EEEE'),
        time: format(new Date(l.scheduled_at), 'HH:mm'),
      })),
      currentTime: format(new Date(), 'HH:mm'),
      currentDate: format(new Date(), 'EEEE, MMMM do'),
    };
  }, [user?.id]);
  
  // Parse transcript using cruzi-ai
  const parseCommand = useCallback(async (transcript: string): Promise<VoiceCommandResult> => {
    const context = await buildContext();
    
    const { data, error } = await supabase.functions.invoke('cruzi-ai', {
      body: {
        action: 'voice-command',
        command: transcript,
        voiceContext: context,
      },
    });
    
    if (error) {
      console.error('Failed to parse voice command:', error);
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        parameters: {},
        confirmationRequired: false,
        spokenConfirmation: "Sorry, I couldn't process that. Please try again.",
      };
    }
    
    return data as VoiceCommandResult;
  }, [buildContext]);
  
  // Keep parseCommandRef in sync
  useEffect(() => {
    parseCommandRef.current = parseCommand;
  }, [parseCommand]);

  // Handle incoming transcript from voice recognition
  const handleTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    setState(prev => ({
      ...prev,
      status: 'processing',
      transcript: text,
      interimTranscript: '',
    }));
    
    // Record the command pattern for learning
    recordCommandPattern(text);
    
    try {
      const parsed = await parseCommandRef.current?.(text);
      if (!parsed) return;
      
      // Check if clarification is needed (ambiguous student match)
      if (parsed.isAmbiguous && parsed.studentCandidates && parsed.studentCandidates.length > 1) {
        // Store the pending command for after clarification
        pendingCommandRef.current = { command: parsed, transcript: text };
        
        setState(prev => ({
          ...prev,
          status: 'clarifying',
          parsedCommand: parsed,
          clarificationCandidates: parsed.studentCandidates,
          clarificationHeardPhrase: parsed.heardStudentName || 'unknown',
        }));
        
        // Speak the clarification request using Gemini TTS
        if (autoSpeak) {
          const names = parsed.studentCandidates.map(c => c.name).join(' or ');
          speakFnRef.current(`Did you mean ${names}?`, VOICE_COMMAND_VOICE);
        }
        
        // Notify parent component
        options.onClarificationNeeded?.(
          parsed.studentCandidates,
          parsed.heardStudentName || '',
          text
        );
        
        return;
      }
      
      if (parsed.confirmationRequired) {
        setState(prev => ({
          ...prev,
          status: 'confirming',
          parsedCommand: parsed,
        }));
        
        // Speak the confirmation request using Gemini TTS
        if (autoSpeak) {
          speakFnRef.current(parsed.spokenConfirmation, VOICE_COMMAND_VOICE);
        }
        
        // Auto-timeout confirmation after 10 seconds
        confirmationTimeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            status: 'idle',
            parsedCommand: null,
            error: 'Confirmation timed out',
          }));
        }, 10000);
      } else {
        // Execute immediately for safe actions or conversations
        await executeCommandRef.current?.(parsed);
      }
    } catch (err) {
      console.error('Voice command error:', err);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to process command',
      }));
    }
  }, [autoSpeak, options]);

  // Voice chat hook - with transcript handler
  const {
    isListening,
    interimTranscript,
    isSpeechSupported,
    toggleListening,
    stopListening,
    isSpeaking,
    speakText,
    stopSpeaking,
    ttsEnabled,
    toggleTTS,
    speakVoiceCommand,
  } = useVoiceChat({
    lang: 'en-GB',
    onTranscript: handleTranscript,
  });
  
  // Update speak ref when function changes - use Gemini TTS for voice commands
  useEffect(() => {
    speakFnRef.current = (text: string, voice: GeminiVoice = VOICE_COMMAND_VOICE) => {
      speakVoiceCommand(text, voice);
    };
  }, [speakVoiceCommand]);
  
  // Update state with interim transcript
  useEffect(() => {
    setState(prev => ({
      ...prev,
      interimTranscript,
      status: isListening ? 'listening' : prev.status === 'listening' ? 'idle' : prev.status,
    }));
  }, [interimTranscript, isListening]);

  // Execute a parsed command
  const executeCommand = useCallback(async (command: VoiceCommandResult) => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Not authenticated',
      }));
      return;
    }
    
    // Clear confirmation timeout if any
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    
    // Clear pending command
    pendingCommandRef.current = null;
    
    setState(prev => ({
      ...prev,
      status: 'executing',
      clarificationCandidates: undefined,
      clarificationHeardPhrase: undefined,
    }));
    
    try {
      const result = await executeVoiceCommand(user.id, command);
      
      // Record student usage for learning (if a student was involved)
      if (result.success && command.parameters?.studentId) {
        recordUsage(command.parameters.studentId);
      }
      
      setState(prev => ({
        ...prev,
        status: result.success ? 'success' : 'error',
        lastResponse: result.message,
        parsedCommand: null,
      }));
      
      // Handle skill updates that require review panel
      if (command.intent === 'UPDATE_SKILL' && result.success && result.data?.requiresReview) {
        window.dispatchEvent(new CustomEvent('cruzi:skill-review', {
          detail: {
            studentId: result.data.studentId,
            studentName: result.data.studentName,
            skillUpdates: result.data.skillUpdates,
            unmatchedSkills: result.data.unmatchedSkills,
          },
        }));
      }
      
      // Emit skill-updated event for confirmed UPDATE_SKILL intents (from review panel)
      if (command.intent === 'UPDATE_SKILL' && result.success && result.data?.updates && !result.data?.requiresReview) {
        window.dispatchEvent(new CustomEvent('cruzi:skill-updated', {
          detail: {
            studentId: result.data.studentId,
            updates: result.data.updates,
          },
        }));
      }
      
      // Emit lesson-created event for BOOK_LESSON intents to refresh calendar
      if (command.intent === 'BOOK_LESSON' && result.success && result.data?.lessonCreated) {
        window.dispatchEvent(new CustomEvent('cruzi:lesson-created', {
          detail: { refreshSchedule: true },
        }));
      }
      
      // Emit broadcast-sent event
      if (command.intent === 'BROADCAST_MESSAGE' && result.success && result.data?.broadcastSent) {
        window.dispatchEvent(new CustomEvent('cruzi:broadcast-sent', {
          detail: { recipientCount: result.data.recipientCount },
        }));
      }
      
      // Speak the result using Gemini TTS
      if (autoSpeak) {
        speakFnRef.current(result.message, VOICE_COMMAND_VOICE);
      }
      
      // Haptic feedback
      navigator.vibrate?.(result.success ? [50, 50, 50] : [100, 50, 100, 50, 100]);
      
      // Show toast
      toast({
        title: result.success ? 'Done!' : 'Oops',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
      options.onCommandExecuted?.(result);
      
      // Reset to idle after a delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          status: 'idle',
        }));
      }, 3000);
    } catch (err) {
      console.error('Execution error:', err);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to execute command',
        parsedCommand: null,
      }));
    }
  }, [user?.id, autoSpeak, options]);

  // Keep executeCommandRef in sync
  useEffect(() => {
    executeCommandRef.current = executeCommand;
  }, [executeCommand]);
  
  // Confirm pending command
  const confirmCommand = useCallback(() => {
    if (state.parsedCommand) {
      executeCommand(state.parsedCommand);
    }
  }, [state.parsedCommand, executeCommand]);
  
  // Cancel pending command - stops everything immediately
  const cancelCommand = useCallback(() => {
    // Clear confirmation timeout
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
      confirmationTimeoutRef.current = null;
    }
    
    // Clear pending command
    pendingCommandRef.current = null;
    
    // Stop speaking immediately
    stopSpeaking();
    
    // Stop listening if active
    stopListening();
    
    // Reset all state
    setState({
      status: 'idle',
      transcript: '',
      interimTranscript: '',
      parsedCommand: null,
      error: null,
      lastResponse: null,
      clarificationCandidates: undefined,
      clarificationHeardPhrase: undefined,
    });
    
    // Quick feedback
    navigator.vibrate?.(50);
  }, [stopSpeaking, stopListening]);
  
  // Resolve clarification - when user selects which student they meant
  const resolveClarification = useCallback((selectedStudent: StudentMatch) => {
    if (!pendingCommandRef.current) {
      console.warn('[VoiceCommands] No pending command to resolve');
      return;
    }
    
    const { command, transcript } = pendingCommandRef.current;
    
    // Update the command with the correct student
    const resolvedCommand: VoiceCommandResult = {
      ...command,
      isAmbiguous: false,
      studentCandidates: undefined,
      heardStudentName: undefined,
      parameters: {
        ...command.parameters,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
      },
    };
    
    // Execute with the resolved student
    executeCommand(resolvedCommand);
  }, [executeCommand]);
  
  // Start listening for a command
  const startListening = useCallback(() => {
    if (!isSpeechSupported) {
      toast({
        title: 'Not Supported',
        description: 'Voice commands are not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset state
    setState({
      status: 'listening',
      transcript: '',
      interimTranscript: '',
      parsedCommand: null,
      error: null,
      lastResponse: null,
    });
    
    navigator.vibrate?.(30);
    toggleListening();
  }, [isSpeechSupported, toggleListening]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) {
        clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // State
    ...state,
    isListening,
    isSpeaking,
    isSpeechSupported,
    ttsEnabled,
    
    // Actions
    startListening,
    stopListening,
    confirmCommand,
    cancelCommand,
    resolveClarification,
    toggleTTS,
    speakText,
    stopSpeaking,
    speakVoiceCommand,
  };
}
