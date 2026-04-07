// Voice Action Executor - Maps AI intents to database operations
import { supabase } from '@/integrations/supabase/client';
import { VoiceCommandResult, VoiceIntent } from '@/types/voiceCommands';
import { format, addDays, parse, isToday, isTomorrow, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday } from 'date-fns';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Parse natural language day to actual date
function parseDayToDate(dayText: string): Date {
  const today = new Date();
  const day = dayText.toLowerCase();
  
  if (day === 'today') return today;
  if (day === 'tomorrow') return addDays(today, 1);
  
  const dayMap: Record<string, () => Date> = {
    'monday': () => nextMonday(today),
    'tuesday': () => nextTuesday(today),
    'wednesday': () => nextWednesday(today),
    'thursday': () => nextThursday(today),
    'friday': () => nextFriday(today),
    'saturday': () => nextSaturday(today),
    'sunday': () => nextSunday(today),
  };
  
  return dayMap[day]?.() || today;
}

// Parse time string to hours/minutes
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  // Handle formats like "3pm", "15:00", "3:30pm", "15:30"
  const cleanTime = timeStr.toLowerCase().replace(/\s/g, '');
  
  let hours = 0;
  let minutes = 0;
  
  if (cleanTime.includes(':')) {
    const [h, m] = cleanTime.replace(/[ap]m/, '').split(':').map(Number);
    hours = h;
    minutes = m || 0;
  } else {
    hours = parseInt(cleanTime.replace(/[ap]m/, ''));
  }
  
  // Convert to 24-hour if PM
  if (cleanTime.includes('pm') && hours < 12) {
    hours += 12;
  } else if (cleanTime.includes('am') && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
}

// Find student by partial name match
async function findStudentByName(
  instructorId: string, 
  partialName: string
): Promise<{ id: string; name: string; userId: string } | null> {
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, user_id')
    .eq('instructor_id', instructorId)
    .ilike('full_name', `%${partialName}%`)
    .limit(1);
  
  if (students && students.length > 0) {
    return {
      id: students[0].id,
      name: students[0].full_name || '',
      userId: students[0].user_id,
    };
  }
  return null;
}

// Check for lesson conflicts
async function checkLessonConflict(
  instructorId: string,
  startTime: Date,
  durationMinutes: number
): Promise<{ hasConflict: boolean; conflictWith?: string }> {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  
  // Fetch lessons in a window around the proposed time
  const { data: conflicts } = await supabase
    .from('lessons')
    .select('scheduled_at, duration_minutes, profiles!lessons_student_id_fkey(full_name)')
    .eq('instructor_id', instructorId)
    .eq('status', 'SCHEDULED')
    .gte('scheduled_at', new Date(startTime.getTime() - 3 * 60 * 60 * 1000).toISOString())
    .lte('scheduled_at', endTime.toISOString());
  
  // Check for actual overlap
  for (const lesson of conflicts || []) {
    const lessonStart = new Date(lesson.scheduled_at).getTime();
    const lessonEnd = lessonStart + lesson.duration_minutes * 60 * 1000;
    if (startTime.getTime() < lessonEnd && endTime.getTime() > lessonStart) {
      return { 
        hasConflict: true, 
        conflictWith: (lesson.profiles as any)?.full_name 
      };
    }
  }
  return { hasConflict: false };
}

