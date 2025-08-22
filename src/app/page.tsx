import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTools } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const tools = await getTools();
  const enabledTools = tools.filter(t => t.enabled);

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
            <CardTitle>Enabled Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{enabledTools.length}</p>
            <p className="text-muted-foreground">Tools currently available for use.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-muted-foreground">Ready to dive in? Pick a tool and start working.</p>
            <Link href={`/tool/${enabledTools[0]?.id || ''}`}>
                <Button className="w-full" disabled={!enabledTools.length}>
                    Go to first tool <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
