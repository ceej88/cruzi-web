// Cruzi AI Service - Connects to Lovable AI Gateway via Edge Function
import { supabase } from '@/integrations/supabase/client';
import { TrickySpot } from '@/types';
import { CANONICAL_TOPICS, normalizeTopicName } from '@/hooks/useUnifiedSkillProgress';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cruzi-ai`;

async function callCruziAI(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  return response.json();
}

// Fetch full student context for AI mentor
async function getStudentContext(studentId: string) {
  // Fetch all data in parallel
  const [profileResult, skillsResult, lessonsResult, mockTestsResult, plansResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, level, credit_balance, total_hours, notes')
      .eq('user_id', studentId)
      .single(),
    supabase
      .from('skill_progress')
      .select('topic, level, notes, updated_at')
      .eq('student_id', studentId),
    supabase
      .from('lessons')
      .select('scheduled_at, topic, notes, status, duration_minutes')
      .eq('student_id', studentId)
      .order('scheduled_at', { ascending: false })
      .limit(10),
    supabase
      .from('mock_test_results')
      .select('date, passed, total_minors, has_serious, has_dangerous, notes')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .limit(3),
    supabase
      .from('shared_plans')
      .select('title, objective, bundled_skills, student_summary, date_shared')
      .eq('student_id', studentId)
      .order('date_shared', { ascending: false })
      .limit(3),
  ]);

  const profile = profileResult.data;
  const skills = skillsResult.data || [];
  const lessons = lessonsResult.data || [];
  const mockTests = mockTestsResult.data || [];
  const plans = plansResult.data || [];

  // Build normalized skill map using unified system
  const skillMap: Record<string, { level: number; notes: string | null }> = {};
  for (const topic of CANONICAL_TOPICS) {
    const dbRecord = skills.find(s => {
      const normalized = normalizeTopicName(s.topic);
      return normalized === topic;
    });
    skillMap[topic] = {
      level: dbRecord?.level || 0,
      notes: dbRecord?.notes || null,
    };
  }

  // Calculate progress stats
  const totalSkills = CANONICAL_TOPICS.length;
  const maxPoints = totalSkills * 5;
  const earnedPoints = Object.values(skillMap).reduce((sum, s) => sum + s.level, 0);
  const masteryPercent = Math.round((earnedPoints / maxPoints) * 100);
  const weakSkills = Object.entries(skillMap)
    .filter(([_, s]) => s.level <= 2 && s.level > 0)
    .map(([topic]) => topic);
  const strongSkills = Object.entries(skillMap)
    .filter(([_, s]) => s.level >= 4)
    .map(([topic]) => topic);
  const notStarted = Object.entries(skillMap)
    .filter(([_, s]) => s.level === 0)
    .map(([topic]) => topic);

  // Get instructor notes from recent lessons and skill updates
  const recentNotes = skills
    .filter(s => s.notes)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map(s => `${s.topic}: ${s.notes}`);

  return {
    name: profile?.full_name || 'Learner',
    level: profile?.level || 'beginner',
    creditBalance: profile?.credit_balance || 0,
    totalHours: profile?.total_hours || 0,
    overallProgress: masteryPercent,
    skillMap,
    weakSkills,
    strongSkills,
    notStarted,
    recentLessons: lessons.map(l => ({
      date: l.scheduled_at,
      topic: l.topic,
      notes: l.notes,
      status: l.status,
    })),
    mockTests: mockTests.map(t => ({
      date: t.date,
      passed: t.passed,
      minors: t.total_minors,
      hasSerious: t.has_serious,
      hasDangerous: t.has_dangerous,
      notes: t.notes,
    })),
    instructorPlans: plans.map(p => ({
      title: p.title,
      objective: p.objective,
      skills: p.bundled_skills,
      summary: p.student_summary,
    })),
    recentInstructorNotes: recentNotes,
  };
}

export async function getCruziMentorResponse(studentId: string, message: string): Promise<string> {
  // Fetch full student context
  const studentContext = await getStudentContext(studentId);
  
  const data = await callCruziAI({
    action: 'mentor',
    studentId,
    message,
    studentContext,
  });
  return data.content || data.message || 'I had trouble understanding that. Can you ask again?';
}

export async function generateLocalJunctionQuiz(
  testCenter: string,
  coords?: { latitude: number; longitude: number }
): Promise<{
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}> {
  const data = await callCruziAI({
    action: 'quiz',
    testCenter,
    coords,
  });
  
  return data.question ? data : {
    question: `When driving in ${testCenter}, what should you prioritize at unmarked junctions?`,
    options: ['Speed', 'Right of way rules', 'Horn usage', 'Indicators only'],
    correctAnswerIndex: 1,
    explanation: 'At unmarked junctions, give way to traffic on your right and proceed with caution.',
  };
}

export async function getLocalTrickySpots(testCenter: string): Promise<TrickySpot[]> {
  try {
    const data = await callCruziAI({
      action: 'tricky-spots',
      testCenter,
    });
    
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    // Return fallback data
    return [
      {
        id: '1',
        title: `${testCenter} Main Roundabout`,
        description: 'Multi-lane spiral roundabout with complex lane markings',
        tip: 'Follow the road markings and stay in your lane throughout',
        lat: 52.0,
        lng: -1.0,
        type: 'roundabout',
      },
      {
        id: '2',
        title: 'Town Centre One-Way System',
        description: 'Narrow streets with parked cars and pedestrians',
        tip: 'Keep speed low and watch for pedestrians stepping out',
        lat: 52.01,
        lng: -1.01,
        type: 'one-way',
      },
    ];
  }
}

export async function generateParentFocusPlan(studentId: string): Promise<{
  title: string;
  parentAdvice: string[];
  specificAreaToDrive: string;
  safetyWarning: string;
}> {
  try {
    const data = await callCruziAI({
      action: 'parent-plan',
      studentId,
    });
    
    return data.title ? data : {
      title: 'Junction Mastery Week',
      parentAdvice: [
        'Find quiet residential areas to practice T-junctions',
        'Emphasize the MSPSL routine before every junction',
        'Praise good observation habits, even if they seem slow',
      ],
      specificAreaToDrive: 'Industrial estates on weekends (less traffic)',
      safetyWarning: 'Always check your own mirrors and be ready to assist with dual controls if available.',
    };
  } catch {
    return {
      title: 'Practice Focus Plan',
      parentAdvice: [
        'Start with quiet roads and build confidence gradually',
        'Focus on one skill at a time',
        'Stay calm and patient throughout',
      ],
      specificAreaToDrive: 'Quiet residential areas',
      safetyWarning: 'Ensure the learner is properly insured and displays L plates.',
    };
  }
}

export async function analyzePracticeDrive(
  route: { lat: number; lng: number; speed: number; timestamp: number }[]
): Promise<{ score: number; feedback: string }> {
  try {
    const data = await callCruziAI({
      action: 'analyze-drive',
      route,
    });
    
    return data.score ? data : {
      score: 75,
      feedback: 'Good practice session! Focus on maintaining consistent speed and smooth gear changes.',
    };
  } catch {
    return {
      score: 70,
      feedback: 'Practice session recorded. Keep working on your observation skills and junction approaches.',
    };
  }
}

export async function generateDVSATheoryQuestion(
  category: string,
  difficulty: 'Beginner' | 'Challenging' | 'Advanced',
  testCenter?: string
): Promise<{
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  highwayCodeRef: string;
}> {
  try {
    const data = await callCruziAI({
      action: 'dvsa-theory',
      category,
      difficulty,
      testCenter: testCenter || 'UK',
    });
    
    return {
      question: data.question || 'What should you do when approaching a pedestrian crossing?',
      options: data.options || ['Speed up', 'Slow down and be prepared to stop', 'Sound your horn', 'Flash your lights'],
      correctAnswerIndex: data.correctAnswerIndex ?? 1,
      explanation: data.explanation || 'You must always be prepared to stop for pedestrians at crossings.',
      highwayCodeRef: data.highwayCodeRef || 'Rule 195',
    };
  } catch (error) {
    console.error('DVSA Theory generation error:', error);
    return {
      question: 'When approaching a zebra crossing, what should you do if pedestrians are waiting?',
      options: ['Flash your lights to let them cross', 'Stop and give way to them', 'Sound your horn gently', 'Slow down but keep moving'],
      correctAnswerIndex: 1,
      explanation: 'At zebra crossings, you must give way to pedestrians who are waiting to cross or already crossing.',
      highwayCodeRef: 'Rule 195',
    };
  }
}

export async function getRemedialExplanation(
  question: string,
  explanation: string,
  highwayCodeRef: string
): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'explain-theory',
      question,
      explanation,
      highwayCodeRef,
    });
    
    return data.content || 'This rule exists to protect all road users. Understanding the reasoning behind it helps you make safer decisions in real driving situations.';
  } catch (error) {
    console.error('Remedial explanation error:', error);
    return 'This Highway Code rule is designed with safety in mind. By following it consistently, you help protect yourself and other road users.';
  }
}
