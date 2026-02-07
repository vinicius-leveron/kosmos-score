import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/primitives/table';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { ArrowLeft, Download, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/design-system/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type AuditResult = Tables<'audit_results'>;

export function AdminResults() {
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedResult, setSelectedResult] = useState<AuditResult | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = results.filter(
    (r) =>
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.base_size.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-orange-500';
    if (score <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const exportToCSV = () => {
    const headers = [
      'Email',
      'Data',
      'KOSMOS Score',
      'Lucro Oculto',
      'Causa',
      'Cultura',
      'Economia',
      'Base',
      'Ticket Médio',
      'Iniciante',
    ];

    const rows = filteredResults.map((r) => [
      r.email,
      formatDate(r.created_at),
      Math.round(r.kosmos_asset_score),
      r.lucro_oculto,
      Math.round(r.score_causa),
      Math.round(r.score_cultura),
      Math.round(r.score_economia),
      r.base_size,
      r.ticket_medio,
      r.is_beginner ? 'Sim' : 'Não',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kosmos-resultados-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Resultados da Auditoria</h1>
              <p className="text-muted-foreground text-sm">
                {results.length} respostas registradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchResults} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.length > 0
                  ? Math.round(
                      results.reduce((acc, r) => acc + r.kosmos_asset_score, 0) / results.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lucro Oculto Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(results.reduce((acc, r) => acc + r.lucro_oculto, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Iniciantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter((r) => r.is_beginner).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou tamanho da base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Lucro Oculto</TableHead>
                  <TableHead className="text-center">Causa</TableHead>
                  <TableHead className="text-center">Cultura</TableHead>
                  <TableHead className="text-center">Economia</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum resultado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow
                      key={result.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedResult(result)}
                    >
                      <TableCell className="font-medium">{result.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(result.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(getScoreColor(result.kosmos_asset_score), 'text-white')}>
                          {Math.round(result.kosmos_asset_score)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(result.lucro_oculto)}
                      </TableCell>
                      <TableCell className="text-center">{Math.round(result.score_causa)}</TableCell>
                      <TableCell className="text-center">{Math.round(result.score_cultura)}</TableCell>
                      <TableCell className="text-center">{Math.round(result.score_economia)}</TableCell>
                      <TableCell className="text-sm">{result.base_size}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={result.is_beginner ? 'secondary' : 'outline'}>
                          {result.is_beginner ? 'Iniciante' : 'Experiente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {selectedResult && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedResult(null)}
          >
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detalhes da Resposta</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                    Fechar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedResult.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{formatDate(selectedResult.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">KOSMOS Score</p>
                    <p className="text-3xl font-bold text-primary">
                      {Math.round(selectedResult.kosmos_asset_score)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Lucro Oculto</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(selectedResult.lucro_oculto)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="text-xl font-bold">
                      {selectedResult.is_beginner ? 'Iniciante' : 'Experiente'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Scores por Pilar</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Causa</p>
                      <p className="text-xl font-bold">{Math.round(selectedResult.score_causa)}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cultura</p>
                      <p className="text-xl font-bold">{Math.round(selectedResult.score_cultura)}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Economia</p>
                      <p className="text-xl font-bold">{Math.round(selectedResult.score_economia)}/100</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Dados Quantitativos</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tamanho da Base</p>
                      <p className="font-medium">{selectedResult.base_size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket Médio</p>
                      <p className="font-medium">{selectedResult.ticket_medio}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Número de Ofertas</p>
                      <p className="font-medium">{selectedResult.num_ofertas}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frequência de Comunicação</p>
                      <p className="font-medium">{selectedResult.frequencia_comunicacao}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Respostas Qualitativas</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Razão de Compra (Causa)</p>
                      <p className="font-medium">{selectedResult.razao_compra}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Identidade da Comunidade (Causa)</p>
                      <p className="font-medium">{selectedResult.identidade_comunidade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Autonomia da Comunidade (Cultura)</p>
                      <p className="font-medium">{selectedResult.autonomia_comunidade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rituais e Jornada (Cultura)</p>
                      <p className="font-medium">{selectedResult.rituais_jornada}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Oferta de Ascensão (Economia)</p>
                      <p className="font-medium">{selectedResult.oferta_ascensao}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recorrência (Economia)</p>
                      <p className="font-medium">{selectedResult.recorrencia}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
