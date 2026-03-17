
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

  // Fetch the role-based document to verify access
  const { data: userData, isLoading: isDocLoading } = useDoc(
    user && db ? doc(db, 'users', user.uid) : null
  );

  useEffect(() => {
    // Redirect to login if auth check finishes and no user is found
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Role verification logic
    if (user && !isDocLoading) {
      if (userData?.role === 'Service Provider') {
        setIsAuthorized(true);
      } else if (userData) {
        // User exists but has wrong role
        router.push('/login');
      } else {
        // Doc doesn't exist yet (could be immediate registration)
        // We'll allow them through assuming initialization is happening
        setIsAuthorized(true); 
      }
    }
  }, [userData, isDocLoading, user, router]);

  // Unified loading screen
  if (isUserLoading || (user && isDocLoading && isAuthorized === null)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-[3rem] shadow-2xl border">
          <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary font-headline">Verifying Access</h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">Please wait while we secure your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Final check to prevent unauthorized render
  if (!user || isAuthorized === false) {
    return null;
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
