import { Button } from '@/design-system/primitives/button';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  MessageSquare,
  Mail,
  MailOpen,
  MousePointer,
  Phone,
  Calendar,
  FileText,
  ArrowRight,
  TrendingUp,
  Tag,
  User,
  MessageCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import type { ActivityType } from '../../types';

interface ActivityTimelineProps {
  contactOrgId: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  email_opened: <MailOpen className="h-4 w-4" />,
  email_clicked: <MousePointer className="h-4 w-4" />,
  email_bounced: <AlertCircle className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  form_submitted: <FileText className="h-4 w-4" />,
  stage_changed: <ArrowRight className="h-4 w-4" />,
  score_changed: <TrendingUp className="h-4 w-4" />,
  tag_added: <Tag className="h-4 w-4" />,
  tag_removed: <Tag className="h-4 w-4" />,
  owner_assigned: <User className="h-4 w-4" />,
  whatsapp_sent: <MessageCircle className="h-4 w-4" />,
  whatsapp_read: <MessageCircle className="h-4 w-4" />,
  custom: <FileText className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
  note: 'bg-blue-500/20 text-blue-500',
  email_sent: 'bg-indigo-500/20 text-indigo-500',
  email_opened: 'bg-green-500/20 text-green-500',
  email_clicked: 'bg-emerald-500/20 text-emerald-500',
  email_bounced: 'bg-red-500/20 text-red-500',
  call: 'bg-amber-500/20 text-amber-500',
  meeting: 'bg-purple-500/20 text-purple-500',
  form_submitted: 'bg-cyan-500/20 text-cyan-500',
  stage_changed: 'bg-orange-500/20 text-orange-500',
  score_changed: 'bg-yellow-500/20 text-yellow-500',
  tag_added: 'bg-pink-500/20 text-pink-500',
  tag_removed: 'bg-gray-500/20 text-gray-500',
  owner_assigned: 'bg-violet-500/20 text-violet-500',
  whatsapp_sent: 'bg-green-500/20 text-green-500',
  whatsapp_read: 'bg-green-600/20 text-green-600',
  custom: 'bg-slate-500/20 text-slate-500',
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function ActivityTimeline({ contactOrgId }: ActivityTimelineProps) {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useActivities(contactOrgId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 text-center py-4">
        Erro ao carregar atividades
      </div>
    );
  }

  const activities = data?.pages.flatMap((page) => page.data) || [];

  if (activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Nenhuma atividade registrada
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex gap-3 py-3 relative"
        >
          {/* Timeline line */}
          {index < activities.length - 1 && (
            <div className="absolute left-4 top-11 bottom-0 w-px bg-border" />
          )}

          {/* Icon */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              activityColors[activity.type as ActivityType] || activityColors.custom
            }`}
          >
            {activityIcons[activity.type as ActivityType] || activityIcons.custom}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-sm">{activity.title}</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(activity.created_at)}
              </div>
            </div>

            {activity.description && (
              <div className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                {activity.description}
              </div>
            )}

            {activity.actor_name && (
              <div className="text-xs text-muted-foreground mt-1">
                por {activity.actor_name}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasNextPage && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              'Carregando...'
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Ver mais
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
