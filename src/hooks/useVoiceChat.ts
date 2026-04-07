// Reusable hook for voice input (Web Speech API) and text-to-speech
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
 
 const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
 const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 
 // Gemini TTS voice options for Voice Commands
 export type GeminiVoice = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Aoede';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceChatOptions {
  lang?: string;
  onTranscript?: (text: string) => void;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const { lang = 'en-GB', onTranscript } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for Web Speech API support
  const isSpeechSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  
  const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Speak text using ElevenLabs TTS (with fallback to Web Speech API)
  // Used for Cruzi Mentor chat
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled) return;
    
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(true);
    
    // Try ElevenLabs first
    if (useElevenLabs) {
      fetch(`${SUPABASE_URL}/functions/v1/cruzi-mentor-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.audio) {
            // Play ElevenLabs audio
            const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            
            audio.onended = () => {
              setIsSpeaking(false);
              audioRef.current = null;
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              audioRef.current = null;
              // Fall back to browser TTS
              speakWithBrowserTTS(text);
            };
            
            audio.play().catch(() => {
              // Fall back to browser TTS if audio play fails
              speakWithBrowserTTS(text);
            });
          } else {
            // Fall back to browser TTS
            speakWithBrowserTTS(text);
          }
       })
        .catch(() => {
          // Fall back to browser TTS
          speakWithBrowserTTS(text);
        });
    } else {
      speakWithBrowserTTS(text);
    }
  }, [ttsEnabled, useElevenLabs]);
  
  // Speak text using Gemini TTS (for Voice Command responses)
  // Uses cost-effective Gemini 2.5 Flash TTS with premium voices
  const speakVoiceCommand = useCallback((text: string, voice: GeminiVoice = 'Kore') => {
    if (!ttsEnabled) return;
    
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    
    setIsSpeaking(true);
    
    fetch(`${SUPABASE_URL}/functions/v1/voice-command-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ text, voice }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.audio) {
          // Play Gemini TTS audio (WAV format)
          const audioUrl = `data:audio/wav;base64,${data.audio}`;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            audioRef.current = null;
            // Fall back to browser TTS
            speakWithBrowserTTS(text);
          };
          
          audio.play().catch(() => {
            // Fall back to browser TTS if audio play fails
            speakWithBrowserTTS(text);
          });
        } else {
          console.warn('[VoiceChat] Gemini TTS failed, falling back to browser TTS');
          speakWithBrowserTTS(text);
        }
      })
      .catch((error) => {
        console.error('[VoiceChat] Gemini TTS error:', error);
        // Fall back to browser TTS
        speakWithBrowserTTS(text);
      });
  }, [ttsEnabled]);
  
  // Browser TTS fallback
  const speakWithBrowserTTS = useCallback((text: string) => {
    if (!isTTSSupported) {
      setIsSpeaking(false);
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en-GB') && v.name.includes('Female')
    ) || voices.find(v => 
      v.lang.startsWith('en-GB')
    ) || voices.find(v => 
      v.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isTTSSupported]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (isTTSSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isTTSSupported]);

  // Toggle TTS
  const toggleTTS = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled(prev => !prev);
  }, [isSpeaking, stopSpeaking]);

  // Stop listening - abort immediately
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  // Toggle voice input
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: 'Not Supported',
        description: 'Voice input is not supported in this browser.',
        variant: 'destructive'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInterimTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 100);
      }
    }
  }, [isListening]);

  // Load voices when available
  useEffect(() => {
    if (!isTTSSupported) return;
    
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isTTSSupported]);

  // Initialize speech recognition - NON-CONTINUOUS mode for complete commands
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    // Use non-continuous mode to wait for natural pause before submitting
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      // Show interim results for feedback
      setInterimTranscript(interimText || finalTranscript);

      // Only submit when we have a final result (user stopped speaking)
      if (finalTranscript) {
        setInterimTranscript('');
        onTranscript?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setInterimTranscript('');
      
      if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please enable microphone access in your browser settings.',
          variant: 'destructive'
        });
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        toast({
          title: 'Voice Input Error',
          description: 'Could not process voice input. Please try again.',
          variant: 'destructive'
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSpeechSupported, lang, onTranscript]);

  return {
    // Speech recognition
    isListening,
    interimTranscript,
    isSpeechSupported,
    toggleListening,
    stopListening,
    
    // Text-to-speech
    isSpeaking,
    ttsEnabled,
    isTTSSupported,
    speakText,        // ElevenLabs (for Cruzi Mentor)
    speakVoiceCommand, // Gemini TTS (for Voice Commands)
    stopSpeaking,
    toggleTTS,
    useElevenLabs,
    setUseElevenLabs,
  };
}
