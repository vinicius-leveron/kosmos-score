/**
 * ConvertToClientModal - Modal to convert a CRM contact to a client organization
 *
 * This modal appears when a contact is moved to a "winning" stage (exit_type: positive).
 * It allows the consultant to create a new client organization for the converted contact.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/design-system/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/design-system/primitives/form';

import { useConvertToClient } from '../../hooks/useOrganizations';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const convertFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  slug: z
    .string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(50, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minusculas, numeros e hifens'),
});

type ConvertFormValues = z.infer<typeof convertFormSchema>;

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ConvertToClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactOrgId: string;
  contactName: string;
  onSuccess?: (organizationId: string) => void;
  onSkip?: () => void;
}

// ============================================================================
// SLUG GENERATOR
// ============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

export function ConvertToClientModal({
  open,
  onOpenChange,
  contactOrgId,
  contactName,
  onSuccess,
  onSkip,
}: ConvertToClientModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const convertMutation = useConvertToClient();

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      name: contactName || '',
      slug: generateSlug(contactName || ''),
    },
  });

  // Update slug when name changes
  const watchedName = form.watch('name');
  useEffect(() => {
    if (watchedName && !form.formState.dirtyFields.slug) {
      form.setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, form]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setIsSuccess(false);
      form.reset({
        name: contactName || '',
        slug: generateSlug(contactName || ''),
      });
    }
  }, [open, contactName, form]);

  const onSubmit = async (values: ConvertFormValues) => {
    try {
      const organizationId = await convertMutation.mutateAsync({
        contactOrgId,
        name: values.name,
        slug: values.slug,
      });

      setIsSuccess(true);
      toast.success('Cliente criado com sucesso!');

      // Wait a bit to show success state, then close
      setTimeout(() => {
        onSuccess?.(organizationId);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao converter contato';
      toast.error(message);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <DialogTitle>Converter para Cliente</DialogTitle>
              <DialogDescription>
                Crie uma organization para este cliente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="p-3 rounded-full bg-green-500/10 mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-foreground">Cliente criado!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Agora voce pode cadastrar os stakeholders
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Empresa ABC"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nome da organization do cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="empresa-abc"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador unico (URL-friendly)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={convertMutation.isPending}
                >
                  Pular por agora
                </Button>
                <Button
                  type="submit"
                  disabled={convertMutation.isPending}
                  className="gap-2"
                >
                  {convertMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      Criar Cliente
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
