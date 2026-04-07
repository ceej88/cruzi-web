// Voice Learning Service - Handles corrections, usage tracking, and phonetic aliases
// This enables the "learning" capability where the AI gets smarter about your students

import { supabase } from '@/integrations/supabase/client';

// Types for the learning system
export interface StudentEntity {
  id: string;
  name: string;
  balance: number;
  mentionCount: number;
  lastMentioned: string | null;
  aliases: string[];  // Phonetic aliases learned from corrections
}

export interface VoiceCorrection {
  misheardPhrase: string;
  correctStudentId: string;
  correctStudentName: string;
  timestamp: string;
}

export interface VoiceLearningData {
  corrections: Record<string, string>;  // misheardPhrase -> studentId
  usageHistory: Record<string, { count: number; lastUsed: string }>;  // studentId -> usage
  commandPatterns: Record<string, number>;  // command pattern -> frequency
}

const STORAGE_KEY = 'cruzi_voice_learning';
const USAGE_DECAY_DAYS = 14;  // Usage weight decays after 2 weeks

// Load learning data from localStorage
export function loadLearningData(): VoiceLearningData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[VoiceLearning] Failed to load data:', e);
  }
  return {
    corrections: {},
    usageHistory: {},
    commandPatterns: {},
  };
}

// Save learning data to localStorage
export function saveLearningData(data: VoiceLearningData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[VoiceLearning] Failed to save data:', e);
  }
}

// Record a correction - when the user fixes a misheard name
export function recordCorrection(
  misheardPhrase: string, 
  correctStudentId: string,
  correctStudentName: string
): void {
  const data = loadLearningData();
  
  // Normalize the phrase for matching
  const normalizedPhrase = misheardPhrase.toLowerCase().trim();
  
  // Store the correction
  data.corrections[normalizedPhrase] = correctStudentId;
  
  // Also record this as a "mention" for usage tracking
  recordUsage(correctStudentId);
  
  saveLearningData(data);
  
  console.log(`[VoiceLearning] Recorded correction: "${misheardPhrase}" -> ${correctStudentName}`);
}

// Record usage of a student name (for frequency weighting)
export function recordUsage(studentId: string): void {
  const data = loadLearningData();
  
  const existing = data.usageHistory[studentId] || { count: 0, lastUsed: '' };
  data.usageHistory[studentId] = {
    count: existing.count + 1,
    lastUsed: new Date().toISOString(),
  };
  
  saveLearningData(data);
}

// Record command patterns (for FAQ learning)
export function recordCommandPattern(pattern: string): void {
  const data = loadLearningData();
  
  const normalizedPattern = pattern.toLowerCase().trim();
  data.commandPatterns[normalizedPattern] = (data.commandPatterns[normalizedPattern] || 0) + 1;
  
  saveLearningData(data);
}

