'use server';
// This file acts as a mock in-memory database.
import type { Tool, LogEntry, User, Category, Role, Permission } from "@/types";
import { query } from './db';

let logs: LogEntry[] = [];

// Simulate fetching data with a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTools = async (): Promise<Tool[]> => {
  try {
    const rows = await query(`
      SELECT t.*, c.name as categoryName 
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
    `, []) as any[];
    return rows.map(row => ({...row, category: row.categoryName}));
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return [];
  }
};

export const addTool = async (tool: Omit<Tool, 'id' | 'category'> & { category_id: string }, user: User) => {
  await sleep(200);
  const newToolId = `t${Date.now()}`;
  await query(
    'INSERT INTO tools (id, name, description, url, icon, iconUrl, enabled, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [newToolId, tool.name, tool.description, tool.url, tool.icon, tool.iconUrl, tool.enabled, tool.category_id]
  );
  logAction(user, `Created tool: ${tool.name}`, `ID: ${newToolId}`);
  const newTool = await query('SELECT * FROM tools WHERE id = ?', [newToolId]) as any[];
  return newTool[0];
};

export const updateTool = async (updatedTool: Tool, user: User) => {
  await sleep(200);
  const oldToolResult = await query('SELECT * FROM tools WHERE id = ?', [updatedTool.id]) as any[];
  if (oldToolResult.length > 0) {
    const oldTool = oldToolResult[0];
    const categoryResult = await query('SELECT id FROM categories WHERE name = ?', [updatedTool.category]) as any[];
    const category_id = categoryResult[0]?.id;

    if (!category_id) throw new Error(`Category ${updatedTool.category} not found`);

    await query(
        'UPDATE tools SET name = ?, description = ?, url = ?, icon = ?, iconUrl = ?, enabled = ?, category_id = ? WHERE id = ?',
        [updatedTool.name, updatedTool.description, updatedTool.url, updatedTool.icon, updatedTool.iconUrl, updatedTool.enabled, category_id, updatedTool.id]
    );
    logAction(user, `Updated tool: ${updatedTool.name}`, `Changes: ${JSON.stringify(diff(oldTool, updatedTool))}`);
    const newTool = await query('SELECT * FROM tools WHERE id = ?', [updatedTool.id]) as any[];
    return newTool[0];
  }
  return null;
};

export const deleteTool = async (toolId: string, user: User) => {
  await sleep(200);
  const toolToDeleteResult = await query('SELECT name FROM tools WHERE id = ?', [toolId]) as any[];
  if(toolToDeleteResult.length > 0) {
    const toolName = toolToDeleteResult[0].name;
    await query('DELETE FROM tools WHERE id = ?', [toolId]);
    logAction(user, `Deleted tool: ${toolName}`, `ID: ${toolId}`);
  }
};

export const getLogs = async () => {
  await sleep(200);
  // In a real app, this should also come from the DB
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
export const getCategories = async (): Promise<Category[]> => {
    try {
      return await query('SELECT * FROM categories', []) as Category[];
    } catch(error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
}

export const addCategory = async (category: Omit<Category, 'id'>, user: User) => {
    await sleep(100);
    const newCategoryId = `cat${Date.now()}`;
    await query(
        'INSERT INTO categories (id, name, description, enabled, icon, iconUrl) VALUES (?, ?, ?, ?, ?, ?)',
        [newCategoryId, category.name, category.description, category.enabled, category.icon, category.iconUrl]
    );
    logAction(user, `Created category: ${category.name}`, `ID: ${newCategoryId}`);
    const newCategory = await query('SELECT * FROM categories WHERE id = ?', [newCategoryId]) as any[];
    return newCategory[0];
}

export const updateUserRole = async (userId: string, role: Role, admin: User): Promise<User | null> => {
    if (admin.role !== 'Superadmin') {
        throw new Error('Only Superadmins can change user roles.');
    }
    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        const updatedUserResult = await query('SELECT * FROM users WHERE id = ?', [userId]) as any[];
        const updatedUser = updatedUserResult[0];
        
        if (updatedUser) {
            logAction(admin, `Updated role for ${updatedUser.name} to ${role}`, `User ID: ${userId}`);
            // Fetch assigned tools for the user to return a complete User object
            const assignedToolsResult = await query('SELECT tool_id FROM user_tools WHERE user_id = ?', [userId]) as any[];
            updatedUser.assignedTools = assignedToolsResult.map((row: any) => row.tool_id);
            return updatedUser;
        }
        return null;
    } catch (error) {
        console.error("Failed to update user role:", error);
        throw new Error('Database error while updating user role.');
    }
}

export const updateCategory = async (updatedCategory: Category, user: User) => {
    await sleep(100);
    const oldCategoryResult = await query('SELECT * FROM categories WHERE id = ?', [updatedCategory.id]) as any[];
    if(oldCategoryResult.length > 0) {
        const oldCategory = oldCategoryResult[0];
        await query(
            'UPDATE categories SET name = ?, description = ?, enabled = ?, icon = ?, iconUrl = ? WHERE id = ?',
            [updatedCategory.name, updatedCategory.description, updatedCategory.enabled, updatedCategory.icon, updatedCategory.iconUrl, updatedCategory.id]
        );
        logAction(user, `Updated category: ${updatedCategory.name}`, `Changes: ${JSON.stringify(diff(oldCategory, updatedCategory))}`);
        return updatedCategory;
    }
    return null;
}

export const deleteCategory = async (categoryId: string, user: User) => {
    await sleep(100);
    const categoryToDeleteResult = await query('SELECT name FROM categories WHERE id = ?', [categoryId]) as any[];
    if (categoryToDeleteResult.length > 0) {
        const categoryToDelete = categoryToDeleteResult[0];
        // Before deleting, update tools in this category to 'General'
        await query(`UPDATE tools SET category_id = 'cat_general' WHERE category_id = ?`, [categoryId]);
        await query('DELETE FROM categories WHERE id = ?', [categoryId]);
        logAction(user, `Deleted category: ${categoryToDelete.name}`, `ID: ${categoryId}`);
    }
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersQuery = `
      SELECT u.id, u.name, u.email, u.avatar, u.role
      FROM users u
    `;
    const usersRows = await query(usersQuery, []) as any[];

    const userToolsQuery = `SELECT user_id, tool_id FROM user_tools`;
    const userToolsRows = await query(userToolsQuery, []) as any[];

    const userToolsMap = userToolsRows.reduce((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = [];
      }
      acc[row.user_id].push(row.tool_id);
      return acc;
    }, {} as Record<string, string[]>);


    return usersRows.map(user => ({
      ...user,
      assignedTools: userToolsMap[user.id] || []
    })) as User[];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return []; // Return an empty array on error to prevent crashes.
  }
}

