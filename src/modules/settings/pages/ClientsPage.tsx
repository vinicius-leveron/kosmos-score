import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';

export function ClientsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">Gerencie as organizações dos seus clientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Em breve
          </CardTitle>
          <CardDescription>
            A gestão de organizações clientes será implementada em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aqui você poderá criar e gerenciar organizações para seus clientes,
            adicionar membros e controlar o acesso aos serviços.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
