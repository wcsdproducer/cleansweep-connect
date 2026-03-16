
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <SidebarNav />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {children}
          </main>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
