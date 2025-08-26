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
  ShieldCheck,
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
import { useTranslation } from "react-i18next";

interface MainNavProps {
  user: User;
  userTools: Tool[];
  allCategories: Category[];
  permissions: {
    canManageUsers: boolean;
    canManageTools: boolean;
    canManageCategories: boolean;
    canManagePermissions: boolean;
    canViewAuditLog: boolean;
  };
}

export function MainNav({ user, userTools, allCategories, permissions }: MainNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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
          <SidebarMenuButton isActive={pathname === "/"} tooltip={t('dashboard')}>
            <LayoutDashboard />
            <span>{t('dashboard')}</span>
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
                    tooltip={tool.name}
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

      {(permissions.canManageUsers || permissions.canManageTools) && <SidebarSeparator />}

      <SidebarGroup>
        <SidebarGroupLabel>{t('settings')}</SidebarGroupLabel>
        <Link href="/profile">
          <SidebarMenuItem>
            <SidebarMenuButton isActive={pathname === "/profile"} tooltip={t('profile')}>
              <UserIcon />
              <span>{t('profile')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Link>
        
        {permissions.canManageUsers && (
            <Link href="/manage-users">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={pathname === "/manage-users"} tooltip={t('manage_users')}>
                  <Users />
                  <span>{t('manage_users')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
        )}
        
        {user.role === 'Superadmin' && (
          <>
            {permissions.canManageTools && (
               <Link href="/manage-tools">
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === "/manage-tools"} tooltip={t('manage_tools')}>
                    <Wrench />
                    <span>{t('manage_tools')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            )}
            {permissions.canManageCategories && (
              <Link href="/manage-categories">
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === "/manage-categories"} tooltip={t('manage_categories')}>
                    <Shapes />
                    <span>{t('manage_categories')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            )}
             {permissions.canManagePermissions && (
              <Link href="/manage-permissions">
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === "/manage-permissions"} tooltip={t('manage_permissions')}>
                    <ShieldCheck />
                    <span>{t('manage_permissions')}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            )}
            {permissions.canViewAuditLog && (
               <Link href="/audit-log">
                  <SidebarMenuItem>
                  <SidebarMenuButton
                      isActive={pathname.startsWith("/audit-log")}
                      tooltip={t('audit_log')}
                  >
                      <FileClock />
                      <span>{t('audit_log')}</span>
                  </SidebarMenuButton>
                  </SidebarMenuItem>
              </Link>
            )}
          </>
        )}

      </SidebarGroup>
    </SidebarMenu>
  );
}
