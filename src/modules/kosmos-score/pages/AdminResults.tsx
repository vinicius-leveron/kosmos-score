import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Badge } from '@/design-system/primitives/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/primitives/table';
import { ArrowLeft, Download, Search, RefreshCw, X } from 'lucide-react';
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
    if (score <= 25) return 'bg-score-red';
    if (score <= 50) return 'bg-score-orange';
    if (score <= 75) return 'bg-score-yellow';
    return 'bg-score-green';
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
    <div className="min-h-screen bg-kosmos-black blueprint-grid p-4 md:p-8 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-px bg-kosmos-orange" />
                <span className="text-kosmos-orange font-display font-semibold tracking-[0.2em] text-xs">KOSMOS</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-kosmos-white">Resultados da Auditoria</h1>
              <p className="text-kosmos-gray text-sm">{results.length} respostas registradas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchResults}
              disabled={loading}
              className="border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-border hover:border-kosmos-orange/50 hover:bg-kosmos-black-light text-kosmos-gray-light font-display"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-structural p-5">
            <p className="text-kosmos-gray text-xs font-display tracking-wider mb-2">TOTAL</p>
            <div className="font-display text-2xl font-bold text-kosmos-white">{results.length}</div>
          </div>
          <div className="card-structural p-5">
            <p className="text-kosmos-gray text-xs font-display tracking-wider mb-2">SCORE MÉDIO</p>
            <div className="font-display text-2xl font-bold text-kosmos-orange">
              {results.length > 0
                ? Math.round(results.reduce((acc, r) => acc + r.kosmos_asset_score, 0) / results.length)
                : 0}
            </div>
          </div>
          <div className="card-structural p-5">
            <p className="text-kosmos-gray text-xs font-display tracking-wider mb-2">LUCRO OCULTO</p>
            <div className="font-display text-xl font-bold text-kosmos-orange">
              {formatCurrency(results.reduce((acc, r) => acc + r.lucro_oculto, 0))}
            </div>
          </div>
          <div className="card-structural p-5">
            <p className="text-kosmos-gray text-xs font-display tracking-wider mb-2">INICIANTES</p>
            <div className="font-display text-2xl font-bold text-kosmos-white">
              {results.filter((r) => r.is_beginner).length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-kosmos-gray" />
          <Input
            placeholder="Buscar por email ou tamanho da base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-kosmos-black-soft border-border focus:border-kosmos-orange text-kosmos-white placeholder:text-kosmos-gray/50"
          />
        </div>

        {/* Results Table */}
        <div className="card-structural overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-kosmos-gray font-display">Email</TableHead>
                <TableHead className="text-kosmos-gray font-display">Data</TableHead>
                <TableHead className="text-kosmos-gray font-display text-center">Score</TableHead>
                <TableHead className="text-kosmos-gray font-display text-right">Lucro Oculto</TableHead>
                <TableHead className="text-kosmos-gray font-display text-center">Causa</TableHead>
                <TableHead className="text-kosmos-gray font-display text-center">Cultura</TableHead>
                <TableHead className="text-kosmos-gray font-display text-center">Economia</TableHead>
                <TableHead className="text-kosmos-gray font-display">Base</TableHead>
                <TableHead className="text-kosmos-gray font-display text-center">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-kosmos-gray">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-kosmos-orange" />
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-kosmos-gray">
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow
                    key={result.id}
                    className="cursor-pointer border-border hover:bg-kosmos-black-light transition-colors"
                    onClick={() => setSelectedResult(result)}
                  >
                    <TableCell className="font-medium text-kosmos-white">{result.email}</TableCell>
                    <TableCell className="text-kosmos-gray text-sm">
                      {formatDate(result.created_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(getScoreColor(result.kosmos_asset_score), 'text-white font-display')}>
                        {Math.round(result.kosmos_asset_score)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-display font-medium text-kosmos-orange">
                      {formatCurrency(result.lucro_oculto)}
                    </TableCell>
                    <TableCell className="text-center text-kosmos-gray-light">{Math.round(result.score_causa)}</TableCell>
                    <TableCell className="text-center text-kosmos-gray-light">{Math.round(result.score_cultura)}</TableCell>
                    <TableCell className="text-center text-kosmos-gray-light">{Math.round(result.score_economia)}</TableCell>
                    <TableCell className="text-sm text-kosmos-gray">{result.base_size}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className={result.is_beginner ? 'bg-blue-500/20 text-blue-400' : 'bg-kosmos-black-light text-kosmos-gray'}>
                        {result.is_beginner ? 'Iniciante' : 'Experiente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Detail Modal */}
        {selectedResult && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedResult(null)}
          >
            <div
              className="card-structural max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-kosmos-orange rounded-r" />
                  <h3 className="font-display text-lg font-semibold text-kosmos-white">Detalhes da Resposta</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedResult(null)}
                  className="text-kosmos-gray hover:text-kosmos-white hover:bg-kosmos-black-light"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-kosmos-gray font-display tracking-wider mb-1">EMAIL</p>
                    <p className="font-medium text-kosmos-white">{selectedResult.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-kosmos-gray font-display tracking-wider mb-1">DATA</p>
                    <p className="font-medium text-kosmos-white">{formatDate(selectedResult.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-kosmos-black-light rounded-lg">
                    <p className="text-xs text-kosmos-gray font-display tracking-wider mb-2">KOSMOS SCORE</p>
                    <p className="font-display text-3xl font-bold text-kosmos-orange">
                      {Math.round(selectedResult.kosmos_asset_score)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-kosmos-black-light rounded-lg">
                    <p className="text-xs text-kosmos-gray font-display tracking-wider mb-2">LUCRO OCULTO</p>
                    <p className="font-display text-xl font-bold text-kosmos-orange">
                      {formatCurrency(selectedResult.lucro_oculto)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-kosmos-black-light rounded-lg">
                    <p className="text-xs text-kosmos-gray font-display tracking-wider mb-2">TIPO</p>
                    <p className="font-display text-xl font-bold text-kosmos-white">
                      {selectedResult.is_beginner ? 'Iniciante' : 'Experiente'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-semibold text-kosmos-white tracking-wider mb-4">SCORES POR PILAR</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-kosmos-gray mb-1">Causa</p>
                      <p className="font-display text-xl font-bold text-kosmos-white">{Math.round(selectedResult.score_causa)}/100</p>
                    </div>
                    <div>
                      <p className="text-xs text-kosmos-gray mb-1">Cultura</p>
                      <p className="font-display text-xl font-bold text-kosmos-white">{Math.round(selectedResult.score_cultura)}/100</p>
                    </div>
                    <div>
                      <p className="text-xs text-kosmos-gray mb-1">Economia</p>
                      <p className="font-display text-xl font-bold text-kosmos-white">{Math.round(selectedResult.score_economia)}/100</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-semibold text-kosmos-white tracking-wider mb-4">DADOS QUANTITATIVOS</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-kosmos-gray">Tamanho da Base</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.base_size}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Ticket Médio</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.ticket_medio}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Número de Ofertas</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.num_ofertas}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Frequência de Comunicação</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.frequencia_comunicacao}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display text-sm font-semibold text-kosmos-white tracking-wider mb-4">RESPOSTAS QUALITATIVAS</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-kosmos-gray">Razão de Compra (Causa)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.razao_compra}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Identidade da Comunidade (Causa)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.identidade_comunidade}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Autonomia da Comunidade (Cultura)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.autonomia_comunidade}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Rituais e Jornada (Cultura)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.rituais_jornada}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Oferta de Ascensão (Economia)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.oferta_ascensao}</p>
                    </div>
                    <div>
                      <p className="text-kosmos-gray">Recorrência (Economia)</p>
                      <p className="font-medium text-kosmos-white">{selectedResult.recorrencia}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
            <div className="w-4 h-px bg-kosmos-gray/20" />
            <span>© 2026 KOSMOS</span>
            <div className="w-4 h-px bg-kosmos-gray/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
