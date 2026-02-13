import { lazy, Suspense } from "react";
import { Toaster } from "@/design-system/primitives/toaster";
import { Toaster as Sonner } from "@/design-system/primitives/sonner";
import { TooltipProvider } from "@/design-system/primitives/tooltip";
import { Skeleton } from "@/design-system/primitives/skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/core/auth/AuthContextOptimized";
import { AdminRoute, ProtectedRoute } from "@/core/auth/guards";

// Layouts
import { AdminLayout, ClientLayout } from "@/core/layouts";

// Pages
import { LoginPage } from "./pages/LoginPage";
import { ClientDashboard } from "./pages/client/ClientDashboard";
import NotFound from "./pages/NotFound";

// Public pages
import Index from "./pages/Index"; // KOSMOS Score quiz
import { EmbedKosmosScore } from "./pages/EmbedKosmosScore";

// Admin pages
import { DashboardPage, LeadMagnetsPage, LeadMagnetAnalyticsPage } from "./pages/admin";

// Admin module pages - Lazy loaded for performance
const AdminResults = lazy(() => import("./modules/kosmos-score/pages").then(m => ({ default: m.AdminResults })));
const KosmosScoreDashboard = lazy(() => import("./modules/kosmos-score/pages").then(m => ({ default: m.AdminDashboard })));
const CrmDashboardPage = lazy(() => import("./modules/crm/pages").then(m => ({ default: m.CrmDashboardPage })));
const ContactsPage = lazy(() => import("./modules/crm/pages").then(m => ({ default: m.ContactsPage })));
const PipelinePage = lazy(() => import("./modules/crm/pages").then(m => ({ default: m.PipelinePage })));
const CompaniesPage = lazy(() => import("./modules/crm/pages").then(m => ({ default: m.CompaniesPage })));
const DealBoardPage = lazy(() => import("./modules/crm/pages").then(m => ({ default: m.DealBoardPage })));
const StakeholdersListPage = lazy(() => import("./modules/stakeholder-analysis/pages/StakeholdersListPage").then(m => ({ default: m.StakeholdersListPage })));
const StakeholderDetailPage = lazy(() => import("./modules/stakeholder-analysis/pages/StakeholderDetailPage").then(m => ({ default: m.StakeholderDetailPage })));
const StakeholderDashboardPage = lazy(() => import("./modules/stakeholder-analysis/pages/StakeholderDashboardPage").then(m => ({ default: m.StakeholderDashboardPage })));
const JourneyAnalyzerPage = lazy(() => import("./modules/journey-analyzer").then(m => ({ default: m.JourneyAnalyzerPage })));
const FormsListPage = lazy(() => import("./modules/toolkit").then(m => ({ default: m.FormsListPage })));
const FormEditorPage = lazy(() => import("./modules/toolkit").then(m => ({ default: m.FormEditorPage })));
const FormAnalyticsPage = lazy(() => import("./modules/toolkit").then(m => ({ default: m.FormAnalyticsPage })));
const FormPublicPage = lazy(() => import("./modules/toolkit").then(m => ({ default: m.FormPublicPage })));
const TeamPage = lazy(() => import("./modules/settings").then(m => ({ default: m.TeamPage })));
const ClientsPage = lazy(() => import("./modules/settings").then(m => ({ default: m.ClientsPage })));
const AcceptInvitePage = lazy(() => import("./modules/settings").then(m => ({ default: m.AcceptInvitePage })));
const AdminBenchmarksPage = lazy(() => import("./modules/benchmarking").then(m => ({ default: m.AdminBenchmarksPage })));
const AdminBenchmarkFormPage = lazy(() => import("./modules/benchmarking").then(m => ({ default: m.AdminBenchmarkFormPage })));
const ClientBenchmarkPage = lazy(() => import("./modules/benchmarking").then(m => ({ default: m.ClientBenchmarkPage })));

// Financial module pages - Lazy loaded
const FinancialDashboardPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.FinancialDashboardPage })));
const ReceivablesPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.ReceivablesPage })));
const PayablesPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.PayablesPage })));
const CashFlowPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.CashFlowPage })));
const DrePage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.DrePage })));
const FinancialCategoriesPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.CategoriesPage })));
const FinancialAccountsPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.AccountsPage })));
const ReconciliationPage = lazy(() => import("./modules/financial/pages").then(m => ({ default: m.ReconciliationPage })));

