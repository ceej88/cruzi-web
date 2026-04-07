// Voice Scribe Queue Service
// Manages cloud backup, session restore, and batch processing
// Shared logic consumed by both web portal and (via API) Replit mobile app

import { supabase } from '@/integrations/supabase/client';
import {
  getUnprocessedSnippets,
  getSnippetsByStudent,
  AudioSnippet,
  deleteSnippet,
} from './audioStorage';

const BUCKET = 'voice-scribe';

// ─── Types ────────────────────────────────────────────────────

export interface PendingSession {
  studentId: string;
  studentName: string;
  clipCount: number;
  totalSeconds: number;
  items: Array<{
    id: string;
    student_id: string;
    student_name: string;
    lesson_date: string;
    status: string;
    duration_seconds: number;
    session_group: string | null;
    created_at: string;
    result: unknown;
    error_message: string | null;
  }>;
}

export interface QueueStatus {
  pendingSessions: PendingSession[];
  recentResults: unknown[];
  totalPending: number;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  results: Array<{
    studentId: string;
    studentName: string;
    success: boolean;
    result?: unknown;
    error?: string;
    queueIds: string[];
  }>;
}

// ─── Cloud backup: upload raw audio to storage ───────────────

export const backupSnippetToCloud = async (
  snippet: AudioSnippet,
  studentName: string
): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const extension = snippet.blob.type?.includes('mp4') ? 'mp4' : 'webm';
    const storagePath = `${user.id}/queue/${snippet.studentId}/${snippet.id}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, snippet.blob, {
        contentType: snippet.blob.type || 'audio/webm',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[VoiceScribeQueue] Upload failed:', uploadError.message);
      return null;
    }

    // Register in queue table
    const { error: regError } = await supabase.functions.invoke('voice-scribe-sync', {
      body: {
        action: 'register',
        storagePath,
        studentId: snippet.studentId,
        studentName,
        lessonDate: snippet.timestamp.split('T')[0],
        durationSeconds: snippet.duration,
        mimeType: snippet.blob.type || 'audio/webm',
        sessionGroup: snippet.lessonId,
      },
    });

    if (regError) {
      console.warn('[VoiceScribeQueue] Register failed:', regError.message);
      return null;
    }

    console.log('[VoiceScribeQueue] Backed up snippet:', snippet.id);
    return storagePath;
  } catch (err) {
    console.warn('[VoiceScribeQueue] Backup error:', err);
    return null;
  }
};

// ─── Opportunistic backup: upload all unprocessed local snippets ─

export const backupAllUnprocessed = async (
  studentNameMap: Record<string, string>
): Promise<number> => {
  if (!navigator.onLine) return 0;

  try {
    const unprocessed = await getUnprocessedSnippets();
    let backed = 0;

    for (const snippet of unprocessed) {
      const name = studentNameMap[snippet.studentId] || 'Unknown Student';
      const path = await backupSnippetToCloud(snippet, name);
      if (path) backed++;
    }

    return backed;
  } catch (err) {
    console.warn('[VoiceScribeQueue] Batch backup error:', err);
    return 0;
  }
};

// ─── Get queue status from cloud ─────────────────────────────

export const getQueueStatus = async (): Promise<QueueStatus | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-scribe-sync', {
      body: { action: 'status' },
    });

    if (error) {
      console.error('[VoiceScribeQueue] Status error:', error);
      return null;
    }

    return data as QueueStatus;
  } catch (err) {
    console.error('[VoiceScribeQueue] Status error:', err);
    return null;
  }
};

// ─── Process all pending sessions ────────────────────────────

export const processAllPending = async (
  sessionGroup?: string
): Promise<SyncResult | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-scribe-sync', {
      body: {
        action: 'process',
        sessionGroup: sessionGroup || undefined,
      },
    });

    if (error) {
      console.error('[VoiceScribeQueue] Process error:', error);
      return null;
    }

    return data as SyncResult;
  } catch (err) {
    console.error('[VoiceScribeQueue] Process error:', err);
    return null;
  }
};

// ─── Retry failed items ─────────────────────────────────────

export const retryFailed = async (queueIds: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('voice-scribe-sync', {
      body: { action: 'retry', queueIds },
    });
    return !error;
  } catch {
    return false;
  }
};

// ─── Cleanup old completed items ─────────────────────────────

export const cleanupOldItems = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-scribe-sync', {
      body: { action: 'cleanup' },
    });
    if (error) return 0;
    return data?.cleaned || 0;
  } catch {
    return 0;
  }
};

// ─── Restore local sessions: check IndexedDB for unprocessed ─

export interface RestoredSession {
  studentId: string;
  segments: AudioSnippet[];
}

export const restoreLocalSessions = async (): Promise<RestoredSession[]> => {
  try {
    const unprocessed = await getUnprocessedSnippets();
    if (unprocessed.length === 0) return [];

    // Group by student
    const byStudent = new Map<string, AudioSnippet[]>();
    for (const snippet of unprocessed) {
      if (!byStudent.has(snippet.studentId)) {
        byStudent.set(snippet.studentId, []);
      }
      byStudent.get(snippet.studentId)!.push(snippet);
    }

    return Array.from(byStudent.entries()).map(([studentId, segments]) => ({
      studentId,
      segments: segments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    }));
  } catch (err) {
    console.error('[VoiceScribeQueue] Restore error:', err);
    return [];
  }
};

// ─── Online detection helper ─────────────────────────────────

export const onOnline = (callback: () => void): (() => void) => {
  const handler = () => callback();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
};

export const onOffline = (callback: () => void): (() => void) => {
  const handler = () => callback();
  window.addEventListener('offline', handler);
  return () => window.removeEventListener('offline', handler);
};
