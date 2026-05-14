import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AdminShell } from './_shell/AdminShell';
import Overview from './Overview';

const AdminUserManagement       = lazy(() => import('./AdminUserManagement'));
const AdminInstructorVerification = lazy(() => import('./AdminInstructorVerification'));
const AdminInstructorActivity   = lazy(() => import('./AdminInstructorActivity'));
const AdminSchoolManagement     = lazy(() => import('./AdminSchoolManagement'));
const AdminSubscriptionOverview = lazy(() => import('./AdminSubscriptionOverview'));
const AdminMessaging            = lazy(() => import('./AdminMessaging'));
const AdminNotificationHub      = lazy(() => import('./AdminNotificationHub'));
const AdminFeedback             = lazy(() => import('./AdminFeedback'));
const AdminSupportAudit         = lazy(() => import('./AdminSupportAudit'));
const BlogAdmin                 = lazy(() => import('./BlogAdmin'));
const GrowthLab                 = lazy(() => import('./GrowthLab'));

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
        <Route path="users"                element={wrap(<AdminUserManagement />)} />
        <Route path="instructors"          element={wrap(<AdminInstructorVerification />)} />
        <Route path="instructor-activity"  element={wrap(<AdminInstructorActivity />)} />
        <Route path="schools"              element={wrap(<AdminSchoolManagement />)} />
        <Route path="subscriptions"        element={wrap(<AdminSubscriptionOverview />)} />
        <Route path="messaging"            element={wrap(<AdminMessaging />)} />
        <Route path="notifications"        element={wrap(<AdminNotificationHub />)} />
        <Route path="feedback"             element={wrap(<AdminFeedback />)} />
        <Route path="audit"                element={wrap(<AdminSupportAudit />)} />
        <Route path="blog"                 element={wrap(<BlogAdmin />)} />
        <Route path="growth"               element={wrap(<GrowthLab />)} />
        <Route path="*"                    element={<Navigate to="/owner" replace />} />
      </Route>
    </Routes>
  );
}
