import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, OnboardingRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import WidgetEmbed from "./pages/WidgetEmbed";
import ChatWidgetSettings from "./pages/ChatWidgetSettings";
import LiveChatInbox from "./pages/LiveChatInbox";
import Files from "./pages/Files";
import EmailArchive from "./pages/EmailArchive";
import EmailMigration from "./pages/EmailMigration";
import SecuritySettings from "./pages/SecuritySettings";
import Analytics from "./pages/Analytics";

// Passwordless auth pages
import AuthLogin from "./pages/auth/Login";
import VerifyOTP from "./pages/auth/VerifyOTP";
import MagicLinkSent from "./pages/auth/MagicLinkSent";
import AuthCallback from "./pages/auth/Callback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Passwordless auth routes (public) */}
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/auth/verify-otp" element={<VerifyOTP />} />
            <Route path="/auth/magic-link-sent" element={<MagicLinkSent />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Onboarding - requires auth but NO organization */}
            <Route
              path="/onboarding"
              element={
                <OnboardingRoute>
                  <Onboarding />
                </OnboardingRoute>
              }
            />
            
            {/* Protected routes - require auth AND organization */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tickets"
              element={
                <ProtectedRoute>
                  <Tickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tickets/new"
              element={
                <ProtectedRoute>
                  <NewTicket />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tickets/:id"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/chat-widget"
              element={
                <ProtectedRoute>
                  <ChatWidgetSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/live-chat"
              element={
                <ProtectedRoute>
                  <LiveChatInbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/files"
              element={
                <ProtectedRoute>
                  <Files />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/emails"
              element={
                <ProtectedRoute>
                  <EmailArchive />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/email-migration"
              element={
                <ProtectedRoute>
                  <EmailMigration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings/security"
              element={
                <ProtectedRoute>
                  <SecuritySettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            {/* Widget embed route (public) */}
            <Route path="/widget/:orgId" element={<WidgetEmbed />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
