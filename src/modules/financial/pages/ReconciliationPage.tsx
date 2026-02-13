import { GitCompareArrows, Upload, FileSearch, ArrowRightLeft, Info } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { useOrganization } from '@/core/auth';

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DropzonePlaceholder() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        'rounded-lg border-2 border-dashed border-muted-foreground/25',
        'bg-muted/30 py-12 px-6 text-center',
        'cursor-not-allowed opacity-60',
      )}
      aria-disabled="true"
      role="region"
      aria-label="Area de upload de extrato bancario (em breve)"
    >
      <div className="p-3 rounded-full bg-muted">
        <Upload className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-muted-foreground">
          Arraste seu extrato aqui ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Formatos aceitos: OFX, CSV (em breve)
        </p>
      </div>
    </div>
  );
}

export function ReconciliationPage() {
  useOrganization();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GitCompareArrows className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Conciliacao Bancaria
              </h1>
              <p className="text-sm text-muted-foreground">
                Importe extratos e concilie com lancamentos
              </p>
            </div>
            <Badge variant="secondary" className="ml-2">Em breve</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6 pb-8 space-y-6">
        {/* Info banner */}
        <div
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-card p-4',
          )}
          role="status"
        >
          <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Em breve: importe extratos bancarios e concilie automaticamente com
            seus lancamentos. As tabelas de conciliacao estao sendo preparadas
            para a proxima versao.
          </p>
        </div>

        {/* Feature explanation cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={FileSearch}
            title="Importar Extrato"
            description="Faca upload de arquivos OFX ou CSV do seu banco. O sistema ira ler todas as movimentacoes e preparar para conciliacao."
          />
          <FeatureCard
            icon={ArrowRightLeft}
            title="Conciliar"
            description="O sistema sugere correspondencias entre o extrato bancario e seus lancamentos financeiros. Voce confirma, ignora ou cria novos lancamentos."
          />
        </div>

        {/* Disabled dropzone */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Upload de Extrato
          </h2>
          <DropzonePlaceholder />
        </div>
      </div>
    </div>
  );
}
