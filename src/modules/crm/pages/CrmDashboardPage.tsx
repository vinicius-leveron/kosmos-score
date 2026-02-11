import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Activity,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { Badge } from '@/design-system/primitives/badge';
import { Progress } from '@/design-system/primitives/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/design-system/lib/utils';

// Tipos para métricas
interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

interface ForecastData {
  month: string;
  projected: number;
  achieved: number;
  probability: number;
}

interface GoalData {
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

interface PipelineHealth {
  stage: string;
  count: number;
  value: number;
  averageTime: number;
  conversionRate: number;
}

export function CrmDashboardPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Dados mockados - em produção viriam da API
  const metrics: MetricCard[] = [
    {
      title: 'Receita do Mês',
      value: 'R$ 127.890',
      change: 12.5,
      changeLabel: 'vs mês anterior',
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: 'Novos Deals',
      value: 42,
      change: -5.2,
      changeLabel: 'vs mês anterior',
      icon: Target,
      trend: 'down',
    },
    {
      title: 'Taxa de Conversão',
      value: '23.4%',
      change: 3.1,
      changeLabel: 'vs mês anterior',
      icon: TrendingUp,
      trend: 'up',
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 3.045',
      change: 8.7,
      changeLabel: 'vs mês anterior',
      icon: Activity,
      trend: 'up',
    },
  ];

  const forecastData: ForecastData[] = [
    { month: 'Jan', projected: 95000, achieved: 92000, probability: 97 },
    { month: 'Fev', projected: 110000, achieved: 115000, probability: 104 },
    { month: 'Mar', projected: 125000, achieved: 127890, probability: 102 },
    { month: 'Abr', projected: 140000, achieved: 0, probability: 78 },
    { month: 'Mai', projected: 155000, achieved: 0, probability: 65 },
    { month: 'Jun', projected: 170000, achieved: 0, probability: 52 },
  ];

  const goals: GoalData[] = [
    {
      name: 'Meta de Vendas Q1',
      target: 350000,
      current: 334890,
      deadline: '31/03/2024',
      status: 'on-track',
    },
    {
      name: 'Novos Clientes',
      target: 50,
      current: 42,
      deadline: '31/03/2024',
      status: 'at-risk',
    },
    {
      name: 'Taxa de Conversão',
      target: 25,
      current: 23.4,
      deadline: '30/04/2024',
      status: 'on-track',
    },
    {
      name: 'Redução de Churn',
      target: 5,
      current: 7.2,
      deadline: '30/06/2024',
      status: 'behind',
    },
  ];

