import { useState, useCallback, type KeyboardEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/design-system/primitives/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreatePersona, useUpdatePersona } from '../../hooks';
import { personaSchema } from '../../schemas';
import type { JourneyPersona } from '../../types';

interface PersonaFormProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to toggle dialog open state */
  onOpenChange: (open: boolean) => void;
  /** The project this persona belongs to */
  projectId: string;
  /** If provided, the form is in edit mode for this persona */
  persona?: JourneyPersona;
}

const TAG_FIELDS = [
  { key: 'goals', label: 'Objetivos', placeholder: 'Ex: Aumentar engajamento' },
  { key: 'pain_points', label: 'Dores', placeholder: 'Ex: Falta de tempo' },
  { key: 'behaviors', label: 'Comportamentos', placeholder: 'Ex: Usa Instagram diariamente' },
  { key: 'motivations', label: 'Motivacoes', placeholder: 'Ex: Crescer a comunidade' },
] as const;

type TagFieldKey = (typeof TAG_FIELDS)[number]['key'];

/**
 * PersonaForm - Dialog form to create or edit a persona.
 * Supports tag-like inputs for goals, pain_points, behaviors, and motivations.
 */
export function PersonaForm({ open, onOpenChange, projectId, persona }: PersonaFormProps) {
  const { toast } = useToast();
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();
  const isEditing = !!persona;

  const [name, setName] = useState(persona?.name ?? '');
  const [role, setRole] = useState(persona?.role ?? '');
  const [ageRange, setAgeRange] = useState(persona?.age_range ?? '');
  const [bio, setBio] = useState(persona?.bio ?? '');
  const [tags, setTags] = useState<Record<TagFieldKey, string[]>>({
    goals: persona?.goals ?? [],
    pain_points: persona?.pain_points ?? [],
    behaviors: persona?.behaviors ?? [],
    motivations: persona?.motivations ?? [],
  });
  const [tagInputs, setTagInputs] = useState<Record<TagFieldKey, string>>({
    goals: '',
    pain_points: '',
    behaviors: '',
    motivations: '',
  });

  const isSubmitting = createPersona.isPending || updatePersona.isPending;

  const handleTagKeyDown = useCallback(
    (field: TagFieldKey, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const value = tagInputs[field].trim();
      if (!value) return;
      if (tags[field].includes(value)) return;

      setTags((prev) => ({ ...prev, [field]: [...prev[field], value] }));
      setTagInputs((prev) => ({ ...prev, [field]: '' }));
    },
    [tagInputs, tags],
  );

  const removeTag = useCallback((field: TagFieldKey, index: number) => {
    setTags((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async () => {
    const parsed = personaSchema.safeParse({
      name: name.trim(),
      role: role.trim() || undefined,
      age_range: ageRange.trim() || undefined,
      bio: bio.trim() || undefined,
      ...tags,
    });
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || 'Dados invalidos';
      toast({ title: firstError, variant: 'destructive' });
      return;
    }

    try {
      if (isEditing && persona) {
        await updatePersona.mutateAsync({
          id: persona.id,
          name: name.trim(),
          role: role.trim() || null,
          age_range: ageRange.trim() || null,
          bio: bio.trim() || null,
          ...tags,
        });
        toast({ title: 'Persona atualizada', description: `"${name.trim()}" foi atualizada com sucesso.` });
      } else {
        await createPersona.mutateAsync({
          project_id: projectId,
          name: name.trim(),
          role: role.trim() || undefined,
          age_range: ageRange.trim() || undefined,
          bio: bio.trim() || undefined,
          ...tags,
        });
        toast({ title: 'Persona criada', description: `"${name.trim()}" foi adicionada ao projeto.` });
      }
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro', description: 'Nao foi possivel salvar a persona.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Persona' : 'Nova Persona'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name (required) */}
          <div className="space-y-1.5">
            <Label htmlFor="persona-name">Nome *</Label>
            <Input id="persona-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da persona" />
          </div>

          {/* Role + Age Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="persona-role">Papel / Cargo</Label>
              <Input id="persona-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex: Community Manager" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="persona-age">Faixa etaria</Label>
              <Input id="persona-age" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="Ex: 25-35" />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="persona-bio">Bio</Label>
            <Textarea id="persona-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Breve descricao da persona..." rows={3} />
          </div>

          {/* Tag fields */}
          {TAG_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`persona-${key}`}>{label}</Label>
              <Input
                id={`persona-${key}`}
                value={tagInputs[key]}
                onChange={(e) => setTagInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={(e) => handleTagKeyDown(key, e)}
                placeholder={`${placeholder} (Enter para adicionar)`}
              />
              {tags[key].length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags[key].map((tag, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(key, i)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        aria-label={`Remover ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Salvar' : 'Criar Persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
