import { Download, Printer, Link2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { JourneyProjectWithStages } from '../../types';

interface ExportButtonProps {
  project: JourneyProjectWithStages;
}

export function ExportButton({ project }: ExportButtonProps) {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const token = (project as Record<string, unknown>).client_access_token;
    if (token) {
      const url = `${window.location.origin}/journey/client/${token}`;
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado', description: 'O link do cliente foi copiado para a area de transferencia.' });
    } else {
      toast({ title: 'Link nao disponivel', variant: 'destructive' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          PDF / Imprimir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copiar Link do Cliente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
