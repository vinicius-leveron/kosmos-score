/**
 * FormEditorPage - Page wrapper for FormBuilder
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { FormBuilder } from '../components/builder';
import { useForm } from '../hooks/useForms';

export function FormEditorPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useForm(formId || '');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="text-center">
          <h1 className="text-xl text-kosmos-white mb-2">Erro ao carregar formulário</h1>
          <p className="text-kosmos-gray-400 mb-4">{error.message}</p>
          <Button onClick={() => navigate('/admin/toolkit/forms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return <FormBuilder formId={formId} />;
}
