import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Radio,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Mail,
  MessageSquare,
  Send,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { useToast } from '@/design-system/primitives/use-toast';
import { useOutboundInfo, isOutboundContact, useUpdateCadenceStatus } from '../../hooks/useOutboundInfo';
import {
  CADENCE_STATUS_LABELS,
  CHANNEL_IN_LABELS,
  OUTBOUND_COLORS,
  type CadenceStatus,
  type Classificacao,
} from '../../types/outbound';

// Status que o usuário pode selecionar manualmente
const MANUAL_STATUS_OPTIONS: { status: CadenceStatus; label: string; description: string }[] = [
  { status: 'replied', label: 'Respondeu', description: 'Lead respondeu - vai pro pipeline' },
  { status: 'converted', label: 'Converteu', description: 'Fechou negócio - cria deal' },
  { status: 'paused', label: 'Pausar', description: 'Pausar cadência temporariamente' },
  { status: 'nurture', label: 'Nurture', description: 'Mover para nurturing' },
  { status: 'archived', label: 'Arquivar', description: 'Arquivar lead' },
];

interface OutboundInfoSectionProps {
  contactOrgId: string;
}

const statusIcons: Record<string, React.ElementType> = {
  new: Target,
  scoring: TrendingUp,
  enriching: TrendingUp,
  ready: CheckCircle2,
  queued: Clock,
  in_sequence: Send,
  paused: Pause,
  replied: MessageSquare,
  converted: CheckCircle2,
  nurture: Clock,
  archived: Clock,
  unsubscribed: AlertTriangle,
  bounced: AlertTriangle,
};

function getClassificationColor(classificacao: Classificacao | null): string {
  switch (classificacao) {
    case 'A':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'B':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'C':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function getStatusColor(status: CadenceStatus): string {
  const color = OUTBOUND_COLORS[status];
  return color || OUTBOUND_COLORS.new;
}

export function OutboundInfoSection({ contactOrgId }: OutboundInfoSectionProps) {
  const { data: outboundInfo, isLoading } = useOutboundInfo(contactOrgId);
  const updateStatus = useUpdateCadenceStatus();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: CadenceStatus) => {
    try {
      await updateStatus.mutateAsync({ contactOrgId, status: newStatus });
      toast({
        title: 'Status atualizado',
        description: `Status alterado para "${CADENCE_STATUS_LABELS[newStatus]}"`,
      });
    } catch {
      toast({
        title: 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  // Don't render anything if not an outbound contact
  if (!isLoading && !isOutboundContact(outboundInfo)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-dashed border-purple-500/30">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!outboundInfo) return null;

  const StatusIcon = outboundInfo.cadence_status
    ? statusIcons[outboundInfo.cadence_status] || Radio
    : Radio;

  return (
    <Card className="border-dashed border-purple-500/30 bg-purple-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Radio className="h-4 w-4 text-purple-400" />
          Origem: Outbound
          {outboundInfo.do_not_contact && (
            <Badge variant="destructive" className="ml-2 text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Não Contatar
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Row - Dropdown para alterar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 gap-1"
                style={{
                  borderColor: outboundInfo.cadence_status
                    ? getStatusColor(outboundInfo.cadence_status)
                    : undefined,
                  color: outboundInfo.cadence_status
                    ? getStatusColor(outboundInfo.cadence_status)
                    : undefined,
                }}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <StatusIcon className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {outboundInfo.cadence_status
                    ? CADENCE_STATUS_LABELS[outboundInfo.cadence_status]
                    : 'N/A'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {MANUAL_STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.status}
                  onClick={() => handleStatusChange(option.status)}
                  disabled={outboundInfo.cadence_status === option.status}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Classification Row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Classificacao</span>
          <Badge
            variant="outline"
            className={getClassificationColor(outboundInfo.classificacao)}
          >
            {outboundInfo.classificacao
              ? `Classe ${outboundInfo.classificacao}`
              : 'Nao classificado'}
          </Badge>
        </div>

        {/* ICP Score Row */}
        {outboundInfo.score_icp !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ICP Score</span>
            <span className="text-sm font-medium">
              {outboundInfo.score_icp.toFixed(0)}
            </span>
          </div>
        )}

        {/* Channel Row */}
        {outboundInfo.channel_in && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Canal de Entrada</span>
            <Badge variant="secondary" className="text-xs">
              {CHANNEL_IN_LABELS[outboundInfo.channel_in] || outboundInfo.channel_in}
            </Badge>
          </div>
        )}

        {/* Cadence Row */}
        {outboundInfo.cadence_name && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cadencia</span>
            <span className="text-sm">
              {outboundInfo.cadence_name}
              {outboundInfo.cadence_step !== null && (
                <span className="text-muted-foreground ml-1">
                  (Step {outboundInfo.cadence_step})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Last Contacted Row */}
        {outboundInfo.last_contacted && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ultimo Contato</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(outboundInfo.last_contacted), {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Next Action Row */}
        {outboundInfo.next_action_date && outboundInfo.cadence_status === 'in_sequence' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proxima Acao</span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(outboundInfo.next_action_date), {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Tenant Row */}
        {outboundInfo.tenant && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tenant</span>
            <Badge variant="outline" className="text-xs capitalize">
              {outboundInfo.tenant}
            </Badge>
          </div>
        )}

        {/* Link to Outbound Dashboard */}
        <Button asChild variant="outline" size="sm" className="w-full mt-2">
          <Link to="/admin/crm/outbound" className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4" />
            Ver no Dashboard Outbound
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
