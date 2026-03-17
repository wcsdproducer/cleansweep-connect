
"use client";

import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import { useUser, useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const { data: userData, loading: docLoading } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  useEffect(() => {
    // Redirect if not logged in
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    // Redirect if role is incorrect or user document is missing
    if (!docLoading && user) {
      if (!userData || userData.role !== 'Service Provider') {
        router.push('/login');
      }
    }
  }, [userData, docLoading, user, router]);

  if (userLoading || docLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full animate-bounce" />
          <p className="text-sm text-muted-foreground font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Final check to prevent flicker before redirect
  if (!user || !userData || userData.role !== 'Service Provider') {
    return null;
  }

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
