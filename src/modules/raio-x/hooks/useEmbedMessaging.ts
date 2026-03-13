import { useCallback } from 'react';
import { useEmbed } from '../contexts/EmbedContext';
import type { RaioXProcessResponse } from '../lib/types';

interface EmbedMessage {
  type: 'raioXKosmos';
  step: 'welcome' | 'questions' | 'processing' | 'result';
  email?: string;
  classification?: string;
  score?: number;
}

export function useEmbedMessaging() {
  const { isEmbed } = useEmbed();

  const notifyStep = useCallback(
    (step: EmbedMessage['step'], data?: Partial<EmbedMessage>) => {
      if (!isEmbed) return;

      const message: EmbedMessage = {
        type: 'raioXKosmos',
        step,
        ...data,
      };

      window.parent.postMessage(message, '*');
    },
    [isEmbed]
  );

  const notifyResult = useCallback(
    (result: RaioXProcessResponse) => {
      notifyStep('result', {
        classification: result.classification,
        score: result.score.total,
      });
    },
    [notifyStep]
  );

  return {
    notifyStep,
    notifyResult,
  };
}
