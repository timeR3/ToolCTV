import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getTools, getUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageUsersClient } from "@/components/manage-users-client";

export default async function ManageUsersPage() {
  const user = await getCurrentUser();
  if (!user || !(await hasPermission(user, 'access_manage_users'))) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
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
