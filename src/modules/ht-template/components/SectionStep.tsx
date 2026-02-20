import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { ArrowRight, ArrowLeft, Plus, X, Lightbulb } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { TemplateSection, TemplateData, EXAMPLE_DATA } from '../lib/sections';

interface SectionStepProps {
  section: TemplateSection;
  sectionIndex: number;
  totalSections: number;
  data: TemplateData;
  onUpdate: (sectionId: string, fieldId: string, value: string | string[] | number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoBack: boolean;
}

export function SectionStep({
  section,
  sectionIndex,
  totalSections,
  data,
  onUpdate,
  onNext,
  onPrevious,
  canGoBack,
}: SectionStepProps) {
  const { isEmbed } = useEmbed();
  const [showTips, setShowTips] = useState(false);
  const sectionData = data[section.id] || {};
  const exampleData = EXAMPLE_DATA[section.id] || {};

  const progress = ((sectionIndex + 1) / totalSections) * 100;

  const handleListAdd = (fieldId: string, maxItems: number) => {
    const current = (sectionData[fieldId] as string[]) || [];
    if (current.length < maxItems) {
      onUpdate(section.id, fieldId, [...current, '']);
    }
  };

  const handleListUpdate = (fieldId: string, index: number, value: string) => {
    const current = (sectionData[fieldId] as string[]) || [];
    const updated = [...current];
    updated[index] = value;
    onUpdate(section.id, fieldId, updated);
  };

  const handleListRemove = (fieldId: string, index: number) => {
    const current = (sectionData[fieldId] as string[]) || [];
    onUpdate(section.id, fieldId, current.filter((_, i) => i !== index));
  };

  const fillWithExample = () => {
    Object.entries(exampleData).forEach(([fieldId, value]) => {
      onUpdate(section.id, fieldId, value as string | string[] | number);
    });
  };

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-8"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-kosmos-orange text-xs font-medium uppercase tracking-wider">
              {section.name}
            </span>
            <span className="text-kosmos-gray text-sm">
              {sectionIndex + 1} / {totalSections}
            </span>
          </div>
          <div className="h-2 bg-kosmos-black-light rounded-full overflow-hidden">
            <div
              className="h-full bg-kosmos-orange transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card-structural p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-kosmos-white mb-1">
                {section.name}
              </h2>
              <p className="text-kosmos-gray text-sm">{section.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className="text-kosmos-orange"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillWithExample}
                className="text-xs"
              >
                Ver exemplo
              </Button>
            </div>
          </div>

          {/* Tips */}
          {showTips && (
            <div className="mb-6 p-4 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-lg">
              <p className="text-kosmos-orange text-sm font-medium mb-2">Dicas:</p>
              <ul className="space-y-1">
                {section.tips.map((tip, i) => (
                  <li key={i} className="text-kosmos-gray text-sm flex items-start gap-2">
                    <span className="text-kosmos-orange">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fields */}
          <div className="space-y-6">
            {section.fields.map((field) => (
              <div key={field.id}>
                <Label className="text-kosmos-white mb-2 block">
                  {field.label}
                  {field.required && <span className="text-kosmos-orange ml-1">*</span>}
                </Label>

                {field.type === 'text' && (
                  <Input
                    value={(sectionData[field.id] as string) || ''}
                    onChange={(e) => onUpdate(section.id, field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea
                    value={(sectionData[field.id] as string) || ''}
                    onChange={(e) => onUpdate(section.id, field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white resize-none"
                  />
                )}

                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={(sectionData[field.id] as number) || ''}
                    onChange={(e) => onUpdate(section.id, field.id, parseInt(e.target.value, 10) || 0)}
                    placeholder={field.placeholder}
                    className="bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                  />
                )}

                {field.type === 'select' && field.options && (
                  <Select
                    value={(sectionData[field.id] as string) || ''}
                    onValueChange={(value) => onUpdate(section.id, field.id, value)}
                  >
                    <SelectTrigger className="bg-kosmos-black border-border text-kosmos-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === 'list' && (
                  <div className="space-y-2">
                    {((sectionData[field.id] as string[]) || ['']).map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleListUpdate(field.id, index, e.target.value)}
                          placeholder={field.placeholder}
                          className="flex-1 bg-kosmos-black border-border focus:border-kosmos-orange text-kosmos-white"
                        />
                        {((sectionData[field.id] as string[]) || []).length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleListRemove(field.id, index)}
                            className="text-kosmos-gray hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {((sectionData[field.id] as string[]) || []).length < (field.maxItems || 10) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleListAdd(field.id, field.maxItems || 10)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar item
                      </Button>
                    )}
                  </div>
                )}

                {field.helperText && (
                  <p className="text-kosmos-gray/60 text-xs mt-1">{field.helperText}</p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoBack}
              className="flex-1 h-12"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={onNext}
              className="flex-1 h-12 bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange"
            >
              {sectionIndex === totalSections - 1 ? 'Ver Template' : 'Proximo'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
