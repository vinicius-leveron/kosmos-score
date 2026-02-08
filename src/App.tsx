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

// Admin module pages
import { AdminResults } from "./modules/kosmos-score/pages/AdminResults";
import { AdminDashboard } from "./modules/kosmos-score/pages/AdminDashboard";
import { ContactsPage } from "./modules/crm/pages/ContactsPage";
import { PipelinePage } from "./modules/crm/pages/PipelinePage";
import { StakeholdersListPage } from "./modules/stakeholder-analysis/pages/StakeholdersListPage";
import { StakeholderDetailPage } from "./modules/stakeholder-analysis/pages/StakeholderDetailPage";
import { JourneyAnalyzerPage } from "./modules/journey-analyzer";
import { FormsListPage, FormEditorPage, FormAnalyticsPage, FormPublicPage } from "./modules/toolkit";

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

            {/* ADMIN PORTAL */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="kosmos-score" element={<AdminResults />} />
              <Route path="crm/contacts" element={<ContactsPage />} />
              <Route path="crm/pipeline" element={<PipelinePage />} />
              <Route path="toolkit/forms" element={<FormsListPage />} />
              <Route path="toolkit/forms/:formId/edit" element={<FormEditorPage />} />
              <Route path="toolkit/forms/:formId/analytics" element={<FormAnalyticsPage />} />
              <Route path="stakeholders" element={<StakeholdersListPage />} />
              <Route path="stakeholders/:id" element={<StakeholderDetailPage />} />
              <Route path="journey" element={<JourneyAnalyzerPage />} />
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
