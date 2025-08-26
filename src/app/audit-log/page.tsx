import { getCurrentUser, hasPermission } from "@/lib/auth-db";
import { getLogs } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { AuditLogClient } from "@/components/audit-log-client";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user || !(await hasPermission(user, 'access_audit_log'))) {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p>You do not have permission to view this page.</p>
        </div>
    )
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
