// Voice Command Types for Cruzi Co-Pilot

export type VoiceIntent = 
  | 'BOOK_LESSON'
  | 'CANCEL_LESSON'
  | 'SEND_MESSAGE'
  | 'BROADCAST_MESSAGE'
  | 'LOG_LESSON'
  | 'NAVIGATE_TO'
  | 'QUERY_DATA'
  | 'UPDATE_STUDENT'
  | 'UPDATE_SKILL'
  | 'UNKNOWN'
  | 'CONVERSATION'
  | 'CLARIFY_STUDENT';  // New intent for ambiguous matches

export interface StudentMatch {
  id: string;
  name: string;
  confidence: number;
}

export interface VoiceCommandResult {
  intent: VoiceIntent;
  confidence: number;
  parameters: Record<string, any>;
  confirmationRequired: boolean;
  spokenConfirmation: string;
  textResponse?: string;
  // New fields for clarification
  isAmbiguous?: boolean;
  studentCandidates?: StudentMatch[];
  heardStudentName?: string;
}

export interface EnrichedStudent {
  id: string;
  name: string;
  balance: number;
  mentionCount: number;
  lastMentioned: string | null;
  aliases: string[];
}

export interface VoiceContext {
  students: { id: string; name: string; balance: number }[];
  todayLessons: { id: string; studentName: string; time: string; status: string }[];
  upcomingLessons: { id: string; studentName: string; date: string; time: string }[];
  currentTime: string;
  currentDate: string;
  // New enriched fields for learning
  enrichedStudents?: EnrichedStudent[];
  phoneticHints?: string;
  corrections?: Record<string, string>;
  topPatterns?: { pattern: string; count: number }[];
}

export interface VoiceCommandState {
  status: 'idle' | 'listening' | 'processing' | 'confirming' | 'clarifying' | 'executing' | 'success' | 'error';
  transcript: string;
  interimTranscript: string;
  parsedCommand: VoiceCommandResult | null;
  error: string | null;
  lastResponse: string | null;
  // Clarification state
  clarificationCandidates?: StudentMatch[];
  clarificationHeardPhrase?: string;
}
