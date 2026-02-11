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
import { Phone, Clock, Save, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";
import { cn } from "@/design-system/lib/utils";

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    metadata: {
      duration: number;
      direction: 'inbound' | 'outbound' | 'missed';
      notes: string;
      calledAt: string;
    };
  }) => void;
  contactName?: string;
  contactPhone?: string;
}

export function CallModal({
  open,
  onClose,
  onSave,
  contactName,
  contactPhone
}: CallModalProps) {
  const [direction, setDirection] = React.useState<'inbound' | 'outbound' | 'missed'>('outbound');
  const [duration, setDuration] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleSave = () => {
    const durationInMinutes = parseInt(duration) || 0;
    
    const directionLabels = {
      'inbound': 'Ligação recebida',
      'outbound': 'Ligação realizada',
      'missed': 'Ligação perdida'
    };

    onSave({
      title: `${directionLabels[direction]} - ${contactName || contactPhone}`,
      description: notes || `Duração: ${durationInMinutes} minutos`,
      metadata: {
        duration: durationInMinutes,
        direction,
        notes,
        calledAt: new Date().toISOString(),
        phone: contactPhone || ''
      }
    });

    // Reset state
    setDirection('outbound');
    setDuration("");
    setNotes("");
  };

  const handleClose = () => {
    setDirection('outbound');
    setDuration("");
    setNotes("");
    onClose();
  };

  const directionOptions = [
    { value: 'outbound', label: 'Ligação realizada', icon: PhoneOutgoing },
    { value: 'inbound', label: 'Ligação recebida', icon: PhoneIncoming },
    { value: 'missed', label: 'Ligação perdida', icon: PhoneMissed }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-purple-500" />
            Registrar Ligação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{contactName || 'Contato sem nome'}</p>
              <p className="text-sm text-muted-foreground">{contactPhone}</p>
            </div>
          </div>

          {/* Call Direction */}
          <div className="space-y-2">
            <Label>Tipo de ligação</Label>
            <div className="grid grid-cols-3 gap-2">
              {directionOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setDirection(value as any)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    "hover:bg-muted hover:border-primary/50",
                    direction === value && "bg-muted border-primary"
                  )}
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          {direction !== 'missed' && (
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração (minutos)
              </Label>
              <Input
                id="duration"
                type="number"
                min="0"
                placeholder="Ex: 15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas da ligação</Label>
            <Textarea
              id="notes"
              placeholder="Resumo da conversa, próximos passos, observações..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Quick notes suggestions */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sugestões rápidas</Label>
            <div className="flex flex-wrap gap-2">
              {[
                'Interessado no produto',
                'Solicitou mais informações',
                'Agendar nova ligação',
                'Enviar proposta',
                'Não atendeu',
                'Número incorreto'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setNotes(prev => 
                    prev ? `${prev}\n${suggestion}` : suggestion
                  )}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}