import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, OnboardingRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/utils/animations";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import GDPRCompliance from "./pages/GDPRCompliance";
import Documentation from "./pages/Documentation";
import APIReference from "./pages/APIReference";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Support from "./pages/Support";
import GettingStarted from "./pages/docs/GettingStarted";
import UserManagement from "./pages/docs/UserManagement";
import TicketManagement from "./pages/docs/TicketManagement";
import APIIntegration from "./pages/docs/APIIntegration";
import Configuration from "./pages/docs/Configuration";
import Analytics from "./pages/docs/Analytics";
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
import AnalyticsDashboard from "./pages/Analytics";
import Team from "./pages/Team";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import PrivacySettings from "./pages/PrivacySettings";

// Passwordless auth pages
import AuthLogin from "./pages/auth/Login";
import AuthSignup from "./pages/auth/Signup";
import VerifyOTP from "./pages/auth/VerifyOTP";
import MagicLinkSent from "./pages/auth/MagicLinkSent";
import AuthCallback from "./pages/auth/Callback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Animated Routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/gdpr-compliance" element={<GDPRCompliance />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/docs/getting-started" element={<GettingStarted />} />
            <Route path="/docs/user-management" element={<UserManagement />} />
            <Route path="/docs/ticket-management" element={<TicketManagement />} />
            <Route path="/docs/api-integration" element={<APIIntegration />} />
            <Route path="/docs/configuration" element={<Configuration />} />
            <Route path="/docs/analytics-and-reporting" element={<Analytics />} />
            <Route path="/api-reference" element={<APIReference />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/support" element={<Support />} />
            
            {/* Passwordless auth routes (public) */}
            <Route path="/auth/login" element={<AuthLogin />} />
            <Route path="/login" element={<AuthLogin />} />
            <Route path="/auth/signup" element={<AuthSignup />} />
            <Route path="/signup" element={<AuthSignup />} />
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
              path="/dashboard/settings/privacy"
              element={
                <ProtectedRoute>
                  <PrivacySettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
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
            <Route
              path="/dashboard/team"
              element={
                <ProtectedRoute>
                  <Team />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/clients"
              element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              }
            />
            
            {/* Widget embed route (public) */}
            <Route path="/widget/:orgId" element={<WidgetEmbed />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Premium Animated Background */}
          <AnimatedBackground variant="both" intensity="medium" />
          
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
