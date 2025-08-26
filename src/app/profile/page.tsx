import { getCurrentUser } from "@/lib/auth-db";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
     return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">No User Found</h1>
            <p>Could not load user profile.</p>
        </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Your Profile"
        description="Manage your account settings and personal information."
      />
      <ProfileForm user={user} />
    </div>
  );
}