export const assignToolsToUser = async (userId: string, toolIds: string[], admin: User): Promise<User | null> => {
    if (admin.role !== 'Admin' && admin.role !== 'Superadmin') {
        throw new Error('Only Admins and Superadmins can assign tools.');
    }
    const connection = await query('START TRANSACTION', []);
    try {
        await query('DELETE FROM user_tools WHERE user_id = ?', [userId]);

        if (toolIds.length > 0) {
            const values = toolIds.map(toolId => [userId, toolId]);
            await query('INSERT INTO user_tools (user_id, tool_id) VALUES ?', [values]);
        }
        await query('COMMIT', []);
        
        const updatedUserResult = await query('SELECT * FROM users WHERE id = ?', [userId]) as any[];
        const updatedUser = updatedUserResult[0];

        if (updatedUser) {
            logAction(admin, `Assigned tools to ${updatedUser.name}`, `Tool IDs: ${toolIds.join(', ')}`);
             const assignedToolsResult = await query('SELECT tool_id FROM user_tools WHERE user_id = ?', [userId]) as any[];
            updatedUser.assignedTools = assignedToolsResult.map((row: any) => row.tool_id);
            return updatedUser;
        }
        return null;
    } catch (error) {
        await query('ROLLBACK', []);
        console.error("Failed to assign tools to user:", error);
        throw new Error('Database error while assigning tools.');
    }
}

// --- Permissions Management ---

export const getAllPermissions = async (): Promise<Permission[]> => {
    try {
      return await query('SELECT * FROM permissions ORDER BY name', []) as Permission[];
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      return [];
    }
}

export const getRolePermissions = async (): Promise<Record<Role, string[]>> => {
    const rolePermissions: Record<Role, string[]> = {
        User: [],
        Admin: [],
        Superadmin: [],
    };
    try {
      const results = await query(`
          SELECT rp.role, p.name as permissionName
          FROM role_permissions rp
          JOIN permissions p ON rp.permission_id = p.id
      `, []) as any[];


      for (const row of results) {
          if (rolePermissions[row.role]) {
              rolePermissions[row.role].push(row.permissionName);
          }
      }
    } catch(error) {
       console.error("Failed to fetch role permissions:", error);
    }
    return rolePermissions;
}

export const updateRolePermission = async (role: Role, permissionId: string, hasPermission: boolean, admin: User): Promise<void> => {
    if (admin.role !== 'Superadmin') {
        throw new Error('Only Superadmins can modify permissions.');
    }

    try {
        if (hasPermission) {
            // Add permission, ignore if it already exists
            await query('INSERT IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)', [role, permissionId]);
            logAction(admin, `Granted permission ${permissionId} to role ${role}`, '');
        } else {
            // Remove permission
            await query('DELETE FROM role_permissions WHERE role = ? AND permission_id = ?', [role, permissionId]);
            logAction(admin, `Revoked permission ${permissionId} from role ${role}`, '');
        }
    } catch (error) {
        console.error("Failed to update role permission:", error);
        throw new Error('Database error while updating permission.');
    }
}
