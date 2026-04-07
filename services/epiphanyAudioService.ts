/**
 * Epiphany Audio Service
 * Handles TTS with ElevenLabs (primary) and browser Web Speech API (fallback)
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Track if ElevenLabs is available (set to false on first 401/500 error)
let elevenLabsAvailable = true;

// Browsers often block audio until a user gesture occurs.
// We keep a shared AudioContext so we can "unlock" it on a click, then reuse it.
let sharedAudio:
  | {
      audioContext: AudioContext;
      gainNode: GainNode;
    }
  | null = null;

export interface PhaseAudio {
  phaseId: string;
  audio: string; // base64 encoded audio (empty if using fallback)
  text: string;
  useFallback?: boolean; // true if using browser TTS
}

export interface AudioPlaybackResult {
  source: AudioBufferSourceNode;
  analyser: AnalyserNode;
  duration: number;
}

// Fallback narrative text for browser TTS when ElevenLabs is unavailable
const NARRATIVE_PHASES: Record<string, Record<string, string>> = {
  onboarding: {
    identity: "Welcome to the Neural Era. You are no longer just an instructor, you are the architect of the next generation of high-performance drivers.",
    friction: "Manual logs, lost texts, and administrative noise are relics of the past. It's time to return to the road and reclaim your focus.",
    solution: "Imagine a digital nervous system that tracks every neural spark of student progress. Every lesson, every correction—automated.",
    reveal: "Meet Cruzi. The first AI Command Hub for elite instructors. Speak. Scribe. Scale. This is the future of your academy.",
    activation: "Your Neural Command Hub is initializing now. Welcome home.",
  },
  vision: {
    road: "The road teaches. Every junction, every mirror check. A lesson waiting to be learned.",
    mission: "We believe driving instruction should evolve. Beyond clipboards. Beyond guesswork. Into intelligence.",
    vision: "A neural ecosystem where instructors command. And students master.",
    future: "Welcome to Cruzi. The future of driving is Neural.",
  },
  tour: {
    center: "Welcome to your Command Center. Everything you need—one neural hub. Built for instructors who refuse to waste time.",
    nav: "Nav Command. See who's next. One tap launches navigation to their pickup point. Zero friction.",
    scribe: "Neural Scribe. Speak your lesson notes. Auto-generates lesson plans and scores student skills instantly. Zero paperwork.",
    studio: "Content Studio. Create stunning social posts with themed templates. Share student wins. Grow your brand.",
    mock: "Mock Test. Run practice tests. Calculate scores. See test readiness at a glance.",
    syllabus: "Syllabus Matrix. Track every DVSA competency. See exactly where each student stands across all twenty-seven core skills.",
    compliance: "Compliance. Audit-ready records at your fingertips. Pass rates, lesson logs, and documentation—all in one place.",
    helper: "AI Helper. Your voice-controlled command center. Speak naturally to log lessons, send messages, or get instant answers.",
    vault: "Teaching Vault. Your unique teaching blueprints and expert methodologies.",
    activation: "Your Command Center is live. Time to build something legendary.",
  },
};

/**
 * Fetch TTS audio for a specific narrative phase with a timeout.
 * Falls back to browser TTS if ElevenLabs is unavailable or too slow.
 */
export async function fetchPhaseAudio(
  phaseId: string,
  mode: 'onboarding' | 'vision' | 'tour' = 'onboarding',
  timeoutMs = 5000
): Promise<PhaseAudio> {
  const fallbackText = NARRATIVE_PHASES[mode]?.[phaseId] || '';
  
  // If ElevenLabs already failed, skip API call and use fallback immediately
  if (!elevenLabsAvailable) {
    console.log(`Using browser TTS fallback for phase: ${phaseId}`);
    return { phaseId, audio: '', text: fallbackText, useFallback: true };
  }
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/epiphany-tts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ phaseId, mode }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (!response.ok) {
      elevenLabsAvailable = false;
      console.warn(`ElevenLabs API failed (${response.status}), switching to browser TTS`);
      return { phaseId, audio: '', text: fallbackText, useFallback: true };
    }

    const data = await response.json();
    
    if (!data.success) {
      elevenLabsAvailable = false;
      console.warn('ElevenLabs returned error, switching to browser TTS:', data.error);
      return { phaseId, audio: '', text: fallbackText, useFallback: true };
    }

    return { phaseId: data.phaseId, audio: data.audio, text: data.text };
  } catch (error: unknown) {
    clearTimeout(timer);
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    if (isTimeout) {
      console.warn(`ElevenLabs timed out after ${timeoutMs}ms for phase: ${phaseId}, using fallback`);
    } else {
      elevenLabsAvailable = false;
      console.warn('ElevenLabs request failed, switching to browser TTS:', error);
    }
    return { phaseId, audio: '', text: fallbackText, useFallback: true };
  }
}

// In-memory cache shared across calls
const audioCache = new Map<string, PhaseAudio>();

