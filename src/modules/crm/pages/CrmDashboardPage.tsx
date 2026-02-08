import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, UserPlus, Target, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/primitives/sheet';
import { Alert, AlertDescription } from '@/design-system/primitives/alert';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/core/auth';
import { useCrmDashboard } from '../hooks/useCrmDashboard';
import {
  DashboardMetricCard,
  HotLeadsList,
  LeadsBySourceChart,
  RecentActivitiesList,
  StageDistributionCard,
} from '../components/dashboard';
import { ContactForm } from '../components/contacts/ContactForm';
import { ContactDetail } from '../components/contacts/ContactDetail';
import type { HotLead } from '../hooks/useCrmDashboard';

export function CrmDashboardPage() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useCrmDashboard(organizationId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedContactOrgId, setSelectedContactOrgId] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    queryClient.invalidateQueries({ queryKey: ['crm-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  const handleLeadClick = (lead: HotLead) => {
    setSelectedContactOrgId(lead.id);
  };

  const handleCloseDetail = () => {
    setSelectedContactOrgId(null);
  };

  const handleViewAllLeads = () => {
    navigate('/admin/crm/contacts?score_min=70');
  };

  const handleStageClick = (stage: { id: string }) => {
    navigate(`/admin/crm/contacts?stage_id=${stage.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dashboard: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CRM</h1>
                <p className="text-muted-foreground">
                  Visão geral dos seus contatos e leads
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardMetricCard
            title="Total de Contatos"
            value={data?.metrics.totalContacts || 0}
            icon={Users}
          />
          <DashboardMetricCard
            title="Score Médio"
            value={data?.metrics.averageScore || 0}
            description="de 100 pontos"
            icon={Target}
          />
          <DashboardMetricCard
            title="Novos (7 dias)"
            value={data?.metrics.newContactsLast7Days || 0}
            icon={UserPlus}
            trend={
              data?.metrics.newContactsChange !== undefined
                ? {
                    value: data.metrics.newContactsChange,
                    isPositive: data.metrics.newContactsChange >= 0,
                  }
                : undefined
            }
          />
          <DashboardMetricCard
            title="Leads Quentes"
            value={data?.hotLeads.length || 0}
            description="score > 70"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Hot Leads and Recent Activities */}
          <div className="lg:col-span-2 space-y-6">
            <HotLeadsList
              leads={data?.hotLeads || []}
              limit={5}
              onLeadClick={handleLeadClick}
              onViewAll={handleViewAllLeads}
            />
            <RecentActivitiesList
              activities={data?.recentActivities || []}
              limit={8}
            />
          </div>

          {/* Right Column - Charts */}
          <div className="space-y-6">
            <StageDistributionCard
              stages={data?.stageDistribution || []}
              onStageClick={handleStageClick}
            />
            <LeadsBySourceChart
              data={data?.sourceDistribution || []}
            />
          </div>
        </div>
      </div>

      {/* Create Contact Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo Contato</SheetTitle>
            <SheetDescription>
              Adicione um novo contato ao CRM
            </SheetDescription>
          </SheetHeader>
          <ContactForm
            organizationId={organizationId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Contact Detail Sheet */}
      <Sheet open={!!selectedContactOrgId} onOpenChange={() => setSelectedContactOrgId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Contato</SheetTitle>
          </SheetHeader>
          {selectedContactOrgId && (
            <ContactDetail
              contactOrgId={selectedContactOrgId}
              onClose={handleCloseDetail}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
