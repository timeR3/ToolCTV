import { getCurrentUser } from "@/lib/auth";
import { getLogs } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { AuditLogClient } from "@/components/audit-log-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  const logs = await getLogs();

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
