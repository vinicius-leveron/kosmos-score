/**
 * InsightsStep - Step 4: Input qualitative insights
 */

import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, X, GripVertical, CheckCircle, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/design-system/primitives/form';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';

interface ListInputProps {
  name: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  placeholder: string;
}

function ListInput({ name, label, icon, color, placeholder }: ListInputProps) {
  const { control, watch, setValue } = useFormContext();
  const [newItem, setNewItem] = useState('');

  const items: string[] = watch(`insights.${name}`) || [];

  const addItem = () => {
    if (newItem.trim()) {
      setValue(`insights.${name}`, [...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setValue(
      `insights.${name}`,
      items.filter((_, i) => i !== index)
    );
  };

  return (
    <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className={`text-base flex items-center gap-2 ${color}`}>
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
          />
          <Button type="button" size="icon" variant="secondary" onClick={addItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-2 rounded bg-kosmos-gray-900/50 group"
              >
                <GripVertical className="h-4 w-4 text-kosmos-gray-600" />
                <span className="flex-1 text-sm">{item}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {items.length === 0 && (
          <p className="text-xs text-kosmos-gray-500 text-center py-2">
            Nenhum item adicionado
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActionPlanSection() {
  const { control, watch, setValue } = useFormContext();
  const [newAction, setNewAction] = useState({ acao: '', impacto: 'medio' as const });

  const actions: { prioridade: number; acao: string; impacto: 'alto' | 'medio' | 'baixo' }[] =
    watch('insights.plano_acao') || [];

  const addAction = () => {
    if (newAction.acao.trim()) {
      setValue('insights.plano_acao', [
        ...actions,
        {
          prioridade: actions.length + 1,
          acao: newAction.acao.trim(),
          impacto: newAction.impacto,
        },
      ]);
      setNewAction({ acao: '', impacto: 'medio' });
    }
  };

  const removeAction = (index: number) => {
    const newActions = actions
      .filter((_, i) => i !== index)
      .map((action, i) => ({ ...action, prioridade: i + 1 }));
    setValue('insights.plano_acao', newActions);
  };

  const getImpactBadge = (impacto: string) => {
    switch (impacto) {
      case 'alto':
        return <Badge className="bg-red-600">Alto</Badge>;
      case 'medio':
        return <Badge className="bg-yellow-600">Médio</Badge>;
      case 'baixo':
        return <Badge className="bg-blue-600">Baixo</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-kosmos-orange">
          <Target className="h-5 w-5" />
          Plano de Ação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Descreva a ação recomendada..."
            className="flex-1"
            value={newAction.acao}
            onChange={(e) => setNewAction({ ...newAction, acao: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
          />
          <Select
            value={newAction.impacto}
            onValueChange={(value: 'alto' | 'medio' | 'baixo') =>
              setNewAction({ ...newAction, impacto: value })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="baixo">Baixo</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="icon" variant="secondary" onClick={addAction}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {actions.length > 0 && (
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li
                key={index}
                className="flex items-center gap-3 p-3 rounded bg-kosmos-gray-900/50 group"
              >
                <span className="w-6 h-6 rounded-full bg-kosmos-orange/20 text-kosmos-orange text-xs flex items-center justify-center font-medium">
                  {action.prioridade}
                </span>
                <span className="flex-1 text-sm">{action.acao}</span>
                {getImpactBadge(action.impacto)}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAction(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {actions.length === 0 && (
          <p className="text-xs text-kosmos-gray-500 text-center py-2">
            Nenhuma ação adicionada
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm text-kosmos-gray-400">
        Adicione insights qualitativos da análise. Estes textos serão exibidos no dashboard do cliente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListInput
          name="pontos_fortes"
          label="Pontos Fortes"
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-green-400"
          placeholder="Adicionar ponto forte..."
        />

        <ListInput
          name="oportunidades"
          label="Oportunidades"
          icon={<Lightbulb className="h-5 w-5" />}
          color="text-yellow-400"
          placeholder="Adicionar oportunidade..."
        />

        <ListInput
          name="riscos"
          label="Riscos"
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-red-400"
          placeholder="Adicionar risco..."
        />
      </div>

      <ActionPlanSection />

      {/* Qualitative Analysis */}
      <FormField
        control={control}
        name="insights.analise_qualitativa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Análise Qualitativa</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Escreva uma análise detalhada sobre o benchmark do cliente..."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
