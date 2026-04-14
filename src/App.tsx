import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";
import JoinPage from "./pages/JoinPage";
import InstallPage from "./pages/InstallPage";
import ParentInvitePage from "./pages/ParentInvitePage";
import SavingsCalculator from "./pages/SavingsCalculator";
import ConnectCompletePage from "./pages/ConnectCompletePage";
import ConnectRefreshPage from "./pages/ConnectRefreshPage";
import SharedRoutePage from "./pages/SharedRoutePage";
import EnquiryPage from "./pages/EnquiryPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";

import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import AcceptableUse from "./pages/legal/AcceptableUse";
import DataProcessingAddendum from "./pages/legal/DataProcessingAddendum";

const InstructorWebDashboard = lazy(() => import("./pages/instructor/InstructorWebDashboard"));
const OwnerCommandCentre = lazy(() => import("./pages/owner/OwnerCommandCentre"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#060e20",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: "#7c3aed", animation: "pulse 1.5s infinite",
    }} />
  </div>
);

const AppRoutes = () => {
  const { user, role, isLoading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          user && !!role ? (
            <Navigate to="/instructor" replace />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/acceptable-use" element={<AcceptableUse />} />
      <Route path="/dpa" element={<DataProcessingAddendum />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/parent/:token" element={<ParentInvitePage />} />
      <Route path="/install" element={<InstallPage />} />
      <Route path="/savings" element={<SavingsCalculator />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/connect/complete" element={<ConnectCompletePage />} />
      <Route path="/connect/refresh" element={<ConnectRefreshPage />} />
      <Route path="/route/:id" element={<SharedRoutePage />} />
      <Route path="/enquire/:slug" element={<EnquiryPage />} />

      <Route path="/admin-login" element={
        <Suspense fallback={<LazyFallback />}>
          <AdminLoginPage />
        </Suspense>
      } />

      <Route path="/instructor/*" element={
        <Suspense fallback={<LazyFallback />}>
          <InstructorWebDashboard />
        </Suspense>
      } />

      <Route
        path="/owner/*"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <Suspense fallback={<LazyFallback />}>
              <OwnerCommandCentre />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
