import { getCurrentUser } from "@/lib/auth-db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTools, logUserAccess } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    // This can happen if there are no users with the 'User' role in the DB
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <h1 className="text-2xl font-bold">No User Found</h1>
            <p className="text-muted-foreground">Could not automatically log in. Please ensure at least one user with the 'User' role exists in the database.</p>
        </div>
      </div>
    )
  }

  await logUserAccess(user, "User session auto-started");
  const allTools = await getTools();
  
  const enabledTools = allTools.filter(t => t.enabled);

  const userTools = enabledTools.filter(tool => 
    user.role === 'Admin' || 
    user.role === 'Superadmin' || 
    (user.assignedTools && user.assignedTools.includes(tool.id))
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}!`}
        description="Here are your available tools. Select one from the sidebar to get started."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{user.role}</p>
            <p className="text-muted-foreground">You have {user.role.toLowerCase()} level permissions.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{userTools.length}</p>
            <p className="text-muted-foreground">Tools currently available for you.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-muted-foreground">Ready to dive in? Pick a tool and start working.</p>
            <Link href={`/tool/${userTools[0]?.id || ''}`}>
                <Button className="w-full" disabled={!userTools.length}>
                    Go to first tool <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
