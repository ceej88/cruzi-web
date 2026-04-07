import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useBroadcast, StudentLevel } from '@/hooks/useBroadcast';
import { useInstructorData } from '@/hooks/useInstructorData';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import {
  Megaphone,
  Sparkles,
  Send,
  Loader2,
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  Check,
  Plus,
  AlertCircle,
} from 'lucide-react';
import SmsTopUpModal from '@/components/sms/SmsTopUpModal';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  initialTemplate?: string;
}

// Message templates for one-tap loading
const MESSAGE_TEMPLATES = [
  {
    id: 'weather',
    label: '🌧️ Weather',
    content: "Due to today's weather conditions, please drive carefully on your way to our lesson. If conditions worsen, I may need to reschedule for safety. I'll keep you updated!",
  },
  {
    id: 'schedule',
    label: '📅 Schedule',
    content: "Quick update: There's been a change to our lesson schedule. Please check your booking for the new time. Let me know if this doesn't work for you.",
  },
  {
    id: 'test-prep',
    label: '🎯 Test Prep',
    content: "Test day is approaching! Here's what to focus on this week: review your manoeuvres, practice observation, and get plenty of rest before the big day.",
  },
  {
    id: 'great-job',
    label: '⭐ Great Job!',
    content: 'Fantastic progress this week! Your skills are really coming together. Keep up the great work and stay focused on the areas we discussed.',
  },
  {
    id: 'cancel',
    label: '❌ Cancel',
    content: "Unfortunately I need to cancel today's lessons due to unforeseen circumstances. I apologise for the short notice and will contact you to reschedule.",
  },
];

const LEVELS: { id: StudentLevel; label: string }[] = [
  { id: 'BEGINNER', label: 'Beginner' },
  { id: 'INTERMEDIATE', label: 'Intermediate' },
  { id: 'ADVANCED', label: 'Advanced' },
  { id: 'TEST_READY', label: 'Test Ready' },
];

