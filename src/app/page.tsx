import { getCurrentUser } from "@/lib/auth-db";
import { getTools, logUserAccess } from "@/lib/data";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import type { Tool, User } from '@/types';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  console.log('[DashboardPage] User:', user ? user.email : 'None');

  if (!user) {
    console.log('[DashboardPage] No user, redirecting to /login.');
    // Although middleware should handle this, it's good practice
    // to have a safeguard in server components.
    redirect('/login');
  }
  console.log('[DashboardPage] User found, rendering DashboardClient.');

  await logUserAccess(user, "User dashboard loaded");
  const allTools = await getTools();
  const enabledTools = allTools.filter(t => t.enabled);
  const userTools = enabledTools.filter(tool => 
    user.role === 'Admin' || 
    user.role === 'Superadmin' || 
    (user.assignedTools && user.assignedTools.includes(tool.id))
  );

  return <DashboardClient user={user} userTools={userTools} />;
}