  const pipelineHealth: PipelineHealth[] = [
    {
      stage: 'Prospecção',
      count: 127,
      value: 381000,
      averageTime: 3,
      conversionRate: 42,
    },
    {
      stage: 'Qualificação',
      count: 53,
      value: 265000,
      averageTime: 5,
      conversionRate: 65,
    },
    {
      stage: 'Proposta',
      count: 34,
      value: 204000,
      averageTime: 7,
      conversionRate: 78,
    },
    {
      stage: 'Negociação',
      count: 18,
      value: 162000,
      averageTime: 4,
      conversionRate: 85,
    },
    {
      stage: 'Fechamento',
      count: 8,
      value: 127890,
      averageTime: 2,
      conversionRate: 95,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-500';
      case 'at-risk':
        return 'text-yellow-500';
      case 'behind':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return CheckCircle;
      case 'at-risk':
        return AlertTriangle;
      case 'behind':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard CRM</h1>
              <p className="text-muted-foreground mt-1">
                Análise completa de vendas, metas e forecast
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.change !== undefined && (
                  <div className="flex items-center text-xs mt-2">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span
                      className={cn(
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {metric.changeLabel}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Atividades Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>
                    Últimas interações com clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Ligação com João Silva - Empresa ABC', 
                      'Proposta enviada para Maria Santos',
                      'Reunião agendada com Pedro Costa',
                      'Follow-up com Ana Oliveira',
                      'Negociação finalizada com Tech Solutions'].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 bg-primary rounded-full" />
                          <span className="text-sm">{activity}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Vendedores */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Vendedores</CardTitle>
                  <CardDescription>
                    Desempenho da equipe este mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Carlos Mendes', value: 45890, deals: 12 },
                      { name: 'Julia Ferreira', value: 38500, deals: 9 },
                      { name: 'Roberto Lima', value: 32100, deals: 8 },
                      { name: 'Patricia Souza', value: 28900, deals: 7 },
                      { name: 'Lucas Alves', value: 24500, deals: 6 },
                    ].map((seller) => (
                      <div key={seller.name} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{seller.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller.deals} deals fechados
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R$ {seller.value.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Forecast de Vendas</CardTitle>
                <CardDescription>
                  Projeção vs Realizado para os próximos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {forecastData.map((data) => (
                    <div key={data.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{data.month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            Projetado: R$ {data.projected.toLocaleString('pt-BR')}
                          </span>
                          {data.achieved > 0 && (
                            <span className="text-green-600 font-medium">
                              Realizado: R$ {data.achieved.toLocaleString('pt-BR')}
                            </span>
                          )}
                          <Badge
                            variant={data.probability >= 80 ? 'default' : data.probability >= 50 ? 'secondary' : 'destructive'}
                          >
                            {data.probability}% probabilidade
                          </Badge>
                        </div>
                      </div>
                      <Progress value={data.achieved ? (data.achieved / data.projected) * 100 : data.probability} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">R$ 850k</p>
                      <p className="text-sm text-muted-foreground">Total Projetado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ 335k</p>
                      <p className="text-sm text-muted-foreground">Total Realizado</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">68%</p>
                      <p className="text-sm text-muted-foreground">Probabilidade Média</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4">
              {goals.map((goal) => {
                const StatusIcon = getStatusIcon(goal.status);
                const progress = (goal.current / goal.target) * 100;
                
                return (
                  <Card key={goal.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={cn('h-5 w-5', getStatusColor(goal.status))} />
                          <div>
                            <CardTitle className="text-base">{goal.name}</CardTitle>
                            <CardDescription>Prazo: {goal.deadline}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            goal.status === 'on-track'
                              ? 'default'
                              : goal.status === 'at-risk'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {goal.status === 'on-track'
                            ? 'No prazo'
                            : goal.status === 'at-risk'
                            ? 'Em risco'
                            : 'Atrasado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span className="font-medium">
                            {typeof goal.current === 'number' && typeof goal.target === 'number'
                              ? `${goal.current.toLocaleString('pt-BR')} / ${goal.target.toLocaleString('pt-BR')}`
                              : `${goal.current}% / ${goal.target}%`}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {progress.toFixed(1)}% completo
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Relatório de Vendas',
                  description: 'Análise detalhada das vendas do período',
                  icon: DollarSign,
                  action: 'Gerar',
                },
                {
                  title: 'Performance da Equipe',
                  description: 'Desempenho individual dos vendedores',
                  icon: Users,
                  action: 'Visualizar',
                },
                {
                  title: 'Análise de Pipeline',
                  description: 'Status e saúde do funil de vendas',
                  icon: Activity,
                  action: 'Analisar',
                },
                {
                  title: 'Relatório de Conversão',
                  description: 'Taxas de conversão por etapa',
                  icon: TrendingUp,
                  action: 'Explorar',
                },
                {
                  title: 'Análise de Churn',
                  description: 'Clientes perdidos e motivos',
                  icon: AlertTriangle,
                  action: 'Investigar',
                },
                {
                  title: 'ROI de Campanhas',
                  description: 'Retorno sobre investimento em marketing',
                  icon: Target,
                  action: 'Calcular',
                },
              ].map((report) => (
                <Card key={report.title} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <report.icon className="h-8 w-8 text-primary" />
                      <Button size="sm" variant="outline">
                        {report.action}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saúde do Pipeline</CardTitle>
                <CardDescription>
                  Análise detalhada de cada etapa do funil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pipelineHealth.map((stage, index) => (
                    <div key={stage.stage} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold flex items-center gap-2">
                          <div className="h-3 w-3 bg-primary rounded-full" />
                          {stage.stage}
                        </h4>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">
                            {stage.count} deals
                          </Badge>
                          <span className="font-medium">
                            R$ {(stage.value / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tempo médio</p>
                          <p className="font-medium">{stage.averageTime} dias</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa de conversão</p>
                          <p className="font-medium">{stage.conversionRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Valor médio</p>
                          <p className="font-medium">
                            R$ {(stage.value / stage.count / 1000).toFixed(1)}k
                          </p>
                        </div>
                      </div>
                      {index < pipelineHealth.length - 1 && (
                        <div className="border-b" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button onClick={() => navigate('/admin/crm/contacts')}>
            <Users className="h-4 w-4 mr-2" />
            Ver Contatos
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/crm/deals')}>
            <Target className="h-4 w-4 mr-2" />
            Gerenciar Deals
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/crm/pipeline')}>
            <Activity className="h-4 w-4 mr-2" />
            Configurar Pipeline
          </Button>
        </div>
      </div>
    </div>
  );
}