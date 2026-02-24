import { useState } from 'react';
import {
  BarChart3,
  GitBranch,
  Mail,
  MessageSquare,
  Target,
  Clock,
  Instagram,
  Zap,
  RefreshCw,
  DollarSign,
  Activity,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { cn } from '@/design-system/lib/utils';
import { OutboundFilterBar, D1FunnelDashboard, D8EmailDashboard } from '../components/outbound';
import { useOutboundFilters } from '../hooks/outbound';

// Tab configuration
const DASHBOARD_TABS = [
  { id: 'overview', label: 'Funil', icon: GitBranch, priority: 'P0' },
  { id: 'sources', label: 'Fontes', icon: Target, priority: 'P1' },
  { id: 'channels', label: 'Canais', icon: MessageSquare, priority: 'P1' },
  { id: 'scoring', label: 'Scoring', icon: Activity, priority: 'P1' },
  { id: 'engagement', label: 'Engajamento', icon: Clock, priority: 'P3' },
  { id: 'operations', label: 'Operações', icon: Instagram, priority: 'P2' },
  { id: 'email', label: 'Email', icon: Mail, priority: 'P0' },
  { id: 'nurture', label: 'Nurture', icon: RefreshCw, priority: 'P2' },
  { id: 'revenue', label: 'Receita', icon: DollarSign, priority: 'P3' },
] as const;

type TabId = (typeof DASHBOARD_TABS)[number]['id'];

export function OutboundDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { filters, setFilters } = useOutboundFilters();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-display font-bold text-kosmos-white">
            Outbound Analytics
          </h1>
          <p className="text-kosmos-gray text-sm mt-1">
            Métricas e performance do motor de outbound
          </p>
        </div>
        <Badge variant="outline" className="text-kosmos-orange border-kosmos-orange">
          Motor v1.0
        </Badge>
      </div>

      {/* Filters */}
      <div className="px-6 py-4">
        <OutboundFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          showCadenceStatus={activeTab === 'overview' || activeTab === 'nurture'}
          showClassificacao={true}
          showSources={activeTab === 'sources'}
          availableSources={[
            'hotmart',
            'ig_hashtag',
            'ig_followers',
            'ig_commenters',
            'youtube',
            'manychat',
            'linkedin',
            'gmaps',
            'ad',
            'outbound',
          ]}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabId)}
        className="flex-1 flex flex-col px-6"
      >
        <TabsList className="w-full justify-start gap-1 bg-kosmos-black-light p-1 rounded-lg overflow-x-auto">
          {DASHBOARD_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap',
                  'data-[state=active]:bg-kosmos-orange data-[state=active]:text-white',
                  'data-[state=inactive]:text-kosmos-gray hover:data-[state=inactive]:text-kosmos-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents */}
        <div className="flex-1 py-6 overflow-y-auto">
          <TabsContent value="overview" className="m-0 space-y-6">
            <D1FunnelDashboard filters={filters} />
          </TabsContent>

          <TabsContent value="sources" className="m-0 space-y-6">
            <D2SourcesPlaceholder />
          </TabsContent>

          <TabsContent value="channels" className="m-0 space-y-6">
            <D3ChannelsPlaceholder />
          </TabsContent>

          <TabsContent value="scoring" className="m-0 space-y-6">
            <D4ScoringPlaceholder />
          </TabsContent>

          <TabsContent value="engagement" className="m-0 space-y-6">
            <D5EngagementPlaceholder />
          </TabsContent>

          <TabsContent value="operations" className="m-0 space-y-6">
            <D6OperationsPlaceholder />
          </TabsContent>

          <TabsContent value="email" className="m-0 space-y-6">
            <D8EmailDashboard filters={filters} />
          </TabsContent>

          <TabsContent value="nurture" className="m-0 space-y-6">
            <D9NurturePlaceholder />
          </TabsContent>

          <TabsContent value="revenue" className="m-0 space-y-6">
            <D10RevenuePlaceholder />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ============================================
// PLACEHOLDER COMPONENTS
// (To be replaced with actual dashboard implementations)
// ============================================

function PlaceholderCard({
  title,
  description,
  priority,
}: {
  title: string;
  description: string;
  priority: string;
}) {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              priority === 'P0' && 'border-red-500 text-red-500',
              priority === 'P1' && 'border-yellow-500 text-yellow-500',
              priority === 'P2' && 'border-blue-500 text-blue-500',
              priority === 'P3' && 'border-gray-500 text-gray-500'
            )}
          >
            {priority}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Skeleton className="h-48 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// D1FunnelPlaceholder removed - using real D1FunnelDashboard component

function D2SourcesPlaceholder() {
  return (
    <PlaceholderCard
      title="D2: Performance por Fonte"
      description="De onde vêm os melhores leads: score médio, classificação, taxa de resposta por fonte"
      priority="P1"
    />
  );
}

function D3ChannelsPlaceholder() {
  return (
    <PlaceholderCard
      title="D3: Performance por Canal"
      description="Email vs DM vs WhatsApp: taxas de envio, entrega, resposta por canal e step"
      priority="P1"
    />
  );
}

function D4ScoringPlaceholder() {
  return (
    <PlaceholderCard
      title="D4: ICP Scoring Health"
      description="Validação do modelo de scoring: distribuição, falsos positivos/negativos"
      priority="P1"
    />
  );
}

function D5EngagementPlaceholder() {
  return (
    <PlaceholderCard
      title="D5: Engagement Heatmap"
      description="Melhores horários e dias para envio: matriz hora x dia com taxas de resposta"
      priority="P3"
    />
  );
}

function D6OperationsPlaceholder() {
  return (
    <>
      <PlaceholderCard
        title="D6: Axiom Operations"
        description="Monitorar ações do Axiom: follows, likes, DMs, erros, warmup"
        priority="P2"
      />
      <PlaceholderCard
        title="D7: ManyChat Inbound"
        description="Performance das automações ManyChat: triggers, conversões, keywords"
        priority="P2"
      />
    </>
  );
}

// D8EmailPlaceholder removed - using real D8EmailDashboard component

function D9NurturePlaceholder() {
  return (
    <PlaceholderCard
      title="D9: Nurture & Re-entry"
      description="Pool de nurture: tamanho, reativações, triggers de re-entry"
      priority="P2"
    />
  );
}

function D10RevenuePlaceholder() {
  return (
    <PlaceholderCard
      title="D10: Revenue & ROI"
      description="Conectar outbound a receita: pipeline, CAC, LTV, ROI por fonte/canal"
      priority="P3"
    />
  );
}
