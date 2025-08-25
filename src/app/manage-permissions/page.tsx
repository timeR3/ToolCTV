import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getAllPermissions, getRolePermissions } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManagePermissionsClient } from "@/components/manage-permissions-client";
import { redirect } from "next/navigation";

export default async function ManagePermissionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (!(await hasPermission(user, 'access_manage_permissions'))) {
    redirect("/");
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
