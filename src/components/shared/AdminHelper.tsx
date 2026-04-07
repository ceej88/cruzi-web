// Cruzi AI - Admin Helper Chat Assistant
// AI-powered chat for instructor admin tasks and reflective log generation
// Uses shared useVoiceChat hook for voice input and TTS

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { processAdminCommand, generateReflectiveLog, getAdminChatResponse } from '@/services/instructorAIService';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { Send, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX, ChevronLeft } from 'lucide-react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  data?: any;
  draftLog?: {
    summary: string;
    achievements: string[];
  };
}

const AdminHelper: React.FC = () => {
  const navigate = useNavigate();
  const { students, lessons, sendMessage } = useInstructorData();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'ai', content: "Hello! I'm Cruzi, your AI assistant. Ask me anything about your students, schedule, or say something like 'log Alex did great today' to create notes." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBuffer, setEditBuffer] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice chat hook
  const {
    isListening,
    interimTranscript,
    isSpeechSupported,
    toggleListening,
    stopListening,
    isSpeaking,
    ttsEnabled,
    isTTSSupported,
    speakText,
    toggleTTS,
  } = useVoiceChat({
    onTranscript: useCallback((text: string) => {
      setInput(prev => prev + (prev ? ' ' : '') + text);
    }, []),
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Build context from real data
  const instructorContext = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekEnd = endOfWeek(now);

    const todayLessons = lessons?.filter(l => {
      const lessonDate = new Date(l.scheduled_at);
      return lessonDate >= todayStart && lessonDate <= todayEnd;
    }).length || 0;

    const upcomingLessons = lessons?.filter(l => {
      const lessonDate = new Date(l.scheduled_at);
      return lessonDate > now && lessonDate <= weekEnd;
    }).length || 0;

    return {
      studentCount: students?.length || 0,
      studentNames: students?.map(s => s.full_name || 'Unknown').filter(Boolean) || [],
      todayLessons,
      upcomingLessons,
    };
  }, [students, lessons]);

  // Detect if this is a question vs command - be generous with detection
  const isQuestion = (text: string): boolean => {
    const lower = text.toLowerCase().trim();
    
    // Command patterns that should trigger action mode
    const commandPatterns = [
      /^(log|note)\s/,                    // "log Alex..." or "note that..."
      /^(message|send|text)\s/,           // "message Alex..."
      /^(draft|write|create)\s+(a\s+)?(message|log|note|reflective)/,  // "draft a message..."
    ];
    
    // If it has explicit command patterns, it's a command
    if (commandPatterns.some(p => p.test(lower))) {
      return false;
    }
    
    // Everything else is treated as a question/chat (including "draft me a lesson plan")
    return true;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    // Stop listening when sending
    stopListening();
    
    const userMsg: Message = { id: Date.now().toString(), type: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Check if this is a question (use chat) or a command (use command parser)
      if (isQuestion(currentInput)) {
        // Use conversational chat with context
        const response = await getAdminChatResponse(currentInput, instructorContext);
        const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', content: response };
        setMessages(prev => [...prev, aiMsg]);
        speakText(response);
      } else {
        // Use command parser for actions
        const response = await processAdminCommand(currentInput);
        
        if (response.action === "GENERATE_LOG") {
          // Try to match student name from input
          const matchedStudent = students.find(s => 
            currentInput.toLowerCase().includes(s.full_name?.toLowerCase().split(' ')[0] || '')
          ) || students[0];
          
          if (matchedStudent) {
            const log = await generateReflectiveLog(
              matchedStudent.full_name || 'Student', 
              currentInput, 
              "General Lesson"
            );
            
            const aiContent = `I've drafted a reflective log for ${matchedStudent.full_name}. Review and refine it below:`;
            const aiMsg: Message = { 
              id: (Date.now() + 1).toString(), 
              type: 'ai', 
              content: aiContent,
              draftLog: log 
            };
            setMessages(prev => [...prev, aiMsg]);
            setEditBuffer(log.summary);
            speakText(aiContent);
          } else {
            const errorContent = "I couldn't identify the student. Please mention their name or select them first.";
            setMessages(prev => [...prev, { 
              id: (Date.now() + 1).toString(), 
              type: 'ai', 
              content: errorContent 
            }]);
            speakText(errorContent);
          }
        } else if (response.action === "SEND_MESSAGE" && response.data) {
          // Handle sending message via instructor data hook
          const targetStudent = students.find(s => 
            s.full_name?.toLowerCase().includes(response.data.to?.toLowerCase() || '')
          );
          if (targetStudent) {
            await sendMessage.mutateAsync({
              receiverId: targetStudent.user_id,
              content: response.data.content
            });
          }
          const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', content: response.confirmation, data: response.data };
          setMessages(prev => [...prev, aiMsg]);
          speakText(response.confirmation);
        } else {
          const aiMsg: Message = { id: (Date.now() + 1).toString(), type: 'ai', content: response.confirmation, data: response.data };
          setMessages(prev => [...prev, aiMsg]);
          speakText(response.confirmation);
        }
      }
    } catch (err) {
      const errorContent = "I hit a snag. Could you try rephrasing that?";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', content: errorContent }]);
      speakText(errorContent);
    } finally {
      setLoading(false);
    }
  };

  const finalizeLog = (msgId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId && m.draftLog 
        ? { ...m, content: "Success: Reflective Log refined and synced to pupil dossier.", draftLog: undefined }
        : m
    ));
  };

  return (
    <div className="max-w-full md:max-w-3xl mx-auto h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] flex flex-col bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 md:p-6 bg-foreground text-background">
        {/* Header row - responsive */}
        <div className="flex items-center justify-between gap-2 mb-2 md:mb-0">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Exit Button */}
            <button
              onClick={() => navigate('/instructor')}
              className="w-9 h-9 md:w-10 md:h-10 bg-background/10 hover:bg-background/20 rounded-xl flex items-center justify-center shrink-0 transition-colors active:scale-95"
              title="Exit to Dashboard"
            >
              <ChevronLeft className="h-5 w-5 text-background" />
            </button>
            
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black tracking-tight leading-none mb-1 text-sm md:text-base truncate">Cruzi Intelligence</h2>
              <p className="text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-widest truncate">Methodology Learning Active</p>
            </div>
          </div>
          
          {/* Online indicator - always visible */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden md:inline">Online</span>
          </div>
        </div>
        
        {/* Voice controls - wrap on mobile */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {isTTSSupported && (
            <button
              onClick={toggleTTS}
              className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-colors text-[9px] ${
                ttsEnabled ? 'bg-primary/20' : 'bg-background/10'
              }`}
              title={ttsEnabled ? 'Voice responses on' : 'Voice responses off'}
            >
              {ttsEnabled ? (
                <Volume2 className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isSpeaking ? 'text-primary animate-pulse' : 'text-primary'}`} />
              ) : (
                <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
              )}
              <span className="font-black uppercase tracking-widest">
                {isSpeaking ? 'Speaking' : ttsEnabled ? 'Voice On' : 'Voice Off'}
              </span>
            </button>
          )}
          {isSpeechSupported && (
            <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-colors ${isListening ? 'bg-destructive/20' : 'bg-background/10'}`}>
              <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isListening ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isListening ? 'Listening' : 'Voice Ready'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-muted/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.type === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card text-foreground border border-border rounded-tl-none'
            }`}>
              <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
              
              {msg.draftLog && (
                <div className="mt-4 p-5 bg-primary/10 rounded-2xl border border-primary/20 space-y-4 animate-in slide-in-from-top-2">
                   <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">Draft Log Summary</p>
                   </div>
                   <textarea 
                     value={editBuffer}
                     onChange={(e) => setEditBuffer(e.target.value)}
                     className="w-full bg-background border border-border rounded-xl p-4 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none min-h-[120px]"
                   />
                   <div className="space-y-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Achievements Identified</p>
                      <div className="flex flex-wrap gap-2">
                         {msg.draftLog.achievements.map((a: string, i: number) => (
                           <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-bold">#{a}</span>
                         ))}
                      </div>
                   </div>
                   <button 
                    onClick={() => finalizeLog(msg.id)}
                    className="w-full py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
                   >
                     Confirm & Send to Pupil
                   </button>
                </div>
              )}

              {msg.data && (
                <div className="mt-3 p-3 bg-muted rounded-xl border border-border">
                   <button className="w-full py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-lg">Apply via Cruzi</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-1.5 p-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-border">
        {/* Interim transcript display */}
        {interimTranscript && (
          <div className="mb-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-xs text-primary font-medium italic">
              <Mic className="h-3 w-3 inline mr-2" />
              {interimTranscript}
            </p>
          </div>
        )}
        
        <div className="relative flex items-center gap-2">
          {/* Voice Input Button */}
          {isSpeechSupported && (
            <button 
              onClick={toggleListening}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                isListening 
                  ? 'bg-destructive text-destructive-foreground animate-pulse' 
                  : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
          
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={isListening ? "Listening... speak now" : "Type a command or tap mic..."} 
              className="w-full pl-4 pr-14 py-5 bg-muted border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary" 
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Voice input hint */}
        {isSpeechSupported && !isListening && (
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest text-center mt-3">
            Tap the mic for hands-free dictation
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminHelper;
