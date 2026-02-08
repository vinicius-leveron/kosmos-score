/**
 * SubmissionFunnel - Funnel visualization showing drop-off per question
 */

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { useSubmissions } from '../../hooks/useFormSubmission';
import type { FormWithRelations, FormSubmission } from '../../types/form.types';

interface SubmissionFunnelProps {
  formId: string;
  form: FormWithRelations | undefined;
}

export function SubmissionFunnel({ formId, form }: SubmissionFunnelProps) {
  // Fetch all submissions to calculate funnel
  const { data, isLoading } = useSubmissions(formId, { limit: 1000 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  if (!form || !data?.submissions) {
    return (
      <div className="text-center py-12 text-kosmos-gray-400">
        Nenhum dado disponível
      </div>
    );
  }

  // Calculate funnel data
  const fields = form.fields.filter((f) => f.type !== 'statement').sort((a, b) => a.position - b.position);
  const totalStarted = data.submissions.length;

  const funnelData = fields.map((field, index) => {
    // Count how many submissions answered this field
    const answeredCount = data.submissions.filter((sub) => {
      const answer = sub.answers[field.key];
      return answer && answer.value !== null && answer.value !== undefined && answer.value !== '';
    }).length;

    // Calculate drop-off from previous step
    const previousCount = index === 0 ? totalStarted : funnelData[index - 1]?.answered || 0;
    const dropOff = previousCount - answeredCount;
    const dropOffRate = previousCount > 0 ? (dropOff / previousCount) * 100 : 0;

    return {
      field,
      answered: answeredCount,
      dropOff,
      dropOffRate,
      percentage: totalStarted > 0 ? (answeredCount / totalStarted) * 100 : 0,
    };
  });

  // Find highest drop-off
  const highestDropOff = funnelData.reduce((max, item) =>
    item.dropOffRate > max.dropOffRate ? item : max
  , funnelData[0]);

  return (
    <div className="space-y-6">
      {/* Warning Card */}
      {highestDropOff && highestDropOff.dropOffRate > 20 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium">Alta taxa de abandono detectada</p>
                <p className="text-sm text-kosmos-gray-300 mt-1">
                  A pergunta "{highestDropOff.field.label}" tem uma taxa de abandono de{' '}
                  <strong>{highestDropOff.dropOffRate.toFixed(1)}%</strong>. Considere simplificar
                  ou torná-la opcional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel Visualization */}
      <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>
            Visualize onde os respondentes abandonam o formulário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Started */}
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm text-kosmos-gray-400 text-right">
                Iniciaram
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-10 bg-kosmos-orange rounded transition-all"
                  style={{ width: '100%' }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-medium">
                  {totalStarted}
                </span>
              </div>
              <div className="w-20 text-sm text-kosmos-gray-400">100%</div>
            </div>

            {/* Fields */}
            {funnelData.map((item, index) => (
              <div key={item.field.key} className="flex items-center gap-4">
                <div className="w-32 text-sm text-kosmos-gray-400 text-right truncate" title={item.field.label}>
                  {index + 1}. {item.field.label.substring(0, 15)}...
                </div>
                <div className="flex-1 relative">
                  <div
                    className="h-10 bg-kosmos-orange/80 rounded transition-all"
                    style={{ width: `${item.percentage}%`, minWidth: item.answered > 0 ? '40px' : '0' }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-medium">
                    {item.answered}
                  </span>
                </div>
                <div className="w-20 text-sm">
                  <span className="text-kosmos-gray-400">{item.percentage.toFixed(1)}%</span>
                  {item.dropOffRate > 10 && (
                    <span className="text-red-400 ml-1">
                      (-{item.dropOffRate.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Completed */}
            <div className="flex items-center gap-4 pt-2 border-t border-kosmos-gray-800">
              <div className="w-32 text-sm text-green-400 text-right font-medium">
                Completaram
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-10 bg-green-500 rounded transition-all"
                  style={{
                    width: `${totalStarted > 0 ? (data.submissions.filter((s) => s.status === 'completed').length / totalStarted) * 100 : 0}%`,
                    minWidth: data.submissions.filter((s) => s.status === 'completed').length > 0 ? '40px' : '0',
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-white font-medium">
                  {data.submissions.filter((s) => s.status === 'completed').length}
                </span>
              </div>
              <div className="w-20 text-sm text-green-400 font-medium">
                {totalStarted > 0
                  ? ((data.submissions.filter((s) => s.status === 'completed').length / totalStarted) * 100).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Details */}
      <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
        <CardHeader>
          <CardTitle>Detalhes de Abandono</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData
              .filter((item) => item.dropOffRate > 5)
              .sort((a, b) => b.dropOffRate - a.dropOffRate)
              .slice(0, 5)
              .map((item, index) => (
                <div
                  key={item.field.key}
                  className="flex items-center justify-between p-3 bg-kosmos-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-red-500' : 'bg-kosmos-gray-700'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-kosmos-white">{item.field.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-red-400 font-medium">
                      -{item.dropOffRate.toFixed(1)}%
                    </span>
                    <span className="text-kosmos-gray-500 text-sm ml-2">
                      ({item.dropOff} abandonos)
                    </span>
                  </div>
                </div>
              ))}
            {funnelData.filter((item) => item.dropOffRate > 5).length === 0 && (
              <p className="text-kosmos-gray-400 text-center py-4">
                Nenhum ponto crítico de abandono identificado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