// Loading component for lazy loaded pages
import { PageLoader } from "@/design-system/components/PageLoader";

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
            <Route path="/embed/kosmos-score" element={<EmbedKosmosScore />} />
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
              <Route path="lead-magnets" element={<LeadMagnetsPage />} />
              <Route path="lead-magnets/:type/analytics" element={<LeadMagnetAnalyticsPage />} />
              <Route path="kosmos-score" element={<Suspense fallback={<PageLoader />}><KosmosScoreDashboard /></Suspense>} />
              <Route path="kosmos-score/results" element={<Suspense fallback={<PageLoader />}><AdminResults /></Suspense>} />
              <Route path="crm" element={<Suspense fallback={<PageLoader />}><CrmDashboardPage /></Suspense>} />
              <Route path="crm/contacts" element={<Suspense fallback={<PageLoader />}><ContactsPage /></Suspense>} />
              <Route path="crm/pipeline" element={<Suspense fallback={<PageLoader />}><PipelinePage /></Suspense>} />
              <Route path="crm/companies" element={<Suspense fallback={<PageLoader />}><CompaniesPage /></Suspense>} />
              <Route path="crm/deals/board" element={<Suspense fallback={<PageLoader />}><DealBoardPage /></Suspense>} />
              <Route path="toolkit/forms" element={<Suspense fallback={<PageLoader />}><FormsListPage /></Suspense>} />
              <Route path="toolkit/forms/:formId/edit" element={<Suspense fallback={<PageLoader />}><FormEditorPage /></Suspense>} />
              <Route path="toolkit/forms/:formId/analytics" element={<Suspense fallback={<PageLoader />}><FormAnalyticsPage /></Suspense>} />
              <Route path="stakeholders" element={<Suspense fallback={<PageLoader />}><StakeholdersListPage /></Suspense>} />
              <Route path="stakeholders/dashboard" element={<Suspense fallback={<PageLoader />}><StakeholderDashboardPage /></Suspense>} />
              <Route path="stakeholders/:id" element={<Suspense fallback={<PageLoader />}><StakeholderDetailPage /></Suspense>} />
              <Route path="journey" element={<Suspense fallback={<PageLoader />}><JourneyAnalyzerPage /></Suspense>} />
              <Route path="settings/team" element={<Suspense fallback={<PageLoader />}><TeamPage /></Suspense>} />
              <Route path="settings/clients" element={<Suspense fallback={<PageLoader />}><ClientsPage /></Suspense>} />
              <Route path="benchmarks" element={<Suspense fallback={<PageLoader />}><AdminBenchmarksPage /></Suspense>} />
              <Route path="benchmarks/new" element={<Suspense fallback={<PageLoader />}><AdminBenchmarkFormPage /></Suspense>} />
              <Route path="benchmarks/:id/edit" element={<Suspense fallback={<PageLoader />}><AdminBenchmarkFormPage /></Suspense>} />
              {/* Financial module */}
              <Route path="financial" element={<Suspense fallback={<PageLoader />}><FinancialDashboardPage /></Suspense>} />
              <Route path="financial/receivables" element={<Suspense fallback={<PageLoader />}><ReceivablesPage /></Suspense>} />
              <Route path="financial/payables" element={<Suspense fallback={<PageLoader />}><PayablesPage /></Suspense>} />
              <Route path="financial/cashflow" element={<Suspense fallback={<PageLoader />}><CashFlowPage /></Suspense>} />
              <Route path="financial/dre" element={<Suspense fallback={<PageLoader />}><DrePage /></Suspense>} />
              <Route path="financial/categories" element={<Suspense fallback={<PageLoader />}><FinancialCategoriesPage /></Suspense>} />
              <Route path="financial/accounts" element={<Suspense fallback={<PageLoader />}><FinancialAccountsPage /></Suspense>} />
              <Route path="financial/reconciliation" element={<Suspense fallback={<PageLoader />}><ReconciliationPage /></Suspense>} />
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