// Execute BOOK_LESSON intent
async function executeBookLesson(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, day, time, duration = 1, lessonType = 'lesson' } = params;
  
  if (!studentName || !day || !time) {
    return { success: false, message: 'Missing booking details. I need student name, day, and time.' };
  }
  
  const student = await findStudentByName(instructorId, studentName);
  if (!student) {
    return { success: false, message: `I couldn't find a student named ${studentName}.` };
  }
  
  // Parse the date and time
  const lessonDate = parseDayToDate(day);
  const { hours, minutes } = parseTimeString(time);
  lessonDate.setHours(hours, minutes, 0, 0);
  
  const durationMinutes = duration * 60;
  
  // Check for conflicts before booking
  const conflict = await checkLessonConflict(instructorId, lessonDate, durationMinutes);
  if (conflict.hasConflict) {
    return { 
      success: false, 
      message: `Can't book - you already have ${conflict.conflictWith ? `a lesson with ${conflict.conflictWith}` : 'a lesson'} at that time.` 
    };
  }
  
  // Validate and normalize lesson type
  const validTypes = ['lesson', 'mocktest', 'testday', 'assessment'];
  const normalizedType = validTypes.includes(lessonType) ? lessonType : 'lesson';
  
  // Generate topic based on lesson type
  const topicMap: Record<string, string> = {
    lesson: 'Driving Lesson',
    mocktest: 'Mock Test',
    testday: 'Driving Test',
    assessment: 'Progress Assessment',
  };
  
  // Create the lesson with correct status/type
  const { error } = await supabase.from('lessons').insert({
    instructor_id: instructorId,
    student_id: student.userId,
    scheduled_at: lessonDate.toISOString(),
    duration_minutes: durationMinutes,
    status: 'SCHEDULED',
    lesson_type: normalizedType,
    topic: topicMap[normalizedType] || 'Driving Lesson',
  });
  
  if (error) {
    console.error('Failed to book lesson:', error);
    return { success: false, message: 'Failed to create the booking. Please try again.' };
  }
  
  const dayLabel = isToday(lessonDate) ? 'today' : isTomorrow(lessonDate) ? 'tomorrow' : format(lessonDate, 'EEEE');
  const timeLabel = format(lessonDate, 'h:mm a');
  const typeLabel = normalizedType !== 'lesson' ? ` ${topicMap[normalizedType]}` : '';
  
  return { 
    success: true, 
    message: `Done! Booked${typeLabel} for ${student.name} on ${dayLabel} at ${timeLabel}.`,
    data: { lessonCreated: true, studentId: student.userId },
  };
}

// Execute SEND_MESSAGE intent
async function executeSendMessage(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, message } = params;
  
  if (!studentName || !message) {
    return { success: false, message: 'I need both a student name and a message to send.' };
  }
  
  const student = await findStudentByName(instructorId, studentName);
  if (!student) {
    return { success: false, message: `I couldn't find a student named ${studentName}.` };
  }
  
  const { error } = await supabase.from('messages').insert({
    sender_id: instructorId,
    receiver_id: student.userId,
    content: message,
    is_read: false,
  });
  
  if (error) {
    console.error('Failed to send message:', error);
    return { success: false, message: 'Failed to send the message. Please try again.' };
  }
  
  return { 
    success: true, 
    message: `Message sent to ${student.name}.`,
  };
}

