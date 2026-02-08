/**
 * FormPublicPage - Public form page for respondents
 */

import { useParams } from 'react-router-dom';
import { FileX } from 'lucide-react';
import { FormRuntime } from '../components/runtime';
import { useFormBySlug } from '../hooks/useForms';
import type { FormSubmission } from '../types/form.types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export function FormPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: form, isLoading, error } = useFormBySlug(KOSMOS_ORG_ID, slug || '');

  const handleComplete = (submission: FormSubmission) => {
    console.log('Form completed:', submission);
    // Could redirect to a thank you page or trigger analytics
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange mx-auto mb-4" />
          <p className="text-kosmos-gray-400">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kosmos-black">
        <div className="text-center max-w-md px-4">
          <FileX className="h-16 w-16 text-kosmos-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-kosmos-white mb-2">
            Formulário não encontrado
          </h1>
          <p className="text-kosmos-gray-400">
            O formulário que você está procurando não existe ou não está mais disponível.
          </p>
        </div>
      </div>
    );
  }

  return <FormRuntime form={form} onComplete={handleComplete} />;
}
