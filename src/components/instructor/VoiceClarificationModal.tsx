// Voice Clarification Modal - Handles ambiguous student name matches
// Shows when the AI confidence is low and asks user to confirm which student they meant

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HelpCircle, Check, X, User } from 'lucide-react';
import { recordCorrection } from '@/services/voiceLearningService';

interface StudentMatch {
  id: string;
  name: string;
  confidence: number;
}

interface VoiceClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedStudent: StudentMatch) => void;
  heardPhrase: string;
  candidates: StudentMatch[];
  originalCommand: string;
}

export const VoiceClarificationModal: React.FC<VoiceClarificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  heardPhrase,
  candidates,
  originalCommand,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentMatch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStudent(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (!selectedStudent) return;
    
    setIsSubmitting(true);
    
    // Record this as a correction so the system learns
    recordCorrection(heardPhrase, selectedStudent.id, selectedStudent.name);
    
    onConfirm(selectedStudent);
  }, [selectedStudent, heardPhrase, onConfirm]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    // Number keys 1-9 to select candidates
    const num = parseInt(e.key);
    if (num >= 1 && num <= candidates.length) {
      setSelectedStudent(candidates[num - 1]);
    }
    
    // Enter to confirm
    if (e.key === 'Enter' && selectedStudent) {
      handleConfirm();
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, candidates, selectedStudent, handleConfirm, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <HelpCircle className="w-5 h-5" />
            Clarification Needed
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            I heard <span className="font-medium text-foreground">"{heardPhrase}"</span> - which student did you mean?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {/* Original command context */}
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
            Full command: "{originalCommand}"
          </div>

          {/* Candidate buttons */}
          <div className="space-y-2">
            {candidates.map((candidate, index) => (
              <button
                key={candidate.id}
                onClick={() => setSelectedStudent(candidate)}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all duration-200",
                  "flex items-center justify-between",
                  "hover:bg-primary/10 hover:border-primary/50",
                  selectedStudent?.id === candidate.id
                    ? "bg-primary/20 border-primary"
                    : "bg-muted/20 border-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    selectedStudent?.id === candidate.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{candidate.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    candidate.confidence > 0.7 
                      ? "bg-green-500/20 text-green-400"
                      : candidate.confidence > 0.4
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {Math.round(candidate.confidence * 100)}% match
                  </span>
                  {selectedStudent?.id === candidate.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press 1-{candidates.length} to select, Enter to confirm, Esc to cancel
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStudent || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-1" />
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
