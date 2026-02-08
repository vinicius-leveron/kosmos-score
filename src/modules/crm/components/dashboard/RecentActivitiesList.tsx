import { Activity, ChevronRight, MessageSquare, Phone, Calendar, FileText, Tag, User, Mail } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RecentActivity } from '../../hooks/useCrmDashboard';
import type { ActivityType } from '../../types';
import { LucideIcon } from 'lucide-react';

interface RecentActivitiesListProps {
  activities: RecentActivity[];
  limit?: number;
  onViewAll?: () => void;
}

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  note: MessageSquare,
  email_sent: Mail,
  email_opened: Mail,
  email_clicked: Mail,
  email_bounced: Mail,
  call: Phone,
  meeting: Calendar,
  form_submitted: FileText,
  stage_changed: Activity,
  score_changed: Activity,
  tag_added: Tag,
  tag_removed: Tag,
  owner_assigned: User,
  whatsapp_sent: MessageSquare,
  whatsapp_read: MessageSquare,
  custom: Activity,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  note: 'bg-blue-500/10 text-blue-500',
  email_sent: 'bg-green-500/10 text-green-500',
  email_opened: 'bg-green-500/10 text-green-500',
  email_clicked: 'bg-green-500/10 text-green-500',
  email_bounced: 'bg-red-500/10 text-red-500',
  call: 'bg-purple-500/10 text-purple-500',
  meeting: 'bg-orange-500/10 text-orange-500',
  form_submitted: 'bg-cyan-500/10 text-cyan-500',
  stage_changed: 'bg-yellow-500/10 text-yellow-500',
  score_changed: 'bg-pink-500/10 text-pink-500',
  tag_added: 'bg-indigo-500/10 text-indigo-500',
  tag_removed: 'bg-gray-500/10 text-gray-500',
  owner_assigned: 'bg-teal-500/10 text-teal-500',
  whatsapp_sent: 'bg-green-500/10 text-green-500',
  whatsapp_read: 'bg-green-500/10 text-green-500',
  custom: 'bg-gray-500/10 text-gray-500',
};

export function RecentActivitiesList({
  activities,
  limit = 10,
  onViewAll,
}: RecentActivitiesListProps) {
  const displayedActivities = activities.slice(0, limit);

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Atividades Recentes</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma atividade registrada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold">Atividades Recentes</h3>
        </div>
        {activities.length > limit && onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Ver todas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {displayedActivities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Activity;
          const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-500/10 text-gray-500';

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">
                    {activity.contactName || activity.contactEmail}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
