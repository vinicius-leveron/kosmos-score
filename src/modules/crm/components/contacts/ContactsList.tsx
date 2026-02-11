import { useState, memo } from 'react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import { Avatar, AvatarFallback } from '@/design-system/primitives/avatar';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Tag,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useContacts } from '../../hooks/useContacts';
import { ScoreBadge } from '../shared';
import { QuickActionsMenu } from '../quick-actions';
import { useOrganization } from '@/core/auth';
import type { ContactFilters, ContactSort, ContactListItem } from '../../types';

interface ContactsListProps {
  onSelectContact: (contact: ContactListItem) => void;
  className?: string;
}

export const ContactsList = memo(function ContactsList({ 
  onSelectContact,
  className 
}: ContactsListProps) {
  const { organizationId } = useOrganization();
  const [filters, setFilters] = useState<ContactFilters>({});
  const [sort] = useState<ContactSort>({
    field: 'created_at',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const perPage = 20;

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
      year: 'numeric',
    });
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>Erro ao carregar contatos</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos..."
            className="pl-9"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} contatos encontrados
        </div>
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : data?.data.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <User className="h-12 w-12 opacity-50" />
                <div className="text-center">
                  <p className="font-medium text-lg">Nenhum contato encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar sua busca ou crie um novo contato</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          data?.data.map((contact) => (
            <Card
              key={contact.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectContact(contact)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(contact.full_name, contact.email)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Score */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">
                        {contact.full_name || 'Sem nome'}
                      </h3>
                      <ScoreBadge score={contact.score} />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{contact.company}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between">
                      {/* Tags and Stage */}
                      <div className="flex items-center gap-2 flex-wrap">
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
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.name}
                          </Badge>
                        ))}
                        {contact.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(contact.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <QuickActionsMenu
                      contactOrgId={contact.id}
                      contactName={contact.full_name || undefined}
                      contactEmail={contact.email}
                      contactPhone={contact.phone || undefined}
                      compact
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Página {data.page} de {data.total_pages} • {data.total} contatos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});