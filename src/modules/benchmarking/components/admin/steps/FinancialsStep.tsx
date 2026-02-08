/**
 * FinancialsStep - Step 3: Input financial metrics
 */

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/design-system/primitives/form';
import { Input } from '@/design-system/primitives/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { DollarSign, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface CurrencyInputProps {
  name: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

function CurrencyInput({ name, label, description, icon }: CurrencyInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm flex items-center gap-2">
            {icon}
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-kosmos-gray-500 text-sm">
                R$
              </span>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                className="pl-10"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? null : parseFloat(val));
                }}
              />
            </div>
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}

function PercentInput({ name, label, description }: { name: string; label: string; description?: string }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type="number"
                min={-100}
                max={1000}
                step={0.1}
                placeholder="0.0"
                className="pr-8"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? null : parseFloat(val));
                }}
              />
              <span className="absolute right-3 top-2.5 text-kosmos-gray-500 text-sm">
                %
              </span>
            </div>
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}

export function FinancialsStep() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-kosmos-gray-400">
        Preencha as métricas financeiras comparativas. Todos os valores em Reais (R$).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Médio */}
        <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-kosmos-orange" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CurrencyInput
              name="ticket_medio"
              label="Cliente"
              description="Ticket médio atual do cliente"
            />
            <CurrencyInput
              name="ticket_medio_benchmark"
              label="Benchmark"
              description="Ticket médio de referência do mercado"
            />
          </CardContent>
        </Card>

        {/* LTV */}
        <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Lifetime Value (LTV)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CurrencyInput
              name="ltv_estimado"
              label="Cliente"
              description="LTV estimado do cliente"
            />
            <CurrencyInput
              name="ltv_benchmark"
              label="Benchmark"
              description="LTV de referência do mercado"
            />
          </CardContent>
        </Card>

        {/* Lucro Oculto */}
        <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Potencial Não Capturado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInput
              name="lucro_oculto"
              label="Lucro Oculto"
              description="Valor estimado que o cliente deixa de capturar"
            />
          </CardContent>
        </Card>

        {/* Projeção de Crescimento */}
        <Card className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Projeção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PercentInput
              name="projecao_crescimento"
              label="Crescimento Projetado"
              description="Percentual de crescimento projetado"
            />
          </CardContent>
        </Card>
      </div>

      {/* Helper text */}
      <div className="p-4 rounded-lg bg-kosmos-gray-800/30 border border-kosmos-gray-700">
        <h4 className="text-sm font-medium text-kosmos-white mb-2">Como calcular</h4>
        <ul className="text-xs text-kosmos-gray-400 space-y-1">
          <li>• <strong>Lucro Oculto:</strong> Diferença entre o potencial de mercado e a receita atual</li>
          <li>• <strong>Projeção:</strong> Crescimento esperado com as melhorias sugeridas</li>
        </ul>
      </div>
    </div>
  );
}
