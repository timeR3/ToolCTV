import { getCurrentUser, hasPermission } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageCategoriesClient } from "@/components/manage-categories-client";
import { redirect } from "next/navigation";

export default async function ManageCategoriesPage() {
  const user = await getCurrentUser();
  
  if (!(await hasPermission(user, 'access_manage_categories'))) {
    redirect("/");
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
