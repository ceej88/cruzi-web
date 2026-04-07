import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Wand2, Phone, ChevronLeft, MessageCircle, Loader2, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const InstructorMessages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { students, messages, sendMessage, isLoading } = useInstructorData();
  const [input, setInput] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // On desktop, auto-select first student
  useEffect(() => {
    if (!isMobile && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].user_id);
    }
  }, [students, selectedStudentId, isMobile]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('instructor-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['instructor-messages'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user?.id || !selectedStudentId || !messages.length) return;

      const unreadIds = messages
        .filter(m => m.sender_id === selectedStudentId && m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)
          .eq('receiver_id', user.id);

        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['instructor-messages'] });
          queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
        }
      }
    };

    markMessagesAsRead();
  }, [selectedStudentId, messages, user?.id, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedStudentId]);

  const activeStudent = students.find(p => p.user_id === selectedStudentId);

  const filteredMessages = messages.filter(m => 
    m.sender_id === selectedStudentId || m.receiver_id === selectedStudentId
  );

  const handleSend = () => {
    if (!input.trim() || !selectedStudentId) return;
    navigator.vibrate?.(10);
    sendMessage.mutate({ receiverId: selectedStudentId, content: input });
    setInput('');
  };

  const handleSelectStudent = (studentId: string) => {
    navigator.vibrate?.(10);
    setSelectedStudentId(studentId);
  };

  const handleBack = () => {
    navigator.vibrate?.(10);
    setSelectedStudentId('');
  };

  const handleExitMessages = () => {
    navigator.vibrate?.(10);
    navigate('/instructor');
  };

  // Filter students by search query
  const filteredStudents = students.filter(student =>
    (student.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unread count per student
  const getUnreadCount = (studentId: string) => {
    return messages.filter(m => 
      m.sender_id === studentId && 
      m.receiver_id === user?.id && 
      !m.is_read
    ).length;
  };

  // Get last message preview
  const getLastMessage = (studentId: string) => {
    const studentMessages = messages.filter(m => 
      m.sender_id === studentId || m.receiver_id === studentId
    );
    if (studentMessages.length === 0) return null;
    return studentMessages[studentMessages.length - 1];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // MOBILE: Two-panel navigation (list OR conversation)
  if (isMobile) {
    // Show conversation view
    if (selectedStudentId && activeStudent) {
      return (
        <div className="flex flex-col h-[100dvh] bg-background">
          {/* Conversation Header */}
          <div className="shrink-0 px-4 py-3 flex items-center gap-3 bg-card border-b border-border pt-safe">
            <button 
              onClick={handleBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground bg-muted rounded-xl active:scale-95 transition-all touch-action-manipulation"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-border shrink-0">
              <img 
                src={`https://picsum.photos/100/100?random=${activeStudent.id}`} 
                alt={activeStudent.full_name || 'Student'}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-foreground leading-none truncate">
                {activeStudent.full_name || 'Student'}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-cruzi-success rounded-full animate-pulse" />
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                  Active Now
                </p>
              </div>
            </div>
            <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground bg-muted rounded-xl active:scale-95 transition-all">
              <Phone className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef} 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
          >
            {filteredMessages.map(msg => {
              const isMine = msg.sender_id !== selectedStudentId;
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isMine 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card border border-border text-foreground rounded-tl-sm'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] font-bold mt-1.5 ${
                      isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                  Start the conversation
                </p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 p-4 bg-card border-t border-border pb-safe">
            <div className="flex items-center gap-2">
              <button className="min-h-[48px] min-w-[48px] rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-95 transition-all touch-action-manipulation">
                <Wand2 className="h-5 w-5" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 min-h-[48px] px-4 bg-muted border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder-muted-foreground touch-action-manipulation"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="min-h-[48px] min-w-[48px] rounded-xl bg-foreground text-background flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 touch-action-manipulation"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Show student list (Inbox)
    return (
      <div className="flex flex-col h-[100dvh] bg-muted/30">
        {/* Enhanced Header with Back Button */}
        <div className="shrink-0 px-6 py-6 bg-card border-b border-border pt-safe">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={handleExitMessages}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground bg-muted rounded-xl active:scale-95 transition-all touch-action-manipulation"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-black italic uppercase tracking-tight text-foreground">
              Messages
            </h1>
            <div className="w-11" /> {/* Spacer for balance */}
          </div>
          <p className="text-center text-sm font-bold text-muted-foreground">
            {students.length} Conversation{students.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full h-14 pl-14 pr-6 bg-card border border-border rounded-[32px] text-sm font-medium text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto px-6 pb-safe space-y-3">
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-6" />
              <h4 className="text-lg font-black text-foreground">No Students Yet</h4>
              <p className="text-sm text-muted-foreground mt-2">
                Connect with students to start messaging
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-bold text-muted-foreground">No students found</p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const unreadCount = getUnreadCount(student.user_id);
              const lastMessage = getLastMessage(student.user_id);
              const hasUnread = unreadCount > 0;
              
              return (
                <button 
                  key={student.user_id}
                  onClick={() => handleSelectStudent(student.user_id)}
                  className="w-full flex items-center gap-4 p-5 bg-card hover:bg-muted/50 active:scale-[0.98] transition-all touch-action-manipulation rounded-[32px] border border-border shadow-sm relative overflow-hidden"
                >
                  {/* Avatar with Active Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-border shadow-inner">
                      <img 
                        src={`https://picsum.photos/100/100?random=${student.id}`} 
                        alt={student.full_name || 'Student'}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {/* Active Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cruzi-success rounded-full border-[3px] border-card shadow-sm" />
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -left-1 min-w-[20px] h-5 bg-destructive rounded-full border-2 border-card text-[10px] font-black text-destructive-foreground flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="text-lg font-black italic uppercase tracking-tighter text-foreground truncate">
                        {student.full_name || 'Student'}
                      </h3>
                      {lastMessage && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase shrink-0 ml-2">
                          {new Date(lastMessage.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground truncate pr-4">
                      {lastMessage?.content || 'Start a conversation...'}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {hasUnread && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-5 w-2 h-2 bg-primary rounded-full shadow-sm" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // DESKTOP: Side-by-side layout
  return (
    <div className="flex h-[calc(100vh-140px)] bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden mx-4">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col bg-muted/30 shrink-0">
        <div className="p-6 border-b border-border">
          <h3 className="font-black text-foreground tracking-tight">Direct Roster</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            {students.length} Students
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {students.map(student => {
            const unreadCount = getUnreadCount(student.user_id);
            const isActive = selectedStudentId === student.user_id;
            
            return (
              <button 
                key={student.user_id}
                onClick={() => handleSelectStudent(student.user_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-card shadow-lg border border-primary/20' 
                    : 'hover:bg-card/80'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-background">
                    <img 
                      src={`https://picsum.photos/100/100?random=${student.id}`} 
                      alt={student.full_name || 'Student'}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-destructive rounded-full border-2 border-background text-[8px] font-black text-destructive-foreground flex items-center justify-center px-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-black text-foreground truncate">
                    {student.full_name || 'Student'}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase truncate">
                    Tap to chat
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-card overflow-hidden">
        {activeStudent ? (
          <>
            <div className="p-5 border-b border-border flex justify-between items-center bg-card shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-border">
                  <img 
                    src={`https://picsum.photos/100/100?random=${activeStudent.id}`} 
                    alt={activeStudent.full_name || 'Student'}
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="font-black text-foreground leading-none mb-1">
                    {activeStudent.full_name || 'Student'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cruzi-success rounded-full animate-pulse" />
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                      Active Now
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-all">
                <Phone className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
              {filteredMessages.map(msg => {
                const isMine = msg.sender_id !== selectedStudentId;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-5 py-3 rounded-2xl ${
                      isMine 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <p className={`text-[8px] font-bold mt-1.5 ${
                        isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {filteredMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                    Start the conversation
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-border bg-card shrink-0">
              <div className="flex items-center gap-3">
                <button className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all shrink-0">
                  <Wand2 className="h-4 w-4" />
                </button>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary transition-all placeholder-muted-foreground"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center active:scale-95 transition-all shrink-0 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center bg-muted/10">
            <MessageCircle className="h-16 w-16 text-muted-foreground/20 mb-6" />
            <h4 className="text-xl font-black text-foreground tracking-tight">Your Roster Awaits</h4>
            <p className="text-sm font-medium mt-3 max-w-xs mx-auto text-muted-foreground leading-relaxed">
              Select a student from the sidebar to start coordinating lessons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorMessages;
