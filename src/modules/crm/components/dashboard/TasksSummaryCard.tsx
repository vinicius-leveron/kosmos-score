import { CheckSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';

interface TasksSummaryCardProps {
  pending: number;
  overdue: number;
  completedToday: number;
  isLoading?: boolean;
}

export function TasksSummaryCard({
  pending,
  overdue,
  completedToday,
  isLoading,
}: TasksSummaryCardProps) {
  const stats = [
    {
      label: 'Pendentes',
      value: pending,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Atrasadas',
      value: overdue,
      icon: AlertTriangle,
      color: overdue > 0 ? 'text-red-400' : 'text-kosmos-gray',
      bgColor: overdue > 0 ? 'bg-red-500/10' : 'bg-kosmos-black',
    },
    {
      label: 'Concluidas Hoje',
      value: completedToday,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-yellow-500 rounded-r" />
        <CheckSquare className="h-5 w-5 text-yellow-400" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Tarefas
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                'rounded-lg p-4 text-center',
                stat.bgColor
              )}
            >
              <Icon className={cn('h-5 w-5 mx-auto mb-2', stat.color)} />
              <div className={cn('text-2xl font-display font-bold', stat.color)}>
                {isLoading ? '-' : stat.value}
              </div>
              <div className="text-xs text-kosmos-gray mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
