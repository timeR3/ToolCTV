import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getCategories } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageCategoriesClient } from "@/components/manage-categories-client";

export default async function ManageCategoriesPage() {
  const user = await getCurrentUser();
  if (!user || !(await hasPermission(user, 'access_manage_categories'))) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
  }
  
  const categories = await getCategories();

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
