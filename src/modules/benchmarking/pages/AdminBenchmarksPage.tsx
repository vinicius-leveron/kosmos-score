/**
 * AdminBenchmarksPage - List all benchmarks for admin management
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  Archive,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import {
  useBenchmarks,
  useDeleteBenchmark,
  usePublishBenchmark,
  useArchiveBenchmark,
} from '../hooks/useBenchmarks';
import type { BenchmarkWithRelations, BenchmarkStatus } from '../types';

export function AdminBenchmarksPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: benchmarks, isLoading, error } = useBenchmarks();
  const deleteBenchmark = useDeleteBenchmark();
  const publishBenchmark = usePublishBenchmark();
  const archiveBenchmark = useArchiveBenchmark();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [benchmarkToDelete, setBenchmarkToDelete] = useState<BenchmarkWithRelations | null>(null);

  const handleDelete = async () => {
    if (!benchmarkToDelete) return;

    try {
      await deleteBenchmark.mutateAsync(benchmarkToDelete.id);
      setIsDeleteDialogOpen(false);
      setBenchmarkToDelete(null);
      toast({ title: 'Benchmark excluído com sucesso' });
    } catch (error) {
      console.error('Error deleting benchmark:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o benchmark',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishBenchmark.mutateAsync(id);
      toast({ title: 'Benchmark publicado', description: 'O cliente já pode visualizar' });
    } catch (error) {
      console.error('Error publishing benchmark:', error);
      toast({
        title: 'Erro ao publicar',
        description: 'Não foi possível publicar o benchmark',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveBenchmark.mutateAsync(id);
      toast({ title: 'Benchmark arquivado' });
    } catch (error) {
      console.error('Error archiving benchmark:', error);
      toast({
        title: 'Erro ao arquivar',
        description: 'Não foi possível arquivar o benchmark',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: BenchmarkStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-600">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'archived':
        return <Badge variant="outline">Arquivado</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-kosmos-gray-400';
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kosmos-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-kosmos-white mb-2">
              Erro ao carregar benchmarks
            </h3>
            <p className="text-kosmos-gray-400 text-center mb-4">
              {(error as Error).message || 'Tente novamente mais tarde'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-kosmos-white">Benchmarks</h1>
          <p className="text-kosmos-gray-400 mt-1">
            Gerencie as análises de benchmark dos clientes
          </p>
        </div>
        <Button onClick={() => navigate('/admin/benchmarks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Benchmark
        </Button>
      </div>

      {benchmarks && benchmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benchmarks.map((benchmark) => (
            <Card
              key={benchmark.id}
              className="bg-kosmos-gray-900 border-kosmos-gray-800 hover:border-kosmos-orange/50 transition-colors"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-kosmos-orange" />
                  <CardTitle className="text-lg font-medium line-clamp-1">
                    {benchmark.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/admin/benchmarks/${benchmark.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {benchmark.status === 'published' && (
                      <DropdownMenuItem onClick={() => navigate(`/app/benchmark/${benchmark.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Dashboard
                      </DropdownMenuItem>
                    )}
                    {benchmark.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handlePublish(benchmark.id)}>
                        <Send className="h-4 w-4 mr-2" />
                        Publicar
                      </DropdownMenuItem>
                    )}
                    {benchmark.status !== 'archived' && (
                      <DropdownMenuItem onClick={() => handleArchive(benchmark.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => {
                        setBenchmarkToDelete(benchmark);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                {/* Cliente info */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-kosmos-gray-500" />
                  <span className="text-sm text-kosmos-gray-400 line-clamp-1">
                    {benchmark.contact_org?.contact?.full_name || benchmark.contact_org?.contact?.email || 'Cliente'}
                  </span>
                </div>

                {/* Score preview */}
                {benchmark.score_total && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-kosmos-gray-500">Score Total:</span>
                    <span className={`text-lg font-bold ${getScoreColor(benchmark.score_total)}`}>
                      {benchmark.score_total.toFixed(1)}
                    </span>
                    {benchmark.percentile_total && (
                      <span className="text-xs text-kosmos-gray-500">
                        (Top {100 - benchmark.percentile_total}%)
                      </span>
                    )}
                  </div>
                )}

                {/* Date and status */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-kosmos-gray-800">
                  <div className="flex items-center gap-1 text-xs text-kosmos-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(benchmark.analysis_date).toLocaleDateString('pt-BR')}
                  </div>
                  {getStatusBadge(benchmark.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-kosmos-gray-900 border-kosmos-gray-800 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-kosmos-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-kosmos-white mb-2">
              Nenhum benchmark ainda
            </h3>
            <p className="text-kosmos-gray-400 text-center mb-4">
              Crie o primeiro benchmark para um cliente
            </p>
            <Button onClick={() => navigate('/admin/benchmarks/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Benchmark
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Benchmark</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o benchmark "{benchmarkToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteBenchmark.isPending}
            >
              {deleteBenchmark.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
