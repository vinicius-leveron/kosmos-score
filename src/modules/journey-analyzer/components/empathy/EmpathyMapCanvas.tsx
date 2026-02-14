import { useState, type KeyboardEvent } from 'react';
import { Plus, X, Loader2, MessageCircle, Brain, Zap, Heart } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateEmpathyMap,
  useAddEmpathyMapItem,
  useRemoveEmpathyMapItem,
} from '../../hooks';
import type { JourneyEmpathyMap, JourneyPersona, EmpathyQuadrant } from '../../types';

interface EmpathyMapCanvasProps {
  /** The project ID */
  projectId: string;
  /** Existing empathy maps for this project */
  empathyMaps: JourneyEmpathyMap[];
  /** Available personas to associate with empathy maps */
  personas: JourneyPersona[];
}

const QUADRANTS: {
  key: EmpathyQuadrant;
  label: string;
  color: string;
  icon: typeof MessageCircle;
  placeholder: string;
}[] = [
  { key: 'says', label: 'Diz', color: '#8b5cf6', icon: MessageCircle, placeholder: 'O que a persona diz...' },
  { key: 'thinks', label: 'Pensa', color: '#6366f1', icon: Brain, placeholder: 'O que a persona pensa...' },
  { key: 'does', label: 'Faz', color: '#0ea5e9', icon: Zap, placeholder: 'O que a persona faz...' },
  { key: 'feels', label: 'Sente', color: '#f59e0b', icon: Heart, placeholder: 'O que a persona sente...' },
];

/**
 * EmpathyMapCanvas - A 2x2 grid canvas for the four empathy map quadrants.
 * Each quadrant allows adding and removing items inline.
 */
export function EmpathyMapCanvas({ projectId, empathyMaps, personas }: EmpathyMapCanvasProps) {
  const { toast } = useToast();
  const createMap = useCreateEmpathyMap();
  const addItem = useAddEmpathyMapItem();
  const removeItem = useRemoveEmpathyMapItem();
  const [inputs, setInputs] = useState<Record<EmpathyQuadrant, string>>({
    says: '', thinks: '', does: '', feels: '',
  });

  const activeMap = empathyMaps[0];
  const linkedPersona = activeMap?.persona_id
    ? personas.find((p) => p.id === activeMap.persona_id)
    : null;

  const handleCreateMap = async () => {
    try {
      await createMap.mutateAsync({ project_id: projectId });
      toast({ title: 'Mapa criado', description: 'O mapa de empatia foi criado com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel criar o mapa.', variant: 'destructive' });
    }
  };

  const handleAddItem = async (quadrant: EmpathyQuadrant) => {
    const value = inputs[quadrant].trim();
    if (!value || !activeMap) return;

    try {
      await addItem.mutateAsync({ id: activeMap.id, quadrant, item: value, projectId });
      setInputs((prev) => ({ ...prev, [quadrant]: '' }));
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel adicionar o item.', variant: 'destructive' });
    }
  };

  const handleRemoveItem = async (quadrant: EmpathyQuadrant, index: number) => {
    if (!activeMap) return;
    try {
      await removeItem.mutateAsync({ id: activeMap.id, quadrant, index, projectId });
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel remover o item.', variant: 'destructive' });
    }
  };

  const handleKeyDown = (quadrant: EmpathyQuadrant, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem(quadrant);
    }
  };

  // Empty state: no empathy map yet
  if (!activeMap) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Nenhum mapa de empatia</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          Crie um mapa de empatia para entender o que sua persona diz, pensa, faz e sente.
        </p>
        <Button onClick={handleCreateMap} disabled={createMap.isPending}>
          {createMap.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Plus className="mr-2 h-4 w-4" />
          Criar Mapa de Empatia
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {linkedPersona && (
        <p className="text-sm text-muted-foreground">
          Mapa vinculado a: <span className="font-medium text-foreground">{linkedPersona.name}</span>
        </p>
      )}

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {QUADRANTS.map(({ key, label, color, icon: Icon, placeholder }) => (
          <div key={key} className="rounded-lg border border-border bg-card">
            {/* Quadrant header */}
            <div
              className="flex items-center gap-2 rounded-t-lg px-3 py-2"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
              <h4 className="text-sm font-semibold" style={{ color }}>{label}</h4>
              <span className="ml-auto text-xs text-muted-foreground">
                {(activeMap[key] as string[]).length}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-1.5 p-3">
              {(activeMap[key] as string[]).map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm"
                >
                  <span className="flex-1 break-words">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(key, i)}
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    aria-label={`Remover "${item}" de ${label}`}
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}

              {/* Inline add input */}
              <div className="flex gap-1.5 pt-1">
                <Input
                  value={inputs[key]}
                  onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={(e) => handleKeyDown(key, e)}
                  placeholder={placeholder}
                  className="h-8 text-sm"
                  aria-label={`Adicionar item em ${label}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleAddItem(key)}
                  disabled={!inputs[key].trim() || addItem.isPending}
                  aria-label={`Adicionar em ${label}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
