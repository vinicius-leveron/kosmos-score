import { Outlet, Link } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { useAuth } from '@/core/auth';
import { Button } from '@/design-system/primitives/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';

export function ClientLayout() {
  const { signOut, profile } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-semibold">KOSMOS</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
