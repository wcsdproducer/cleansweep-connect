
"use client";

import { useEffect, useState } from 'react';
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
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const { data: userData, isLoading: isDocLoading } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isDocLoading && user) {
      if (userData?.role === 'Service Provider') {
        setIsAuthorized(true);
      } else if (userData) {
        // Logged in but not a provider
        router.push('/login');
      } else if (!isDocLoading) {
        // User exists in Auth but not in Firestore 'users' collection
        // This could happen if registration was interrupted
        setIsAuthorized(true); // Allow them to see the dashboard, or redirect to profile completion
      }
    }
  }, [userData, isDocLoading, user, router]);

  if (isUserLoading || (user && isDocLoading && isAuthorized === null)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-[3rem] shadow-2xl border">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary">Securing Session</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Verifying your professional credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
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