/**
 * Prefetch all phases in parallel (non-blocking).
 * Results are stored in the module-level cache so playPhaseAudio can grab them.
 */
export function prefetchAllPhases(
  phaseIds: string[],
  mode: 'onboarding' | 'vision' | 'tour' = 'onboarding'
): void {
  for (const phaseId of phaseIds) {
    const key = `${mode}:${phaseId}`;
    if (audioCache.has(key)) continue; // already cached or in-flight
    // Mark as in-flight with a placeholder so we don't double-fetch
    fetchPhaseAudio(phaseId, mode).then((audio) => {
      audioCache.set(key, audio);
    }).catch((error) => {
      console.warn(`Prefetch failed for ${phaseId}:`, error);
      const fallbackText = NARRATIVE_PHASES[mode]?.[phaseId] || '';
      audioCache.set(key, { phaseId, audio: '', text: fallbackText, useFallback: true });
    });
  }
}

/**
 * Prefetch all phases in staggered batches to respect ElevenLabs rate limits.
 * Fetches in groups of 3 with 300ms gaps, then retries any that fell back to browser TTS.
 */
export async function prefetchAllPhasesStaggered(
  phaseIds: string[],
  mode: 'onboarding' | 'vision' | 'tour' = 'onboarding'
): Promise<void> {
  const BATCH_SIZE = 3;
  const BATCH_DELAY_MS = 300;

  // Split into batches of 3
  const batches: string[][] = [];
  for (let i = 0; i < phaseIds.length; i += BATCH_SIZE) {
    batches.push(phaseIds.slice(i, i + BATCH_SIZE));
  }

  // Process batches sequentially, phases within a batch in parallel
  for (const batch of batches) {
    await Promise.all(
      batch.map(async (phaseId) => {
        const key = `${mode}:${phaseId}`;
        if (audioCache.has(key)) return; // already cached
        try {
          const audio = await fetchPhaseAudio(phaseId, mode);
          audioCache.set(key, audio);
        } catch (error) {
          console.warn(`Prefetch failed for ${phaseId}:`, error);
          const fallbackText = NARRATIVE_PHASES[mode]?.[phaseId] || '';
          audioCache.set(key, { phaseId, audio: '', text: fallbackText, useFallback: true });
        }
      })
    );
    // Pause between batches to avoid rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  // Retry pass: re-fetch any phases that fell back to browser TTS
  const fallbackPhases = phaseIds.filter((phaseId) => {
    const key = `${mode}:${phaseId}`;
    const cached = audioCache.get(key);
    return cached?.useFallback === true;
  });

  if (fallbackPhases.length > 0 && elevenLabsAvailable) {
    console.log(`Retrying ${fallbackPhases.length} phases that used fallback:`, fallbackPhases);
    // Small delay before retry
    await new Promise((r) => setTimeout(r, 500));

    for (const batch of chunkArray(fallbackPhases, 2)) {
      await Promise.all(
        batch.map(async (phaseId) => {
          const key = `${mode}:${phaseId}`;
          try {
            // Clear stale fallback so we actually re-fetch
            audioCache.delete(key);
            const audio = await fetchPhaseAudio(phaseId, mode, 8000); // longer timeout for retry
            audioCache.set(key, audio);
            if (!audio.useFallback) {
              console.log(`Retry succeeded for phase: ${phaseId}`);
            }
          } catch (error) {
            console.warn(`Retry failed for ${phaseId}:`, error);
          }
        })
      );
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}

/** Split an array into chunks of a given size */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get cached phase audio, or fetch with timeout if not yet cached.
 */
export async function getCachedOrFetch(
  phaseId: string,
  mode: 'onboarding' | 'vision' | 'tour' = 'onboarding',
  timeoutMs = 5000
): Promise<PhaseAudio> {
  const key = `${mode}:${phaseId}`;
  const cached = audioCache.get(key);
  if (cached) return cached;

  // Not cached yet — fetch with timeout
  const audio = await fetchPhaseAudio(phaseId, mode, timeoutMs);
  audioCache.set(key, audio);
  return audio;
}

/**
 * Fetch all phase audio sequentially to avoid ElevenLabs rate limits.
 * Most plans only allow 2-3 concurrent requests.
 */
export async function fetchAllPhaseAudio(
  phaseIds: string[],
  mode: 'onboarding' | 'vision' | 'tour' = 'onboarding'
): Promise<Map<string, PhaseAudio>> {
  const audioMap = new Map<string, PhaseAudio>();

  for (const phaseId of phaseIds) {
    try {
      const audio = await getCachedOrFetch(phaseId, mode);
      audioMap.set(phaseId, audio);
    } catch (error) {
      console.error(`Failed to fetch audio for phase ${phaseId}:`, error);
      const fallbackText = NARRATIVE_PHASES[mode]?.[phaseId] || '';
      audioMap.set(phaseId, { phaseId, audio: '', text: fallbackText, useFallback: true });
    }
  }

  return audioMap;
}

/**
 * Decode base64 audio and play through Web Audio API
 * Returns the AudioBufferSourceNode and AnalyserNode for visual sync
 */
export async function playAudio(
  base64Audio: string,
  audioContext: AudioContext,
  gainNode: GainNode
): Promise<AudioPlaybackResult> {
  // Use data URI approach for reliable decoding
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  
  // Fetch and decode the audio
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Create source node
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;

  // Create analyser for visual pulse
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;

  // Connect: source -> analyser -> gain -> destination
  source.connect(analyser);
  analyser.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start playback
  source.start(0);

  return {
    source,
    analyser,
    duration: audioBuffer.duration,
  };
}

/**
 * Create an AudioContext and GainNode for the audio service.
 * Reuses the shared context if it exists and isn't closed.
 */
export function createAudioContext(): { audioContext: AudioContext; gainNode: GainNode } {
  // Reuse existing context if available (may already be unlocked via user gesture)
  if (sharedAudio && sharedAudio.audioContext.state !== 'closed') {
    // Resume if suspended (browser may have auto-suspended it)
    if (sharedAudio.audioContext.state === 'suspended') {
      sharedAudio.audioContext.resume().catch(console.warn);
    }
    return sharedAudio;
  }

  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0;
  sharedAudio = { audioContext, gainNode };
  return sharedAudio;
}

/**
 * Call this from a user gesture (click/tap) to satisfy autoplay policies.
 * This creates the shared AudioContext during the gesture so it's allowed to play audio.
 */
export async function unlockAudioContext(): Promise<void> {
  const { audioContext } = createAudioContext();
  
  // Resume if suspended - this MUST happen during a user gesture
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('AudioContext unlocked successfully, state:', audioContext.state);
    } catch (e) {
      console.warn('AudioContext resume blocked:', e);
    }
  } else {
    console.log('AudioContext already running, state:', audioContext.state);
  }
  
  // Play a silent buffer to fully unlock on iOS Safari
  try {
    const buffer = audioContext.createBuffer(1, 1, 22050);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    console.log('Silent buffer played for iOS unlock');
  } catch (e) {
    console.warn('Silent buffer playback failed:', e);
  }
}

/**
 * Set volume (0 = muted, 1 = full volume)
 */
export function setVolume(gainNode: GainNode, volume: number): void {
  gainNode.gain.value = Math.max(0, Math.min(1, volume));
}

/**
 * Play text using browser's native Web Speech API (fallback TTS)
 * Returns a Promise that resolves when speech ends, with the duration
 */
export function speakTextFallback(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): { cancel: () => void; duration: Promise<number> } {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported');
    return { 
      cancel: () => {}, 
      duration: Promise.resolve(estimateReadingDuration(text)) 
    };
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Try to find a good British English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.lang.startsWith('en-GB') && v.name.toLowerCase().includes('female')
  ) || voices.find(v => 
    v.lang.startsWith('en-GB')
  ) || voices.find(v => 
    v.lang.startsWith('en')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  // Estimate max duration for timeout safety (iOS Safari can silently fail)
  const estimatedDuration = estimateReadingDuration(text);
  const timeoutMs = (estimatedDuration + 5) * 1000; // Add 5 second buffer
  
  let resolved = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const speechPromise = new Promise<number>((resolve) => {
    const startTime = Date.now();
    
    utterance.onstart = () => {
      onStart?.();
    };
    
    utterance.onend = () => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      const duration = (Date.now() - startTime) / 1000;
      onEnd?.();
      resolve(duration);
    };
    
    utterance.onerror = (event) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      console.warn('Speech synthesis error:', event.error);
      onEnd?.();
      resolve(estimatedDuration);
    };
  });
  
  const timeoutPromise = new Promise<number>((resolve) => {
    timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      console.warn('Speech synthesis timeout - using estimated duration');
      window.speechSynthesis.cancel();
      onEnd?.();
      resolve(estimatedDuration);
    }, timeoutMs);
  });
  
  window.speechSynthesis.speak(utterance);
  
  // Race: speech completion vs timeout
  const durationPromise = Promise.race([speechPromise, timeoutPromise]);
  
  return {
    cancel: () => {
      if (resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      window.speechSynthesis.cancel();
      onEnd?.();
    },
    duration: durationPromise,
  };
}

/**
 * Estimate reading duration based on text length (words per minute)
 */
function estimateReadingDuration(text: string): number {
  const wordsPerMinute = 150; // Average speaking rate
  const words = text.split(/\s+/).length;
  return (words / wordsPerMinute) * 60; // seconds
}

/**
 * Load voices (some browsers load them asynchronously)
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Wait for voices to load
    window.speechSynthesis?.addEventListener('voiceschanged', () => {
      resolve(window.speechSynthesis.getVoices());
    }, { once: true });
    
    // Timeout fallback
    setTimeout(() => resolve(window.speechSynthesis?.getVoices() || []), 1000);
  });
}
