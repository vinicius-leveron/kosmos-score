import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/design-system/primitives/sidebar';
import { Separator } from '@/design-system/primitives/separator';
import { AdminSidebar } from './components/AdminSidebar';

export function AdminLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar />
      <SidebarInset>
        {/* Header - Mobile Optimized */}
        <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger 
            className="-ml-1 sm:-ml-2 h-10 w-10 p-0" 
            aria-label="Toggle sidebar"
          />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex-1" />
        </header>
        {/* Main Content - Responsive Padding */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
