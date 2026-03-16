"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Wallet, 
  User, 
  Settings, 
  LogOut,
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Accounting', href: '/dashboard/accounting', icon: Wallet },
];

const secondaryItems = [
  { name: 'My Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '#', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-20 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="text-primary w-6 h-6" />
          <span className="font-bold text-lg text-sidebar-foreground font-headline tracking-tight">CleanSweep</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 space-y-8">
        <div>
          <h3 className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-4 px-3">Main Menu</h3>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    pathname === item.href 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-4 px-3">Account</h3>
          <SidebarMenu>
            {secondaryItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    pathname === item.href 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator className="mb-4 bg-sidebar-border" />
        <Link href="/">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-sidebar-foreground/60 hover:text-destructive transition-colors rounded-xl hover:bg-destructive/5">
            <LogOut className="w-5 h-5" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}