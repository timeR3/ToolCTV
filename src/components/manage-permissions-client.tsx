"use client";

import { useState } from "react";
import type { Permission, Role, User } from "@/types";
import { updateRolePermission } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface ManagePermissionsClientProps {
  initialPermissions: Permission[];
  initialRolePermissions: Record<Role, string[]>;
  currentUser: User;
}

export function ManagePermissionsClient({
  initialPermissions,
  initialRolePermissions,
  currentUser,
}: ManagePermissionsClientProps) {
  const [rolePermissions, setRolePermissions] = useState(initialRolePermissions);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handlePermissionChange = async (
    role: Role,
    permission: Permission,
    checked: boolean
  ) => {
    const savingKey = `${role}-${permission.id}`;
    setIsSaving((prev) => ({ ...prev, [savingKey]: true }));

    try {
      await updateRolePermission(role, permission.id, checked, currentUser);
      setRolePermissions((prev) => {
        const updatedPermissions = checked
          ? [...(prev[role] || []), permission.name]
          : (prev[role] || []).filter((p) => p !== permission.name);
        return { ...prev, [role]: updatedPermissions };
      });
      toast({
        title: "Success",
        description: `Permission for ${role} updated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update permission.",
      });
    } finally {
      setIsSaving((prev) => ({ ...prev, [savingKey]: false }));
    }
  };

  const roles: Role[] = ["User", "Admin"]; // Superadmin has all permissions implicitly

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Based Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Permission</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center">
                    <Badge variant={role === 'Admin' ? 'secondary' : 'default'}>{role}</Badge>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <p className="font-medium">{permission.name.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </TableCell>
                  {roles.map((role) => {
                    const savingKey = `${role}-${permission.id}`;
                    const isChecked = rolePermissions[role]?.includes(permission.name);
                    return (
                      <TableCell key={role} className="text-center">
                        {isSaving[savingKey] ? (
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        ) : (
                          <Switch
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(role, permission, checked)
                            }
                            disabled={currentUser.role !== 'Superadmin'}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
            Note: The <strong>Superadmin</strong> role always has all permissions by default.
        </p>
      </CardContent>
    </Card>
  );
}
