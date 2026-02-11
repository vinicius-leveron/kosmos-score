import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Progress } from '@/design-system/primitives/progress';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Users,
  TrendingUp,
  Target,
  DollarSign,
  ArrowRight,
  Megaphone,
  Kanban,
  FileText,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  totalContacts: number;
  newContactsThisMonth: number;
  contactsGrowthPercent: number;
  pipelineValue: number;
  pipelineCount: number;
  leadMagnetsCompleted: number;
  avgKosmosScore: number;
  conversionRate: number;
}

export function DashboardPage() {
  const { organizationId } = useOrganization();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!organizationId) return;

      try {
        // Buscar contatos
        const { count: totalContacts } = await supabase
          .from('contact_orgs')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId);

        // Contatos novos este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newContactsThisMonth } = await supabase
          .from('contact_orgs')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', startOfMonth.toISOString());

        // Lead magnets (audit_results)
        const { count: leadMagnetsCompleted } = await supabase
          .from('audit_results')
          .select('*', { count: 'exact', head: true });

        // Score médio
        const { data: scoreData } = await supabase
          .from('audit_results')
          .select('kosmos_asset_score');

        const avgScore = scoreData && scoreData.length > 0
          ? scoreData.reduce((acc, r) => acc + (r.kosmos_asset_score || 0), 0) / scoreData.length
          : 0;

        setStats({
          totalContacts: totalContacts || 0,
          newContactsThisMonth: newContactsThisMonth || 0,
          contactsGrowthPercent: totalContacts ? ((newContactsThisMonth || 0) / totalContacts) * 100 : 0,
          pipelineValue: 0, // TODO: implementar quando tiver deals
          pipelineCount: 0,
          leadMagnetsCompleted: leadMagnetsCompleted || 0,
          avgKosmosScore: Math.round(avgScore),
          conversionRate: 0, // TODO: calcular
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Contatos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newContactsThisMonth || 0} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lead Magnets
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leadMagnetsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">
              formulários completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Médio
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgKosmosScore || 0}</div>
            <p className="text-xs text-muted-foreground">
              KOSMOS Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pipelineCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              oportunidades ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="hover:border-primary/50 transition-colors active:scale-[0.98]">
          <Link to="/admin/crm/contacts" className="block">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm sm:text-base">CRM - Contatos</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Gerencie seus contatos e leads
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors active:scale-[0.98]">
          <Link to="/admin/crm/pipeline" className="block">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Kanban className="h-5 w-5 text-purple-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm sm:text-base">Pipeline de Vendas</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Acompanhe suas oportunidades
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 transition-colors active:scale-[0.98]">
          <Link to="/admin/kosmos-score" className="block">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm sm:text-base">KOSMOS Score Analytics</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Análise dos leads do lead magnet
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma atividade recente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
