"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  FileClock,
  User as UserIcon,
  Shapes,
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
  const enabledTools = tools.filter((tool) => tool.enabled);
  const hasAdminAccess = user.role === "Admin" || user.role === "Superadmin";

  const toolsByCategory = enabledTools.reduce((acc, tool) => {
    const category = tool.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/">
          <SidebarMenuButton isActive={pathname === "/"}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      {Object.entries(toolsByCategory).map(([category, tools]) => (
        <SidebarGroup key={category}>
          <SidebarGroupLabel>{category}</SidebarGroupLabel>
          {tools.map((tool) => (
            <SidebarMenuItem key={tool.id}>
              <Link href={`/tool/${tool.id}`}>
                <SidebarMenuButton
                  isActive={pathname === `/tool/${tool.id}`}
                >
                  <DynamicIcon name={tool.icon} />
                  <span>{tool.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      ))}

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenuItem>
          <Link href="/profile">
            <SidebarMenuButton isActive={pathname === "/profile"}>
              <UserIcon />
              <span>Profile</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {hasAdminAccess && (
          <>
            <SidebarMenuItem>
              <Link href="/manage-tools">
                <SidebarMenuButton isActive={pathname === "/manage-tools"}>
                  <Wrench />
                  <span>Manage Tools</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/manage-categories">
                <SidebarMenuButton isActive={pathname === "/manage-categories"}>
                  <Shapes />
                  <span>Manage Categories</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </>
        )}

        {user.role === "Superadmin" && (
          <SidebarMenuItem>
            <Link href="/audit-log">
              <SidebarMenuButton
                isActive={pathname.startsWith("/audit-log")}
              >
                <FileClock />
                <span>Audit Log</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )}
      </SidebarGroup>
    </SidebarMenu>
  );
}
