import { getCurrentUser } from "@/lib/auth";
import { getTools } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageToolsClient } from "@/components/manage-tools-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ManageToolsPage() {
  const user = await getCurrentUser();
  const tools = await getTools();

  const hasAccess = user.role === "Admin" || user.role === "Superadmin";

  if (!hasAccess) {
    redirect("/");
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
