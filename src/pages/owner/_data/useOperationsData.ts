import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_TIME = 60_000;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  return new Date(startOfToday().getTime() + DAY_MS);
}

function isoOrZero(value: string | null | undefined) {
  return value ? new Date(value).getTime() : 0;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function boolFromJson(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function numberFromJson(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getErrorMessage(result: { error?: unknown }) {
  const error = result.error as { message?: string } | null | undefined;
  return error?.message ?? 'Failed to load admin operations data';
}

function getSafeOptionalError(result: { error?: unknown }) {
  const message = getErrorMessage(result);
  if (/permission denied/i.test(message)) {
    return 'Event feed unavailable due to permissions';
  }
  return 'Event feed unavailable';
}

type Role = 'admin' | 'instructor' | 'student' | 'parent' | 'school_admin' | string;

export interface ProfileRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  instructor_id: string | null;
  status: string | null;
  credit_balance: number | null;
  total_hours: number | null;
  progress: number | null;
  onboarded_at: string | null;
  instructor_onboarded_at: string | null;
  booking_allowed: boolean | null;
  booking_requests_enabled: boolean | null;
  stripe_account_status: string | null;
  stripe_onboarding_complete: boolean | null;
  stripe_payouts_enabled: boolean | null;
  subscription_source: string | null;
  school_id: string | null;
  school_role: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  user_id: string;
  role: Role;
}

export interface LessonRow {
  id: string;
  instructor_id: string;
  student_id: string | null;
  manual_student_id: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  lesson_type: string | null;
  status: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransactionRow {
  id: string;
  instructor_id: string;
  student_id: string;
  hours: number;
  amount_paid: number;
  payment_method: string | null;
  transaction_type: string | null;
  status: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
}

export interface SmsCreditRow {
  instructor_id: string;
  balance: number | null;
  lifetime_purchased: number | null;
  lifetime_used: number | null;
  last_topped_up: string | null;
}

export interface SubscriptionRow {
  user_id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  trial_ends_at: string | null;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string | null;
  title: string;
  is_read: boolean | null;
  target_tab: string | null;
  created_at: string;
}

export interface EventRow {
  id: string;
  actor_role: string | null;
  event_type: string;
  entity_type: string | null;
  result: string;
  created_at: string;
}

export interface FeedbackSummaryRow {
  id: string;
  type: string | null;
  status: string | null;
  created_at: string;
}

export interface TestManagerProjectionRow {
  user_id: string;
  test_ready: unknown;
  booking_passes: unknown;
  test_slots: unknown;
}

export interface BookingPass {
  id: string;
  instructor_id: string;
  student_id: string;
  status: string;
  selected_date: string | null;
  requested_at: string | null;
  approved_at: string | null;
  expires_at: string | null;
  use_count: number;
  max_uses: number;
}

export interface TestReadyEntry {
  instructor_id: string;
  student_id: string;
  enabled: boolean;
  updated_at: string | null;
}

export interface TestSlotEntry {
  instructor_id: string;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
}

export interface OperationsData {
  profiles: ProfileRow[];
  roles: RoleRow[];
  lessons: LessonRow[];
  creditTransactions: CreditTransactionRow[];
  smsCredits: SmsCreditRow[];
  subscriptions: SubscriptionRow[];
  notifications: NotificationRow[];
  events: EventRow[];
  eventsUnavailableReason: string | null;
  feedback: FeedbackSummaryRow[];
  testReadyEntries: TestReadyEntry[];
  bookingPasses: BookingPass[];
  testSlots: TestSlotEntry[];
  pendingInstructorCount: number;
}

export interface StudentOperationRow {
  user_id: string;
  name: string;
  email: string;
  onboarded: boolean;
  linkedInstructor: boolean;
  instructorName: string;
  lessonCount: number;
  transactionCount: number;
  creditBalance: number;
  totalHours: number;
  progress: number;
  testReady: boolean;
  approvalStatus: string;
  latestActivityAt: string | null;
}

export interface InstructorOperationRow {
  user_id: string;
  name: string;
  email: string;
  status: string;
  onboarded: boolean;
  studentCount: number;
  lessonCount: number;
  upcomingLessons: number;
  completedLessons: number;
  cancelledLessons: number;
  smsBalance: number | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  stripeReady: boolean;
  latestActivityAt: string | null;
}

export interface PaymentOperationRow {
  id: string;
  created_at: string;
  method: string;
  type: string;
  status: string;
  hours: number;
  amount: number;
  verified: boolean;
  instructorName: string;
  studentName: string;
  joinStatus: 'ok' | 'missing-student' | 'missing-instructor';
  qualityFlags: string[];
}

export interface LessonOperationRow {
  id: string;
  scheduled_at: string;
  status: string;
  durationMinutes: number;
  instructorName: string;
  studentName: string;
  studentSource: 'profile' | 'manual' | 'missing' | 'broken';
  paymentMethod: string;
  qualityFlags: string[];
}

export interface SupportEventRow {
  id: string;
  event_type: string;
  entity_type: string;
  result: string;
  created_at: string;
}

export interface OperationsModel {
  raw: OperationsData;
  students: StudentOperationRow[];
  instructors: InstructorOperationRow[];
  payments: PaymentOperationRow[];
  lessons: LessonOperationRow[];
  supportEvents: SupportEventRow[];
  counts: {
    students: number;
    studentsOnboarded: number;
    studentsLinked: number;
    studentsWithLessons: number;
    studentsWithTransactions: number;
    studentsActive7d: number;
    instructors: number;
    instructorsOnboarded: number;
    instructorsWithStudents: number;
    instructorsWithLessons: number;
    instructorsActive7d: number;
    pendingInstructors: number;
    lowSmsCredits: number;
    pendingBankTransfers: number;
    failedPayments: number;
    completedPurchases: number;
    rejectedTransfers: number;
    paymentsWithQualityWarnings: number;
    lessonsToday: number;
    upcomingLessons: number;
    completedLessons: number;
    cancelledLessons: number;
    staleScheduledLessons: number;
    brokenLessonJoins: number;
    missingLessonStudents: number;
    testReadyStudents: number;
    requestedBookingPasses: number;
    approvedBookingPasses: number;
    expiredBookingPasses: number;
    usedUpBookingPasses: number;
    bookingPassNotifications: number;
    supportFeedback: number;
    failedEvents7d: number;
    warningEvents7d: number;
  };
  money: {
    pendingBankTransferAmount: number;
    completedPurchaseAmount: number;
    failedPaymentAmount: number;
  };
}

export function useOperationsData() {
  return useQuery<OperationsData>({
    queryKey: ['admin', 'operations-data'],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const [
        profilesRes,
        rolesRes,
        lessonsRes,
        creditTransactionsRes,
        smsCreditsRes,
        subscriptionsRes,
        notificationsRes,
        eventsRes,
        feedbackRes,
        testManagerRes,
        pendingInstructorsRes,
      ] = await Promise.all([
        (supabase as any)
          .from('profiles')
          .select([
            'user_id',
            'email',
            'full_name',
            'instructor_id',
            'status',
            'credit_balance',
            'total_hours',
            'progress',
            'onboarded_at',
            'instructor_onboarded_at',
            'booking_allowed',
            'booking_requests_enabled',
            'stripe_account_status',
            'stripe_onboarding_complete',
            'stripe_payouts_enabled',
            'subscription_source',
            'school_id',
            'school_role',
            'last_seen_at',
            'created_at',
            'updated_at',
          ].join(',')),
        (supabase as any)
          .from('user_roles')
          .select('user_id,role'),
        (supabase as any)
          .from('lessons')
          .select('id,instructor_id,student_id,manual_student_id,scheduled_at,duration_minutes,lesson_type,status,payment_method,created_at,updated_at')
          .order('scheduled_at', { ascending: false })
          .limit(500),
        (supabase as any)
          .from('credit_transactions')
          .select('id,instructor_id,student_id,hours,amount_paid,payment_method,transaction_type,status,verified_at,verified_by,created_at')
          .order('created_at', { ascending: false })
          .limit(500),
        (supabase as any)
          .from('sms_credits')
          .select('instructor_id,balance,lifetime_purchased,lifetime_used,last_topped_up'),
        (supabase as any)
          .from('subscriptions')
          .select('user_id,tier,status,current_period_end,trial_ends_at,updated_at'),
        (supabase as any)
          .from('notifications')
          .select('id,user_id,type,title,is_read,target_tab,created_at')
          .order('created_at', { ascending: false })
          .limit(300),
        (supabase as any)
          .from('events')
          .select('id,actor_role,event_type,entity_type,result,created_at')
          .order('created_at', { ascending: false })
          .limit(500),
        (supabase as any)
          .from('parent_feedback')
          .select('id,type,status,created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        (supabase as any)
          .from('profiles')
          .select('user_id,test_ready:test_manager->test_ready,booking_passes:test_manager->booking_passes,test_slots:test_manager->test_slots'),
        (supabase as any).rpc('admin_list_pending_instructors'),
      ]);

      const results = [
        profilesRes,
        rolesRes,
        lessonsRes,
        creditTransactionsRes,
        smsCreditsRes,
        subscriptionsRes,
        notificationsRes,
        feedbackRes,
        testManagerRes,
        pendingInstructorsRes,
      ];
      const failed = results.find((result) => result.error);
      if (failed) throw new Error(getErrorMessage(failed));
      const eventsUnavailableReason = eventsRes.error ? getSafeOptionalError(eventsRes) : null;

      const testRows = asArray<TestManagerProjectionRow>(testManagerRes.data);
      const testReadyEntries: TestReadyEntry[] = [];
      const bookingPasses: BookingPass[] = [];
      const testSlots: TestSlotEntry[] = [];

      testRows.forEach((row) => {
        Object.entries(asRecord(row.test_ready)).forEach(([studentId, value]) => {
          const entry = asRecord(value);
          testReadyEntries.push({
            instructor_id: row.user_id,
            student_id: studentId,
            enabled: boolFromJson(entry.enabled),
            updated_at: typeof entry.updated_at === 'string' ? entry.updated_at : null,
          });
        });

        asArray<unknown>(row.booking_passes).forEach((value) => {
          const pass = asRecord(value);
          const studentId = typeof pass.student_id === 'string' ? pass.student_id : '';
          if (!studentId) return;
          bookingPasses.push({
            id: typeof pass.id === 'string' ? pass.id : `${row.user_id}-${studentId}`,
            instructor_id: typeof pass.instructor_id === 'string' ? pass.instructor_id : row.user_id,
            student_id: studentId,
            status: typeof pass.status === 'string' ? pass.status : 'unknown',
            selected_date: typeof pass.selected_date === 'string' ? pass.selected_date : null,
            requested_at: typeof pass.requested_at === 'string' ? pass.requested_at : null,
            approved_at: typeof pass.approved_at === 'string' ? pass.approved_at : null,
            expires_at: typeof pass.expires_at === 'string' ? pass.expires_at : null,
            use_count: numberFromJson(pass.use_count),
            max_uses: numberFromJson(pass.max_uses, 1),
          });
        });

        asArray<unknown>(row.test_slots).forEach((value) => {
          const slot = asRecord(value);
          testSlots.push({
            instructor_id: row.user_id,
            date: typeof slot.date === 'string' ? slot.date : null,
            start_time: typeof slot.start_time === 'string' ? slot.start_time : null,
            end_time: typeof slot.end_time === 'string' ? slot.end_time : null,
            status: typeof slot.status === 'string' ? slot.status : null,
          });
        });
      });

      return {
        profiles: asArray<ProfileRow>(profilesRes.data),
        roles: asArray<RoleRow>(rolesRes.data),
        lessons: asArray<LessonRow>(lessonsRes.data),
        creditTransactions: asArray<CreditTransactionRow>(creditTransactionsRes.data),
        smsCredits: asArray<SmsCreditRow>(smsCreditsRes.data),
        subscriptions: asArray<SubscriptionRow>(subscriptionsRes.data),
        notifications: asArray<NotificationRow>(notificationsRes.data),
        events: eventsUnavailableReason ? [] : asArray<EventRow>(eventsRes.data),
        eventsUnavailableReason,
        feedback: asArray<FeedbackSummaryRow>(feedbackRes.data),
        testReadyEntries,
        bookingPasses,
        testSlots,
        pendingInstructorCount: Array.isArray(pendingInstructorsRes.data) ? pendingInstructorsRes.data.length : 0,
      };
    },
  });
}

export function useOperationsModel() {
  const query = useOperationsData();

  const model = useMemo<OperationsModel | null>(() => {
    if (!query.data) return null;

    const now = new Date();
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);

    const profilesById = new Map(query.data.profiles.map((profile) => [profile.user_id, profile]));
    const rolesByUser = new Map<string, Set<Role>>();
    query.data.roles.forEach((role) => {
      if (!rolesByUser.has(role.user_id)) rolesByUser.set(role.user_id, new Set<Role>());
      rolesByUser.get(role.user_id)?.add(role.role);
    });

    const hasRole = (userId: string, role: Role) => rolesByUser.get(userId)?.has(role) ?? false;
    const nameFor = (userId: string | null | undefined, fallback = 'Unknown') => {
      if (!userId) return fallback;
      const profile = profilesById.get(userId);
      return profile?.full_name || profile?.email || fallback;
    };

    const studentProfiles = query.data.profiles.filter((profile) => hasRole(profile.user_id, 'student'));
    const instructorProfiles = query.data.profiles.filter((profile) => hasRole(profile.user_id, 'instructor'));
    const lessonsByStudent = new Map<string, LessonRow[]>();
    const lessonsByInstructor = new Map<string, LessonRow[]>();
    const transactionsByStudent = new Map<string, CreditTransactionRow[]>();
    const smsByInstructor = new Map(query.data.smsCredits.map((row) => [row.instructor_id, row]));
    const subscriptionByUser = new Map(query.data.subscriptions.map((row) => [row.user_id, row]));

    query.data.lessons.forEach((lesson) => {
      if (!lessonsByInstructor.has(lesson.instructor_id)) lessonsByInstructor.set(lesson.instructor_id, []);
      lessonsByInstructor.get(lesson.instructor_id)?.push(lesson);
      if (lesson.student_id) {
        if (!lessonsByStudent.has(lesson.student_id)) lessonsByStudent.set(lesson.student_id, []);
        lessonsByStudent.get(lesson.student_id)?.push(lesson);
      }
    });

    query.data.creditTransactions.forEach((transaction) => {
      if (!transactionsByStudent.has(transaction.student_id)) transactionsByStudent.set(transaction.student_id, []);
      transactionsByStudent.get(transaction.student_id)?.push(transaction);
    });

    const testReadyStudentIds = new Set(
      query.data.testReadyEntries
        .filter((entry) => entry.enabled)
        .map((entry) => entry.student_id),
    );
    const passesByStudent = new Map<string, BookingPass[]>();
    query.data.bookingPasses.forEach((pass) => {
      if (!passesByStudent.has(pass.student_id)) passesByStudent.set(pass.student_id, []);
      passesByStudent.get(pass.student_id)?.push(pass);
    });

    const students = studentProfiles.map<StudentOperationRow>((profile) => {
      const lessons = lessonsByStudent.get(profile.user_id) ?? [];
      const transactions = transactionsByStudent.get(profile.user_id) ?? [];
      const passes = passesByStudent.get(profile.user_id) ?? [];
      const preferredPass = passes.find((pass) => pass.status === 'requested')
        ?? passes.find((pass) => pass.status === 'approved')
        ?? passes[0];
      const latestActivityAt = [
        profile.updated_at,
        ...lessons.map((lesson) => lesson.updated_at),
        ...transactions.map((transaction) => transaction.created_at),
      ].sort((a, b) => isoOrZero(b) - isoOrZero(a))[0] ?? null;

      return {
        user_id: profile.user_id,
        name: profile.full_name || 'Unnamed student',
        email: profile.email || 'No email',
        onboarded: Boolean(profile.onboarded_at),
        linkedInstructor: Boolean(profile.instructor_id),
        instructorName: nameFor(profile.instructor_id, 'Unlinked'),
        lessonCount: lessons.length,
        transactionCount: transactions.length,
        creditBalance: Number(profile.credit_balance ?? 0),
        totalHours: Number(profile.total_hours ?? 0),
        progress: Number(profile.progress ?? 0),
        testReady: testReadyStudentIds.has(profile.user_id),
        approvalStatus: preferredPass?.status ?? 'none',
        latestActivityAt,
      };
    }).sort((a, b) => isoOrZero(b.latestActivityAt) - isoOrZero(a.latestActivityAt));

    const instructors = instructorProfiles.map<InstructorOperationRow>((profile) => {
      const lessons = lessonsByInstructor.get(profile.user_id) ?? [];
      const linkedStudents = studentProfiles.filter((student) => student.instructor_id === profile.user_id);
      const sms = smsByInstructor.get(profile.user_id);
      const subscription = subscriptionByUser.get(profile.user_id);
      const latestActivityAt = [
        profile.last_seen_at,
        profile.updated_at,
        ...lessons.map((lesson) => lesson.updated_at),
      ].sort((a, b) => isoOrZero(b) - isoOrZero(a))[0] ?? null;

      return {
        user_id: profile.user_id,
        name: profile.full_name || 'Unnamed instructor',
        email: profile.email || 'No email',
        status: profile.status || 'unknown',
        onboarded: Boolean(profile.instructor_onboarded_at),
        studentCount: linkedStudents.length,
        lessonCount: lessons.length,
        upcomingLessons: lessons.filter((lesson) => new Date(lesson.scheduled_at) >= now).length,
        completedLessons: lessons.filter((lesson) => lesson.status === 'completed').length,
        cancelledLessons: lessons.filter((lesson) => lesson.status === 'cancelled').length,
        smsBalance: sms?.balance ?? null,
        subscriptionTier: subscription?.tier ?? 'none',
        subscriptionStatus: subscription?.status ?? 'none',
        stripeReady: Boolean(profile.stripe_onboarding_complete && profile.stripe_payouts_enabled),
        latestActivityAt,
      };
    }).sort((a, b) => isoOrZero(b.latestActivityAt) - isoOrZero(a.latestActivityAt));

    const payments = query.data.creditTransactions.map<PaymentOperationRow>((transaction) => {
      const qualityFlags: string[] = [];
      const hasInstructor = profilesById.has(transaction.instructor_id);
      const hasStudent = profilesById.has(transaction.student_id);
      if (!hasInstructor) qualityFlags.push('Missing instructor');
      if (!hasStudent) qualityFlags.push('Missing student');
      if (transaction.amount_paid <= 0 && transaction.transaction_type === 'PURCHASE') qualityFlags.push('Purchase has zero/negative amount');
      if (transaction.hours <= 0 && transaction.transaction_type === 'PURCHASE') qualityFlags.push('Purchase has zero/negative hours');

      return {
        id: transaction.id,
        created_at: transaction.created_at,
        method: transaction.payment_method || 'unknown',
        type: transaction.transaction_type || 'unknown',
        status: transaction.status || 'unknown',
        hours: Number(transaction.hours ?? 0),
        amount: Number(transaction.amount_paid ?? 0),
        verified: Boolean(transaction.verified_at),
        instructorName: nameFor(transaction.instructor_id),
        studentName: nameFor(transaction.student_id),
        joinStatus: !hasInstructor ? 'missing-instructor' : !hasStudent ? 'missing-student' : 'ok',
        qualityFlags,
      };
    });

    const lessons = query.data.lessons.map<LessonOperationRow>((lesson) => {
      const studentProfile = lesson.student_id ? profilesById.get(lesson.student_id) : null;
      const qualityFlags: string[] = [];
      let studentSource: LessonOperationRow['studentSource'] = 'profile';
      if (!lesson.student_id && !lesson.manual_student_id) {
        studentSource = 'missing';
        qualityFlags.push('No student reference');
      } else if (lesson.manual_student_id) {
        studentSource = 'manual';
      } else if (!studentProfile) {
        studentSource = 'broken';
        qualityFlags.push('Broken student join');
      }
      if (lesson.status === 'scheduled' && new Date(lesson.scheduled_at) < now) {
        qualityFlags.push('Scheduled in the past');
      }

      return {
        id: lesson.id,
        scheduled_at: lesson.scheduled_at,
        status: lesson.status || 'unknown',
        durationMinutes: Number(lesson.duration_minutes ?? 0),
        instructorName: nameFor(lesson.instructor_id),
        studentName: studentProfile?.full_name || studentProfile?.email || (lesson.manual_student_id ? 'Manual student' : 'Missing student'),
        studentSource,
        paymentMethod: lesson.payment_method || 'unknown',
        qualityFlags,
      };
    });

    const meaningfulEvents = query.data.events
      .filter((event) => !event.event_type.startsWith('push.'))
      .slice(0, 50)
      .map<SupportEventRow>((event) => ({
        id: event.id,
        event_type: event.event_type,
        entity_type: event.entity_type || 'unknown',
        result: event.result,
        created_at: event.created_at,
      }));

    const isPurchase = (payment: PaymentOperationRow) => payment.type === 'PURCHASE';
    const isPendingBank = (payment: PaymentOperationRow) =>
      payment.method === 'BANK_TRANSFER' && ['pending', 'pending_verification', 'pending bank transfer', 'pending_bank_transfer'].includes(payment.status);
    const isExpiredPass = (pass: BookingPass) => Boolean(pass.expires_at && new Date(pass.expires_at) < now);
    const isUsedUpPass = (pass: BookingPass) => pass.use_count >= pass.max_uses;
    const lessonToday = (lesson: LessonOperationRow) => {
      const scheduled = new Date(lesson.scheduled_at);
      return scheduled >= todayStart && scheduled < todayEnd;
    };

    const counts = {
      students: students.length,
      studentsOnboarded: students.filter((student) => student.onboarded).length,
      studentsLinked: students.filter((student) => student.linkedInstructor).length,
      studentsWithLessons: students.filter((student) => student.lessonCount > 0).length,
      studentsWithTransactions: students.filter((student) => student.transactionCount > 0).length,
      studentsActive7d: students.filter((student) => student.latestActivityAt && new Date(student.latestActivityAt) >= sevenDaysAgo).length,
      instructors: instructors.length,
      instructorsOnboarded: instructors.filter((instructor) => instructor.onboarded).length,
      instructorsWithStudents: instructors.filter((instructor) => instructor.studentCount > 0).length,
      instructorsWithLessons: instructors.filter((instructor) => instructor.lessonCount > 0).length,
      instructorsActive7d: instructors.filter((instructor) => instructor.latestActivityAt && new Date(instructor.latestActivityAt) >= sevenDaysAgo).length,
      pendingInstructors: query.data.pendingInstructorCount,
      lowSmsCredits: instructors.filter((instructor) => (instructor.smsBalance ?? 0) < 10).length,
      pendingBankTransfers: payments.filter(isPendingBank).length,
      failedPayments: payments.filter((payment) => payment.status === 'failed').length,
      completedPurchases: payments.filter((payment) => payment.status === 'completed' && isPurchase(payment)).length,
      rejectedTransfers: payments.filter((payment) => payment.status === 'rejected').length,
      paymentsWithQualityWarnings: payments.filter((payment) => payment.qualityFlags.length > 0).length,
      lessonsToday: lessons.filter(lessonToday).length,
      upcomingLessons: lessons.filter((lesson) => new Date(lesson.scheduled_at) >= now && lesson.status === 'scheduled').length,
      completedLessons: lessons.filter((lesson) => lesson.status === 'completed').length,
      cancelledLessons: lessons.filter((lesson) => lesson.status === 'cancelled').length,
      staleScheduledLessons: lessons.filter((lesson) => lesson.qualityFlags.includes('Scheduled in the past')).length,
      brokenLessonJoins: lessons.filter((lesson) => lesson.studentSource === 'broken').length,
      missingLessonStudents: lessons.filter((lesson) => lesson.studentSource === 'missing').length,
      testReadyStudents: query.data.testReadyEntries.filter((entry) => entry.enabled).length,
      requestedBookingPasses: query.data.bookingPasses.filter((pass) => pass.status === 'requested').length,
      approvedBookingPasses: query.data.bookingPasses.filter((pass) => pass.status === 'approved' && !isExpiredPass(pass) && !isUsedUpPass(pass)).length,
      expiredBookingPasses: query.data.bookingPasses.filter(isExpiredPass).length,
      usedUpBookingPasses: query.data.bookingPasses.filter(isUsedUpPass).length,
      bookingPassNotifications: query.data.notifications.filter((notification) => notification.type === 'booking_pass_request').length,
      supportFeedback: query.data.feedback.length,
      failedEvents7d: meaningfulEvents.filter((event) => event.result === 'failed' && new Date(event.created_at) >= sevenDaysAgo).length,
      warningEvents7d: meaningfulEvents.filter((event) => event.result === 'warning' && new Date(event.created_at) >= sevenDaysAgo).length,
    };

    const money = {
      pendingBankTransferAmount: payments.filter(isPendingBank).reduce((sum, payment) => sum + payment.amount, 0),
      completedPurchaseAmount: payments
        .filter((payment) => payment.status === 'completed' && isPurchase(payment) && payment.amount > 0)
        .reduce((sum, payment) => sum + payment.amount, 0),
      failedPaymentAmount: payments
        .filter((payment) => payment.status === 'failed')
        .reduce((sum, payment) => sum + payment.amount, 0),
    };

    return {
      raw: query.data,
      students,
      instructors,
      payments,
      lessons,
      supportEvents: meaningfulEvents,
      counts,
      money,
    };
  }, [query.data]);

  return { ...query, model };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
