// Unified Skill Progress Hook - Single Source of Truth
// Provides consistent skill calculations across all views with flexible topic matching
// Total: 38 skills across 5 categories, max points = 190

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CORE_SKILLS_GROUPS } from '@/constants';

// Canonical topic names - single source of truth (38 skills)
// These match exactly what the frontend displays AND what Neural Scribe returns
export const CANONICAL_TOPICS = [
  // Basic Skills (10)
  "Cockpit Drill", "Clutch Control", "Changing Gear", "Steering",
  "Moving Off & Stopping", "Hill Start", "MSPSL Routine", "Emergency Stop",
  "Ancillary Controls", "Show Me Tell Me",
  // Junctions (6)
  "Turn Left", "Turn Right", "Crossroads", "Roundabouts", "Traffic Lights", "Dual Carriageways",
  // Manoeuvres (7)
  "Turn In Road", "Parallel Park", "Pull Up On The Right", "Left Reverse",
  "Bay Park (Forward)", "Bay Park (Reverse)", "Emergency Stop (Controlled)",
  // Road Use (10)
  "Use of Speed", "Following Distance", "Mirrors & Signals", "Pedestrian Crossings",
  "Meeting & Passing", "Overtaking Safely", "Anticipation & Planning", "Crossing Other Traffic",
  "Independent Driving (Sat Nav)", "Independent Driving (Follow Signs)",
  // Other (5)
  "Country Roads", "Motorways", "Night Driving", "Weather Conditions", "City Driving"
] as const;

export type CanonicalTopic = typeof CANONICAL_TOPICS[number];

