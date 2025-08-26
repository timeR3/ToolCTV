
'use client';

import { useTranslation } from 'react-i18next';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool, User } from '@/types';

interface DashboardClientProps {
  user: User;
  userTools: Tool[];
}

export function DashboardClient({ user, userTools }: DashboardClientProps) {
  const { t } = useTranslation();

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
