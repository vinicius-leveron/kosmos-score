import { useCallback } from 'react';
import { useEmbed } from '../contexts/EmbedContext';
import { DiagnosticResult } from '../lib/scoring';

interface EmbedMessage {
  type: 'maturityDiagnostic';
  step: 'welcome' | 'questions' | 'result';
  email?: string;
  level?: number;
  levelName?: string;
  score?: number;
}

export function useEmbedMessaging() {
  const { isEmbed } = useEmbed();

  const notifyStep = useCallback(
    (step: EmbedMessage['step'], data?: Partial<EmbedMessage>) => {
      if (!isEmbed) return;

      const message: EmbedMessage = {
        type: 'maturityDiagnostic',
        step,
        ...data,
      };

      // Send to parent window
      window.parent.postMessage(message, '*');
    },
    [isEmbed]
  );

  const notifyResult = useCallback(
    (result: DiagnosticResult) => {
      notifyStep('result', {
        email: result.email,
        level: result.level,
        levelName: result.levelInfo.name,
        score: Math.round(result.averageScore * 20), // Convert to 0-100
      });
    },
    [notifyStep]
  );

  return {
    notifyStep,
    notifyResult,
  };
}
