import { useState, memo } from 'react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Calendar,
  Mail,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useContacts } from '../../hooks/useContacts';
import { ContactAvatar, ScoreBadge } from '../shared';
import { QuickActionsMenu } from '../quick-actions';
import { useOrganization } from '@/core/auth';
import type { ContactFilters, ContactSort, ContactListItem } from '../../types';

interface ContactsTableMobileProps {
  onSelectContact: (contact: ContactListItem) => void;
  className?: string;
}

/**
 * Mobile-optimized contact list with card layout
 * Provides touch-friendly targets (min 44x44px) and responsive design
 */
export const ContactsTableMobile = memo(function ContactsTableMobile({ 
  onSelectContact,
  className 
}: ContactsTableMobileProps) {
  const { organizationId } = useOrganization();
  const [filters, setFilters] = useState<ContactFilters>({});
  const [sort] = useState<ContactSort>({
    field: 'created_at',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const perPage = 10; // Reduced for mobile

  const { data, isLoading, error } = useContacts({
    organizationId: organizationId || undefined,
    filters,
    sort,
    pagination: { page, per_page: perPage },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p className="text-sm">Erro ao carregar contatos</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar - Mobile Optimized */}
      <div className="px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-9 h-11" // Touch-friendly height
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground text-center">
          {data?.total ?? 0} contatos encontrados
        </div>
      </div>

      {/* Contact Cards */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          // Loading skeleton for mobile
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : data?.data.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <User className="h-10 w-10 opacity-50" />
              <div className="text-center">
                <p className="font-medium">Nenhum contato encontrado</p>
                <p className="text-sm mt-1">Tente ajustar sua busca</p>
              </div>
            </div>
          </Card>
        ) : (
          data?.data.map((contact) => (
            <Card
              key={contact.id}
              className="p-4 hover:border-primary/50 transition-colors"
            >
              <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => onSelectContact(contact)}
              >
                {/* Avatar */}
                <ContactAvatar
                  name={contact.full_name}
                  email={contact.email}
                  className="flex-shrink-0"
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Name and Email */}
                  <div className="mb-2">
                    <div className="font-medium truncate">
                      {contact.full_name || 'Sem nome'}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  </div>

                  {/* Score and Stage */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <ScoreBadge score={contact.score} />
                    {contact.stage_name && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: contact.stage_color || undefined,
                          color: contact.stage_color || undefined,
                        }}
                      >
                        {contact.stage_name}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(contact.created_at)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ 
                            backgroundColor: tag.color + '20', 
                            color: tag.color 
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions - Compact Mode for Mobile */}
              <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                <QuickActionsMenu
                  contactOrgId={contact.id}
                  contactName={contact.full_name || undefined}
                  contactEmail={contact.email}
                  contactPhone={contact.phone || undefined}
                  compact
                  className="justify-center"
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination - Mobile Optimized */}
      {data && data.total_pages > 1 && (
        <div className="px-4 py-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Página {data.page} de {data.total_pages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3" // Touch-friendly size
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3" // Touch-friendly size
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});