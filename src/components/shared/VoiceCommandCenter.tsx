// VoiceCommandCenter - Floating voice command button for Cruzi Co-Pilot
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Check, Volume2, VolumeX, Loader2, HelpCircle, User } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { cn } from '@/lib/utils';
import { recordCorrection } from '@/services/voiceLearningService';

interface VoiceCommandCenterProps {
  className?: string;
}

const VoiceCommandCenter: React.FC<VoiceCommandCenterProps> = ({ className }) => {
  const {
    status,
    transcript,
    interimTranscript,
    parsedCommand,
    lastResponse,
    isListening,
    isSpeaking,
    isSpeechSupported,
    ttsEnabled,
    clarificationCandidates,
    clarificationHeardPhrase,
    startListening,
    stopListening,
    confirmCommand,
    cancelCommand,
    resolveClarification,
    toggleTTS,
  } = useVoiceCommands();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedClarificationIndex, setSelectedClarificationIndex] = useState<number | null>(null);
  
  // Expand when actively processing
  useEffect(() => {
    if (status !== 'idle') {
      setIsExpanded(true);
    }
  }, [status]);
  
  // Reset clarification selection when status changes
  useEffect(() => {
    if (status !== 'clarifying') {
      setSelectedClarificationIndex(null);
    }
  }, [status]);
  
  // Auto-collapse after success/error
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Handle keyboard shortcuts for clarification
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'clarifying' || !clarificationCandidates) return;
      
      // Number keys 1-9
      const num = parseInt(e.key);
      if (num >= 1 && num <= clarificationCandidates.length) {
        setSelectedClarificationIndex(num - 1);
      }
      
      // Enter to confirm
      if (e.key === 'Enter' && selectedClarificationIndex !== null) {
        handleClarificationConfirm();
      }
      
      // Escape to cancel
      if (e.key === 'Escape') {
        cancelCommand();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, clarificationCandidates, selectedClarificationIndex, cancelCommand]);
  
  const handleClarificationConfirm = () => {
    if (selectedClarificationIndex === null || !clarificationCandidates) return;
    
    const selected = clarificationCandidates[selectedClarificationIndex];
    
    // Record this correction for learning
    if (clarificationHeardPhrase) {
      recordCorrection(clarificationHeardPhrase, selected.id, selected.name);
    }
    
    resolveClarification(selected);
  };
  
  if (!isSpeechSupported) {
    return null; // Don't render if not supported
  }
  
  const handleMainButtonClick = () => {
    if (status === 'idle') {
      startListening();
    } else if (isListening) {
      stopListening();
    }
  };
  
  // Status-based styling
  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)]';
      case 'processing':
      case 'executing':
        return 'bg-secondary';
      case 'confirming':
        return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
      case 'clarifying':
        return 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
      case 'success':
        return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      case 'error':
        return 'bg-destructive shadow-[0_0_20px_hsl(var(--destructive)/0.5)]';
      default:
        return 'bg-background border border-border shadow-lg';
    }
  };
  
  const getStatusLabel = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Thinking...';
      case 'executing':
        return 'On it...';
      case 'confirming':
        return 'Confirm?';
      case 'clarifying':
        return 'Which student?';
      case 'success':
        return 'Done!';
      case 'error':
        return 'Oops';
      default:
        return 'Tap to speak';
    }
  };
  
  return (
    <div className={cn('fixed bottom-24 right-4 z-50', className)}>
      <AnimatePresence>
        {/* Expanded panel */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-72 bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  status === 'listening' ? 'bg-primary animate-pulse' : 
                  status === 'processing' || status === 'executing' ? 'bg-amber-500 animate-pulse' :
                  status === 'success' ? 'bg-emerald-500' :
                  status === 'error' ? 'bg-destructive' : 'bg-muted'
                )} />
                <span className="text-sm font-medium text-foreground">{getStatusLabel()}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {/* TTS Toggle */}
                <button
                  onClick={toggleTTS}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                
                {/* Close */}
                <button
                  onClick={() => {
                    cancelCommand();
                    setIsExpanded(false);
                  }}
                  className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 min-h-[80px]">
              {/* Waveform visualization when listening */}
              {status === 'listening' && (
                <div className="flex items-center justify-center gap-1 h-8 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{
                        height: [8, 24, 8],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Interim transcript */}
              {(interimTranscript || transcript) && (
                <p className="text-sm text-muted-foreground italic mb-2">
                  "{interimTranscript || transcript}"
                </p>
              )}
              
              {/* Parsed command */}
              {parsedCommand && status === 'confirming' && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    {parsedCommand.spokenConfirmation}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={confirmCommand}
                      className="flex-1 py-2 px-4 bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <Check className="w-4 h-4" />
                      Yes
                    </button>
                    <button
                      onClick={cancelCommand}
                      className="flex-1 py-2 px-4 bg-muted text-foreground rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <X className="w-4 h-4" />
                      No
                    </button>
                  </div>
                </div>
              )}
              
              {/* Clarification UI */}
              {status === 'clarifying' && clarificationCandidates && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <p className="text-sm">
                      I heard "{clarificationHeardPhrase}" - which student?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {clarificationCandidates.map((candidate, index) => (
                      <button
                        key={candidate.id}
                        onClick={() => setSelectedClarificationIndex(index)}
                        className={cn(
                          "w-full p-2 rounded-lg border transition-all",
                          "flex items-center justify-between text-left",
                          "hover:bg-primary/10 hover:border-primary/50",
                          selectedClarificationIndex === index
                            ? "bg-primary/20 border-primary"
                            : "bg-muted/20 border-muted"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            selectedClarificationIndex === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{candidate.name}</span>
                        </div>
                        
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          candidate.confidence > 0.7 
                            ? "bg-green-500/20 text-green-400"
                            : "bg-amber-500/20 text-amber-400"
                        )}>
                          {Math.round(candidate.confidence * 100)}%
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleClarificationConfirm}
                      disabled={selectedClarificationIndex === null}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                        selectedClarificationIndex !== null
                          ? "bg-emerald-500 text-white active:scale-95"
                          : "bg-muted text-muted-foreground opacity-50"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={cancelCommand}
                      className="flex-1 py-2 px-4 bg-muted text-foreground rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Processing indicator */}
              {(status === 'processing' || status === 'executing') && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{status === 'processing' ? 'Understanding...' : 'Executing...'}</span>
                </div>
              )}
              
              {/* Result */}
              {(status === 'success' || status === 'error') && lastResponse && (
                <p className={cn(
                  'text-sm',
                  status === 'success' ? 'text-emerald-500' : 'text-destructive'
                )}>
                  {lastResponse}
                </p>
              )}
              
              {/* Idle state hint */}
              {status === 'idle' && !transcript && (
                <p className="text-xs text-muted-foreground text-center">
                  Try: "Mark Sarah mirrors level 4" or "Who's next?"
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main floating button */}
      <motion.button
        onClick={handleMainButtonClick}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all',
          'active:scale-95',
          getStatusColor(),
          status === 'idle' ? 'text-muted-foreground' : 'text-white'
        )}
        animate={status === 'listening' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ touchAction: 'manipulation' }}
      >
        {status === 'processing' || status === 'executing' ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : status === 'success' ? (
          <Check className="w-6 h-6" />
        ) : status === 'error' ? (
          <X className="w-6 h-6" />
        ) : isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>
      
      {/* Speaking indicator */}
      {isSpeaking && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </div>
  );
};

export default VoiceCommandCenter;
