import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/design-system/primitives/dialog";
import { Button } from "@/design-system/primitives/button";
import { Input } from "@/design-system/primitives/input";
import { Textarea } from "@/design-system/primitives/textarea";
import { Label } from "@/design-system/primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/design-system/primitives/select";
import { CheckSquare, Calendar, AlertCircle, Save, Clock } from "lucide-react";
import { taskTypes } from "../../hooks/useQuickActions";
import { cn } from "@/design-system/lib/utils";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    metadata: {
      taskType: string;
      deadline?: string;
      priority: 'low' | 'medium' | 'high';
      createdAt: string;
    };
  }) => void;
  contactName?: string;
}

export function TaskModal({
  open,
  onClose,
  onSave,
  contactName
}: TaskModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [taskType, setTaskType] = React.useState("followup");
  const [deadline, setDeadline] = React.useState("");
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');

  // Set default deadline to tomorrow
  React.useEffect(() => {
    if (open && !deadline) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [open]);

  const handleSave = () => {
    if (!title.trim()) return;

    const taskTypeLabel = taskTypes.find(t => t.value === taskType)?.label || 'Tarefa';

    onSave({
      title: `${taskTypeLabel}: ${title}`,
      description: description || `Tarefa para ${contactName || 'contato'}`,
      metadata: {
        taskType,
        deadline: deadline || undefined,
        priority,
        createdAt: new Date().toISOString()
      }
    });

    // Reset state
    setTitle("");
    setDescription("");
    setTaskType("followup");
    setDeadline("");
    setPriority("medium");
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setTaskType("followup");
    setDeadline("");
    setPriority("medium");
    onClose();
  };

  const priorityOptions = [
    { value: 'low', label: 'Baixa', color: 'text-blue-500 bg-blue-500/10' },
    { value: 'medium', label: 'Média', color: 'text-yellow-500 bg-yellow-500/10' },
    { value: 'high', label: 'Alta', color: 'text-red-500 bg-red-500/10' }
  ];

  const suggestedTitles = [
    'Fazer follow-up',
    'Enviar proposta',
    'Agendar reunião',
    'Enviar material',
    'Ligar para confirmar',
    'Verificar interesse'
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-orange-500" />
            Criar Tarefa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          {contactName && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Tarefa para:</span>
              <span className="font-medium">{contactName}</span>
            </div>
          )}

          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de tarefa</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <span 
                        className={cn("w-2 h-2 rounded-full", `bg-${type.color}-500`)}
                        style={{ backgroundColor: `var(--${type.color}-500)` }}
                      />
                      {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da tarefa</Label>
            <Input
              id="title"
              type="text"
              placeholder="Ex: Enviar proposta comercial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1">
              {suggestedTitles.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setTitle(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setPriority(value as any)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all",
                    "hover:border-primary/50",
                    priority === value && "border-primary",
                    priority === value && color
                  )}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data e hora limite
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            {/* Quick date options */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  today.setHours(18, 0, 0, 0);
                  setDeadline(today.toISOString().slice(0, 16));
                }}
              >
                Hoje 18h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(9, 0, 0, 0);
                  setDeadline(tomorrow.toISOString().slice(0, 16));
                }}
              >
                Amanhã 9h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  nextWeek.setHours(9, 0, 0, 0);
                  setDeadline(nextWeek.toISOString().slice(0, 16));
                }}
              >
                Próxima semana
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Criar Tarefa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}