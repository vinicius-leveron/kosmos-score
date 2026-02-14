import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { useClientContext } from '../../contexts/ClientAccessContext';

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baixa',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Clock,
  pending: AlertCircle,
};

export function ClientActionPlanPanel() {
  const { data } = useClientContext();
  const { actions, ideas } = data;

  const selectedIdeas = ideas.filter((i) => i.status === 'selected');

  if (actions.length === 0 && selectedIdeas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma acao planejada ainda</p>
        </CardContent>
      </Card>
    );
  }

  // Group actions by category
  const grouped = actions.reduce<Record<string, typeof actions>>((acc, action) => {
    const cat = (action as Record<string, unknown>).category as string || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(action);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Selected Solutions */}
      {selectedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Solucoes Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedIdeas.map((idea) => (
                <div key={idea.id} className="p-4 rounded-lg border border-green-200 bg-green-50/50">
                  <p className="text-sm font-medium">{idea.title}</p>
                  {idea.description && (
                    <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {idea.impact && (
                      <Badge variant="outline" className="text-xs">
                        Impacto: {idea.impact}/5
                      </Badge>
                    )}
                    {idea.effort && (
                      <Badge variant="outline" className="text-xs">
                        Esforco: {idea.effort}/5
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      {Object.entries(grouped).map(([category, categoryActions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryActions.map((action) => {
                const StatusIcon = STATUS_ICONS[action.status] || AlertCircle;
                return (
                  <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${
                      action.status === 'completed' ? 'text-green-500' :
                      action.status === 'in_progress' ? 'text-blue-500' :
                      'text-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.title}</p>
                      {action.description && (
                        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {action.priority && (
                          <Badge className={`text-xs ${PRIORITY_COLORS[action.priority]}`}>
                            {PRIORITY_LABELS[action.priority] || action.priority}
                          </Badge>
                        )}
                        {action.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Prazo: {new Date(action.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
