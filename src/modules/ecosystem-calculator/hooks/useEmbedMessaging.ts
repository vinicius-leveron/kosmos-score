import { useCallback, useEffect, useState } from 'react';

type Step = 'welcome' | 'inputs' | 'result';

interface CompleteData {
  email: string;
  potencial: number;
  gap: number;
  nivel: string;
}

export function useEmbedMessaging() {
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    // Check if running in iframe
    setIsEmbed(window !== window.parent);
  }, []);

  const postMessage = useCallback((type: string, data: Record<string, unknown>) => {
    if (isEmbed && window.parent) {
      window.parent.postMessage({ type, ...data }, '*');
    }
  }, [isEmbed]);

  const notifyStep = useCallback((step: Step) => {
    postMessage('KOSMOS_ECOSYSTEM_CALC_STEP', { step });
  }, [postMessage]);

  const notifyComplete = useCallback((data: CompleteData) => {
    postMessage('KOSMOS_ECOSYSTEM_CALC_COMPLETE', { data });
  }, [postMessage]);

  const notifyHeight = useCallback((height: number) => {
    postMessage('KOSMOS_ECOSYSTEM_CALC_HEIGHT', { height });
  }, [postMessage]);

  // Auto-report height changes
  useEffect(() => {
    if (!isEmbed) return;

    const observer = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      notifyHeight(height);
    });

    observer.observe(document.body);
    return () => observer.disconnect();
  }, [isEmbed, notifyHeight]);

  return {
    isEmbed,
    notifyStep,
    notifyComplete,
    notifyHeight,
  };
}
