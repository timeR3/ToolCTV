import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getAllPermissions, getRolePermissions } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManagePermissionsClient } from "@/components/manage-permissions-client";

export default async function ManagePermissionsPage() {
  const user = await getCurrentUser();
  if (!user || !(await hasPermission(user, 'access_manage_permissions'))) {
     return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
  }

  const allPermissions = await getAllPermissions();
  const rolePermissions = await getRolePermissions();
  
  return (
    <div>
      <PageHeader
        title="Manage Permissions"
        description="Configure which roles can access specific parts of the application."
      />
      <ManagePermissionsClient
        initialPermissions={allPermissions}
        initialRolePermissions={rolePermissions}
        currentUser={user}
      />
    </div>
  );
}
