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
import { assignToolsToUser, updateUser, updateUserRole } from "@/lib/data";
import type { User, Role, Tool } from "@/types";
import { Loader2, Pencil, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { hasPermission } from "@/lib/auth-db";

interface ManageUsersClientProps {
  initialUsers: User[];
  currentUser: User;
  allTools: Tool[];
  permissions: {
    canEditUsers: boolean;
    canChangeRoles: boolean;
    canAssignTools: boolean;
  };
}

const roleColors: Record<Role, "default" | "secondary" | "destructive"> = {
    User: "default",
    Admin: "secondary",
    Superadmin: "destructive"
}

export function ManageUsersClient({ initialUsers, currentUser, allTools, permissions }: ManageUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignedTools, setAssignedTools] = useState<number[]>([]);
  
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentUserToEdit, setCurrentUserToEdit] = useState<Partial<User>>({});
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const { canEditUsers, canChangeRoles, canAssignTools } = permissions;

  const handleSelectUser = (user: User) => {
    if (user.role === 'Superadmin' && currentUser.role !== 'Superadmin') {
      setSelectedUser(null);
      return;
    }
    setSelectedUser(user);
    setAssignedTools(user.assignedTools || []);
  };

  const handleEditRoleClick = (user: User) => {
    setCurrentUserToEdit(user);
    setIsRoleDialogOpen(true);
  };
  
  const handleEditUserClick = (user: User) => {
    setCurrentUserToEdit(user);
    setNewPassword("");
    setIsEditUserDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!currentUserToEdit.id || !currentUserToEdit.role) {
      toast({ variant: "destructive", title: "Error", description: "Invalid user data." });
      return;
    }
    setIsSaving(true);
    try {
      const updatedUser = await updateUserRole(currentUserToEdit.id, currentUserToEdit.role, currentUser);
      if (updatedUser) {
        const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        setUsers(updatedUsers);
        if (selectedUser && selectedUser.id === updatedUser.id) {
          setSelectedUser(updatedUser);
        }
        toast({
          title: "Success",
          description: "User role updated successfully.",
        });
      }
      setIsRoleDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not update user role.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async () => {
    if (!currentUserToEdit.id) return;
    
    const dataToUpdate: Partial<User> = { name: currentUserToEdit.name, email: currentUserToEdit.email };
    if (newPassword) {
        dataToUpdate.password = newPassword;
    }

    setIsSaving(true);
    try {
        const updatedUser = await updateUser(currentUserToEdit.id, dataToUpdate, currentUser);
        if (updatedUser) {
            const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
            setUsers(updatedUsers);
             if (selectedUser && selectedUser.id === updatedUser.id) {
                setSelectedUser(updatedUser);
            }
            toast({ title: "Success", description: "User updated successfully."});
            setIsEditUserDialogOpen(false);
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || "Could not update user."});
    } finally {
        setIsSaving(false);
    }
  }
  
  const handleToolToggle = (toolId: number) => {
    setAssignedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
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
    setIsSaving(true);
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
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Could not save tool assignments.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const enabledTools = allTools.filter(tool => tool.enabled);
  
  // const canEditUsers = hasPermission(currentUser, 'edit_any_user'); // Removed
  // const canChangeRoles = hasPermission(currentUser, 'change_user_roles'); // Removed
  // const canAssignTools = hasPermission(currentUser, 'assign_tools'); // Removed


  return (
    <>
    <div className="grid gap-6">
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
                            (user.role !== 'Superadmin' || currentUser.role === 'Superadmin') && "cursor-pointer",
                            selectedUser?.id === user.id && "bg-muted/50"
                        )}
                    >
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                        <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleEditUserClick(user); }}
                                disabled={!canEditUsers && currentUser.id !== user.id}
                                title="Edit User Details"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => { e.stopPropagation(); handleEditRoleClick(user); }}
                                disabled={!canChangeRoles || user.id === currentUser.id}
                                title="Change User Role"
                            >
                                <Users className="h-4 w-4" />
                            </Button>
                          </>
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
                    {(selectedUser?.role === 'Admin' || selectedUser?.role === 'Superadmin') && " Admins and Superadmins have access to all tools by default."}
                </p>
                <ScrollArea className="h-72 rounded-md border">
                    <Table>
                        <TableBody>
                            {enabledTools.map(tool => (
                            <TableRow key={tool.id}>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tool-${tool.id}`}
                                            checked={assignedTools.includes(tool.id) || selectedUser?.role === 'Admin' || selectedUser?.role === 'Superadmin'}
                                            onCheckedChange={() => handleToolToggle(tool.id)}
                                            disabled={!canAssignTools || selectedUser?.role === 'Admin' || selectedUser?.role === 'Superadmin'}
                                        />
                                        <label
                                            htmlFor={`tool-${tool.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {tool.name}
                                        </label>
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveChanges} disabled={isSaving || !canAssignTools || selectedUser?.role === 'Admin' || selectedUser?.role === 'Superadmin'}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Tool Assignments
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}
    </div>

    {currentUser.role === 'Superadmin' && (
      <>
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {currentUserToEdit.name}. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
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
              <Button type="submit" onClick={handleSaveRole} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Modify the details for {currentUserToEdit.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={currentUserToEdit.name || ""} onChange={(e) => setCurrentUserToEdit({...currentUserToEdit, name: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={currentUserToEdit.email || ""} onChange={(e) => setCurrentUserToEdit({...currentUserToEdit, email: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">New Password</Label>
                    <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" placeholder="Leave blank to keep current"/>
                </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveUser} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )}
    </>
  );
}
