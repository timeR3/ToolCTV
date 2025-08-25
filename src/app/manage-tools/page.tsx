import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getTools } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageToolsClient } from "@/components/manage-tools-client";
import { redirect } from "next/navigation";

export default async function ManageToolsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  
  if (!(await hasPermission(user, 'access_manage_tools'))) {
    redirect("/");
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
