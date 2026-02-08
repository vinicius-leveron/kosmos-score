/**
 * ScoresStep - Step 2: Input comparative scores
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

interface ScoreInputProps {
  name: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

function ScoreInput({ name, label, description, min = 0, max = 100, step = 0.1 }: ScoreInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={min}
              max={max}
              step={step}
              placeholder="0.00"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === '' ? null : parseFloat(val));
              }}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}

export function ScoresStep() {
  const pillars = [
    { key: 'causa', label: 'Causa', color: 'text-blue-400' },
    { key: 'cultura', label: 'Cultura', color: 'text-purple-400' },
    { key: 'economia', label: 'Economia', color: 'text-green-400' },
    { key: 'total', label: 'Total', color: 'text-kosmos-orange' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-kosmos-gray-400">
        Preencha os scores comparativos para cada pilar. Todos os valores são de 0 a 100.
      </p>

      {/* Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pilar) => (
          <Card key={pilar.key} className="bg-kosmos-gray-800/50 border-kosmos-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className={`text-base ${pilar.color}`}>
                {pilar.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreInput
                name={`score_${pilar.key}`}
                label="Score do Cliente"
                description="Pontuação obtida pelo cliente"
              />
              <ScoreInput
                name={`market_avg_${pilar.key}`}
                label="Média do Mercado"
                description="Média geral do mercado"
              />
              <ScoreInput
                name={`percentile_${pilar.key}`}
                label="Percentil"
                description="Posição percentil (0-100)"
                min={0}
                max={100}
                step={1}
              />
              <ScoreInput
                name={`top10_${pilar.key}`}
                label="Top 10%"
                description="Score do top 10% do mercado"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Helper text */}
      <div className="p-4 rounded-lg bg-kosmos-gray-800/30 border border-kosmos-gray-700">
        <h4 className="text-sm font-medium text-kosmos-white mb-2">Dica</h4>
        <p className="text-xs text-kosmos-gray-400">
          O percentil indica a posição relativa do cliente. Por exemplo, percentil 75 significa
          que o cliente está melhor que 75% do mercado. O campo "Top 10%" deve conter o score
          mínimo para estar entre os 10% melhores.
        </p>
      </div>
    </div>
  );
}
