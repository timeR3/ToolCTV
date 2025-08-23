import { getCurrentUser } from "@/lib/auth";
import { getTools, getUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageUsersClient } from "@/components/manage-users-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ManageUsersPage() {
  const user = await getCurrentUser();
  
  if (user.role !== "Superadmin") {
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
