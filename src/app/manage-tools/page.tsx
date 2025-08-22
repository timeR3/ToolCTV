import { getCurrentUser } from "@/lib/auth";
import { getTools } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageToolsClient } from "@/components/manage-tools-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ManageToolsPage() {
  const user = await getCurrentUser();
  const tools = await getTools();

  const hasAccess = user.role === "Admin" || user.role === "Superadmin";

  if (!hasAccess) {
    return (
      <div>
        <PageHeader title="Access Denied" />
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Forbidden</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Manage Tools"
        description="Add, edit, or disable tools available in the toolbox."
      />
      <ManageToolsClient initialTools={tools} user={user} />
    </div>
  );
}
