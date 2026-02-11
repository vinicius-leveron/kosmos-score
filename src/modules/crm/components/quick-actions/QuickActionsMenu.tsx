import * as React from "react";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/primitives/button";
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  CheckSquare,
  Clock,
  Send,
  Calendar,
  User
} from "lucide-react";
import { WhatsAppModal } from "./WhatsAppModal";
import { EmailModal } from "./EmailModal";
import { CallModal } from "./CallModal";
import { TaskModal } from "./TaskModal";
import { useCreateQuickAction } from "../../hooks/useQuickActions";
import type { QuickActionType } from "../../hooks/useQuickActions";

interface QuickActionsMenuProps {
  /** The contact organization ID */
  contactOrgId: string;
  /** Contact name for personalization */
  contactName?: string;
  /** Contact email */
  contactEmail?: string;
  /** Contact phone */
  contactPhone?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show as compact buttons (mobile) */
  compact?: boolean;
}

/**
 * QuickActionsMenu - Inline quick action buttons with modals for CRM interactions
 * 
 * @example
 * <QuickActionsMenu 
 *   contactOrgId="123" 
 *   contactName="João Silva"
 *   contactEmail="joao@example.com"
 *   contactPhone="+5511999999999"
 * />
 */
export const QuickActionsMenu = React.forwardRef<HTMLDivElement, QuickActionsMenuProps>(
  ({ 
    contactOrgId, 
    contactName, 
    contactEmail, 
    contactPhone, 
    className,
    compact = false 
  }, ref) => {
    const [activeModal, setActiveModal] = React.useState<QuickActionType | null>(null);
    const createAction = useCreateQuickAction();

    const handleActionComplete = (type: QuickActionType, data: any) => {
      createAction.mutate({
        type,
        contactOrgId,
        title: data.title,
        description: data.description,
        metadata: data.metadata
      });
      setActiveModal(null);
    };

    const actions = [
      {
        type: 'whatsapp' as QuickActionType,
        icon: MessageCircle,
        label: 'WhatsApp',
        color: 'text-green-500 hover:text-green-600',
        bgColor: 'hover:bg-green-500/10',
        disabled: !contactPhone
      },
      {
        type: 'email' as QuickActionType,
        icon: Mail,
        label: 'Email',
        color: 'text-blue-500 hover:text-blue-600',
        bgColor: 'hover:bg-blue-500/10',
        disabled: !contactEmail
      },
      {
        type: 'call' as QuickActionType,
        icon: Phone,
        label: 'Ligação',
        color: 'text-purple-500 hover:text-purple-600',
        bgColor: 'hover:bg-purple-500/10',
        disabled: !contactPhone
      },
      {
        type: 'task' as QuickActionType,
        icon: CheckSquare,
        label: 'Tarefa',
        color: 'text-orange-500 hover:text-orange-600',
        bgColor: 'hover:bg-orange-500/10',
        disabled: false
      }
    ];

    return (
      <>
        <div 
          ref={ref}
          className={cn(
            "flex items-center gap-1",
            compact && "gap-0.5",
            className
          )}
        >
          {actions.map(({ type, icon: Icon, label, color, bgColor, disabled }) => (
            <Button
              key={type}
              variant="ghost"
              size={compact ? "sm" : "default"}
              className={cn(
                "transition-all",
                color,
                bgColor,
                compact && "px-2 py-1",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !disabled && setActiveModal(type)}
              disabled={disabled}
              aria-label={`${label} ${disabled ? '(não disponível)' : ''}`}
            >
              <Icon className={cn("h-4 w-4", !compact && "mr-2")} />
              {!compact && <span className="text-sm font-medium">{label}</span>}
            </Button>
          ))}
        </div>

        {/* Modals */}
        <WhatsAppModal
          open={activeModal === 'whatsapp'}
          onClose={() => setActiveModal(null)}
          onSend={(data) => handleActionComplete('whatsapp', data)}
          contactName={contactName}
          contactPhone={contactPhone}
        />

        <EmailModal
          open={activeModal === 'email'}
          onClose={() => setActiveModal(null)}
          onSend={(data) => handleActionComplete('email', data)}
          contactName={contactName}
          contactEmail={contactEmail}
        />

        <CallModal
          open={activeModal === 'call'}
          onClose={() => setActiveModal(null)}
          onSave={(data) => handleActionComplete('call', data)}
          contactName={contactName}
          contactPhone={contactPhone}
        />

        <TaskModal
          open={activeModal === 'task'}
          onClose={() => setActiveModal(null)}
          onSave={(data) => handleActionComplete('task', data)}
          contactName={contactName}
        />
      </>
    );
  }
);

QuickActionsMenu.displayName = "QuickActionsMenu";