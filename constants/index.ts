// Cruzi AI - Constants & Mock Data
// Shared source of truth for both Instructor and Student portals

import { Pupil, PupilLevel, Lesson, LessonStatus } from '@/types';

export const MOCK_PUPILS: Pupil[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '07700 900123',
    parentEmail: 'mark.j@example.com',
    level: PupilLevel.BEGINNER,
    totalHours: 4,
    creditBalance: 10,
    nextLesson: '2024-05-20T14:00:00',
    progress: 15,
    notes: 'Needs work on clutch control and moving off smoothly.',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Sarah Miller',
    email: 'sarah.m@example.com',
    phone: '07700 900456',
    parentEmail: 'jane.m@example.com',
    level: PupilLevel.INTERMEDIATE,
    totalHours: 18,
    creditBalance: 2.5,
    nextLesson: '2024-05-21T09:00:00',
    progress: 55,
    notes: 'Doing well with roundabouts. Starting dual carriageways next.',
    status: 'ACTIVE'
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james.w@example.com',
    phone: '07700 900789',
    parentEmail: 'david.w@example.com',
    level: PupilLevel.TEST_READY,
    totalHours: 35,
    creditBalance: 0,
    nextLesson: '2024-05-22T11:00:00',
    progress: 92,
    notes: 'Very confident. Mock test scheduled for next week.',
    status: 'ACTIVE'
  }
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: '101',
    pupilId: '1',
    date: '2024-05-20T14:00:00',
    duration: 120,
    topic: 'Clutch Control & Moving Off',
    status: LessonStatus.SCHEDULED,
    paymentMethod: 'CREDIT'
  },
  {
    id: '102',
    pupilId: '2',
    date: '2024-05-21T09:00:00',
    duration: 90,
    topic: 'Emerging from Junctions',
    status: LessonStatus.SCHEDULED,
    paymentMethod: 'CASH'
  }
];

// DVSA Syllabus topics - CANONICAL NAMES (single source of truth)
// These must match exactly with:
// 1. useUnifiedSkillProgress.ts CANONICAL_TOPICS
// 2. supabase/functions/neural-scribe-audio/index.ts SYLLABUS_TOPICS
// When updating, ensure all three files are kept in sync!
// Total: 38 skills across 5 categories, max points = 190
export const SYLLABUS_TOPICS = [
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

export const CORE_SKILLS_GROUPS = [
  {
    category: "Basic Skills",
    skills: ["Cockpit Drill", "Clutch Control", "Changing Gear", "Steering", "Moving Off & Stopping", "Hill Start", "MSPSL Routine", "Emergency Stop", "Ancillary Controls", "Show Me Tell Me"] as const
  },
  {
    category: "Junctions",
    skills: ["Turn Left", "Turn Right", "Crossroads", "Roundabouts", "Traffic Lights", "Dual Carriageways"] as const
  },
  {
    category: "Manoeuvres",
    skills: ["Turn In Road", "Parallel Park", "Pull Up On The Right", "Left Reverse", "Bay Park (Forward)", "Bay Park (Reverse)", "Emergency Stop (Controlled)"] as const
  },
  {
    category: "Road Use",
    skills: ["Use of Speed", "Following Distance", "Mirrors & Signals", "Pedestrian Crossings", "Meeting & Passing", "Overtaking Safely", "Anticipation & Planning", "Crossing Other Traffic", "Independent Driving (Sat Nav)", "Independent Driving (Follow Signs)"] as const
  },
  {
    category: "Other",
    skills: ["Country Roads", "Motorways", "Night Driving", "Weather Conditions", "City Driving"] as const
  }
] as const;

export const DVSA_CATEGORIES = [
  "Precautions",
  "Controls (Clutch, Gears, etc)",
  "Move Off (Safety & Control)",
  "Mirrors (Signalling & Change Direction)",
  "Signals (Necessary & Correctly)",
  "Response to Signs/Signals",
  "Use of Speed",
  "Following Distance",
  "Progress (Appropriate Speed)",
  "Junctions (Approach & Observation)",
  "Judgement (Overtaking & Meeting)",
  "Positioning (Normal & Lane Discipline)",
  "Pedestrian Crossings",
  "Awareness & Planning",
  "Ancillary Controls",
  "Maneuvers"
];

// Level badge colors and labels
export const LEVEL_CONFIG = {
  [PupilLevel.BEGINNER]: { label: 'Beginner', color: 'bg-cruzi-cyan/20 text-cruzi-cyan' },
  [PupilLevel.INTERMEDIATE]: { label: 'Intermediate', color: 'bg-cruzi-indigo/20 text-cruzi-indigo' },
  [PupilLevel.ADVANCED]: { label: 'Advanced', color: 'bg-cruzi-gold/20 text-cruzi-gold' },
  [PupilLevel.TEST_READY]: { label: 'Test Ready', color: 'bg-cruzi-success/20 text-cruzi-success' }
};

export const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-cruzi-success/20 text-cruzi-success' },
  PENDING: { label: 'Pending', color: 'bg-cruzi-gold/20 text-cruzi-gold' },
  ARCHIVED: { label: 'Archived', color: 'bg-muted text-muted-foreground' }
};
