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
import type { Category, Tool, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface MainNavProps {
  user: User;
  userTools: Tool[];
  allCategories: Category[];
}

export function MainNav({ user, userTools, allCategories }: MainNavProps) {
  const pathname = usePathname();
  
  const isSuperadmin = user.role === "Superadmin";
  const isAdmin = user.role === "Admin";

  const toolsByCategory = userTools.reduce((acc, tool) => {
    const categoryName = tool.category || "General";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(tool);
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

      {Object.entries(toolsByCategory).map(([categoryName, categoryTools]) => {
        const category = allCategories.find(c => c.name === categoryName);
        if (!category?.enabled && categoryName !== 'General') return null;

        return (
          <SidebarGroup key={categoryName}>
            <SidebarGroupLabel className="flex items-center gap-2">
              {category && (
                 <Avatar className="h-5 w-5 rounded-sm">
                    {category.iconUrl ? (
                      <AvatarImage src={category.iconUrl} alt={category.name} className="object-contain" />
                    ) : null}
                    <AvatarFallback className="rounded-sm bg-transparent">
                      <DynamicIcon name={category.icon} className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
              )}
              <span>{categoryName}</span>
            </SidebarGroupLabel>
            {categoryTools.map((tool) => (
              <Link href={`/tool/${tool.id}`} key={tool.id}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === `/tool/${tool.id}`}
                  >
                    <Avatar className="h-5 w-5 rounded-sm">
                      {tool.iconUrl ? (
                        <AvatarImage src={tool.iconUrl} alt={tool.name} className="object-contain" />
                      ) : null}
                      <AvatarFallback className="rounded-sm bg-transparent">
                        <DynamicIcon name={tool.icon} className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{tool.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            ))}
          </SidebarGroup>
        )
      })}

      {(isAdmin || isSuperadmin) && <SidebarSeparator />}

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
        
        {(isAdmin || isSuperadmin) && (
            <Link href="/manage-users">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/manage-users"}>
                  <Users />
                  <span>Manage Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
        )}

        {isSuperadmin && (
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
