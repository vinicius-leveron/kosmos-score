import { Toaster } from "@/design-system/primitives/toaster";
import { Toaster as Sonner } from "@/design-system/primitives/sonner";
import { TooltipProvider } from "@/design-system/primitives/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/core/auth";
import { AdminRoute, ProtectedRoute } from "@/core/auth/guards";

// Layouts
import { AdminLayout, ClientLayout } from "@/core/layouts";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { ClientDashboard } from "./pages/client/ClientDashboard";
import NotFound from "./pages/NotFound";

// Public pages
import Index from "./pages/Index"; // KOSMOS Score quiz

// Admin pages
import { DashboardPage } from "./pages/admin";

// Admin module pages
import { AdminResults, AdminDashboard as KosmosScoreDashboard } from "./modules/kosmos-score/pages";
import { ContactsPage, PipelinePage } from "./modules/crm/pages";
import { StakeholdersListPage } from "./modules/stakeholder-analysis/pages/StakeholdersListPage";
import { StakeholderDetailPage } from "./modules/stakeholder-analysis/pages/StakeholderDetailPage";
import { StakeholderDashboardPage } from "./modules/stakeholder-analysis/pages/StakeholderDashboardPage";
import { JourneyAnalyzerPage } from "./modules/journey-analyzer";
import { FormsListPage, FormEditorPage, FormAnalyticsPage, FormPublicPage } from "./modules/toolkit";
import { TeamPage, ClientsPage, AcceptInvitePage } from "./modules/settings";
import { AdminBenchmarksPage, AdminBenchmarkFormPage, ClientBenchmarkPage } from "./modules/benchmarking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/quiz/kosmos-score" element={<Index />} />
            <Route path="/f/:slug" element={<FormPublicPage />} />
            <Route path="/invite/:token" element={<AcceptInvitePage />} />

            {/* ADMIN PORTAL */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="kosmos-score" element={<KosmosScoreDashboard />} />
              <Route path="kosmos-score/results" element={<AdminResults />} />
              <Route path="crm/contacts" element={<ContactsPage />} />
              <Route path="crm/pipeline" element={<PipelinePage />} />
              <Route path="toolkit/forms" element={<FormsListPage />} />
              <Route path="toolkit/forms/:formId/edit" element={<FormEditorPage />} />
              <Route path="toolkit/forms/:formId/analytics" element={<FormAnalyticsPage />} />
              <Route path="stakeholders" element={<StakeholdersListPage />} />
              <Route path="stakeholders/dashboard" element={<StakeholderDashboardPage />} />
              <Route path="stakeholders/:id" element={<StakeholderDetailPage />} />
              <Route path="journey" element={<JourneyAnalyzerPage />} />
              <Route path="settings/team" element={<TeamPage />} />
              <Route path="settings/clients" element={<ClientsPage />} />
              <Route path="benchmarks" element={<AdminBenchmarksPage />} />
              <Route path="benchmarks/new" element={<AdminBenchmarkFormPage />} />
              <Route path="benchmarks/:id/edit" element={<AdminBenchmarkFormPage />} />
            </Route>

            {/* CLIENT PORTAL */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <ClientLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ClientDashboard />} />
              <Route path="benchmark" element={<ClientBenchmarkPage />} />
              <Route path="benchmark/:id" element={<ClientBenchmarkPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
