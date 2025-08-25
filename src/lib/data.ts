'use server';
// This file acts as a mock in-memory database.
import type { Tool, LogEntry, User, Category, Role } from "@/types";
import { query } from './db';

// In-memory data is now being replaced by MySQL queries.

let tools: Tool[] = [
  {
    id: "t1",
    name: "Project Planner",
    description: "A Kanban board for project management.",
    url: "https://trello.com",
    icon: "Wrench",
    iconUrl: "",
    enabled: true,
    category: "Proyectos",
  },
  {
    id: "t2",
    name: "Security Scanner",
    description: "Tool for scanning web vulnerabilities.",
    url: "https://www.ssllabs.com/ssltest/",
    icon: "ShieldCheck",
    iconUrl: "",
    enabled: true,
    category: "IT",
  },
  {
    id: "t3",
    name: "Version Control",
    description: "Git repository management.",
    url: "https://github.com",
    icon: "GitBranch",
    iconUrl: "",
    enabled: false,
    category: "IT",
  },
  {
    id: "t4",
    name: "Time Tracker",
    description: "Log and track work hours.",
    url: "https://toggl.com/track/timer/",
    icon: "FileClock",
    iconUrl: "",
    enabled: true,
    category: "Contabilidad",
  },
];

let categories: Category[] = [
    { id: "cat1", name: "Finanzas", description: "Herramientas para gestión financiera", enabled: true, icon: "Shapes" },
    { id: "cat2", name: "Marketing", description: "Herramientas para campañas y análisis", enabled: true, icon: "Shapes" },
    { id: "cat3", name: "Diseño", description: "Herramientas para creativos", enabled: true, icon: "Shapes" },
    { id: "cat4", name: "Proyectos", description: "Herramientas para gestión de proyectos", enabled: true, icon: "Shapes" },
    { id: "cat5", name: "Contabilidad", description: "Herramientas para contabilidad y finanzas", enabled: false, icon: "Shapes" },
    { id: "cat6", name: "IT", description: "Herramientas para el equipo de TI", enabled: true, icon: "Shapes" },
];

let logs: LogEntry[] = [];

// Simulate fetching data with a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTools = async () => {
  await sleep(200);
  return [...tools];
};

export const addTool = async (tool: Omit<Tool, 'id'>, user: User) => {
  await sleep(200);
  const newTool: Tool = { ...tool, id: `t${Date.now()}` };
  tools.unshift(newTool);
  logAction(user, `Created tool: ${newTool.name}`, `ID: ${newTool.id}`);
  return newTool;
};

export const updateTool = async (updatedTool: Tool, user: User) => {
  await sleep(200);
  const index = tools.findIndex(t => t.id === updatedTool.id);
  if (index !== -1) {
    const oldTool = tools[index];
    tools[index] = updatedTool;
    logAction(user, `Updated tool: ${updatedTool.name}`, `Changes: ${JSON.stringify(diff(oldTool, updatedTool))}`);
    return updatedTool;
  }
  return null;
};

export const deleteTool = async (toolId: string, user: User) => {
  await sleep(200);
  const toolToDelete = tools.find(t => t.id === toolId);
  if(toolToDelete) {
    tools = tools.filter(t => t.id !== toolId);
    logAction(user, `Deleted tool: ${toolToDelete.name}`, `ID: ${toolId}`);
  }
};

export const getLogs = async () => {
  await sleep(200);
  return [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const logAction = (user: User, action: string, details: string) => {
  const newLog: LogEntry = {
    id: `l${Date.now()}`,
    timestamp: new Date(),
    adminName: user.name,
    action,
    details,
  };
  logs.unshift(newLog);
};

export const logUserAccess = async (user: User, action: string, details: string = "") => {
    await sleep(50);
    const newLog: LogEntry = {
        id: `l${Date.now()}`,
        timestamp: new Date(),
        adminName: user.name,
        action,
        details,
    };
    logs.unshift(newLog);
}

// Helper to find differences between two objects for logging
const diff = (obj1: any, obj2: any) => {
  return Object.keys(obj1).reduce((result, key) => {
    if (obj2.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
      result[key] = { from: obj1[key], to: obj2[key] };
    }
    return result;
  }, {} as any);
}

// Categories
export const getCategories = async () => {
    await sleep(100);
    return [...categories];
}

export const addCategory = async (category: Omit<Category, 'id'>, user: User) => {
    await sleep(100);
    const newCategory: Category = { ...category, id: `cat${Date.now()}` };
    categories.push(newCategory);
    logAction(user, `Created category: ${newCategory.name}`, `ID: ${newCategory.id}`);
    return newCategory;
}

export const updateUserRole = async (userId: string, role: Role, admin: User): Promise<User | null> => {
    if (admin.role !== 'Superadmin') {
        throw new Error('Only Superadmins can change user roles.');
    }
    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        const updatedUser = (await query('SELECT * FROM users WHERE id = ?', [userId])) as User[];
        if (updatedUser.length > 0) {
            logAction(admin, `Updated role for ${updatedUser[0].name} to ${role}`, `User ID: ${userId}`);
            return updatedUser[0];
        }
        return null;
    } catch (error) {
        console.error("Failed to update user role:", error);
        throw new Error('Database error while updating user role.');
    }
}

export const updateCategory = async (updatedCategory: Category, user: User) => {
    await sleep(100);
    const index = categories.findIndex(c => c.id === updatedCategory.id);
    if (index !== -1) {
        const oldCategory = categories[index];
        categories[index] = updatedCategory;
        logAction(user, `Updated category: ${updatedCategory.name}`, `Changes: ${JSON.stringify(diff(oldCategory, updatedCategory))}`);
        return updatedCategory;
    }
    return null;
}

export const deleteCategory = async (categoryId: string, user: User) => {
    await sleep(100);
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (categoryToDelete) {
        categories = categories.filter(c => c.id !== categoryId);
        // Optional: Also update tools that used this category
        tools = tools.map(t => t.category === categoryToDelete.name ? { ...t, category: 'General' } : t);
        logAction(user, `Deleted category: ${categoryToDelete.name}`, `ID: ${categoryId}`);
    }
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const rows = await query('SELECT * FROM users', []) as any[];
    // The mysql2 driver can parse JSON columns automatically.
    // If assignedTools is a TEXT column storing a JSON string, you might need to parse it manually:
    // return rows.map(row => ({ ...row, assignedTools: JSON.parse(row.assignedTools || '[]') }));
    return rows as User[];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return []; // Return an empty array on error to prevent crashes.
  }
}

export const assignToolsToUser = async (userId: string, toolIds: string[], admin: User): Promise<User | null> => {
    if (admin.role !== 'Admin' && admin.role !== 'Superadmin') {
        throw new Error('Only Admins and Superadmins can assign tools.');
    }
    try {
        // We need to stringify the array to store it in the JSON column
        const toolsJson = JSON.stringify(toolIds);
        await query('UPDATE users SET assignedTools = ? WHERE id = ?', [toolsJson, userId]);
        
        const updatedUserRows = await query('SELECT * FROM users WHERE id = ?', [userId]) as any[];
        if (updatedUserRows.length > 0) {
            const updatedUser = updatedUserRows[0] as User;
            logAction(admin, `Assigned tools to ${updatedUser.name}`, `Tool IDs: ${toolIds.join(', ')}`);
            return updatedUser;
        }
        return null;
    } catch (error) {
        console.error("Failed to assign tools to user:", error);
        throw new Error('Database error while assigning tools.');
    }
}
