import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/design-system/primitives/sidebar';
import { AdminSidebar } from './components/AdminSidebar';

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
          <SidebarTrigger
            className="-ml-1 h-9 w-9"
            aria-label="Toggle sidebar"
          />
        </header>
        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
