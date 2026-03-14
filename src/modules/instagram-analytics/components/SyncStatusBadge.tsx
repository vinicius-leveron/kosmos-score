import { Badge } from '@/design-system/primitives/badge';

interface SyncStatusBadgeProps {
  status: string;
  lastSync: string | null;
}

export function SyncStatusBadge({ status, lastSync }: SyncStatusBadgeProps) {
  const formatLastSync = (date: string | null) => {
    if (!date) return 'Nunca sincronizado';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atras`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atras`;
    const days = Math.floor(hours / 24);
    return `${days}d atras`;
  };

  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'outline', label: 'Pendente' },
    syncing: { variant: 'default', label: 'Sincronizando...' },
    completed: { variant: 'secondary', label: formatLastSync(lastSync) },
    error: { variant: 'destructive', label: 'Erro' },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
