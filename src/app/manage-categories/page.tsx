import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { ManageCategoriesClient } from "@/components/manage-categories-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ManageCategoriesPage() {
  const user = await getCurrentUser();
  const categories = await getCategories();

  const hasAccess = user.role === "Admin" || user.role === "Superadmin";

  if (!hasAccess) {
    redirect("/");
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
