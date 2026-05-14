import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BabyIcon, School, ShieldCheck,
  CalendarDays, FileText, Map, Mic, Trophy,
  Coins, BadgeAlert, AlertTriangle, CreditCard, MessageSquare, ScrollText,
  UserPlus, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MetricCard, type MetricStatus } from './_components/MetricCard';
import { AlertCard } from './_components/AlertCard';
import { SectionHeader } from './_components/SectionHeader';
import { ActivityFeed } from './_components/ActivityFeed';
import {
  useTodayMetrics, useUserBaseMetrics, useProductUsageMetrics,
  useSmsMetrics, usePendingInstructors, useSubscriptionStats,
} from './_data/useAdminData';

function status(q: { isLoading: boolean; isError: boolean; data: unknown }): MetricStatus {
  if (q.isLoading) return 'loading';
  if (q.isError || q.data == null) return 'unavailable';
  return 'value';
}

export default function Overview() {
  const navigate = useNavigate();
  const today    = useTodayMetrics();
  const base     = useUserBaseMetrics();
  const usage    = useProductUsageMetrics();
  const sms      = useSmsMetrics();
  const pending  = usePendingInstructors();
  const subs     = useSubscriptionStats();

  const moneyStatus: MetricStatus =
    subs.isLoading ? 'loading' : (subs.isError ? 'unavailable' : 'value');

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto space-y-8" data-testid="page-overview">
      {/* Page header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight" data-testid="text-page-title">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live operating snapshot of the Cruzi platform.
        </p>
      </div>

      {/* TODAY */}
      <section data-testid="section-today-wrapper">
        <SectionHeader title="Today" hint="Activity since midnight UK time." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard
            label="New sign-ups"
            value={today.data?.signups}
            status={status(today)}
            icon={UserPlus}
          />
          <MetricCard
            label="Lessons scheduled"
            value={today.data?.lessonsToday}
            status={status(today)}
            icon={CalendarDays}
            hint="Lessons with scheduled_at today"
          />
          <MetricCard
            label="SMS top-ups"
            value={today.data?.smsTopUpsToday}
            status={status(today)}
            icon={Coins}
            hint="Stripe credit purchases today"
          />
          <MetricCard
            label="Pending instructor approvals"
            value={pending.data}
            status={status(pending)}
            icon={ShieldCheck}
            to="/owner/instructors"
          />
        </div>
      </section>

      {/* NEEDS ATTENTION */}
      <section data-testid="section-needs-attention-wrapper">
        <SectionHeader title="Needs attention" hint="Items waiting on you." />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          <AlertCard
            label="Instructors awaiting approval"
            count={pending.data ?? null}
            loading={pending.isLoading}
            severity="warn"
            icon={ShieldCheck}
            to="/owner/instructors"
            testId="alert-pending-approvals"
          />
          <AlertCard
            label="Instructors with low SMS credits (< 10)"
            count={sms.data?.lowBalanceCount ?? null}
            loading={sms.isLoading}
            severity="warn"
            icon={BadgeAlert}
            testId="alert-low-credits"
          />
          <AlertCard
            label="Failed SMS top-ups (last 7d)"
            count={sms.data?.txFail7d ?? null}
            loading={sms.isLoading}
            severity="critical"
            icon={AlertTriangle}
            testId="alert-failed-topups"
          />
        </div>
      </section>

      {/* USER BASE */}
      <section data-testid="section-user-base-wrapper">
        <SectionHeader
          title="User base"
          action={{ label: 'Manage users', to: '/owner/users' }}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <MetricCard
            label="Total profiles"
            value={base.data?.profilesTotal}
            status={status(base)}
            icon={Users}
            to="/owner/users"
            hint={base.data ? `${base.data.profilesNew7d} new this week` : undefined}
          />
          <MetricCard
            label="Instructors"
            value={base.data?.instructors}
            status={status(base)}
            icon={GraduationCap}
            to="/owner/users?role=instructor"
          />
          <MetricCard
            label="Students"
            value={base.data?.students}
            status={status(base)}
            icon={Users}
            to="/owner/users?role=student"
          />
          <MetricCard
            label="Parents"
            value={base.data?.parents}
            status={status(base)}
            icon={BabyIcon}
            to="/owner/users?role=parent"
          />
          <MetricCard
            label="School admins"
            value={base.data?.schoolAdmins}
            status={status(base)}
            icon={School}
            to="/owner/users?role=school_admin"
          />
          <MetricCard
            label="Admins"
            value={base.data?.admins}
            status={status(base)}
            icon={ShieldCheck}
            to="/owner/users?role=admin"
          />
        </div>
      </section>

      {/* PRODUCT USAGE */}
      <section data-testid="section-product-usage-wrapper">
        <SectionHeader
          title="Product usage"
          hint="All-time totals across the platform."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          <MetricCard
            label="Lessons"
            value={usage.data?.lessons}
            status={status(usage)}
            icon={CalendarDays}
            unavailableReason="Detail view coming next iteration"
          />
          <MetricCard
            label="Lesson plans"
            value={usage.data?.lessonPlans}
            status={status(usage)}
            icon={FileText}
          />
          <MetricCard
            label="CoPilot sessions"
            value={usage.data?.copilot}
            status={status(usage)}
            icon={Mic}
            hint={usage.data ? `${usage.data.copilot7d} in last 7d` : undefined}
            unavailableReason="Detail view coming next iteration"
          />
          <MetricCard
            label="Practice sessions"
            value={usage.data?.practice}
            status={status(usage)}
            icon={Map}
          />
          <MetricCard
            label="Mock tests"
            value={usage.data?.mockTests}
            status={status(usage)}
            icon={Trophy}
          />
          <MetricCard
            label="Active subscriptions"
            value={moneyStatus === 'value' ? subs.active : undefined}
            status={moneyStatus}
            icon={CreditCard}
            to="/owner/subscriptions"
            hint={
              moneyStatus === 'value'
                ? `${subs.paying} paying · ${subs.trialing} trialing`
                : undefined
            }
          />
        </div>
      </section>

      {/* MONEY & SMS */}
      <section data-testid="section-money-sms-wrapper">
        <SectionHeader title="Money & SMS" hint="SMS credits and Stripe top-ups (no live SMS sends in this view)." />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          <MetricCard
            label="Credits in circulation"
            value={sms.data?.balanceTotal}
            status={status(sms)}
            icon={Coins}
            hint="Sum of every instructor's current balance"
          />
          <MetricCard
            label="Lifetime credits purchased"
            value={sms.data?.lifetimePurchased}
            status={status(sms)}
            icon={Coins}
          />
          <MetricCard
            label="Lifetime credits used"
            value={sms.data?.lifetimeUsed}
            status={status(sms)}
            icon={Coins}
          />
          <MetricCard
            label="Lifetime SMS revenue"
            value={
              sms.data
                ? '£' + (sms.data.lifetimeRevenuePence / 100).toFixed(2)
                : undefined
            }
            status={status(sms)}
            icon={CreditCard}
            hint="Sum of completed top-up purchases"
          />
        </div>
      </section>

      {/* RECENT ACTIVITY + QUICK ACTIONS */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6" data-testid="section-activity-actions-wrapper">
        <div className="xl:col-span-2">
          <SectionHeader title="Recent activity" hint="Latest sign-ups, SMS top-ups, and subscription changes." />
          <Card>
            <CardContent className="p-4 lg:p-5">
              <ActivityFeed />
            </CardContent>
          </Card>
        </div>
        <div>
          <SectionHeader title="Quick actions" />
          <Card>
            <CardContent className="p-4 lg:p-5 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/owner/instructors')}
                data-testid="button-quick-approve"
              >
                Review pending instructors
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/owner/messaging')}
                data-testid="button-quick-broadcast"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Broadcast a message
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/owner/audit')}
                data-testid="button-quick-audit"
              >
                <span className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Open audit log
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate('/owner/subscriptions')}
                data-testid="button-quick-subs"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Subscriptions overview
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
