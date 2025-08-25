import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getLogs } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { AuditLogClient } from "@/components/audit-log-client";
import { redirect } from "next/navigation";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  
  if (!(await hasPermission(user, 'access_audit_log'))) {
    redirect("/");
  }

  const logs = await getLogs();

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Review all administrative actions performed in the system."
      />
      <AuditLogClient logs={logs} />
    </div>
  );
}
