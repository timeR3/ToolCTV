import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();

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
