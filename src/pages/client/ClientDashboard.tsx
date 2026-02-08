import { useUser, useOrganization } from '@/core/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';

export function ClientDashboard() {
  const { fullName, email } = useUser();
  const { currentOrg } = useOrganization();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {fullName || email}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Suas Análises</CardTitle>
            <CardDescription>
              Visualize as análises de jornada compartilhadas com você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma análise disponível ainda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organização</CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentOrg ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Organização:</span>{' '}
                  {currentOrg.organization_name}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Tipo:</span>{' '}
                  {currentOrg.organization_type}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Seu papel:</span>{' '}
                  {currentOrg.role}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sem organização vinculada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
