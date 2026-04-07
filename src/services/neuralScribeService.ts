// Neural Scribe Service - Audio-to-AI Processing
// Uses storage-first approach: upload audio to bucket, send signed URL to edge function

import { supabase } from '@/integrations/supabase/client';
import { NeuralSessionResult } from '@/types';

interface NeuralScribeResponse {
  success: boolean;
  result?: NeuralSessionResult;
  error?: string;
}

const BUCKET = 'voice-scribe';

export const processAudioWithAI = async (
  audioBlob: Blob,
  pupilName: string,
  currentSkills: Record<string, number>
): Promise<NeuralScribeResponse> => {
  let storagePath: string | null = null;

  try {
    // Get current user for storage path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const mimeType = audioBlob.type || 'audio/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    storagePath = `${user.id}/${Date.now()}.${extension}`;

    console.log('[Neural Scribe] Uploading audio to storage:', {
      size: audioBlob.size,
      mimeType,
      path: storagePath
    });

    // 1. Upload audio blob to storage bucket
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, audioBlob, { contentType: mimeType });

    if (uploadError) {
      console.error('[Neural Scribe] Upload error:', uploadError);
      return { success: false, error: 'Failed to upload audio: ' + uploadError.message };
    }

    // 2. Create a short-lived signed URL (5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 300);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[Neural Scribe] Signed URL error:', signedUrlError);
      return { success: false, error: 'Failed to create signed URL' };
    }

    console.log('[Neural Scribe] Calling edge function with signed URL');

    // 3. Call edge function with the signed URL
    const { data, error } = await supabase.functions.invoke('neural-scribe-audio', {
      body: {
        audioUrl: signedUrlData.signedUrl,
        mimeType,
        pupilName,
        currentSkills
      }
    });

    if (error) {
      console.error('[Neural Scribe] Edge function error:', error);
      return { success: false, error: error.message || 'Failed to process audio' };
    }

    // Check for specific error responses (like no_speech_detected)
    if (data && data.success === false) {
      console.warn('[Neural Scribe] API returned error:', data.error);
      return { success: false, error: data.error || data.message || 'Processing failed' };
    }

    if (!data || !data.result) {
      console.error('[Neural Scribe] Invalid response:', data);
      return { success: false, error: 'Invalid response from AI' };
    }

    console.log('[Neural Scribe] Successfully processed:', data.result);

    return { success: true, result: data.result as NeuralSessionResult };
  } catch (err) {
    console.error('[Neural Scribe] Processing error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  } finally {
    // 4. Always clean up the storage file
    if (storagePath) {
      supabase.storage.from(BUCKET).remove([storagePath]).then(({ error }) => {
        if (error) console.warn('[Neural Scribe] Cleanup failed:', error);
        else console.log('[Neural Scribe] Cleaned up storage file');
      });
    }
  }
};

// Process multiple audio snippets and combine results
export const processMultipleSnippets = async (
  audioBlobs: Blob[],
  pupilName: string,
  currentSkills: Record<string, number>
): Promise<NeuralScribeResponse> => {
  const combinedBlob = new Blob(audioBlobs, { type: 'audio/webm' });
  return processAudioWithAI(combinedBlob, pupilName, currentSkills);
};

// Fallback: Process text transcript (for Web Speech API backup)
export const processTranscriptWithAI = async (
  transcript: string,
  pupilName: string,
  currentSkills: Record<string, number>
): Promise<NeuralScribeResponse> => {
  try {
    console.log('[Neural Scribe] Processing transcript:', { length: transcript.length, pupilName });

    const { data, error } = await supabase.functions.invoke('neural-scribe-audio', {
      body: { transcript, pupilName, currentSkills }
    });

    if (error) {
      console.error('[Neural Scribe] Edge function error:', error);
      return { success: false, error: error.message || 'Failed to process transcript' };
    }

    if (!data || !data.result) {
      console.error('[Neural Scribe] Invalid response:', data);
      return { success: false, error: 'Invalid response from AI' };
    }

    return { success: true, result: data.result as NeuralSessionResult };
  } catch (err) {
    console.error('[Neural Scribe] Processing error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
