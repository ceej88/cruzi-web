import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import OwnerCommandCentre from "./pages/owner/OwnerCommandCentre";
import NotFound from "./pages/NotFound";
import JoinPage from "./pages/JoinPage";
import InstallPage from "./pages/InstallPage";
import ParentInvitePage from "./pages/ParentInvitePage";
import SavingsCalculator from "./pages/SavingsCalculator";
import ConnectCompletePage from "./pages/ConnectCompletePage";
import ConnectRefreshPage from "./pages/ConnectRefreshPage";

// Legal Pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import CookiePolicy from "./pages/legal/CookiePolicy";
import AcceptableUse from "./pages/legal/AcceptableUse";
import DataProcessingAddendum from "./pages/legal/DataProcessingAddendum";

const queryClient = new QueryClient();

// Router component that uses auth context
const AppRoutes = () => {
  const { user, role, isLoading } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          user && role === "instructor" ? (
            <Navigate to="/instructor" replace />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/acceptable-use" element={<AcceptableUse />} />
      <Route path="/dpa" element={<DataProcessingAddendum />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/parent/:token" element={<ParentInvitePage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/install" element={<InstallPage />} />
      <Route path="/savings" element={<SavingsCalculator />} />
      <Route path="/connect/complete" element={<ConnectCompletePage />} />
      <Route path="/connect/refresh" element={<ConnectRefreshPage />} />

      {/* Instructor routes - No ProtectedRoute wrapper!
          The InstructorDashboard handles its own funnel state machine:
          VISION → TIERS → SIGNUP → VERIFICATION → READY
          Returning instructors are detected and skip to READY automatically */}
      <Route
        path="/instructor/*"
        element={<InstructorDashboard />}
      />

      {/* Owner Command Centre (admin) */}
      <Route
        path="/owner/*"
        element={
          <ProtectedRoute allowedRoles={["instructor"]}>
            <OwnerCommandCentre />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