// Execute LOG_LESSON intent
async function executeLogLesson(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, skill, level, notes } = params;
  
  if (!studentName) {
    return { success: false, message: 'I need to know which student to log for.' };
  }
  
  const student = await findStudentByName(instructorId, studentName);
  if (!student) {
    return { success: false, message: `I couldn't find a student named ${studentName}.` };
  }
  
  // If skill and level provided, update skill_progress
  if (skill) {
    const { error: skillError } = await supabase.from('skill_progress').upsert({
      instructor_id: instructorId,
      student_id: student.userId,
      topic: skill,
      level: level || 3,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,topic' });
    
    if (skillError) {
      console.error('Failed to log skill:', skillError);
    }
  }
  
  // Create a session log
  const { error } = await supabase.from('session_logs').insert({
    instructor_id: instructorId,
    student_id: student.userId,
    summary: notes || `Logged ${skill || 'session'} progress`,
    reflective_log: notes || 'Voice logged session',
    skill_updates: skill ? { [skill]: level || 3 } : null,
  });
  
  if (error) {
    console.error('Failed to create session log:', error);
    return { success: false, message: 'Failed to save the log. Please try again.' };
  }
  
  const skillMsg = skill ? ` ${skill} marked as level ${level || 3}.` : '';
  return { 
    success: true, 
    message: `Logged for ${student.name}.${skillMsg}`,
  };
}

// Execute QUERY_DATA intent
async function executeQueryData(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { queryType, studentName } = params;
  
  // Get today's date range
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  switch (queryType) {
    case 'next_lesson': {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('scheduled_at, duration_minutes, profiles!lessons_student_id_fkey(full_name)')
        .eq('instructor_id', instructorId)
        .gte('scheduled_at', new Date().toISOString())
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
        .limit(1);
      
      if (lessons && lessons.length > 0) {
        const lesson = lessons[0];
        const time = format(new Date(lesson.scheduled_at), 'h:mm a');
        const name = (lesson.profiles as any)?.full_name || 'Unknown';
        return { success: true, message: `Your next lesson is with ${name} at ${time}.` };
      }
      return { success: true, message: 'You have no more lessons scheduled today.' };
    }
    
    case 'today_count': {
      const { count } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('instructor_id', instructorId)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay);
      
      return { success: true, message: `You have ${count || 0} lessons today.` };
    }
    
    case 'student_balance': {
      if (!studentName) {
        return { success: false, message: 'Which student do you want to check?' };
      }
      const student = await findStudentByName(instructorId, studentName);
      if (!student) {
        return { success: false, message: `I couldn't find ${studentName}.` };
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('user_id', student.userId)
        .single();
      
      const balance = profile?.credit_balance || 0;
      return { success: true, message: `${student.name} has ${balance} hour${balance === 1 ? '' : 's'} credit remaining.` };
    }
    
    case 'free_at': {
      // Check if free at a specific time
      const { time } = params;
      if (!time) {
        return { success: false, message: 'What time do you want to check?' };
      }
      
      const checkDate = new Date();
      const { hours, minutes } = parseTimeString(time);
      checkDate.setHours(hours, minutes, 0, 0);
      
      // Check for lessons within 2 hours of that time
      const rangeStart = new Date(checkDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const rangeEnd = new Date(checkDate.getTime() + 2 * 60 * 60 * 1000).toISOString();
      
      const { data: lessons } = await supabase
        .from('lessons')
        .select('scheduled_at, duration_minutes')
        .eq('instructor_id', instructorId)
        .gte('scheduled_at', rangeStart)
        .lte('scheduled_at', rangeEnd)
        .eq('status', 'scheduled');
      
      if (!lessons || lessons.length === 0) {
        return { success: true, message: `Yes, you're free at ${time}.` };
      }
      
      return { success: true, message: `No, you have a lesson around that time.` };
    }
    
    default:
      return { success: true, message: "I'm not sure what you're asking. Try 'Who's next?' or 'How many lessons today?'" };
  }
}

// Execute NAVIGATE_TO intent
async function executeNavigateTo(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, address } = params;
  
  if (address) {
    // Open maps with the address
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    return { success: true, message: `Opening navigation to ${address}.` };
  }
  
  if (studentName) {
    const student = await findStudentByName(instructorId, studentName);
    if (!student) {
      return { success: false, message: `I couldn't find ${studentName}.` };
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('address')
      .eq('user_id', student.userId)
      .single();
    
    if (profile?.address) {
      const encodedAddress = encodeURIComponent(profile.address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
      return { success: true, message: `Opening navigation to ${student.name}'s address.` };
    }
    
    return { success: false, message: `${student.name} doesn't have an address on file.` };
  }
  
  return { success: false, message: 'I need an address or student name to navigate to.' };
}

// Execute CANCEL_LESSON intent
async function executeCancelLesson(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, day, time } = params;
  
  if (!studentName) {
    return { success: false, message: 'Which student\'s lesson should I cancel?' };
  }
  
  const student = await findStudentByName(instructorId, studentName);
  if (!student) {
    return { success: false, message: `I couldn't find a student named ${studentName}.` };
  }
  
  // Find the lesson to cancel
  let query = supabase
    .from('lessons')
    .select('id, scheduled_at')
    .eq('instructor_id', instructorId)
    .eq('student_id', student.userId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);
  
  const { data: lessons, error: queryError } = await query;
  
  if (queryError || !lessons || lessons.length === 0) {
    return { success: false, message: `I couldn't find an upcoming lesson for ${student.name}.` };
  }
  
  const { error } = await supabase
    .from('lessons')
    .update({ status: 'cancelled' })
    .eq('id', lessons[0].id);
  
  if (error) {
    return { success: false, message: 'Failed to cancel the lesson. Please try again.' };
  }
  
  const lessonTime = format(new Date(lessons[0].scheduled_at), 'EEEE \'at\' h:mm a');
  return { 
    success: true, 
    message: `Cancelled ${student.name}'s lesson on ${lessonTime}.`,
  };
}

// Execute BROADCAST_MESSAGE intent
async function executeBroadcastMessage(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { message, targetLevel = 'all' } = params;
  
  if (!message) {
    return { success: false, message: 'What message would you like to broadcast?' };
  }
  
  // Fetch students based on target level
  let query = supabase
    .from('profiles')
    .select('user_id, full_name, level')
    .eq('instructor_id', instructorId);
  
  // Filter by level if not 'all'
  const levelMap: Record<string, string[]> = {
    beginner: ['BEGINNER', 'beginner'],
    intermediate: ['INTERMEDIATE', 'intermediate'],
    advanced: ['ADVANCED', 'advanced'],
    test_ready: ['TEST_READY', 'TEST READY', 'test_ready'],
  };
  
  if (targetLevel !== 'all' && levelMap[targetLevel.toLowerCase()]) {
    query = query.in('level', levelMap[targetLevel.toLowerCase()]);
  }
  
  const { data: students, error: fetchError } = await query;
  
  if (fetchError || !students || students.length === 0) {
    return { 
      success: false, 
      message: targetLevel === 'all' 
        ? 'You have no students to broadcast to.' 
        : `No ${targetLevel} students found.` 
    };
  }
  
  // Send message to each student
  let successCount = 0;
  for (const student of students) {
    const { error } = await supabase.from('messages').insert({
      sender_id: instructorId,
      receiver_id: student.user_id,
      content: message,
      is_read: false,
    });
    
    if (!error) successCount++;
  }
  
  if (successCount === 0) {
    return { success: false, message: 'Failed to send broadcast. Please try again.' };
  }
  
  const levelLabel = targetLevel === 'all' ? '' : ` ${targetLevel}`;
  const studentWord = successCount === 1 ? 'student' : 'students';
  
  return { 
    success: true, 
    message: `Broadcast sent to ${successCount}${levelLabel} ${studentWord}.`,
    data: { broadcastSent: true, recipientCount: successCount },
  };
}

// Canonical topic names for fuzzy matching (full 38 DVSA skills)
const CANONICAL_TOPICS = [
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
];

// Normalize topic name to canonical form
function normalizeTopicName(input: string): string | null {
  const lower = input.toLowerCase().trim();
  
  // Direct match first
  const directMatch = CANONICAL_TOPICS.find(t => t.toLowerCase() === lower);
  if (directMatch) return directMatch;
  
  // Fuzzy matching map
  const fuzzyMap: Record<string, string> = {
    // Basic Skills
    'cockpit': 'Cockpit Drill',
    'cockpits': 'Cockpit Drill',
    'cockpit check': 'Cockpit Drill',
    'clutch': 'Clutch Control',
    'clutch control': 'Clutch Control',
    'controls': 'Clutch Control',
    'instruments': 'Clutch Control',
    'pedals': 'Clutch Control',
    'gears': 'Changing Gear',
    'gear change': 'Changing Gear',
    'gear changes': 'Changing Gear',
    'steering': 'Steering',
    'moving off': 'Moving Off & Stopping',
    'pulling up': 'Moving Off & Stopping',
    'move off': 'Moving Off & Stopping',
    'hill': 'Hill Start',
    'hill start': 'Hill Start',
    'hill starts': 'Hill Start',
    'msm': 'MSPSL Routine',
    'mspsl': 'MSPSL Routine',
    'routine': 'MSPSL Routine',
    'emergency': 'Emergency Stop',
    'emergency stop': 'Emergency Stop',
    'e-stop': 'Emergency Stop',
    'quick stop': 'Emergency Stop',
    'ancillary': 'Ancillary Controls',
    'heater': 'Ancillary Controls',
    'wipers': 'Ancillary Controls',
    'demister': 'Ancillary Controls',
    'show me tell me': 'Show Me Tell Me',
    'show tell': 'Show Me Tell Me',
    'vehicle checks': 'Show Me Tell Me',
    'safety checks': 'Show Me Tell Me',
    'safety check': 'Show Me Tell Me',
    'legal': 'Show Me Tell Me',
    'licence': 'Show Me Tell Me',
    'license': 'Show Me Tell Me',
    // Junctions
    'turn left': 'Turn Left',
    'turn right': 'Turn Right',
    'junction': 'Turn Left',
    'junctions': 'Turn Left',
    't-junction': 'Turn Left',
    'emerging': 'Turn Left',
    'crossroads': 'Crossroads',
    'crossroad': 'Crossroads',
    'roundabout': 'Roundabouts',
    'roundabouts': 'Roundabouts',
    'mini roundabout': 'Roundabouts',
    'traffic light': 'Traffic Lights',
    'traffic lights': 'Traffic Lights',
    'dual': 'Dual Carriageways',
    'dual carriageway': 'Dual Carriageways',
    'dual carriageways': 'Dual Carriageways',
    // Manoeuvres
    'turn in road': 'Turn In Road',
    'turn in the road': 'Turn In Road',
    'three point turn': 'Turn In Road',
    'parallel': 'Parallel Park',
    'parallel park': 'Parallel Park',
    'parallel parking': 'Parallel Park',
    'pull up right': 'Pull Up On The Right',
    'pull up on the right': 'Pull Up On The Right',
    'left reverse': 'Left Reverse',
    'reverse': 'Left Reverse',
    'reversing': 'Left Reverse',
    'reverse exercise': 'Left Reverse',
    'bay park': 'Bay Park (Reverse)',
    'bay parking': 'Bay Park (Reverse)',
    'reverse bay': 'Bay Park (Reverse)',
    'bay reverse': 'Bay Park (Reverse)',
    'forward bay': 'Bay Park (Forward)',
    'bay forward': 'Bay Park (Forward)',
    'reversing into a bay': 'Bay Park (Reverse)',
    'controlled stop': 'Emergency Stop (Controlled)',
    // Road Use
    'speed': 'Use of Speed',
    'speed control': 'Use of Speed',
    'use of speed': 'Use of Speed',
    'following': 'Following Distance',
    'following distance': 'Following Distance',
    'two second rule': 'Following Distance',
    '2 second rule': 'Following Distance',
    'safe distance': 'Following Distance',
    'mirror': 'Mirrors & Signals',
    'mirrors': 'Mirrors & Signals',
    'mirror checks': 'Mirrors & Signals',
    'signal': 'Mirrors & Signals',
    'signals': 'Mirrors & Signals',
    'signalling': 'Mirrors & Signals',
    'indicating': 'Mirrors & Signals',
    'pedestrian crossing': 'Pedestrian Crossings',
    'crossings': 'Pedestrian Crossings',
    'zebra crossing': 'Pedestrian Crossings',
    'pelican crossing': 'Pedestrian Crossings',
    'meeting': 'Meeting & Passing',
    'passing': 'Meeting & Passing',
    'clearance': 'Meeting & Passing',
    'narrow roads': 'Meeting & Passing',
    'overtaking': 'Overtaking Safely',
    'overtake': 'Overtaking Safely',
    'anticipation': 'Anticipation & Planning',
    'planning': 'Anticipation & Planning',
    'hazards': 'Anticipation & Planning',
    'planning ahead': 'Anticipation & Planning',
    'crossing traffic': 'Crossing Other Traffic',
    'turning right': 'Crossing Other Traffic',
    'independent driving': 'Independent Driving (Sat Nav)',
    'independent drive': 'Independent Driving (Sat Nav)',
    'sat nav': 'Independent Driving (Sat Nav)',
    'sat nav driving': 'Independent Driving (Sat Nav)',
    'satnav': 'Independent Driving (Sat Nav)',
    'follow signs': 'Independent Driving (Follow Signs)',
    'following signs': 'Independent Driving (Follow Signs)',
    // Other
    'country': 'Country Roads',
    'country roads': 'Country Roads',
    'rural': 'Country Roads',
    'rural roads': 'Country Roads',
    'bends': 'Country Roads',
    'motorway': 'Motorways',
    'motorway driving': 'Motorways',
    'joining motorway': 'Motorways',
    'fast roads': 'Motorways',
    'night driving': 'Night Driving',
    'driving at night': 'Night Driving',
    'lights': 'Night Driving',
    'night': 'Night Driving',
    'weather': 'Weather Conditions',
    'rain': 'Weather Conditions',
    'fog': 'Weather Conditions',
    'ice': 'Weather Conditions',
    'adverse weather': 'Weather Conditions',
    'city': 'City Driving',
    'city driving': 'City Driving',
    'town': 'City Driving',
    'town driving': 'City Driving',
    'urban': 'City Driving',
  };
  
  // Check fuzzy map
  if (fuzzyMap[lower]) return fuzzyMap[lower];
  
  // Partial match - check if input contains any canonical topic
  for (const topic of CANONICAL_TOPICS) {
    if (lower.includes(topic.toLowerCase()) || topic.toLowerCase().includes(lower)) {
      return topic;
    }
  }
  
  return null;
}

// Execute UPDATE_SKILL intent - returns preview data for human-in-the-loop verification
async function executeUpdateSkill(
  instructorId: string,
  params: Record<string, any>
): Promise<ExecutionResult> {
  const { studentName, skills } = params;
  
  if (!studentName || !skills?.length) {
    return { success: false, message: 'I need a student name and skill to update.' };
  }
  
  const student = await findStudentByName(instructorId, studentName);
  if (!student) {
    return { success: false, message: `I couldn't find a student named ${studentName}.` };
  }
  
  // Normalize skills for preview (don't save yet - human-in-the-loop)
  const normalizedSkills: { topic: string; level: number; original: string }[] = [];
  const unmatchedSkills: string[] = [];
  
  for (const { topic, level } of skills) {
    const normalized = normalizeTopicName(topic);
    if (!normalized) {
      console.warn(`[VoiceExecutor] Unknown topic: ${topic}`);
      unmatchedSkills.push(topic);
      continue;
    }
    
    const clampedLevel = Math.max(1, Math.min(5, level)); // Clamp 1-5
    normalizedSkills.push({ topic: normalized, level: clampedLevel, original: topic });
  }
  
  if (normalizedSkills.length === 0) {
    return { success: false, message: 'Could not match any skills to the DVSA syllabus.' };
  }
  
  const skillSummary = normalizedSkills.length === 1 
    ? `${normalizedSkills[0].topic} → Level ${normalizedSkills[0].level}`
    : `${normalizedSkills.length} skills to update`;
  
  // Return preview data for the review panel instead of saving immediately
  return { 
    success: true, 
    message: `Ready to update ${student.name}: ${skillSummary}. Review and confirm.`,
    data: { 
      requiresReview: true,
      studentId: student.userId,
      studentName: student.name,
      skillUpdates: normalizedSkills,
      unmatchedSkills,
    },
  };
}

// Actually save skill updates after user confirms (called from UI)
export async function saveSkillUpdates(
  instructorId: string,
  studentId: string,
  updates: { topic: string; level: number }[]
): Promise<ExecutionResult> {
  const savedUpdates: { topic: string; level: number }[] = [];
  
  for (const { topic, level } of updates) {
    const { error } = await supabase.from('skill_progress').upsert({
      instructor_id: instructorId,
      student_id: studentId,
      topic,
      level,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id,topic' });
    
    if (error) {
      console.error('[VoiceExecutor] Failed to update skill:', error);
      continue;
    }
    
    savedUpdates.push({ topic, level });
  }
  
  if (savedUpdates.length === 0) {
    return { success: false, message: 'Failed to save skill updates.' };
  }
  
  return { 
    success: true, 
    message: `Saved ${savedUpdates.length} skill${savedUpdates.length > 1 ? 's' : ''}.`,
    data: { updates: savedUpdates },
  };
}

// Main executor function
export async function executeVoiceCommand(
  instructorId: string,
  command: VoiceCommandResult
): Promise<ExecutionResult> {
  console.log('[VoiceExecutor] Executing:', command.intent, command.parameters);
  
  switch (command.intent) {
    case 'BOOK_LESSON':
      return executeBookLesson(instructorId, command.parameters);
    
    case 'SEND_MESSAGE':
      return executeSendMessage(instructorId, command.parameters);
    
    case 'LOG_LESSON':
      return executeLogLesson(instructorId, command.parameters);
    
    case 'QUERY_DATA':
      return executeQueryData(instructorId, command.parameters);
    
    case 'NAVIGATE_TO':
      return executeNavigateTo(instructorId, command.parameters);
    
    case 'CANCEL_LESSON':
      return executeCancelLesson(instructorId, command.parameters);
    
    case 'BROADCAST_MESSAGE':
      return executeBroadcastMessage(instructorId, command.parameters);
    
    case 'UPDATE_SKILL':
      return executeUpdateSkill(instructorId, command.parameters);
    
    case 'CONVERSATION':
      // Return the text response from the AI
      return { 
        success: true, 
        message: command.textResponse || 'I didn\'t quite catch that.',
      };
    
    case 'UNKNOWN':
    default:
      return { 
        success: false, 
        message: command.textResponse || 'I didn\'t understand that command. Try something like "Book Sarah Thursday 3pm" or "Who\'s next?"',
      };
  }
}
