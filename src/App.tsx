import { Toaster } from "@/design-system/primitives/toaster";
import { Toaster as Sonner } from "@/design-system/primitives/sonner";
import { TooltipProvider } from "@/design-system/primitives/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/resultados" element={<AdminResults />} />
          {/* CRM Routes */}
          <Route path="/crm/contacts" element={<ContactsPage />} />
          <Route path="/crm/pipeline" element={<PipelinePage />} />
          {/* Stakeholder Analysis Routes */}
          <Route path="/stakeholders" element={<StakeholdersListPage organizationId="c0000000-0000-0000-0000-000000000001" />} />
          <Route path="/stakeholders/:id" element={<StakeholderDetailPage organizationId="c0000000-0000-0000-0000-000000000001" />} />
          {/* Journey Analyzer Routes */}
          <Route path="/journey-analyzer" element={<JourneyAnalyzerPage />} />
          {/* Toolkit - Forms Routes */}
          <Route path="/toolkit/forms" element={<FormsListPage />} />
          <Route path="/toolkit/forms/:formId/edit" element={<FormEditorPage />} />
          <Route path="/toolkit/forms/:formId/analytics" element={<FormAnalyticsPage />} />
          <Route path="/f/:slug" element={<FormPublicPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
