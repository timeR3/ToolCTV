"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignToolsToUser, updateUserRole } from "@/lib/data";
import type { User, Role, Tool } from "@/types";
import { Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

interface ManageUsersClientProps {
  initialUsers: User[];
  currentUser: User;
  allTools: Tool[];
}

const roleColors: Record<Role, "default" | "secondary" | "destructive"> = {
    User: "default",
    Admin: "secondary",
    Superadmin: "destructive"
}

export function ManageUsersClient({ initialUsers, currentUser, allTools }: ManageUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignedTools, setAssignedTools] = useState<string[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isSavingTools, setIsSavingTools] = useState(false);
  
  const [currentUserToEdit, setCurrentUserToEdit] = useState<Partial<User>>({});
  const { toast } = useToast();

  const handleSelectUser = (user: User) => {
    if (user.role === 'Superadmin') {
      setSelectedUser(null);
      return;
    }
    setSelectedUser(user);
    setAssignedTools(user.assignedTools || []);
  };

  const handleEditUser = (user: User) => {
    setCurrentUserToEdit(user);
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!currentUserToEdit.id || !currentUserToEdit.role) {
      toast({ variant: "destructive", title: "Error", description: "Invalid user data." });
      return;
    }
    setIsSavingRole(true);
    try {
      const updatedUser = await updateUserRole(currentUserToEdit.id, currentUserToEdit.role, currentUser);
      if (updatedUser) {
        const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        setUsers(updatedUsers);
        // also update selected user if it's the one being edited
        if (selectedUser && selectedUser.id === updatedUser.id) {
          setSelectedUser(updatedUser);
        }
        toast({
          title: "Success",
          description: "User role updated successfully.",
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update user role.",
      });
    } finally {
      setIsSavingRole(false);
    }
  };
  
  const handleToolToggle = (toolId: string, checked: boolean) => {
    setAssignedTools(prev => 
      checked ? [...prev, toolId] : prev.filter(id => id !== toolId)
    );
  };
  
  const handleSaveChanges = async () => {
    if (!selectedUser) {
        toast({
            variant: "destructive",
            title: "No User Selected",
            description: "Please select a user to assign tools.",
        });
        return;
    }
    setIsSavingTools(true);
    try {
        const updatedUser = await assignToolsToUser(selectedUser.id, assignedTools, currentUser);
        if(updatedUser){
            const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
            setUsers(updatedUsers);
            setSelectedUser(updatedUser);
            toast({
                title: "Success",
                description: "Tool assignments have been updated.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save tool assignments.",
        });
    } finally {
        setIsSavingTools(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
            <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow 
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={cn(
                            user.role !== 'Superadmin' && "cursor-pointer",
                            selectedUser?.id === user.id && "bg-muted/50"
                        )}
                    >
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                            }}
                            disabled={user.id === currentUser.id}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
            <CardHeader>
                <CardTitle>Assign Tools for {selectedUser.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-muted-foreground">
                    Select the tools this user can access.
                    {selectedUser?.role === 'Admin' && " Admins have access to all tools by default."}
                </p>
                <ScrollArea className="h-72">
                    <div className="grid gap-4">
                        {allTools.filter(t => t.enabled).map(tool => (
                        <div key={tool.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`tool-${tool.id}`}
                                checked={assignedTools.includes(tool.id) || selectedUser?.role === 'Admin'}
                                onCheckedChange={(checked) => handleToolToggle(tool.id, !!checked)}
                                disabled={selectedUser?.role === 'Admin' || selectedUser?.role === 'Superadmin'}
                            />
                            <label
                                htmlFor={`tool-${tool.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {tool.name}
                            </label>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveChanges} disabled={isSavingTools || selectedUser?.role === 'Admin'}>
                        {isSavingTools ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Tool Assignments
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {currentUserToEdit.name}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right">Role</label>
              <Select
                value={currentUserToEdit.role}
                onValueChange={(value: Role) => setCurrentUserToEdit({ ...currentUserToEdit, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveRole} disabled={isSavingRole}>
              {isSavingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
