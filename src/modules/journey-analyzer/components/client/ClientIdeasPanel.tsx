import { ThumbsUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { Button } from '@/design-system/primitives/button';
import { useToast } from '@/hooks/use-toast';
import { useClientContext } from '../../contexts/ClientAccessContext';
import { useClientVoteIdea } from '../../hooks';
import type { IdeaStatus } from '../../types';

const STATUS_LABELS: Record<IdeaStatus, string> = {
  draft: 'Rascunho',
  voting: 'Em votacao',
  selected: 'Selecionada',
  rejected: 'Rejeitada',
};

const STATUS_COLORS: Record<IdeaStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  voting: 'bg-blue-100 text-blue-700',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function ClientIdeasPanel() {
  const { token, data } = useClientContext();
  const { ideas, voted_idea_ids = [] } = data;
  const voteIdea = useClientVoteIdea(token);
  const { toast } = useToast();

  const votingIdeas = ideas.filter((i) => i.status === 'voting');
  const selectedIdeas = ideas.filter((i) => i.status === 'selected');
  const otherIdeas = ideas.filter((i) => i.status !== 'voting' && i.status !== 'selected');

  const handleVote = async (ideaId: string) => {
    try {
      await voteIdea.mutateAsync(ideaId);
      toast({ title: 'Voto registrado!' });
    } catch {
      toast({ title: 'Erro ao votar', variant: 'destructive' });
    }
  };

  if (ideas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma ideia cadastrada ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Voting Ideas - Interactive */}
      {votingIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideias em Votacao</CardTitle>
            <p className="text-sm text-muted-foreground">
              Vote nas ideias que voce acredita que trariam mais resultado
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {votingIdeas.map((idea) => (
                <div key={idea.id} className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 space-y-3">
                  <div>
                    <p className="text-sm font-medium">{idea.title}</p>
                    {idea.description && (
                      <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {idea.category && (
                        <Badge variant="outline" className="text-xs">{idea.category}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {idea.votes} {idea.votes === 1 ? 'voto' : 'votos'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={voted_idea_ids.includes(idea.id) ? 'default' : 'outline'}
                      onClick={() => handleVote(idea.id)}
                      disabled={voteIdea.isPending || voted_idea_ids.includes(idea.id)}
                      aria-label={voted_idea_ids.includes(idea.id) ? `Ja votou em ${idea.title}` : `Votar em ${idea.title}`}
                    >
                      {voteIdea.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : voted_idea_ids.includes(idea.id) ? (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Votado
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Votar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Ideas */}
      {selectedIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideias Selecionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedIdeas.map((idea) => (
                <div key={idea.id} className="p-4 rounded-lg border border-green-200 bg-green-50/50">
                  <p className="text-sm font-medium">{idea.title}</p>
                  {idea.description && (
                    <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={STATUS_COLORS.selected + ' text-xs'}>
                      {STATUS_LABELS.selected}
                    </Badge>
                    {idea.impact && (
                      <Badge variant="outline" className="text-xs">
                        Impacto: {idea.impact}/5
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {idea.votes} {idea.votes === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Ideas */}
      {otherIdeas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outras Ideias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherIdeas.map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{idea.title}</p>
                    {idea.description && (
                      <p className="text-xs text-muted-foreground">{idea.description}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${STATUS_COLORS[idea.status]}`}>
                    {STATUS_LABELS[idea.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
