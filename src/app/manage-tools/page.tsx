import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getTools } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageToolsClient } from "@/components/manage-tools-client";

export default async function ManageToolsPage() {
  const user = await getCurrentUser();
  if (!user || !(await hasPermission(user, 'access_manage_tools'))) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
  }

  const tools = await getTools();

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
