"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  FileClock,
  User as UserIcon,
  Shapes,
  Users,
  UserCheck,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { DynamicIcon } from "@/components/icons";
import type { Tool, User } from "@/types";

interface MainNavProps {
  user: User;
  tools: Tool[];
}

export function MainNav({ user, tools }: MainNavProps) {
  const pathname = usePathname();
  
  const userTools = tools.filter(tool => 
    user.role === 'Admin' || user.role === 'Superadmin' || (user.assignedTools && user.assignedTools.includes(tool.id))
  ).filter(tool => tool.enabled);
  
  const hasAdminAccess = user.role === "Admin" || user.role === "Superadmin";

  const toolsByCategory = userTools.reduce((acc, tool) => {
    const category = tool.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <SidebarMenu>
      <Link href="/">
        <SidebarMenuItem>
          <SidebarMenuButton isActive={pathname === "/"}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </Link>

      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <SidebarGroup key={category}>
          <SidebarGroupLabel>{category}</SidebarGroupLabel>
          {categoryTools.map((tool) => (
             <Link href={`/tool/${tool.id}`} key={tool.id}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === `/tool/${tool.id}`}
                >
                  <DynamicIcon name={tool.icon} />
                  <span>{tool.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarGroup>
      ))}

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <Link href="/profile">
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/profile"}>
              <UserIcon />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Link>

        {hasAdminAccess && (
          <>
            <Link href="/manage-tools">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/manage-tools"}>
                  <Wrench />
                  <span>Manage Tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
            <Link href="/manage-categories">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/manage-categories"}>
                  <Shapes />
                  <span>Manage Categories</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          </>
        )}

        {user.role === "Superadmin" && (
          <>
             <Link href="/manage-users">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/manage-users"}>
                  <Users />
                  <span>Manage Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
            <Link href="/audit-log">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/audit-log")}
                >
                  <FileClock />
                  <span>Audit Log</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          </>
        )}
      </SidebarGroup>
    </SidebarMenu>
  );
}
