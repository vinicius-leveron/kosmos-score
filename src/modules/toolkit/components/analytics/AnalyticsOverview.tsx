/**
 * AnalyticsOverview - Overview metrics for form analytics
 */

import { Users, CheckCircle, Clock, TrendingUp, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { FormStats } from '../../types/form.types';

interface AnalyticsOverviewProps {
  formId: string;
  stats: FormStats | null | undefined;
}

export function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
  if (!stats) {
    return (
      <div className="text-center py-12 text-kosmos-gray-400">
        Nenhum dado disponível
      </div>
    );
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const metrics = [
    {
      title: 'Total de Respostas',
      value: stats.total_submissions || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Completadas',
      value: stats.completed_submissions || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Taxa de Conclusão',
      value: `${stats.completion_rate || 0}%`,
      icon: Target,
      color: 'text-kosmos-orange',
      bgColor: 'bg-kosmos-orange/10',
    },
    {
      title: 'Tempo Médio',
      value: formatTime(stats.avg_time_seconds),
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Score Médio',
      value: stats.avg_score !== null ? stats.avg_score.toFixed(1) : '--',
      icon: BarChart3,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Hoje',
      value: stats.submissions_today || 0,
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="bg-kosmos-gray-900 border-kosmos-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-kosmos-white">{metric.value}</p>
                  <p className="text-xs text-kosmos-gray-400">{metric.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kosmos-gray-400">
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-kosmos-white">
              {stats.submissions_this_week || 0}
            </p>
            <p className="text-sm text-kosmos-gray-500">respostas</p>
          </CardContent>
        </Card>

        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kosmos-gray-400">
              Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-kosmos-white">
              {stats.submissions_this_month || 0}
            </p>
            <p className="text-sm text-kosmos-gray-500">respostas</p>
          </CardContent>
        </Card>

        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-kosmos-gray-400">
              Em Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-kosmos-white">
              {stats.in_progress_submissions || 0}
            </p>
            <p className="text-sm text-kosmos-gray-500">incompletas</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
        <CardHeader>
          <CardTitle>Status das Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Completed */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-kosmos-gray-400">Completadas</span>
                <span className="text-kosmos-white">{stats.completed_submissions || 0}</span>
              </div>
              <div className="h-2 bg-kosmos-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${stats.total_submissions ? (stats.completed_submissions / stats.total_submissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-kosmos-gray-400">Em Progresso</span>
                <span className="text-kosmos-white">{stats.in_progress_submissions || 0}</span>
              </div>
              <div className="h-2 bg-kosmos-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all"
                  style={{
                    width: `${stats.total_submissions ? (stats.in_progress_submissions / stats.total_submissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Abandoned */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-kosmos-gray-400">Abandonadas</span>
                <span className="text-kosmos-white">{stats.abandoned_submissions || 0}</span>
              </div>
              <div className="h-2 bg-kosmos-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{
                    width: `${stats.total_submissions ? (stats.abandoned_submissions / stats.total_submissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