// Get usage weight for a student (higher = more recently/frequently mentioned)
export function getUsageWeight(studentId: string): number {
  const data = loadLearningData();
  const usage = data.usageHistory[studentId];
  
  if (!usage) return 0;
  
  // Calculate recency factor (decays over USAGE_DECAY_DAYS)
  const daysSinceUsed = usage.lastUsed 
    ? (Date.now() - new Date(usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24)
    : USAGE_DECAY_DAYS;
  
  const recencyFactor = Math.max(0, 1 - (daysSinceUsed / USAGE_DECAY_DAYS));
  
  // Combine frequency and recency
  return usage.count * (0.5 + 0.5 * recencyFactor);
}

// Check if a phrase matches a known correction
export function findCorrectionMatch(phrase: string): string | null {
  const data = loadLearningData();
  const normalizedPhrase = phrase.toLowerCase().trim();
  
  // Direct match
  if (data.corrections[normalizedPhrase]) {
    return data.corrections[normalizedPhrase];
  }
  
  // Fuzzy match - check if phrase contains any known correction
  for (const [misheard, studentId] of Object.entries(data.corrections)) {
    if (normalizedPhrase.includes(misheard) || misheard.includes(normalizedPhrase)) {
      return studentId;
    }
  }
  
  return null;
}

// Get top command patterns (for FAQ suggestions)
export function getTopCommandPatterns(limit = 5): { pattern: string; count: number }[] {
  const data = loadLearningData();
  
  return Object.entries(data.commandPatterns)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Build enriched student list for AI context
export async function buildEnrichedStudentList(instructorId: string): Promise<StudentEntity[]> {
  const learningData = loadLearningData();
  
  // Fetch students from database
  const { data: students, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, credit_balance')
    .eq('instructor_id', instructorId)
    .limit(50);
  
  if (error || !students) {
    console.warn('[VoiceLearning] Failed to fetch students:', error);
    return [];
  }
  
  // Build correction aliases map (studentId -> aliases)
  const aliasMap: Record<string, string[]> = {};
  for (const [phrase, studentId] of Object.entries(learningData.corrections)) {
    if (!aliasMap[studentId]) {
      aliasMap[studentId] = [];
    }
    aliasMap[studentId].push(phrase);
  }
  
  // Enrich students with learning data
  const enrichedStudents: StudentEntity[] = students.map(s => {
    const usage = learningData.usageHistory[s.user_id];
    return {
      id: s.user_id,
      name: s.full_name || 'Unknown',
      balance: s.credit_balance || 0,
      mentionCount: usage?.count || 0,
      lastMentioned: usage?.lastUsed || null,
      aliases: aliasMap[s.user_id] || [],
    };
  });
  
  // Sort by usage weight (most mentioned first)
  return enrichedStudents.sort((a, b) => {
    const weightA = getUsageWeight(a.id);
    const weightB = getUsageWeight(b.id);
    return weightB - weightA;
  });
}

// Generate phonetic hints for the AI
export function generatePhoneticHints(students: StudentEntity[]): string {
  const hints: string[] = [];
  
  for (const student of students) {
    if (student.aliases.length > 0) {
      hints.push(
        `If you hear "${student.aliases.join('" or "')}", that means "${student.name}" (ID: ${student.id})`
      );
    }
    
    // Generate common phonetic variations
    const name = student.name.split(' ')[0]; // First name
    const variations = generatePhoneticVariations(name);
    if (variations.length > 0) {
      hints.push(
        `"${variations.join('" or "')}" → "${student.name}" (ID: ${student.id})`
      );
    }
  }
  
  return hints.join('\n');
}

// Generate common phonetic variations for a name
function generatePhoneticVariations(name: string): string[] {
  const variations: string[] = [];
  const lower = name.toLowerCase();
  
  // Common sound-alike substitutions
  const substitutions: Record<string, string[]> = {
    'sarah': ['sara', 'sera', 'zarah'],
    'james': ['jaymes', 'jams'],
    'emma': ['ema', 'emmer'],
    'michael': ['mike', 'mikey', 'mikhael'],
    'christopher': ['chris', 'kris'],
    'jennifer': ['jen', 'jenny'],
    'elizabeth': ['liz', 'beth', 'lizzy'],
    'matthew': ['matt', 'matty'],
    'nicholas': ['nick', 'nicky'],
    'daniel': ['dan', 'danny'],
    'jessica': ['jess', 'jessie'],
    'ashley': ['ash'],
    'taylor': ['tayla'],
    'chloe': ['cloe', 'khloe'],
    'sophie': ['sophy', 'sofia'],
    'olivia': ['liv', 'livvy'],
    'amy': ['aimee', 'amie'],
    'lucy': ['lucie', 'luce'],
    'katie': ['kate', 'katy'],
    'lauren': ['loren', 'lauryn'],
  };
  
  if (substitutions[lower]) {
    variations.push(...substitutions[lower]);
  }
  
  return variations;
}

// Clear all learning data (reset)
export function clearLearningData(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[VoiceLearning] All learning data cleared');
}

// Export stats for debugging
export function getLearningStats(): {
  totalCorrections: number;
  totalStudentsTracked: number;
  totalCommandPatterns: number;
  topStudents: { id: string; mentions: number }[];
} {
  const data = loadLearningData();
  
  const topStudents = Object.entries(data.usageHistory)
    .map(([id, usage]) => ({ id, mentions: usage.count }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5);
  
  return {
    totalCorrections: Object.keys(data.corrections).length,
    totalStudentsTracked: Object.keys(data.usageHistory).length,
    totalCommandPatterns: Object.keys(data.commandPatterns).length,
    topStudents,
  };
}
