'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from "@/lib/auth-db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTools, logUserAccess } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);

      if (fetchedUser) {
        await logUserAccess(fetchedUser, "User session auto-started");
        const allTools = await getTools();
        const enabledTools = allTools.filter(t => t.enabled);
        const fetchedUserTools = enabledTools.filter(tool => 
          fetchedUser.role === 'Admin' || 
          fetchedUser.role === 'Superadmin' || 
          (fetchedUser.assignedTools && fetchedUser.assignedTools.includes(tool.id))
        );
        setUserTools(fetchedUserTools);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="..." description="..." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-32" /><Skeleton className="h-4 w-48 mt-2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-16" /><Skeleton className="h-4 w-40 mt-2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full mt-2" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold">No User Found</h1>
            <p className="text-muted-foreground">Could not automatically log in. Please ensure at least one user with the 'User' role exists in the database.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={t('welcome_back', { name: user.name.split(' ')[0] })}
        description={t('welcome_description')}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('your_role')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{user.role}</p>
            <p className="text-muted-foreground">{t('role_description', { role: user.role.toLowerCase() })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('available_tools')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{userTools.length}</p>
            <p className="text-muted-foreground">{t('available_tools_description')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('get_started')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-muted-foreground">{t('get_started_description')}</p>
            <Link href={`/tool/${userTools[0]?.id || ''}`}>
                <Button className="w-full" disabled={!userTools.length}>
                    {t('go_to_first_tool')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
