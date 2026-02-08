import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/design-system/primitives/card';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import {
  Megaphone,
  Target,
  FileText,
  ArrowRight,
  BarChart3,
  Users,
  Plus,
  ExternalLink,
} from 'lucide-react';

interface LeadMagnet {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  publicUrl?: string;
  stats?: {
    total: number;
    label: string;
  };
  status: 'active' | 'draft' | 'paused';
}

const leadMagnets: LeadMagnet[] = [
  {
    id: 'kosmos-score',
    name: 'KOSMOS Score',
    description: 'Quiz de diagnóstico que calcula o potencial de monetização da comunidade do lead',
    icon: Target,
    color: 'text-orange-500',
    href: '/admin/kosmos-score',
    publicUrl: '/quiz/kosmos-score',
    status: 'active',
  },
  {
    id: 'forms',
    name: 'Formulários',
    description: 'Crie formulários personalizados para captura de leads com campos customizados',
    icon: FileText,
    color: 'text-blue-500',
    href: '/admin/toolkit/forms',
    status: 'active',
  },
];

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
  draft: { label: 'Rascunho', variant: 'secondary' as const, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  paused: { label: 'Pausado', variant: 'outline' as const, className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

export function LeadMagnetsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Lead Magnets</h1>
            <p className="text-muted-foreground">
              Ferramentas de aquisição para capturar e qualificar leads
            </p>
          </div>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Novo Experimento
        </Button>
      </div>

      {/* Lead Magnets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadMagnets.map((lm) => {
          const Icon = lm.icon;
          const status = statusConfig[lm.status];

          return (
            <Card key={lm.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-muted ${lm.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant={status.variant} className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{lm.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {lm.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats placeholder */}
                {lm.stats && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{lm.stats.total} {lm.stats.label}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button asChild className="flex-1">
                    <Link to={lm.href}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
                  {lm.publicUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={`#${lm.publicUrl}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Card */}
        <Card className="border-dashed hover:border-primary/50 transition-colors cursor-not-allowed opacity-60">
          <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Criar Experimento</p>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-medium mb-2">O que são Lead Magnets?</h3>
          <p className="text-sm text-muted-foreground">
            Lead magnets são ferramentas de aquisição que oferecem valor gratuito em troca de informações de contato.
            Use-os para atrair leads qualificados, entender seu perfil e alimentar seu pipeline de vendas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
