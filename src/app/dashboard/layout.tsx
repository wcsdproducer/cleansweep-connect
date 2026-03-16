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
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
        <SidebarNav />
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}