import { useCallback, useEffect, useState } from 'react';

type Step = 'welcome' | 'questions' | 'result';

interface CompleteData {
  email: string;
  score: number;
  level: string;
}

export function useEmbedMessaging() {
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    setIsEmbed(window !== window.parent);
  }, []);

  const postMessage = useCallback((type: string, data: Record<string, unknown>) => {
    if (isEmbed && window.parent) {
      window.parent.postMessage({ type, ...data }, '*');
    }
  }, [isEmbed]);

  const notifyStep = useCallback((step: Step) => {
    postMessage('KOSMOS_HT_READINESS_STEP', { step });
  }, [postMessage]);

  const notifyComplete = useCallback((data: CompleteData) => {
    postMessage('KOSMOS_HT_READINESS_COMPLETE', { data });
  }, [postMessage]);

  const notifyHeight = useCallback((height: number) => {
    postMessage('KOSMOS_HT_READINESS_HEIGHT', { height });
  }, [postMessage]);

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
