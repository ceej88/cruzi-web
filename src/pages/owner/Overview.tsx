import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  LifeBuoy,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AlertCard } from './_components/AlertCard';
import { MetricCard, type MetricStatus } from './_components/MetricCard';
import { SectionHeader } from './_components/SectionHeader';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  OperationsPage,
  ReadOnlyNotice,
  StatusPill,
} from './_components/OperationsUI';
import { formatCurrency, formatDateTime, useOperationsModel } from './_data/useOperationsData';
import { Card, CardContent } from '@/components/ui/card';

const valueStatus: MetricStatus = 'value';

export default function Overview() {
  const { model, isLoading, isError, error } = useOperationsModel();

  if (isLoading) {
    return (
      <OperationsPage title="Overview" description="Read-only operating snapshot of the Cruzi platform.">
        <LoadingState />
      </OperationsPage>
    );
  }

  if (isError || !model) {
    return (
      <OperationsPage title="Overview" description="Read-only operating snapshot of the Cruzi platform.">
        <ErrorState message={error instanceof Error ? error.message : undefined} />
      </OperationsPage>
    );
  }

  const recentIssues = [
    ...model.payments.filter((payment) => payment.qualityFlags.length > 0).slice(0, 4).map((payment) => ({
      id: payment.id,
      label: `${payment.studentName} payment quality warning`,
      detail: payment.qualityFlags.join(', '),
      status: payment.status,
      date: payment.created_at,
    })),
    ...model.lessons.filter((lesson) => lesson.qualityFlags.length > 0).slice(0, 4).map((lesson) => ({
      id: lesson.id,
      label: `${lesson.studentName} lesson warning`,
      detail: lesson.qualityFlags.join(', '),
      status: lesson.status,
      date: lesson.scheduled_at,
    })),
    ...model.supportEvents.filter((event) => event.result !== 'success').slice(0, 4).map((event) => ({
      id: event.id,
      label: event.event_type,
      detail: event.entity_type,
      status: event.result,
      date: event.created_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <OperationsPage title="Overview" description="Live read-only snapshot for day-to-day Cruzi operations.">
      <ReadOnlyNotice>
        This dashboard only reads existing production data. Dangerous account tools, broadcasts, backend changes, and cleanup work are isolated away from daily operations.
      </ReadOnlyNotice>

      <section>
        <SectionHeader title="Needs Attention" hint="Start here before looking at general metrics." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          <AlertCard
            label="Pending bank transfers"
            count={model.counts.pendingBankTransfers}
            severity="critical"
            icon={CreditCard}
            to="/owner/payments"
          />
          <AlertCard
            label="Instructor approvals"
            count={model.counts.pendingInstructors}
            severity="warn"
            icon={ShieldCheck}
            to="/owner/instructors"
          />
          <AlertCard
            label="Lesson data warnings"
            count={model.counts.staleScheduledLessons + model.counts.brokenLessonJoins + model.counts.missingLessonStudents}
            severity="warn"
            icon={AlertTriangle}
            to="/owner/lessons"
          />
          <AlertCard
            label="Payment data warnings"
            count={model.counts.paymentsWithQualityWarnings}
            severity="warn"
            icon={AlertTriangle}
            to="/owner/payments"
          />
          <AlertCard
            label="Booking approvals requested"
            count={model.counts.requestedBookingPasses}
            severity="warn"
            icon={ClipboardCheck}
            to="/owner/test-booking"
          />
          <AlertCard
            label="Failed support events last 7d"
            count={model.counts.failedEvents7d}
            severity="critical"
            icon={LifeBuoy}
            to="/owner/support"
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Today" hint="Strictly counts records scheduled or created today, not today onward." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard label="Lessons today" value={model.counts.lessonsToday} status={valueStatus} icon={CalendarDays} to="/owner/lessons" />
          <MetricCard label="Upcoming lessons" value={model.counts.upcomingLessons} status={valueStatus} icon={CalendarDays} to="/owner/lessons" />
          <MetricCard label="Pending transfer value" value={formatCurrency(model.money.pendingBankTransferAmount)} status={valueStatus} icon={CreditCard} to="/owner/payments" />
          <MetricCard label="Active students 7d" value={model.counts.studentsActive7d} status={valueStatus} icon={Users} to="/owner/students" />
        </div>
      </section>

      <section>
        <SectionHeader title="User Base" hint="Role-aware counts from profiles and user_roles." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard label="Students" value={model.counts.students} status={valueStatus} icon={Users} to="/owner/students" hint={`${model.counts.studentsLinked} linked to instructors`} />
          <MetricCard label="Instructors" value={model.counts.instructors} status={valueStatus} icon={GraduationCap} to="/owner/instructors" hint={`${model.counts.instructorsActive7d} active in last 7d`} />
          <MetricCard label="Onboarded students" value={model.counts.studentsOnboarded} status={valueStatus} icon={Users} to="/owner/students" />
          <MetricCard label="Low SMS instructors" value={model.counts.lowSmsCredits} status={valueStatus} icon={AlertTriangle} to="/owner/instructors" />
        </div>
      </section>

      <section>
        <SectionHeader title="Product Operations" hint="Reliable operational signals available now." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard label="Completed lessons" value={model.counts.completedLessons} status={valueStatus} icon={CalendarDays} to="/owner/lessons" />
          <MetricCard label="Completed purchases" value={model.counts.completedPurchases} status={valueStatus} icon={CreditCard} to="/owner/payments" hint={formatCurrency(model.money.completedPurchaseAmount)} />
          <MetricCard label="Test-ready students" value={model.counts.testReadyStudents} status={valueStatus} icon={ClipboardCheck} to="/owner/test-booking" />
          <MetricCard label="Support feedback" value={model.counts.supportFeedback} status={valueStatus} icon={LifeBuoy} to="/owner/support" />
        </div>
      </section>

      <section>
        <SectionHeader title="Recent Issues" hint="Filtered to useful warnings, with push-token noise removed." />
        <Card>
          <CardContent className="p-0">
            {recentIssues.length === 0 ? (
              <div className="p-4">
                <EmptyState label="No recent operational issues found." />
              </div>
            ) : (
              <div className="divide-y">
                {recentIssues.map((issue) => (
                  <div key={`${issue.id}-${issue.label}`} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{issue.label}</p>
                      <p className="text-sm text-muted-foreground">{issue.detail}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill value={issue.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(issue.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </OperationsPage>
  );
}
