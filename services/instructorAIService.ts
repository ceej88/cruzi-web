// Cruzi AI Service - Instructor-specific AI functions
import { supabase } from '@/integrations/supabase/client';
import { CruziNotification, LessonPlan } from '@/types';

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

export async function generateDailyPulse(): Promise<CruziNotification[]> {
  try {
    const data = await callCruziAI({
      action: 'daily-pulse',
    });
    
    if (Array.isArray(data)) {
      return data.map((item: any, idx: number) => ({
        id: `pulse-${Date.now()}-${idx}`,
        type: item.type || 'INSIGHT',
        title: item.title || 'Academy Update',
        message: item.message || 'Your academy is running smoothly.',
        timestamp: new Date().toISOString(),
        read: false,
      }));
    }
    
    return [
      {
        id: `pulse-${Date.now()}`,
        type: 'INSIGHT',
        title: 'Daily Check Complete',
        message: 'All systems are running smoothly. No immediate actions required.',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
  } catch {
    return [
      {
        id: `pulse-${Date.now()}`,
        type: 'INFO',
        title: 'Pulse Complete',
        message: 'Your academy dashboard is ready for today.',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
  }
}

export async function generateLessonPlan(
  pupilName: string,
  level: string,
  currentScores: Record<string, number>,
  category: string,
  context?: string
): Promise<LessonPlan & { bundledSkills: string[]; studentSummary: string }> {
  try {
    const data = await callCruziAI({
      action: 'lesson-plan',
      pupilName,
      level,
      currentScores,
      category,
      context,
    });
    
    return {
      title: data.title || `${category} Focus Session`,
      objective: data.objective || `Improve ${category} skills to exam standard`,
      setup: data.setup || ['Ensure all mirrors are adjusted', 'Complete cockpit drill', 'Brief student on focus areas'],
      mainActivities: data.mainActivities || ['Progressive exercises', 'Real-world application', 'Independent practice'],
      commonFaults: data.commonFaults || ['Check mirrors before maneuvers', 'Signal timing', 'Observation at junctions'],
      summary: data.summary || 'Focus on consistent application of learned skills.',
      bundledSkills: data.bundledSkills || [category],
      studentSummary: data.studentSummary || `Great progress on ${category}! Keep practicing these key areas.`,
    };
  } catch {
    return {
      title: `${category} Development Session`,
      objective: `Build confidence and competence in ${category}`,
      setup: ['Complete pre-drive checks', 'Discuss focus areas', 'Set clear goals'],
      mainActivities: ['Skill development exercises', 'Progressive challenge', 'Feedback and adjustment'],
      commonFaults: ['Observation timing', 'Control smoothness', 'Decision making'],
      summary: 'Focus on building consistent habits.',
      bundledSkills: [category],
      studentSummary: `Working on ${category} skills. Keep up the practice!`,
    };
  }
}

export async function generateParentProgressEmail(
  pupilName: string,
  progress: number,
  recentAchievements: string[],
  focusAreas: string[]
): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'parent-email',
      pupilName,
      progress,
      recentAchievements,
      focusAreas,
    });
    
    return data.email || data.content || `Dear Parent/Guardian,\n\n${pupilName} has been making excellent progress...`;
  } catch {
    return `Dear Parent/Guardian,\n\n${pupilName} has been working hard on their driving skills. Current progress is at ${progress}%.\n\nRecent achievements include: ${recentAchievements.join(', ') || 'Consistent attendance'}.\n\nAreas we're focusing on: ${focusAreas.join(', ') || 'Core competencies'}.\n\nBest regards,\nYour Instructor`;
  }
}

export async function parseVoiceCommand(
  input: string,
  categories: string[]
): Promise<{ category: string; type: 'minor' | 'serious' | 'dangerous'; count: number } | null> {
  try {
    const data = await callCruziAI({
      action: 'parse-voice',
      input,
      categories,
    });
    
    if (data.category && data.type) {
      return {
        category: data.category,
        type: data.type,
        count: data.count || 1,
      };
    }
    return null;
  } catch {
    // Simple local parsing fallback
    const lowerInput = input.toLowerCase();
    let type: 'minor' | 'serious' | 'dangerous' = 'minor';
    
    if (lowerInput.includes('serious') || lowerInput.includes('s fault')) {
      type = 'serious';
    } else if (lowerInput.includes('dangerous') || lowerInput.includes('d fault')) {
      type = 'dangerous';
    }
    
    // Try to find matching category
    const matchedCategory = categories.find(cat => 
      lowerInput.includes(cat.toLowerCase().split(' ')[0])
    );
    
    if (matchedCategory) {
      return { category: matchedCategory, type, count: 1 };
    }
    
    return null;
  }
}

export async function generateAutoReply(
  lastMessage: string,
  studentName: string,
  recentLessons: any[],
  studentNotes?: string
): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'auto-reply',
      lastMessage,
      studentName,
      recentLessons,
      studentNotes,
    });
    
    return data.reply || data.content || `Hi ${studentName}, thanks for your message. I'll get back to you shortly.`;
  } catch {
    return `Hi ${studentName}, thanks for your message! I'll review this and respond soon.`;
  }
}

