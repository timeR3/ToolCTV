import { getCurrentUser } from "@/lib/auth";
import { getLogs } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { AuditLogClient } from "@/components/audit-log-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  
  if (user.role !== "Superadmin") {
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
