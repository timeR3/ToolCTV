"use client";

import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { addTool, deleteTool, getCategories, getTools, updateTool } from "@/lib/data";
import type { Tool, User, Category } from "@/types";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DynamicIcon } from "./icons";
import { hasPermission } from "@/lib/auth-db";

interface ManageToolsClientProps {
    initialTools: Tool[];
    user: User;
}

export function ManageToolsClient({ initialTools, user }: ManageToolsClientProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTool, setCurrentTool] = useState<Partial<Tool>>({});
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const { toast } = useToast();
  
  const [canAdd, setCanAdd] = useState(false);
  const [canEditOwn, setCanEditOwn] = useState(false);
  const [canEditAny, setCanEditAny] = useState(false);
  const [canDeleteOwn, setCanDeleteOwn] = useState(false);
  const [canDeleteAny, setCanDeleteAny] = useState(false);
  
  useEffect(() => {
    const checkPerms = async () => {
        setCanAdd(await hasPermission(user, 'add_tools'));
        setCanEditOwn(await hasPermission(user, 'edit_own_tool'));
        setCanEditAny(await hasPermission(user, 'edit_any_tool'));
        setCanDeleteOwn(await hasPermission(user, 'delete_own_tool'));
        setCanDeleteAny(await hasPermission(user, 'delete_any_tool'));
    }
    checkPerms();
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch categories.'})
        }
    }
    fetchCategories();
  }, [toast]);

  const handleNewTool = () => {
    setCurrentTool({ category: categories[0]?.name || "General", enabled: true, icon: "Wrench", created_by_user_id: user.id });
    setIsDialogOpen(true);
  };

  const handleEditTool = (tool: Tool) => {
    setCurrentTool(tool);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setIsAlertOpen(true);
  }
  
  const confirmDelete = async () => {
    if (!toolToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTool(toolToDelete.id, user);
      setTools(tools.filter(t => t.id !== toolToDelete.id));
      toast({
        title: "Tool Deleted",
        description: `The tool "${toolToDelete.name}" has been deleted.`,
      });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error Deleting Tool",
            description: error.message || "Could not delete the tool.",
        });
    } finally {
        setIsDeleting(false);
        setIsAlertOpen(false);
        setToolToDelete(null);
    }
  }

  const handleSave = async () => {
    if (!currentTool.name || !currentTool.url) {
        toast({ variant: "destructive", title: "Error", description: "Tool name and URL cannot be empty." });
        return;
    }
    
    const selectedCategory = categories.find(c => c.name === currentTool.category);
    if (!selectedCategory) {
        toast({ variant: "destructive", title: "Error", description: "Please select a valid category." });
        return;
    }

    setIsSaving(true);
    try {
      if (currentTool.id) {
        // Update existing tool
        const updated = await updateTool(currentTool as Tool, user);
        if (updated) {
          setTools(tools.map(t => t.id === updated.id ? updated : t));
          toast({ title: "Success", description: "Tool updated successfully." });
        }
      } else {
        // Add new tool
        const newTool = await addTool({
            name: currentTool.name || "",
            description: currentTool.description || "",
            url: currentTool.url || "",
            icon: currentTool.icon || "Wrench",
            iconUrl: currentTool.iconUrl,
            enabled: currentTool.enabled ?? false,
            category_id: selectedCategory.id
        }, user);
        const newTools = await getTools(); // Re-fetch to get the full new tool object
        setTools(newTools);
        toast({ title: "Success", description: "Tool added successfully." });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error Saving Tool", description: error.message || "Could not save the tool." });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleNewTool} disabled={!canAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Tool
        </Button>
      </div>
      <div className="mt-4 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.map((tool) => {
              const canEditThisTool = canEditAny || (canEditOwn && user.id === tool.created_by_user_id);
              const canDeleteThisTool = canDeleteAny || (canDeleteOwn && user.id === tool.created_by_user_id);

              return (
              <TableRow key={tool.id}>
                <TableCell>
                  <Avatar className="h-8 w-8 rounded-md">
                    {tool.iconUrl ? (
                      <AvatarImage src={tool.iconUrl} alt={tool.name} className="object-contain" />
                    ) : null}
                    <AvatarFallback className="rounded-md bg-transparent">
                      <DynamicIcon name={tool.icon} className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{tool.description}</TableCell>
                <TableCell>{tool.category}</TableCell>
                <TableCell className="text-muted-foreground">{tool.createdByUser || 'N/A'}</TableCell>
                <TableCell>{tool.enabled ? "Enabled" : "Disabled"}</TableCell>
                <TableCell className="text-right">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditTool(tool)}
                    disabled={!canEditThisTool}
                    title={!canEditThisTool ? "You don't have permission to edit this tool" : "Edit tool"}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteClick(tool)}
                    disabled={!canDeleteThisTool}
                    title={!canDeleteThisTool ? "You don't have permission to delete this tool" : "Delete tool"}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTool.id ? "Edit Tool" : "Add New Tool"}</DialogTitle>
            <DialogDescription>
              {currentTool.id ? "Make changes to your tool here." : "Add a new tool to your toolbox."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={currentTool.name || ""} onChange={(e) => setCurrentTool({...currentTool, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input id="description" value={currentTool.description || ""} onChange={(e) => setCurrentTool({...currentTool, description: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input id="url" value={currentTool.url || ""} onChange={(e) => setCurrentTool({...currentTool, url: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">Icon Name</Label>
              <Input id="icon" value={currentTool.icon || ""} onChange={(e) => setCurrentTool({...currentTool, icon: e.target.value })} className="col-span-3" placeholder="A lucide-react icon name"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="iconUrl" className="text-right">Icon URL</Label>
              <Input id="iconUrl" value={currentTool.iconUrl || ""} onChange={(e) => setCurrentTool({...currentTool, iconUrl: e.target.value })} className="col-span-3" placeholder="URL for a custom icon"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                    Category
                </Label>
                <Select
                    value={currentTool.category}
                    onValueChange={(value) => setCurrentTool({ ...currentTool, category: value })}
                >
                    <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enabled" className="text-right">Enabled</Label>
              <Switch id="enabled" checked={currentTool.enabled} onCheckedChange={(checked) => setCurrentTool({...currentTool, enabled: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tool
              "{toolToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
