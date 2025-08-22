"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  FileClock,
  User as UserIcon,
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/" passHref>
          <SidebarMenuButton asChild isActive={pathname === "/"}>
            <>
              <LayoutDashboard />
              <span>Dashboard</span>
            </>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      {enabledTools.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          {enabledTools.map((tool) => (
            <SidebarMenuItem key={tool.id}>
              <Link href={`/tool/${tool.id}`} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/tool/${tool.id}`}
                >
                  <>
                    <DynamicIcon name={tool.icon} />
                    <span>{tool.name}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      )}

      <SidebarSeparator />

      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenuItem>
          <Link href="/profile" passHref>
            <SidebarMenuButton asChild isActive={pathname === "/profile"}>
              <>
                <UserIcon />
                <span>Profile</span>
              </>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>

        {hasAdminAccess && (
          <SidebarMenuItem>
            <Link href="/manage-tools" passHref>
              <SidebarMenuButton asChild isActive={pathname === "/manage-tools"}>
                <>
                  <Wrench />
                  <span>Manage Tools</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )}

        {user.role === "Superadmin" && (
          <SidebarMenuItem>
            <Link href="/audit-log" passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/audit-log")}
              >
                <>
                  <FileClock />
                  <span>Audit Log</span>
                </>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        )}
      </SidebarGroup>
    </SidebarMenu>
  );
}
