import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/design-system/primitives/sheet';
import { Kanban, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContactsTable } from '../components/contacts/ContactsTable';
import { ContactDetail } from '../components/contacts/ContactDetail';
import type { ContactListItem } from '../types';

export function ContactsPage() {
  const [selectedContact, setSelectedContact] = useState<ContactListItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSelectContact = (contact: ContactListItem) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedContact(null), 300); // Wait for animation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Contatos</h1>
                <p className="text-muted-foreground">
                  Gerencie seus leads e clientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/crm/pipeline">
                  <Kanban className="h-4 w-4 mr-2" />
                  Pipeline
                </Link>
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        <ContactsTable onSelectContact={handleSelectContact} />
      </div>

      {/* Contact Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Contato</SheetTitle>
          </SheetHeader>
          {selectedContact && (
            <ContactDetail
              contactOrgId={selectedContact.id}
              onClose={handleCloseDetail}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