// Alias map for legacy database entries that may have different names
// Maps non-canonical names to their canonical equivalents
const TOPIC_ALIASES: Record<string, CanonicalTopic> = {
  // ── Old canonical names from the 27-skill era ──
  "Controls & Instruments": "Clutch Control",
  "Controls & Cockpit Drill": "Cockpit Drill",
  "Moving Off & Pulling Up": "Moving Off & Stopping",
  "Moving Off & Stopping": "Moving Off & Stopping",
  "Safety Checks": "Show Me Tell Me",
  "Vehicle Safety Checks": "Show Me Tell Me",
  "Signals & Positioning": "Mirrors & Signals",
  "Road Position & Speed": "Use of Speed",
  "Use of Mirrors": "Mirrors & Signals",
  "Mirrors": "Mirrors & Signals",
  "Signals": "Mirrors & Signals",
  "Junctions": "Turn Left",
  "Bay Park": "Bay Park (Reverse)",
  "Reversing": "Left Reverse",
  "Independent Driving": "Independent Driving (Sat Nav)",
  "Legal Responsibilities": "Show Me Tell Me",

  // ── Legacy shorthand aliases ──
  "Controls": "Clutch Control",
  "Moving Off": "Moving Off & Stopping",
  "Pulling Up": "Moving Off & Stopping",
  "Observations": "Mirrors & Signals",
  "Mirror Checks": "Mirrors & Signals",
  "Signalling": "Mirrors & Signals",
  "Planning": "Anticipation & Planning",
  "Speed Control": "Use of Speed",
  "Speed Management": "Use of Speed",
  "Junction Approach": "Turn Left",
  "Roundabout Navigation": "Roundabouts",
  "Parallel Parking": "Parallel Park",
  "Bay Parking": "Bay Park (Reverse)",
  "Reverse Parking": "Bay Park (Reverse)",
  "E-Stop": "Emergency Stop",
  "Reverse": "Left Reverse",
  "Reversing Exercise": "Left Reverse",
  "Satnav": "Independent Driving (Sat Nav)",
  "Night": "Night Driving",

  // ── Spoken / verbal aliases ──
  "Legal": "Show Me Tell Me",
  "Licence": "Show Me Tell Me",
  "License": "Show Me Tell Me",
  "Vehicle Checks": "Show Me Tell Me",
  "Show Me Tell Me Questions": "Show Me Tell Me",
  "Ancillary": "Ancillary Controls",
  "Heater": "Ancillary Controls",
  "Wipers": "Ancillary Controls",
  "Demister": "Ancillary Controls",
  "Following": "Following Distance",
  "Two Second Rule": "Following Distance",
  "2 Second Rule": "Following Distance",
  "Safe Distance": "Following Distance",
  "Pedestrian Crossing": "Pedestrian Crossings",
  "Crossings": "Pedestrian Crossings",
  "Zebra Crossing": "Pedestrian Crossings",
  "Pelican Crossing": "Pedestrian Crossings",
  "Meeting": "Meeting & Passing",
  "Passing": "Meeting & Passing",
  "Clearance": "Meeting & Passing",
  "Narrow Roads": "Meeting & Passing",
  "Crossing Traffic": "Crossing Other Traffic",
  "Turning Right": "Crossing Other Traffic",
  "Overtaking": "Overtaking Safely",
  "Overtake": "Overtaking Safely",
  "Country": "Country Roads",
  "Rural": "Country Roads",
  "Rural Roads": "Country Roads",
  "Bends": "Country Roads",
  "Motorway": "Motorways",
  "Motorway Driving": "Motorways",
  "Joining Motorway": "Motorways",
  "Weather": "Weather Conditions",
  "Rain": "Weather Conditions",
  "Fog": "Weather Conditions",
  "Ice": "Weather Conditions",
  "Adverse Weather": "Weather Conditions",

  // ── New skill verbal aliases ──
  "Clutch": "Clutch Control",
  "Gears": "Changing Gear",
  "Gear Change": "Changing Gear",
  "Gear Changes": "Changing Gear",
  "Hill": "Hill Start",
  "Hill Starts": "Hill Start",
  "MSM": "MSPSL Routine",
  "MSPSL": "MSPSL Routine",
  "Routine": "MSPSL Routine",
  "Show Tell": "Show Me Tell Me",
  "T-Junction": "Turn Left",
  "Emerging": "Turn Left",
  "Crossroad": "Crossroads",
  "Traffic Light": "Traffic Lights",
  "Dual": "Dual Carriageways",
  "Dual Carriageway": "Dual Carriageways",
  "Turn In The Road": "Turn In Road",
  "Three Point Turn": "Turn In Road",
  "Pull Up Right": "Pull Up On The Right",
  "Reverse Bay": "Bay Park (Reverse)",
  "Forward Bay": "Bay Park (Forward)",
  "Bay Forward": "Bay Park (Forward)",
  "Bay Reverse": "Bay Park (Reverse)",
  "Sat Nav": "Independent Driving (Sat Nav)",
  "Sat Nav Drive": "Independent Driving (Sat Nav)",
  "Follow Signs": "Independent Driving (Follow Signs)",
  "Following Signs": "Independent Driving (Follow Signs)",
  "City": "City Driving",
  "Town": "City Driving",
  "Town Driving": "City Driving",
  "Urban": "City Driving",
  "Manoeuvres": "Left Reverse",
};

// Normalize a topic name to its canonical form
export function normalizeTopicName(topic: string): CanonicalTopic | null {
  // First check if it's already canonical
  if (CANONICAL_TOPICS.includes(topic as CanonicalTopic)) {
    return topic as CanonicalTopic;
  }
  
  // Check alias map
  if (TOPIC_ALIASES[topic]) {
    return TOPIC_ALIASES[topic];
  }
  
  // Try fuzzy matching - check if the canonical topic is contained in the db topic
  for (const canonical of CANONICAL_TOPICS) {
    const topicLower = topic.toLowerCase();
    const canonicalLower = canonical.toLowerCase();
    
    if (topicLower.includes(canonicalLower) || canonicalLower.includes(topicLower)) {
      return canonical;
    }
    
    // Check for significant word overlap
    const topicWords = topicLower.split(/\s+/);
    const canonicalWords = canonicalLower.split(/\s+/);
    const matchingWords = topicWords.filter(w => 
      canonicalWords.some(cw => cw.includes(w) || w.includes(cw))
    );
    
    if (matchingWords.length >= 2 || (matchingWords.length === 1 && topicWords.length === 1)) {
      return canonical;
    }
  }
  
  return null;
}

