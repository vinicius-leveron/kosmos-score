import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  User,
} from 'lucide-react';
import { useContacts } from '../../hooks/useContacts';
import { ContactAvatar, ScoreBadge } from '../shared';
import type { ContactFilters, ContactSort, ContactListItem } from '../../types';

interface ContactsTableProps {
  onSelectContact: (contact: ContactListItem) => void;
}

export function ContactsTable({ onSelectContact }: ContactsTableProps) {
  const [filters, setFilters] = useState<ContactFilters>({});
  const [sort, setSort] = useState<ContactSort>({
    field: 'created_at',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading, error } = useContacts({
    filters,
    sort,
    pagination: { page, per_page: perPage },
  });

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value || undefined }));
    setPage(1);
  };

  const handleSort = (field: ContactSort['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Erro ao carregar contatos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            className="pl-9"
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {data?.total ?? 0} contatos
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('full_name')}
                >
                  Contato
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('score')}
                >
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Estágio</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('created_at')}
                >
                  Criado em
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <User className="h-8 w-8" />
                    <span>Nenhum contato encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => onSelectContact(contact)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ContactAvatar
                        name={contact.full_name}
                        email={contact.email}
                      />
                      <div>
                        <div className="font-medium">
                          {contact.full_name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={contact.score} />
                  </TableCell>
                  <TableCell>
                    {contact.stage_name ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: contact.stage_color || undefined,
                          color: contact.stage_color || undefined,
                        }}
                      >
                        {contact.stage_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {contact.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{contact.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contact.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {data.page} de {data.total_pages}
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
}
