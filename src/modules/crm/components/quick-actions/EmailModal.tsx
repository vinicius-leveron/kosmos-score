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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/primitives/tabs";
import { Mail, Send, FileText, User } from "lucide-react";
import { messageTemplates } from "../../hooks/useQuickActions";
import { cn } from "@/design-system/lib/utils";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (data: {
    title: string;
    description: string;
    metadata: {
      subject: string;
      body: string;
      templateUsed?: string;
      sentAt: string;
    };
  }) => void;
  contactName?: string;
  contactEmail?: string;
}

export function EmailModal({
  open,
  onClose,
  onSend,
  contactName,
  contactEmail
}: EmailModalProps) {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);

  const handleTemplateSelect = (template: typeof messageTemplates.email[0]) => {
    let content = template.content;
    if (contactName) {
      content = content.replace(/{{nome}}/g, contactName);
    }
    // Replace sender placeholder with a default
    content = content.replace(/{{remetente}}/g, 'Equipe');
    
    setSubject(template.subject);
    setBody(content);
    setSelectedTemplate(template.id);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;

    onSend({
      title: `Email enviado para ${contactName || contactEmail}`,
      description: subject,
      metadata: {
        subject,
        body,
        templateUsed: selectedTemplate || undefined,
        sentAt: new Date().toISOString(),
        email: contactEmail || ''
      }
    });

    // Reset state
    setSubject("");
    setBody("");
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    setSubject("");
    setBody("");
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Enviar Email
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Contact Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{contactName || 'Contato sem nome'}</p>
              <p className="text-sm text-muted-foreground">{contactEmail}</p>
            </div>
          </div>

          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Escrever</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Assunto do email..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Mensagem</Label>
                <Textarea
                  id="body"
                  placeholder="Escreva sua mensagem..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="resize-none font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {body.length} caracteres
                </p>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione um template</Label>
                <div className="grid gap-2">
                  {messageTemplates.email.map((template) => (
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
                          <p className="text-xs font-medium text-muted-foreground">
                            Assunto: {template.subject}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <Label>Assunto personalizado</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem personalizada</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      className="resize-none font-mono text-sm"
                    />
                  </div>
                </>
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
            disabled={!subject.trim() || !body.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}