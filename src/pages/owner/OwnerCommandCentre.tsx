import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminShell } from './_shell/AdminShell';
import Overview from './Overview';

const Students = lazy(() => import('./Students'));
const Instructors = lazy(() => import('./Instructors'));
const Payments = lazy(() => import('./Payments'));
const Lessons = lazy(() => import('./Lessons'));
const TestBooking = lazy(() => import('./TestBooking'));
const Support = lazy(() => import('./Support'));
const AdminTools = lazy(() => import('./AdminTools'));

const PageFallback = () => (
  <div className="flex items-center justify-center py-20" data-testid="admin-page-fallback">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

const wrap = (node: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

export default function OwnerCommandCentre() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index                       element={<Overview />} />
        <Route path="students"             element={wrap(<Students />)} />
        <Route path="instructors"          element={wrap(<Instructors />)} />
        <Route path="payments"             element={wrap(<Payments />)} />
        <Route path="lessons"              element={wrap(<Lessons />)} />
        <Route path="test-booking"         element={wrap(<TestBooking />)} />
        <Route path="support"              element={wrap(<Support />)} />
        <Route path="admin-tools"          element={wrap(<AdminTools />)} />
        <Route path="users"                element={<Navigate to="/owner/students" replace />} />
        <Route path="instructor-activity"  element={<Navigate to="/owner/instructors" replace />} />
        <Route path="schools"              element={<Navigate to="/owner/admin-tools" replace />} />
        <Route path="subscriptions"        element={<Navigate to="/owner/payments" replace />} />
        <Route path="messaging"            element={<Navigate to="/owner/admin-tools" replace />} />
        <Route path="notifications"        element={<Navigate to="/owner/support" replace />} />
        <Route path="feedback"             element={<Navigate to="/owner/support" replace />} />
        <Route path="audit"                element={<Navigate to="/owner/support" replace />} />
        <Route path="blog"                 element={<Navigate to="/owner/admin-tools" replace />} />
        <Route path="growth"               element={<Navigate to="/owner/admin-tools" replace />} />
        <Route path="*"                    element={<Navigate to="/owner" replace />} />
      </Route>
    </Routes>
  );
}
