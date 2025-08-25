import { getCurrentUser } from "@/lib/auth";
import { getTools, getUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageUsersClient } from "@/components/manage-users-client";
import { redirect } from "next/navigation";

export default async function ManageUsersPage() {
  const user = await getCurrentUser();
  
  const hasAccess = user.role === "Admin" || user.role === "Superadmin";

  if (!hasAccess) {
    redirect("/");
  }
  
  const users = await getUsers();
  const tools = await getTools();

  return (
    <div>
      <PageHeader
        title="Manage Users & Tools"
        description="Manage user roles and assign tools to them."
      />
      <ManageUsersClient initialUsers={users} currentUser={user} allTools={tools} />
    </div>
  );
}
