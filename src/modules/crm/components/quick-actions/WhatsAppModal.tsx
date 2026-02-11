import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/design-system/primitives/dialog";
import { Button } from "@/design-system/primitives/button";
import { Textarea } from "@/design-system/primitives/textarea";
import { Label } from "@/design-system/primitives/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/primitives/tabs";
import { MessageCircle, Clock, Send, FileText } from "lucide-react";
import { messageTemplates } from "../../hooks/useQuickActions";
import { cn } from "@/design-system/lib/utils";

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: {
    title: string;
    description: string;
    metadata: {
      message: string;
      templateUsed?: string;
      sentAt: string;
    };
  }) => void;
  contactName?: string;
  contactPhone?: string;
}

export function WhatsAppModal({
  open,
  onClose,
  onSend,
  contactName,
  contactPhone
}: WhatsAppModalProps) {
  const [message, setMessage] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  const handleTemplateSelect = (template: typeof messageTemplates.whatsapp[0]) => {
    let content = template.content;
    if (contactName) {
      content = content.replace(/{{nome}}/g, contactName);
    }
    setMessage(content);
    setSelectedTemplate(template.id);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    onSend({
      title: `WhatsApp enviado para ${contactName || contactPhone}`,
      description: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
      metadata: {
        message,
        templateUsed: selectedTemplate || undefined,
        sentAt: new Date().toISOString(),
        phone: contactPhone || ''
      }
    });

    // Reset state
    setMessage("");
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    setMessage("");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Enviar WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Contact Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="font-medium">{contactName || 'Contato sem nome'}</p>
              <p className="text-sm text-muted-foreground">{contactPhone}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Escrever</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {message.length} caracteres
                </p>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione um template</Label>
                <div className="grid gap-2">
                  {messageTemplates.whatsapp.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={cn(
                        "p-3 text-left rounded-lg border transition-all",
                        "hover:bg-muted hover:border-primary/50",
                        selectedTemplate === template.id && "bg-muted border-primary"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.content}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <div className="space-y-2">
                  <Label>Mensagem personalizada</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}