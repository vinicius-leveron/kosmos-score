import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { useSendToPipeline } from '../../../hooks/useSendToPipeline';

interface SendToCrmButtonProps {
  contactOrgId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

/**
 * Button to manually send an Outbound contact to the CRM Pipeline
 * Shows dropdown with options: Pipeline only or Pipeline + Deal
 */
export function SendToCrmButton({
  contactOrgId,
  variant = 'outline',
  size = 'sm',
  className,
}: SendToCrmButtonProps) {
  const sendToPipeline = useSendToPipeline();

  const handleSend = (createDeal: boolean) => {
    sendToPipeline.mutate({
      contactOrgId,
      createDeal,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={sendToPipeline.isPending}
        >
          {sendToPipeline.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Enviar para CRM
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSend(false)}>
          Adicionar ao Pipeline
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSend(true)}>
          Criar Deal
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
