import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageCategoriesClient } from "@/components/manage-categories-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function ManageCategoriesPage() {
  const user = await getCurrentUser();
  const categories = await getCategories();

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
        title="Manage Categories"
        description="Add, edit, or delete tool categories."
      />
      <ManageCategoriesClient initialCategories={categories} user={user} />
    </div>
  );
}