const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onComplete, initialTemplate }) => {
  const { students } = useInstructorData();
  const { isDrafting, isDispatching, dispatchProgress, draftMessage, dispatchBroadcast, getTargetStudents } = useBroadcast();
  const { credits: smsCredits, sendSms, isSending: isSendingSms } = useSmsCredits();

  const [selectedLevels, setSelectedLevels] = useState<StudentLevel[]>([]);
  const [message, setMessage] = useState('');
  const [roughNotes, setRoughNotes] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [smsProgress, setSmsProgress] = useState(0);

  // Load initial template if provided
  React.useEffect(() => {
    if (initialTemplate && isOpen) {
      const template = MESSAGE_TEMPLATES.find(t => t.id === initialTemplate);
      if (template) {
        setMessage(template.content);
      }
    }
  }, [initialTemplate, isOpen]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setRoughNotes('');
      setSelectedLevels([]);
      setSmsEnabled(false);
      setSmsProgress(0);
    }
  }, [isOpen]);

  const targetStudents = useMemo(() => {
    return getTargetStudents(students, selectedLevels);
  }, [students, selectedLevels, getTargetStudents]);

  // Get students with phone numbers for SMS
  const studentsWithPhones = useMemo(() => {
    return targetStudents.filter(s => {
      // We need to check if student has a phone - for now we'll use the profile
      return true; // Will be filtered by actual phone availability in dispatch
    });
  }, [targetStudents]);

  // Calculate SMS cost
  const smsCost = smsEnabled ? studentsWithPhones.length : 0;
  const hasEnoughCredits = smsCredits >= smsCost;

  const toggleLevel = (level: StudentLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleSmartDraft = async () => {
    const notes = roughNotes.trim() || message.trim();
    if (!notes) return;
    
    const draft = await draftMessage(notes);
    setMessage(draft);
    setRoughNotes('');
  };

  const handleDispatch = async () => {
    if (!message.trim() || targetStudents.length === 0) return;
    
    const studentIds = targetStudents.map(s => s.user_id);
    
    // Send in-app messages
    const success = await dispatchBroadcast(message, studentIds);
    
    // Send SMS if enabled (would need phone numbers from profiles)
    // For now, SMS broadcast is a future enhancement that requires
    // fetching phone numbers from profiles
    
    if (success) {
      setMessage('');
      setRoughNotes('');
      setSelectedLevels([]);
      setSmsEnabled(false);
      onComplete?.();
      onClose();
    }
  };

  const handleClose = () => {
    if (!isDispatching) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg">
              <Megaphone className="h-5 w-5" />
            </div>
            Academy Broadcast
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Send a message to multiple students at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Target Audience */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Target Audience
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => toggleLevel(level.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedLevels.includes(level.id)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {selectedLevels.includes(level.id) && <Check className="h-3 w-3 inline mr-1" />}
                  {level.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-bold">
                {targetStudents.length} {targetStudents.length === 1 ? 'student' : 'students'} selected
              </span>
              {selectedLevels.length === 0 && (
                <span className="text-[10px] uppercase tracking-widest">(all students)</span>
              )}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Delivery Channels
            </label>
            <div className="flex flex-wrap gap-2">
              {/* In-App - Always enabled */}
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground flex items-center gap-2 shadow-md">
                <MessageSquare className="h-3 w-3" />
                In-App
                <Check className="h-3 w-3" />
              </div>
              
              {/* SMS - Now clickable */}
              <button
                onClick={() => {
                  if (!smsEnabled && smsCredits < 1) {
                    setShowTopUp(true);
                    return;
                  }
                  setSmsEnabled(!smsEnabled);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  smsEnabled
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Smartphone className="h-3 w-3" />
                SMS
                {smsEnabled ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="text-[8px] uppercase tracking-widest">+{smsCredits} credits</span>
                )}
              </button>
              
              {/* Email - Coming soon */}
              <div className="px-4 py-2 rounded-xl text-xs font-bold bg-muted text-muted-foreground/50 flex items-center gap-2 cursor-not-allowed">
                <Mail className="h-3 w-3" />
                Email
                <span className="text-[8px] uppercase tracking-widest">Soon</span>
              </div>
            </div>
            
            {/* SMS Credit Info */}
            {smsEnabled && (
              <div className={`flex items-center justify-between p-3 rounded-xl border ${
                hasEnoughCredits 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <div className="flex items-center gap-2">
                  {hasEnoughCredits ? (
                    <Smartphone className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-xs font-medium">
                    {hasEnoughCredits 
                      ? `Will use ${smsCost} SMS credit${smsCost !== 1 ? 's' : ''}`
                      : `Need ${smsCost - smsCredits} more credits`
                    }
                  </span>
                </div>
                <button
                  onClick={() => setShowTopUp(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Top Up
                </button>
              </div>
            )}
          </div>

          {/* Quick Templates */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {MESSAGE_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setMessage(template.content)}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rough Notes for AI */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Quick Notes (for AI to polish)
            </label>
            <Textarea
              placeholder="e.g. moving monday lessons to tuesday, bank holiday..."
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              className="min-h-[60px] resize-none rounded-xl"
              disabled={isDispatching}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSmartDraft}
              disabled={isDrafting || isDispatching || (!roughNotes.trim() && !message.trim())}
              className="w-full rounded-xl font-bold"
            >
              {isDrafting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI Smart Draft
            </Button>
          </div>

          {/* Message Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Announcement Content
              </label>
              <span className={`text-[10px] font-bold ${message.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {message.length}/500
              </span>
            </div>
            <Textarea
              placeholder="Type your announcement here, or use AI Smart Draft above..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              className="min-h-[120px] resize-none rounded-xl"
              disabled={isDispatching}
            />
          </div>

          {/* Dispatch Progress */}
          {isDispatching && (
            <div className="space-y-2">
              <Progress value={dispatchProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center font-bold">
                Sending... {dispatchProgress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDispatching}
              className="flex-1 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDispatch}
              disabled={isDispatching || !message.trim() || targetStudents.length === 0}
              className="flex-1 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80"
            >
              {isDispatching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Dispatch to {targetStudents.length}
          </Button>
        </div>
      </div>

      {/* SMS Top Up Modal */}
      <SmsTopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
    </DialogContent>
  </Dialog>
);
};

export default BroadcastModal;
