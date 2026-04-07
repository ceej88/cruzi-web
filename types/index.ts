// Cruzi AI - Core Type Definitions
// Shared source of truth for both Instructor and Student portals

import { Database } from "@/integrations/supabase/types";

// Re-export the database role type
export type UserRole = Database["public"]["Enums"]["app_role"];

// Subscription tier types
export type SubscriptionTier = 'lite' | 'elite';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

// Instructor Conversion Funnel Types
export type FunnelStep = 'VISION' | 'TIERS' | 'SIGNUP' | 'VERIFICATION' | 'READY';
export type SelectedTier = 'LITE' | 'ELITE';

export enum LessonStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REQUESTED = 'REQUESTED'
}

export enum PupilLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  TEST_READY = 'TEST_READY'
}

export enum SkillProficiency {
  INTRODUCED = 1,
  UNDER_INSTRUCTION = 2,
  PROMPTED = 3,
  SELDOM_PROMPTED = 4,
  INDEPENDENT = 5
}

export type PupilStatus = 'PENDING' | 'ACTIVE' | 'ARCHIVED';

export interface CruziNotification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT' | 'INSIGHT' | 'GROWTH';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  targetTab?: string;
}

export interface SharedPlan {
  id: string;
  pupilId: string;
  title: string;
  objective: string;
  studentSummary: string;
  bundledSkills: string[];
  dateShared: string;
}

export type VerificationStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface InstructorProfile {
  name: string;
  email?: string;
  instructorPin?: string;
  adiNumber: string;
  grade: string;
  bio: string;
  termsOfBusiness?: string;
  hourlyRate: number;
  blockRates: {
    tenHours: number;
    twentyHours: number;
    thirtyHours: number;
  };
  bankDetails?: {
    accountName: string;
    sortCode: string;
    accountNumber: string;
  };
  showBankDetailsToStudents: boolean;
  stripeConnected: boolean;
  // Verification fields
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationScore?: number;
  adiExpiryDate?: string;
  badgeImageUrl?: string;
  // Subscription tier fields
  subscriptionTier?: SubscriptionTier;
  aiCallsToday?: number;
  maxStudents?: number;
  lastUsageReset?: string;
  // Trial fields
  trialExpiresAt?: string;
  selectedTier?: SelectedTier;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Pupil {
  id: string;
  name: string;
  email: string;
  phone: string;
  parentEmail?: string;
  dob?: string;
  address?: string;
  level: PupilLevel;
  totalHours: number;
  creditBalance: number;
  nextLesson?: string;
  progress: number;
  notes: string;
  status: PupilStatus;
  hasProvisional?: boolean;
  provisionalNo?: string;
  checkCode?: string;
  hasTheory?: boolean;
  theoryCertNo?: string;
  visionRequired?: boolean;
  medicalDetails?: string;
  previousExperience?: string;
  learningStyle?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  prefDuration?: string;
  prefDays?: string[];
  prefPayment?: string;
  acceptedTerms?: boolean;
  onboardedDate?: string;
}

export interface TeachingTemplate {
  id: string;
  title: string;
  category?: string;
  content: string;
  aiSummary: string;
  lastUsed?: string;
}

export interface SkillProgress {
  topic: string;
  level: SkillProficiency;
  lastUpdated: string;
}

export interface Lesson {
  id: string;
  pupilId: string;
  date: string;
  duration: number;
  topic: string;
  status: LessonStatus;
  notes?: string;
  paymentMethod?: 'CREDIT' | 'CASH' | 'BANK_TRANSFER';
}

export interface LessonPlan {
  title: string;
  objective: string;
  setup: string[];
  mainActivities: string[];
  commonFaults: string[];
  summary: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface FaultMarker {
  category: string;
  minors: number;
  serious: boolean;
  dangerous: boolean;
}

export interface MockTestResult {
  pupilId: string;
  date: string;
  markers: FaultMarker[];
  totalMinors: number;
  hasSerious: boolean;
  hasDangerous: boolean;
  passed: boolean;
}

export interface TrickySpot {
  id: string;
  title: string;
  description: string;
  tip: string;
  lat: number;
  lng: number;
  type: 'junction' | 'roundabout' | 'one-way' | 'hazard';
}

export interface PracticeDrive {
  id: string;
  date: string;
  duration: number;
  miles: number;
  score: number;
  feedback: string;
  route: { lat: number; lng: number; speed: number }[];
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  isUnlocked: boolean;
  criteria: string;
}

export interface GrowthOpportunity {
  id: string;
  type: 'UPSELL' | 'MARKETING' | 'RETENTION' | 'YIELD';
  title: string;
  description: string;
  action: string;
  onClick?: () => void;
}

// Database Profile type (maps to profiles table)
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  instructor_id?: string;
  created_at: string;
  updated_at: string;
}

// Neural Scribe Types
export interface AudioSnippet {
  id: string;
  lessonId: string;
  studentId: string;
  blob: Blob;
  timestamp: string;
  duration: number;
  isProcessed: boolean;
}

export interface NeuralSessionResult {
  summary: string;
  skillsDiscussed: string[];
  reflectiveLog: string;
  nextLessonFocus: string;
}

export type NeuralSessionStatus = 'NONE' | 'PENDING_REVIEW' | 'COMMITTED';
