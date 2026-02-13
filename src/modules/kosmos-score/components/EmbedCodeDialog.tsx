import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/design-system/primitives/dialog';
import { Button } from '@/design-system/primitives/button';
import { Code, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbedCodeDialogProps {
  quizUrl: string;
}

export function EmbedCodeDialog({ quizUrl }: EmbedCodeDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const origin = window.location.origin;

  const embedCode = `<!-- KOSMOS Score Embed -->
<iframe
  src="${quizUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border:none; max-width:720px; margin:0 auto; display:block;"
  allow="clipboard-write"
  id="kosmos-score-embed"
  title="KOSMOS Score - Auditoria de Lucro Oculto"
></iframe>
<script>
  window.addEventListener('message', function(e) {
    if (e.origin !== '${origin}') return;
    if (e.data && e.data.type === 'kosmos-score:resize') {
      var iframe = document.getElementById('kosmos-score-embed');
      if (iframe) iframe.style.height = e.data.payload.height + 'px';
    }
  });
</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: 'Codigo copiado!',
        description: 'Cole o codigo no HTML da sua pagina.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Selecione o codigo manualmente e copie com Ctrl+C.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Codigo de embed">
          <Code className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Embed KOSMOS Score</DialogTitle>
          <DialogDescription>
            Cole este codigo no HTML da pagina onde deseja exibir o quiz. O iframe se ajusta automaticamente ao conteudo.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
            <code>{embedCode}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleCopy}
            aria-label="Copiar codigo"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
