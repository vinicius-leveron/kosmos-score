import { useEffect, useCallback } from 'react';
import { useEmbed } from '../contexts/EmbedContext';

export function useEmbedMessaging() {
  const { isEmbed } = useEmbed();

  const postToParent = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (!isEmbed) return;
      window.parent.postMessage({ type, payload }, '*');
    },
    [isEmbed],
  );

  // Auto-resize: observe body height and notify parent
  useEffect(() => {
    if (!isEmbed) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height =
          entry.borderBoxSize?.[0]?.blockSize ?? entry.target.scrollHeight;
        postToParent('kosmos-score:resize', { height: Math.ceil(height) });
      }
    });

    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, [isEmbed, postToParent]);

  const notifyStep = useCallback(
    (step: string) => {
      postToParent('kosmos-score:step', { step });
    },
    [postToParent],
  );

  const notifyComplete = useCallback(
    (data: { email: string; score: number; profile: string }) => {
      postToParent('kosmos-score:complete', data);
    },
    [postToParent],
  );

  return { isEmbed, notifyStep, notifyComplete };
}
