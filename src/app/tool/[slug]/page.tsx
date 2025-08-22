import { PageHeader } from "@/components/page-header";
import { getTools } from "@/lib/data";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tools = await getTools();
  const tool = tools.find((t) => t.id === params.slug);

  if (!tool) {
    notFound();
  }

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
    slug: tool.id,
  }));
}
