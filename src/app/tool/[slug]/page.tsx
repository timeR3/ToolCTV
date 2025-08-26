import { PageHeader } from "@/components/page-header";
import { getTools, logUserAccess } from "@/lib/data";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-db";

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user) {
     return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
  }
  
  const tools = await getTools();
  const toolId = parseInt(params.slug, 10);
  const tool = tools.find((t) => t.id === toolId);

  if (!tool || isNaN(toolId)) {
    notFound();
  }

  // --- PERMISSION CHECK ---
  const hasAccess = user.role === 'Superadmin' || 
                    user.role === 'Admin' || 
                    (user.assignedTools && user.assignedTools.includes(tool.id));

  if (!hasAccess) {
    return (
       <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this tool. Please contact an administrator.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  // -------------------------

  await logUserAccess(user, `Accessed tool: ${tool.name}`, `Tool ID: ${tool.id}`);

  if (!tool.enabled) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Tool Disabled</AlertTitle>
          <AlertDescription>
            This tool is currently disabled by an administrator. Please check back later or contact support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      <PageHeader title={tool.name} description={tool.description} />
      <div className="flex-grow rounded-lg border bg-card">
        <iframe
          src={tool.url}
          title={tool.name}
          className="h-full w-full rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const tools = await getTools();
 
  return tools.map((tool) => ({
    slug: tool.id.toString(),
  }));
}
