import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getCategories, getTools } from "@/lib/data";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/auth/user-nav";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MainNav } from '@/components/main-nav';
import type { Category, Tool, User } from '@/types';


export const metadata: Metadata = {
  title: 'Toolbox Pro',
  description: 'Your integrated tool suite.',
};

const Nav = async () => {
  const user = await getCurrentUser();
  // This should not happen if middleware is correct, but as a safeguard:
  if (!user) {
    // This will be caught by the error boundary in a real app
    // For now, it prevents render errors if the session is lost.
    return null;
  }
  const allTools = await getTools();
  const allCategories = await getCategories();

  const userTools = allTools.filter(tool => 
    user.role === 'Admin' || 
    user.role === 'Superadmin' || 
    (user.assignedTools && user.assignedTools.includes(tool.id))
  ).filter(tool => tool.enabled);
  
  // Check all permissions at once
  const [
    canManageUsers,
    canManageTools,
    canManageCategories,
    canManagePermissions,
    canViewAuditLog
  ] = await Promise.all([
    hasPermission(user, 'access_manage_users'),
    hasPermission(user, 'access_manage_tools'),
    hasPermission(user, 'access_manage_categories'),
    hasPermission(user, 'access_manage_permissions'),
    hasPermission(user, 'access_audit_log')
  ]);
  
  const permissions = {
    canManageUsers,
    canManageTools,
    canManageCategories,
    canManagePermissions,
    canViewAuditLog
  };

  return <MainNav user={user} userTools={userTools} allCategories={allCategories} permissions={permissions} />;
};

const NavSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-px w-full my-2" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    // This case is for when the layout is accessed on a non-protected page
    // like /login, we don't want to render the authed layout.
    // The per-page protection handles the actual protection.
    return (
         <html lang="en" className="dark">
            <body className="font-body antialiased">
              {children}
              <Toaster />
            </body>
         </html>
    )
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar collapsible="icon" className="bg-sidebar">
            <SidebarRail />
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <Suspense fallback={<NavSkeleton />}>
                <Nav />
              </Suspense>
            </SidebarContent>
            <SidebarFooter>
              {/* Footer content if any */}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:flex items-center gap-2">
                    <SidebarTrigger />
                    <h2 className='font-semibold'>Dashboard</h2>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <UserNav user={user} />
              </div>
            </header>
            <main className="flex-1 px-4 sm:px-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
