"use client";

import type { LogEntry } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface AuditLogClientProps {
    logs: LogEntry[];
}

export function AuditLogClient({ logs }: AuditLogClientProps) {

  return (
    <div className="rounded-lg border">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                <TableRow key={log.id}>
                    <TableCell>{format(log.timestamp, "PPP p")}</TableCell>
                    <TableCell>{log.adminName}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.details}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
