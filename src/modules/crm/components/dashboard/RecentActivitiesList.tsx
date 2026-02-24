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
  note: 'text-blue-400',
  email_sent: 'text-green-400',
  email_opened: 'text-green-400',
  email_clicked: 'text-green-400',
  email_bounced: 'text-red-400',
  call: 'text-purple-400',
  meeting: 'text-kosmos-orange',
  form_submitted: 'text-cyan-400',
  stage_changed: 'text-yellow-400',
  score_changed: 'text-pink-400',
  tag_added: 'text-indigo-400',
  tag_removed: 'text-gray-400',
  owner_assigned: 'text-teal-400',
  whatsapp_sent: 'text-green-400',
  whatsapp_read: 'text-green-400',
  custom: 'text-gray-400',
};

export function RecentActivitiesList({
  activities,
  limit = 10,
  onViewAll,
}: RecentActivitiesListProps) {
  const displayedActivities = activities.slice(0, limit);

  if (activities.length === 0) {
    return (
      <div className="card-structural p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-5 bg-purple-500 rounded-r" />
          <Activity className="h-5 w-5 text-purple-400" />
          <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
            Atividades Recentes
          </h3>
        </div>
        <p className="text-sm text-kosmos-gray text-center py-8">
          Nenhuma atividade registrada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="card-structural p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-purple-500 rounded-r" />
          <Activity className="h-5 w-5 text-purple-400" />
          <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
            Atividades Recentes
          </h3>
        </div>
        {activities.length > limit && onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-kosmos-gray hover:text-kosmos-white">
            Ver todas
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {displayedActivities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Activity;
          const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-400';

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-kosmos-black/50 hover:bg-kosmos-black transition-colors"
            >
              <div className={`mt-0.5 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-kosmos-white truncate">{activity.title}</p>
                <p className="text-xs text-kosmos-gray">
                  {activity.contactName || activity.contactEmail}
                </p>
              </div>
              <span className="text-xs text-kosmos-gray whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