// Get skill level for a canonical topic from database records
function getSkillLevelFromRecords(
  topic: CanonicalTopic, 
  skillRecords: Array<{ topic: string; level: number }>
): number {
  // Direct match
  const direct = skillRecords.find(s => s.topic === topic);
  if (direct) return direct.level;
  
  // Check if any record normalizes to this topic — use Math.max for multiple matches
  let maxLevel = 0;
  for (const record of skillRecords) {
    const normalized = normalizeTopicName(record.topic);
    if (normalized === topic) {
      maxLevel = Math.max(maxLevel, record.level);
    }
  }
  
  return maxLevel;
}

export interface SkillRecord {
  id: string;
  student_id: string;
  instructor_id: string;
  topic: string;
  level: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedSkillProgress {
  rawRecords: SkillRecord[];
  skillMap: Record<CanonicalTopic, number>;
  totalSkills: number;        // 38
  maxPoints: number;          // 190 (38 × 5)
  earnedPoints: number;
  coveredSkills: number;
  masteredSkills: number;
  masteryPercent: number;     // earnedPoints / maxPoints * 100
  coveragePercent: number;    // coveredSkills / totalSkills * 100
  getLevel: (topic: string) => number;
  isLoading: boolean;
}

function buildProgress(rawRecords: SkillRecord[], isLoading: boolean): UnifiedSkillProgress {
  const totalSkills = CANONICAL_TOPICS.length; // 38
  const maxPoints = totalSkills * 5; // 190
  
  const skillMap = {} as Record<CanonicalTopic, number>;
  for (const topic of CANONICAL_TOPICS) {
    skillMap[topic] = getSkillLevelFromRecords(topic, rawRecords);
  }
  
  const levels = Object.values(skillMap);
  const earnedPoints = levels.reduce((sum, level) => sum + level, 0);
  const coveredSkills = levels.filter(l => l > 0).length;
  const masteredSkills = levels.filter(l => l >= 4).length;
  
  return {
    rawRecords,
    skillMap,
    totalSkills,
    maxPoints,
    earnedPoints,
    coveredSkills,
    masteredSkills,
    masteryPercent: Math.round((earnedPoints / maxPoints) * 100),
    coveragePercent: Math.round((coveredSkills / totalSkills) * 100),
    getLevel: (topic: string) => {
      const normalized = normalizeTopicName(topic);
      return normalized ? skillMap[normalized] : 0;
    },
    isLoading,
  };
}

// Hook for student's own skill progress
export function useUnifiedStudentSkillProgress(): UnifiedSkillProgress {
  const { user } = useAuth();
  
  const { data: rawRecords = [], isLoading } = useQuery({
    queryKey: ['unified-student-skills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('topic', { ascending: true });
      if (error) throw error;
      return data as SkillRecord[];
    },
    enabled: !!user?.id,
  });
  
  return useMemo(() => buildProgress(rawRecords, isLoading), [rawRecords, isLoading]);
}

// Hook for instructor viewing a specific student's progress
export function useUnifiedInstructorSkillProgress(studentId: string): UnifiedSkillProgress {
  const { data: rawRecords = [], isLoading } = useQuery({
    queryKey: ['unified-instructor-skills', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('topic', { ascending: true });
      if (error) throw error;
      return data as SkillRecord[];
    },
    enabled: !!studentId,
  });
  
  return useMemo(() => buildProgress(rawRecords, isLoading), [rawRecords, isLoading]);
}
