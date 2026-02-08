/**
 * FormBuilderHeader - Header component for the form builder
 * Contains form name, status badge, and action buttons
 */

import * as React from 'react';
import { ArrowLeft, Eye, Save, Globe, GlobeLock, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Input } from '@/design-system/primitives/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import type { Form, FormStatus } from '../../types/form.types';

interface FormBuilderHeaderProps {
  /** The form being edited */
  form: Form;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Callback when form name changes */
  onNameChange: (name: string) => void;
  /** Callback to save form */
  onSave: () => void;
  /** Callback to publish/unpublish form */
  onTogglePublish: () => void;
  /** Callback to preview form */
  onPreview: () => void;
  /** Callback to duplicate form */
  onDuplicate?: () => void;
  /** Callback to delete form */
  onDelete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const STATUS_CONFIG: Record<FormStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  published: { label: 'Publicado', variant: 'default' },
  archived: { label: 'Arquivado', variant: 'outline' },
};

/**
 * Header component for the form builder with form name editing,
 * status display, and action buttons
 */
export function FormBuilderHeader({
  form,
  isSaving = false,
  onNameChange,
  onSave,
  onTogglePublish,
  onPreview,
  onDuplicate,
  onDelete,
  className,
}: FormBuilderHeaderProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(form.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const statusConfig = STATUS_CONFIG[form.status];
  const isPublished = form.status === 'published';

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== form.name) {
      onNameChange(editName.trim());
    } else {
      setEditName(form.name);
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(form.name);
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3',
        className
      )}
    >
      {/* Left section: Back button + Form name + Status */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="h-8 w-[200px] text-lg font-semibold"
              aria-label="Nome do formulario"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold text-foreground hover:text-kosmos-orange transition-colors"
              aria-label="Editar nome do formulario"
            >
              {form.name}
            </button>
          )}

          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          aria-label="Visualizar formulario"
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          aria-label="Salvar alteracoes"
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>

        <Button
          variant={isPublished ? 'outline' : 'default'}
          size="sm"
          onClick={onTogglePublish}
          className={cn(!isPublished && 'bg-kosmos-orange hover:bg-kosmos-orange/90')}
          aria-label={isPublished ? 'Despublicar formulario' : 'Publicar formulario'}
        >
          {isPublished ? (
            <>
              <GlobeLock className="h-4 w-4 mr-1" />
              Despublicar
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-1" />
              Publicar
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Mais opcoes">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDuplicate && (
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar formulario
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir formulario
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
