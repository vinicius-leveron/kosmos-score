/**
 * StakeholdersListPage - Main listing page for stakeholders
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, TrendingUp, Wallet, Search, Filter } from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';

import { useStakeholders, useStakeholderStats } from '../hooks/useStakeholders';
import { StakeholderCard } from '../components/StakeholderCard';
import { StakeholderForm } from '../components/StakeholderForm';
import type { StakeholderType, StakeholderStatus } from '../types/stakeholder.types';
import { STAKEHOLDER_TYPE_LABELS } from '../types/stakeholder.types';

// ============================================================================
// PROPS
// ============================================================================

interface StakeholdersListPageProps {
  organizationId: string;
}

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-kosmos-orange/10 rounded-lg text-kosmos-orange">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Nenhum stakeholder cadastrado
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Comece adicionando os socios, investidores e parceiros da sua comunidade
        para acompanhar sua contribuicao e relacionamentos.
      </p>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar primeiro stakeholder
      </Button>
    </div>
  );
}

// ============================================================================
// LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export function StakeholdersListPage({ organizationId }: StakeholdersListPageProps) {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<StakeholderType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StakeholderStatus | 'all'>('all');

  const { data: stakeholders, isLoading } = useStakeholders(organizationId);
  const { data: stats } = useStakeholderStats(organizationId);

  // Filter stakeholders
  const filteredStakeholders = stakeholders?.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || s.stakeholder_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stakeholders</h1>
          <p className="text-muted-foreground">
            Gerencie os socios e parceiros da sua comunidade
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total de Stakeholders"
            value={stats.total_stakeholders}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Ativos"
            value={stats.active_stakeholders}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label="Score Medio"
            value={stats.avg_score.toFixed(0)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="Total Investido"
            value={formatCurrency(stats.total_investment)}
            icon={<Wallet className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as StakeholderType | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {(Object.entries(STAKEHOLDER_TYPE_LABELS) as [StakeholderType, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StakeholderStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="exited">Saiu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : !stakeholders?.length ? (
        <EmptyState onAdd={() => setIsFormOpen(true)} />
      ) : filteredStakeholders?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum stakeholder encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStakeholders?.map((stakeholder) => (
            <StakeholderCard
              key={stakeholder.id}
              stakeholder={stakeholder}
              onClick={() => navigate(`/stakeholders/${stakeholder.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Stakeholder</DialogTitle>
          </DialogHeader>
          <StakeholderForm
            organizationId={organizationId}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
