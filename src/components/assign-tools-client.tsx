"use client";

import { useState } from "react";
import type { User, Tool } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { assignToolsToUser } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface AssignToolsClientProps {
  allUsers: User[];
  allTools: Tool[];
  adminUser: User;
}

export function AssignToolsClient({ allUsers, allTools, adminUser }: AssignToolsClientProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [assignedTools, setAssignedTools] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = allUsers.find(u => u.id === userId);
    setAssignedTools(user ? user.assignedTools : []);
  };

  const handleToolToggle = (toolId: string, checked: boolean) => {
    setAssignedTools(prev => 
      checked ? [...prev, toolId] : prev.filter(id => id !== toolId)
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedUserId) {
        toast({
            variant: "destructive",
            title: "No User Selected",
            description: "Please select a user to assign tools.",
        });
        return;
    }
    setIsSaving(true);
    try {
        await assignToolsToUser(selectedUserId, assignedTools, adminUser);
        toast({
            title: "Success",
            description: "Tool assignments have been updated.",
        });
        // Note: In a real app, you might want to refresh the user data here.
        // For this mock setup, the state is managed locally until page refresh.
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save tool assignments.",
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  const selectedUser = allUsers.find(u => u.id === selectedUserId);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Label htmlFor="user-select">User</Label>
              <Select onValueChange={handleUserChange} value={selectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user to manage..." />
                </SelectTrigger>
                <SelectContent>
                  {allUsers
                    .filter(u => u.role !== 'Superadmin')
                    .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Available Tools</CardTitle>
            </CardHeader>
            <CardContent>
                {selectedUserId ? (
                    <>
                        <p className="mb-4 text-muted-foreground">
                            Assign tools for <span className="font-semibold text-foreground">{selectedUser?.name}</span>. 
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
                            <Button onClick={handleSaveChanges} disabled={isSaving || selectedUser?.role === 'Admin'}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-72">
                        <p className="text-muted-foreground">Select a user to see their tool assignments.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}