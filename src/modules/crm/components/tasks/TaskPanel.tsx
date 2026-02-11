import { useState } from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Plus,
  ChevronRight,
  User,
  Phone,
  Mail,
  MessageSquare,
  Video,
  FileText,
  Target,
  Presentation,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { 
  useTasksByContact, 
  useCompleteTask, 
  useCancelTask,
  Task 
} from '../../hooks/useTasks';
import { TaskModal } from './TaskModal';
import { cn } from '@/design-system/lib/utils';

interface TaskPanelProps {
  contactOrgId?: string;
  dealId?: string;
  companyId?: string;
  className?: string;
  onClose?: () => void;
}

const taskIcons = {
  call: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  meeting: Video,
  follow_up: Clock,
  proposal: FileText,
  demo: Presentation,
  custom: Target,
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function TaskPanel({
  contactOrgId,
  dealId,
  companyId,
  className,
  onClose,
}: TaskPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const { data: tasks, isLoading } = useTasksByContact(contactOrgId);
  const completeTask = useCompleteTask();
  const cancelTask = useCancelTask();

  const pendingTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'overdue') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  const handleComplete = async (task: Task) => {
    await completeTask.mutateAsync({
      taskId: task.id,
      outcome: 'Concluído com sucesso',
    });
  };

  const handleCancel = async (taskId: string) => {
    await cancelTask.mutateAsync(taskId);
  };

  const getTaskIcon = (type: Task['type']) => {
    const Icon = taskIcons[type] || Target;
    return <Icon className="h-4 w-4" />;
  };

  const getTaskStatus = (task: Task) => {
    if (task.status === 'overdue' || (task.status === 'pending' && isPast(new Date(task.due_at)))) {
      return { label: 'Atrasada', color: 'text-red-600 dark:text-red-400', icon: AlertTriangle };
    }
    if (task.status === 'completed') {
      return { label: 'Concluída', color: 'text-green-600 dark:text-green-400', icon: CheckCircle2 };
    }
    return { label: 'Pendente', color: 'text-yellow-600 dark:text-yellow-400', icon: Clock };
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Tarefas</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Tarefa
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'completed')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pendentes
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas
              {completedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {completedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma tarefa pendente</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Criar primeira tarefa
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const status = getTaskStatus(task);
                    const StatusIcon = status.icon;
                    const isOverdue = isPast(new Date(task.due_at));

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'group flex items-start gap-3 p-3 rounded-lg border transition-colors',
                          'hover:bg-accent/50 cursor-pointer',
                          isOverdue && 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950'
                        )}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getTaskIcon(task.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <Badge className={cn('flex-shrink-0', priorityColors[task.priority])}>
                              {task.priority === 'urgent' ? 'Urgente' : 
                               task.priority === 'high' ? 'Alta' :
                               task.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                {isOverdue ? 
                                  `Atrasada ${formatDistanceToNow(new Date(task.due_at), { 
                                    locale: ptBR,
                                    addSuffix: false 
                                  })}` :
                                  format(new Date(task.due_at), "dd MMM 'às' HH:mm", { locale: ptBR })
                                }
                              </span>
                            </div>

                            {task.assigned_to && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>Responsável</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComplete(task);
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluir
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(task.id);
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <ScrollArea className="h-[400px]">
              {completedTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma tarefa concluída ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border opacity-75"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-through">{task.title}</p>
                        {task.outcome && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.outcome}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Concluída {formatDistanceToNow(new Date(task.completed_at!), { 
                            locale: ptBR,
                            addSuffix: true 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <TaskModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          contactOrgId={contactOrgId}
          dealId={dealId}
          companyId={companyId}
        />
      </CardContent>
    </Card>
  );
}