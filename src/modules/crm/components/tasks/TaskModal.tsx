import { useState } from 'react';
import { addDays, addHours, format, startOfTomorrow, startOfDay, endOfDay } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Calendar } from '@/design-system/primitives/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/design-system/primitives/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useCreateTask, Task } from '../../hooks/useTasks';
import { useToast } from '@/design-system/primitives/use-toast';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactOrgId?: string;
  dealId?: string;
  companyId?: string;
}

const taskTypes: Array<{ value: Task['type']; label: string }> = [
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'demo', label: 'Demonstração' },
  { value: 'custom', label: 'Personalizada' },
];

const priorities: Array<{ value: Task['priority']; label: string; color: string }> = [
  { value: 'low', label: 'Baixa', color: 'text-gray-600' },
  { value: 'medium', label: 'Média', color: 'text-blue-600' },
  { value: 'high', label: 'Alta', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgente', color: 'text-red-600' },
];

const quickDates = [
  { label: 'Hoje', getValue: () => endOfDay(new Date()) },
  { label: 'Amanhã', getValue: () => endOfDay(startOfTomorrow()) },
  { label: 'Em 3 dias', getValue: () => endOfDay(addDays(new Date(), 3)) },
  { label: 'Próxima semana', getValue: () => endOfDay(addDays(new Date(), 7)) },
  { label: 'Em 2 semanas', getValue: () => endOfDay(addDays(new Date(), 14)) },
];

export function TaskModal({
  open,
  onOpenChange,
  contactOrgId,
  dealId,
  companyId,
}: TaskModalProps) {
  const { toast } = useToast();
  const createTask = useCreateTask();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Task['type']>('follow_up');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<Date>(endOfDay(new Date()));
  const [dueTime, setDueTime] = useState('18:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título da tarefa é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      const dueDateWithTime = new Date(dueDate);
      const [hours, minutes] = dueTime.split(':');
      dueDateWithTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      let reminderAt: string | undefined;
      if (reminderEnabled && reminderTime) {
        const reminderDate = new Date(dueDate);
        const [remHours, remMinutes] = reminderTime.split(':');
        reminderDate.setHours(parseInt(remHours), parseInt(remMinutes), 0, 0);
        reminderAt = reminderDate.toISOString();
      }

      await createTask.mutateAsync({
        title,
        description: description.trim() || undefined,
        type,
        priority,
        due_at: dueDateWithTime.toISOString(),
        reminder_at: reminderAt,
        contact_org_id: contactOrgId,
        deal_id: dealId,
        company_id: companyId,
      });

      toast({
        title: 'Tarefa criada',
        description: 'A tarefa foi adicionada com sucesso',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setType('follow_up');
      setPriority('medium');
      setDueDate(endOfDay(new Date()));
      setDueTime('18:00');
      setReminderEnabled(false);
      setReminderTime('09:00');
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar tarefa',
        description: 'Ocorreu um erro ao criar a tarefa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Crie uma tarefa para acompanhar suas atividades
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ligar para cliente"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as Task['type'])}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Data de Vencimento</Label>
            
            {/* Quick date buttons */}
            <div className="flex flex-wrap gap-2 mb-2">
              {quickDates.map((quick) => (
                <Button
                  key={quick.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueDate(quick.getValue())}
                  className={cn(
                    format(dueDate, 'yyyy-MM-dd') === format(quick.getValue(), 'yyyy-MM-dd') &&
                    'bg-primary text-primary-foreground'
                  )}
                >
                  {quick.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes sobre a tarefa..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reminder"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="reminder" className="text-sm font-normal">
              Adicionar lembrete
            </Label>
            {reminderEnabled && (
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-32 ml-auto"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createTask.isPending}>
            {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}