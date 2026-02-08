/**
 * SubmissionsList - List of form submissions with pagination
 */

import { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight, Mail, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
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
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { useSubmissions } from '../../hooks/useFormSubmission';
import type { FormWithRelations, FormSubmission, SubmissionStatus } from '../../types/form.types';

interface SubmissionsListProps {
  formId: string;
  form: FormWithRelations | undefined;
}

const PAGE_SIZE = 10;

export function SubmissionsList({ formId, form }: SubmissionsListProps) {
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const { data, isLoading } = useSubmissions(formId, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completa</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-600">Em progresso</Badge>;
      case 'abandoned':
        return <Badge className="bg-red-600">Abandonada</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as SubmissionStatus | 'all');
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completas</SelectItem>
              <SelectItem value="in_progress">Em progresso</SelectItem>
              <SelectItem value="abandoned">Abandonadas</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-kosmos-gray-400">
            {data?.total || 0} respostas
          </span>
        </div>
      </div>

      {/* Submissions Table */}
      <Card className="bg-kosmos-gray-900 border-kosmos-gray-800">
        <CardContent className="p-0">
          {data?.submissions && data.submissions.length > 0 ? (
            <div className="divide-y divide-kosmos-gray-800">
              {data.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 hover:bg-kosmos-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-kosmos-gray-500" />
                          <span className="text-kosmos-white font-medium">
                            {submission.respondent_email || 'Anônimo'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-kosmos-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(submission.created_at)}
                          </span>
                          {submission.time_spent_seconds > 0 && (
                            <span>
                              Duração: {formatDuration(submission.time_spent_seconds)}
                            </span>
                          )}
                          {submission.score !== null && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Score: {submission.score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Ver detalhes"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(submission);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-kosmos-gray-400">
              Nenhuma resposta encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-kosmos-gray-400">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Submission Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={(open) => !open && setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalhes da Resposta</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-kosmos-gray-400">Email</p>
                    <p className="text-kosmos-white">
                      {selectedSubmission.respondent_email || 'Anônimo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-kosmos-gray-400">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-kosmos-gray-400">Data</p>
                    <p className="text-kosmos-white">
                      {formatDate(selectedSubmission.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-kosmos-gray-400">Duração</p>
                    <p className="text-kosmos-white">
                      {selectedSubmission.time_spent_seconds
                        ? formatDuration(selectedSubmission.time_spent_seconds)
                        : '--'}
                    </p>
                  </div>
                  {selectedSubmission.score !== null && (
                    <div>
                      <p className="text-sm text-kosmos-gray-400">Score</p>
                      <p className="text-2xl font-bold text-kosmos-orange">
                        {selectedSubmission.score}
                      </p>
                    </div>
                  )}
                </div>

                {/* Answers */}
                <div>
                  <h4 className="font-medium text-kosmos-white mb-3">Respostas</h4>
                  <div className="space-y-3">
                    {form?.fields.map((field) => {
                      const answer = selectedSubmission.answers[field.key];
                      if (!answer && field.type === 'statement') return null;

                      return (
                        <div
                          key={field.key}
                          className="p-3 bg-kosmos-gray-800 rounded-lg"
                        >
                          <p className="text-sm text-kosmos-gray-400 mb-1">
                            {field.label}
                          </p>
                          <p className="text-kosmos-white">
                            {answer ? (
                              Array.isArray(answer.value)
                                ? answer.value.join(', ')
                                : String(answer.value)
                            ) : (
                              <span className="text-kosmos-gray-500 italic">
                                Não respondido
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pillar Scores */}
                {selectedSubmission.pillar_scores &&
                  Object.keys(selectedSubmission.pillar_scores).length > 0 && (
                    <div>
                      <h4 className="font-medium text-kosmos-white mb-3">
                        Scores por Pilar
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(selectedSubmission.pillar_scores).map(
                          ([pillar, score]) => (
                            <div
                              key={pillar}
                              className="p-3 bg-kosmos-gray-800 rounded-lg text-center"
                            >
                              <p className="text-sm text-kosmos-gray-400 capitalize">
                                {pillar}
                              </p>
                              <p className="text-xl font-bold text-kosmos-orange">
                                {typeof score === 'number' ? score.toFixed(1) : score}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
