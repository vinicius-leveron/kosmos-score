import { useParams } from 'react-router-dom';
import { useRaioXResult } from '../hooks/useRaioXResult';
import { ResultScreen } from '../components/result/ResultScreen';
import { EmbedProvider } from '../contexts/EmbedContext';

function RaioXResultContent() {
  const { id } = useParams<{ id: string }>();
  const { data: result, isLoading, error } = useRaioXResult(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-kosmos-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kosmos-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-kosmos-gray text-sm">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-kosmos-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-kosmos-orange font-display text-6xl font-bold mb-4">404</p>
          <h1 className="text-kosmos-white font-display text-xl font-bold mb-2">
            Resultado não encontrado
          </h1>
          <p className="text-kosmos-gray text-sm">
            Este Raio-X pode ter expirado ou o link está incorreto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResultScreen
      outputs={result.outputs}
      score={result.score}
      respondentName={result.respondent_name}
      resultId={result.id}
    />
  );
}

export function RaioXResultPage() {
  return (
    <EmbedProvider>
      <RaioXResultContent />
    </EmbedProvider>
  );
}
