/**
 * FormAnalyticsPage - Analytics dashboard for form submissions
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { useForm } from '../hooks/useForms';
import { useFormStats } from '../hooks/useFormSubmission';
import { AnalyticsOverview } from '../components/analytics/AnalyticsOverview';
import { SubmissionsList } from '../components/analytics/SubmissionsList';
import { SubmissionFunnel } from '../components/analytics/SubmissionFunnel';

export function FormAnalyticsPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { data: form, isLoading: formLoading } = useForm(formId || '');
  const { data: stats, isLoading: statsLoading, refetch } = useFormStats(formId || '');

  if (!formId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="text-center">
          <h1 className="text-xl text-kosmos-white mb-4">Formulário não encontrado</h1>
          <Button onClick={() => navigate('/admin/toolkit/forms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  if (formLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kosmos-black">
      {/* Header */}
      <header className="border-b border-kosmos-gray-800 bg-kosmos-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin/toolkit/forms')}
                aria-label="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-kosmos-white">
                  {form?.name || 'Analytics'}
                </h1>
                <p className="text-sm text-kosmos-gray-400">
                  Dashboard de respostas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="submissions">Respostas</TabsTrigger>
            <TabsTrigger value="funnel">Funil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsOverview formId={formId} stats={stats} />
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionsList formId={formId} form={form} />
          </TabsContent>

          <TabsContent value="funnel">
            <SubmissionFunnel formId={formId} form={form} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