export async function generateOnboardingPin(): Promise<string> {
  // Generate a 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  return pin;
}

export async function generateMilestoneCopy(
  studentName: string,
  level: string
): Promise<{ caption: string; hashtags: string[] }> {
  try {
    const data = await callCruziAI({
      action: 'milestone-copy',
      studentName,
      level,
    });
    
    return {
      caption: data.caption || `🎉 Congratulations to ${studentName} for reaching ${level.replace('_', ' ')} level! Another step closer to driving independence.`,
      hashtags: data.hashtags || ['DrivingSchool', 'StudentSuccess', 'LearnToDrive', 'DrivingLessons'],
    };
  } catch {
    const levelDisplay = level.replace('_', ' ').toLowerCase();
    return {
      caption: `🚗 Celebrating ${studentName}'s amazing progress! They've reached ${levelDisplay} level and are crushing their driving goals. Hard work pays off! 💪`,
      hashtags: ['DrivingSchool', 'StudentSuccess', 'LearnToDrive', 'DrivingLessons', 'ProudInstructor'],
    };
  }
}

export async function generateTipSocialCopy(
  tipTitle: string,
  tipContent: string
): Promise<{ caption: string; hashtags: string[] }> {
  try {
    const data = await callCruziAI({
      action: 'tip-social-copy',
      tipTitle,
      tipContent,
    });
    
    return {
      caption: data.caption || `💡 Pro Tip: ${tipTitle}\n\n${tipContent.slice(0, 200)}...`,
      hashtags: data.hashtags || ['DrivingTips', 'LearnToDrive', 'RoadSafety', 'DrivingSchool'],
    };
  } catch {
    return {
      caption: `💡 ${tipTitle}\n\n${tipContent.slice(0, 200)}${tipContent.length > 200 ? '...' : ''}\n\nShare this with someone learning to drive!`,
      hashtags: ['DrivingTips', 'LearnToDrive', 'RoadSafety', 'DrivingSchool', 'ExpertAdvice'],
    };
  }
}

export async function generateSummaryForTemplate(content: string): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'template-summary',
      content,
    });
    
    return data.summary || `A step-by-step teaching methodology for ${content.slice(0, 50)}...`;
  } catch {
    return `Teaching methodology: ${content.slice(0, 100)}...`;
  }
}

interface AdminCommandResponse {
  action: string;
  confirmation: string;
  data?: any;
}

export async function processAdminCommand(command: string): Promise<AdminCommandResponse> {
  try {
    const data = await callCruziAI({
      action: 'admin-command',
      command,
    });
    
    return {
      action: data.action || 'UNKNOWN',
      confirmation: data.confirmation || 'Command processed.',
      data: data.data,
    };
  } catch {
    // Fallback: detect simple patterns
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('log') || lowerCommand.includes('note') || lowerCommand.includes('today') || lowerCommand.includes('lesson')) {
      return {
        action: 'GENERATE_LOG',
        confirmation: 'Creating reflective log...',
      };
    }
    
    if (lowerCommand.includes('message') || lowerCommand.includes('send') || lowerCommand.includes('text')) {
      return {
        action: 'SEND_MESSAGE',
        confirmation: 'Preparing message...',
        data: { to: '', content: command },
      };
    }
    
    return {
      action: 'UNKNOWN',
      confirmation: "I'm not sure what you'd like me to do. Try 'log [student] did great today' or 'message [student] about tomorrow'.",
    };
  }
}

// New: Conversational admin chat with real data context
export async function getAdminChatResponse(
  message: string,
  context: {
    studentCount: number;
    studentNames: string[];
    upcomingLessons: number;
    todayLessons: number;
  }
): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'admin-chat',
      message,
      instructorContext: context,
    });
    return data.content || data.message || "I'm not sure how to answer that. Try asking about your students or lessons.";
  } catch {
    return "I had trouble processing that. Could you try again?";
  }
}

export async function generateReflectiveLog(
  studentName: string,
  notes: string,
  topic: string
): Promise<{ summary: string; achievements: string[] }> {
  try {
    const data = await callCruziAI({
      action: 'reflective-log',
      studentName,
      notes,
      topic,
    });
    
    return {
      summary: data.summary || `${studentName} showed progress during today's ${topic} session. ${notes}`,
      achievements: data.achievements || ['Progress', 'Focus', 'Improvement'],
    };
  } catch {
    return {
      summary: `${studentName} participated in a ${topic} session today. Instructor notes: ${notes}. The student demonstrated continued engagement and is making progress toward their driving goals.`,
      achievements: ['Engagement', 'Progress', 'Practice'],
    };
  }
}

export async function generateBroadcastDraft(notes: string): Promise<string> {
  try {
    const data = await callCruziAI({
      action: 'broadcast-draft',
      notes,
    });
    return data.content || data.draft || notes;
  } catch {
    return notes; // Return original if AI fails
  }
}
