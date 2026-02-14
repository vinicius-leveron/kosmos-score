/**
 * CompetitorForm - Dialog for adding a new competitor by Instagram handle
 */

import { useState } from 'react';
import { Instagram, Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateCompetitor, validateInstagramHandle } from '../hooks/useCompetitorAnalysis';

interface CompetitorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompetitorForm({ open, onOpenChange }: CompetitorFormProps) {
  const [handle, setHandle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  const createCompetitor = useCreateCompetitor();

  const handleChange = (value: string) => {
    setHandle(value);
    if (validationError && value.trim()) {
      const result = validateInstagramHandle(value);
      if (result.success) {
        setValidationError(null);
      }
    }
  };

  const handleBlur = () => {
    if (!handle.trim()) return;
    const result = validateInstagramHandle(handle);
    if (!result.success) {
      setValidationError(result.error ?? null);
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateInstagramHandle(handle);
    if (!result.success) {
      setValidationError(result.error ?? null);
      return;
    }

    try {
      const { profile } = await createCompetitor.mutateAsync(handle);
      toast({
        title: 'Análise iniciada',
        description: `Pipeline de análise para @${profile.instagram_handle} foi iniciado.`,
      });
      setHandle('');
      setValidationError(null);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar análise';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setHandle('');
        setValidationError(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" aria-hidden="true" />
            Analisar concorrente
          </DialogTitle>
          <DialogDescription>
            Insira o handle do Instagram do concorrente. O sistema vai descobrir automaticamente
            canais, produtos e gerar uma análise completa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="instagram-handle">Handle do Instagram</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  id="instagram-handle"
                  placeholder="concorrente"
                  value={handle}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  className={`pl-8 ${validationError ? 'border-destructive' : ''}`}
                  autoFocus
                  disabled={createCompetitor.isPending}
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? 'handle-error' : 'handle-hint'}
                />
              </div>
              {validationError ? (
                <p id="handle-error" className="text-xs text-destructive" role="alert">
                  {validationError}
                </p>
              ) : (
                <p id="handle-hint" className="text-xs text-muted-foreground">
                  Exemplo: @nfrfrankfurt, @marketingdigital
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCompetitor.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!handle.trim() || !!validationError || createCompetitor.isPending}
            >
              {createCompetitor.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Iniciando...
                </>
              ) : (
                'Iniciar análise'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
