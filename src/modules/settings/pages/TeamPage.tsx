import { useState } from 'react';
import { Loader2, UserPlus, Copy, Check, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import { Badge } from '@/design-system/primitives/badge';
import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/primitives/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/primitives/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useInvitations } from '../hooks/useInvitations';
import { ROLE_LABELS, type OrgRole } from '../types';

function getInitials(name: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeVariant(role: OrgRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { members, isLoading: loadingMembers, updateMemberRole, removeMember } = useTeamMembers();
  const { invitations, isLoading: loadingInvitations, createInvitation, revokeInvitation } = useInvitations();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('member');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const handleCreateInvite = async () => {
    if (!inviteEmail) {
      toast({ title: 'Digite o email', variant: 'destructive' });
      return;
    }

    setIsCreatingInvite(true);
    try {
      const link = await createInvitation(inviteEmail, inviteRole);
      setInviteLink(link);
      toast({ title: 'Convite criado com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao criar convite', variant: 'destructive' });
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({ title: 'Link copiado!' });
    }
  };

  const handleCloseInviteDialog = () => {
    setIsInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('member');
    setInviteLink(null);
    setCopiedLink(false);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemovingMember(true);
    try {
      await removeMember(memberToRemove);
      toast({ title: 'Membro removido com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao remover membro', variant: 'destructive' });
    } finally {
      setIsRemovingMember(false);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrgRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast({ title: 'Role atualizado com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao atualizar role', variant: 'destructive' });
    }
  };

  const isLoading = loadingMembers || loadingInvitations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da sua organização</p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar novo membro</DialogTitle>
              <DialogDescription>
                Envie um convite para alguém se juntar à sua equipe
              </DialogDescription>
            </DialogHeader>

            {inviteLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm text-muted-foreground">Link de convite</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input value={inviteLink} readOnly className="font-mono text-sm" />
                    <Button size="icon" variant="outline" onClick={handleCopyLink}>
                      {copiedLink ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Este link expira em 7 dias
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseInviteDialog}>
                    Fechar
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Permissão</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrgRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseInviteDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateInvite} disabled={isCreatingInvite}>
                    {isCreatingInvite ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Criar convite
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membros ({members.length})</CardTitle>
          <CardDescription>Pessoas com acesso à organização</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const isCurrentUser = member.profile_id === user?.id;
              const isOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.profile.avatar_url ?? undefined} />
                      <AvatarFallback>{getInitials(member.profile.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.profile.full_name || member.profile.email}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{member.profile.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {ROLE_LABELS[member.role]}
                    </Badge>

                    {!isCurrentUser && !isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                            Tornar Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'member')}>
                            Tornar Membro
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'viewer')}>
                            Tornar Visualizador
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setMemberToRemove(member.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites pendentes ({invitations.length})</CardTitle>
            <CardDescription>Convites aguardando aceite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      Expira em{' '}
                      {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeInvitation(invitation.id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O membro perderá acesso imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemovingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemovingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
