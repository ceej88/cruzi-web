import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  ChevronLeft, 
  MessageSquare, 
  Smartphone, 
  Mail,
  Check,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBroadcast, StudentLevel } from '@/hooks/useBroadcast';
import { useInstructorData } from '@/hooks/useInstructorData';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
interface InstructorBroadcastProps {
  onNavigate?: (tab: string) => void;
  initialTemplate?: string;
}

const InstructorBroadcast: React.FC<InstructorBroadcastProps> = ({ onNavigate, initialTemplate }) => {
  const navigate = useNavigate();
  const { students } = useInstructorData();
  const { isDrafting, isDispatching, dispatchBroadcast, draftMessage, getTargetStudents } = useBroadcast();
  
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('in-app');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Calculate counts from actual student data
  const getAudienceCount = useCallback((audienceId: string) => {
    if (audienceId === 'all') return students.length;
    const levelMap: Record<string, string> = {
      'beginner': 'BEGINNER',
      'intermediate': 'INTERMEDIATE',
      'advanced': 'TEST_READY'
    };
    return getTargetStudents(students, [levelMap[audienceId] as StudentLevel]).length;
  }, [students, getTargetStudents]);

  const audiences = [
    { 
      id: 'all', 
      label: 'All Students', 
      icon: '👥',
      isGradient: true
    },
    { 
      id: 'beginner', 
      label: 'Beginner', 
      icon: '🌱',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      subtext: 'text-emerald-700'
    },
    { 
      id: 'intermediate', 
      label: 'Intermediate', 
      icon: '📈',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtext: 'text-amber-700'
    },
    { 
      id: 'advanced', 
      label: 'Test Ready', 
      icon: '🏆',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900',
      subtext: 'text-purple-700'
    }
  ];

  const templates = [
    { id: 'weather', label: '🌧️ Weather', text: "Due to today's weather conditions, please drive carefully on your way to our lesson. If conditions worsen, I may need to reschedule for safety. I'll keep you updated!" },
    { id: 'schedule', label: '📅 Schedule', text: "Quick update: There's been a change to our lesson schedule. Please check your booking for the new time. Let me know if this doesn't work for you." },
    { id: 'test', label: '🎯 Test Prep', text: "Test day is approaching! Here's what to focus on this week: review your manoeuvres, practice observation, and get plenty of rest before the big day." },
    { id: 'great', label: '⭐ Great Job!', text: 'Fantastic progress this week! Your skills are really coming together. Keep up the great work and stay focused on the areas we discussed.' },
    { id: 'cancel', label: '❌ Cancel', text: "Unfortunately I need to cancel today's lessons due to unforeseen circumstances. I apologise for the short notice and will contact you to reschedule." }
  ];

  // Load initial template if provided
  useEffect(() => {
    if (initialTemplate) {
      const template = templates.find(t => t.id === initialTemplate);
      if (template) {
        setMessage(template.text);
        if (navigator.vibrate) navigator.vibrate(10);
      }
    }
  }, [initialTemplate]);

  const handleTemplate = useCallback((template: typeof templates[0]) => {
    setMessage(template.text);
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  const handleAIDraft = useCallback(async () => {
    if (!message.trim()) return;
    const polished = await draftMessage(message);
    setMessage(polished);
  }, [message, draftMessage]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    
    let studentIds: string[];
    
    if (selectedAudience === 'specific') {
      // Use manually selected student IDs
      studentIds = selectedStudentIds;
    } else {
      // Use level-based filtering
      const levelMap: Record<string, StudentLevel[]> = {
        'all': [],
        'beginner': ['BEGINNER'],
        'intermediate': ['INTERMEDIATE'],
        'advanced': ['TEST_READY']
      };
      const targetStudents = getTargetStudents(students, levelMap[selectedAudience]);
      studentIds = targetStudents.map(s => s.user_id);
    }
    
    const success = await dispatchBroadcast(message, studentIds);
    if (success) {
      setMessage('');
      setSelectedStudentIds([]);
    }
  }, [message, selectedAudience, selectedStudentIds, students, getTargetStudents, dispatchBroadcast]);

  const handleBack = useCallback(() => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      navigate(-1);
    }
  }, [onNavigate, navigate]);

  const selectedCount = selectedAudience === 'specific' 
    ? selectedStudentIds.length 
    : getAudienceCount(selectedAudience);

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col overflow-hidden touch-pan-y">
      {/* Safe Area Top */}
      <div className="h-[env(safe-area-inset-top)] bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] shrink-0" />
      
      {/* Header - Neural Gradient Style */}
      <header className="shrink-0 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#2DD4BF] text-white px-4 pt-2 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={handleBack}
            className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center active:bg-white/20 active:scale-95 transition-all"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-black italic tracking-tight">New Broadcast</h1>
            <p className="text-xs font-bold text-black uppercase tracking-[0.2em] mt-0.5">Academy Messenger</p>
          </div>
          
          <button 
            className="text-xs font-bold text-slate-400 min-h-[44px] px-3 rounded-lg active:bg-white/10 transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            History
          </button>
        </div>
        
        {/* Stats Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white px-4 py-2.5 rounded-full shadow-lg shadow-purple-500/20">
            <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse" />
            <span className="text-xs font-black">{students.length} Student{students.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex-shrink-0 bg-white/10 text-white/70 px-4 py-2.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">
            {students.filter(s => s.status === 'ACTIVE').length} Active Today
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain bg-slate-50 scroll-smooth">
        <div className="p-4 space-y-6 pb-40">
          
          {/* AUDIENCE CARDS */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              Who should receive this?
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {audiences.map((audience) => {
                const isSelected = selectedAudience === audience.id;
                const count = getAudienceCount(audience.id);
                
                if (audience.isGradient) {
                  return (
                    <button
                      key={audience.id}
                      onClick={() => {
                        setSelectedAudience(audience.id);
                        setSelectedStudentIds([]);
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      className={`
                        relative flex flex-col items-start p-4 rounded-2xl min-h-[110px]
                        bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white
                        shadow-lg shadow-purple-500/20 active:scale-95 transition-all
                        ${isSelected ? 'ring-2 ring-[#2DD4BF] ring-offset-2' : ''}
                      `}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="text-2xl mb-2">{audience.icon}</span>
                      <span className="text-sm font-black leading-tight">{audience.label}</span>
                      <span className="text-xs mt-1 text-white/80 font-bold">
                        {count} student{count !== 1 ? 's' : ''}
                      </span>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={audience.id}
                    onClick={() => {
                      setSelectedAudience(audience.id);
                      setSelectedStudentIds([]);
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className={`
                      relative flex flex-col items-start p-4 rounded-2xl min-h-[110px] border-2
                      ${isSelected 
                        ? `${audience.bg} ${audience.border} shadow-md` 
                        : 'bg-white border-slate-100'
                      }
                      active:scale-95 transition-all
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#2DD4BF] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-2xl mb-2">{audience.icon}</span>
                    <span className={`text-sm font-black leading-tight ${isSelected ? audience.text : 'text-slate-900'}`}>
                      {audience.label}
                    </span>
                    <span className={`text-xs mt-1 font-bold ${isSelected ? audience.subtext : 'text-slate-400'}`}>
                      {count} student{count !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => {
                setShowStudentPicker(true);
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className={`w-full mt-3 py-4 border-2 border-dashed rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:bg-slate-100 active:scale-95 transition-all min-h-[56px] ${
                selectedStudentIds.length > 0 
                  ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6]' 
                  : 'border-slate-300 bg-white text-slate-600'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <Plus className="w-5 h-5" />
              {selectedStudentIds.length > 0 
                ? `${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? 's' : ''} Selected`
                : 'Select Specific Students'
              }
            </button>
          </section>

          {/* CHANNEL SELECTOR */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              How to send?
            </h2>
            
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {[
                { id: 'in-app', label: 'In-App', sub: 'Free', icon: MessageSquare, active: true },
                { id: 'sms', label: 'SMS', sub: 'Soon', icon: Smartphone, active: false },
                { id: 'email', label: 'Email', sub: 'Soon', icon: Mail, active: false }
              ].map((channel) => (
                <button
                  key={channel.id}
                  disabled={!channel.active}
                  onClick={() => {
                    if (channel.active) {
                      setSelectedChannel(channel.id);
                      if (navigator.vibrate) navigator.vibrate(10);
                    }
                  }}
                  className={`
                    flex-shrink-0 flex flex-col items-center justify-center gap-2 
                    w-[100px] h-[100px] rounded-2xl border-2 transition-all
                    ${selectedChannel === channel.id && channel.active
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg' 
                      : channel.active 
                        ? 'bg-white border-slate-100 text-slate-700 active:scale-95'
                        : 'bg-slate-50 border-transparent text-slate-300 cursor-not-allowed'
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <channel.icon className={`w-6 h-6 ${!channel.active && 'text-slate-300'}`} />
                  <span className="text-sm font-black">{channel.label}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">
                    {channel.sub}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* TEMPLATES */}
          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              Quick Templates
            </h2>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplate(template)}
                  className="flex-shrink-0 px-4 py-3 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-700 active:bg-slate-50 active:scale-95 transition-all min-h-[44px] shadow-sm"
                  style={{ touchAction: 'manipulation' }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </section>

          {/* MESSAGE INPUT */}
          <section>
            <div className="flex justify-between items-center mb-3 ml-1">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Message
              </h2>
              <span className={`text-xs font-bold ${message.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                {message.length}/500
              </span>
            </div>
            
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                placeholder="Type your announcement here..."
                className="w-full p-4 pr-16 bg-white border border-slate-200 rounded-2xl text-sm font-medium min-h-[140px] resize-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all shadow-sm"
                disabled={isDispatching}
              />
              
              <button
                onTouchStart={() => setIsRecording(true)}
                onTouchEnd={() => setIsRecording(false)}
                onMouseDown={() => setIsRecording(true)}
                onMouseUp={() => setIsRecording(false)}
                className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${
                  isRecording ? 'bg-red-500 text-white scale-110' : 'bg-[#0F172A] text-white'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            
            {isRecording && (
              <p className="text-xs text-red-500 font-bold mt-2 text-center animate-pulse">
                Recording... Release to send
              </p>
            )}
          </section>

          {/* AI TOGGLE */}
          <button
            onClick={handleAIDraft}
            disabled={isDrafting || !message.trim()}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#8B5CF6]/10 to-[#A855F7]/5 border border-[#8B5CF6]/20 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center text-white shadow-md">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-[#0F172A]">
                  {isDrafting ? 'Polishing...' : 'AI Smart Draft'}
                </div>
                <div className="text-xs text-[#8B5CF6] font-bold">Polish your message before sending</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
          </button>
        </div>
      </main>

      {/* STICKY BOTTOM BAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">Sending to</p>
            <p className="text-sm font-black text-slate-900">
              {selectedCount} student{selectedCount !== 1 ? 's' : ''} via in-app
            </p>
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!message.trim() || isDispatching || selectedCount === 0}
            className="flex-[2] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:active:scale-100 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[56px]"
            style={{ touchAction: 'manipulation' }}
          >
            <Send className="w-4 h-4" />
            {isDispatching ? 'Sending...' : 'Send Now'}
          </button>
        </div>
      </footer>

      {/* Student Picker Sheet */}
      <Sheet open={showStudentPicker} onOpenChange={setShowStudentPicker}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-lg font-black">Select Students</SheetTitle>
            <SheetDescription>
              Tap to select specific students for this broadcast
            </SheetDescription>
          </SheetHeader>
          
          <div className="overflow-y-auto py-4 space-y-2 h-[calc(100%-140px)]">
            {students.map((student) => {
              const isSelected = selectedStudentIds.includes(student.user_id);
              return (
                <button
                  key={student.user_id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedStudentIds(prev => prev.filter(id => id !== student.user_id));
                    } else {
                      setSelectedStudentIds(prev => [...prev, student.user_id]);
                    }
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]' 
                      : 'bg-white border-2 border-slate-100'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    isSelected ? 'bg-[#8B5CF6] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {student.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-slate-900">{student.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{student.level || 'Beginner'}</p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-[#8B5CF6]" />}
                </button>
              );
            })}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <button
              onClick={() => {
                setSelectedAudience('specific');
                setShowStudentPicker(false);
                if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
              }}
              disabled={selectedStudentIds.length === 0}
              className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white rounded-2xl font-bold disabled:opacity-50 active:scale-95 transition-all min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              Confirm Selection ({selectedStudentIds.length})
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default InstructorBroadcast;
