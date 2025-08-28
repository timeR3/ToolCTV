'use server';
// This file acts as a mock in-memory database.
import type { Tool, LogEntry, User, Category, Role, Permission } from "@/types";
import { query } from './db';
import bcrypt from 'bcryptjs';
import { redirect } from "next/navigation";
import { hasPermission } from "./auth-db";
import { logDetailedError } from './error-logger'; // Import the new logger

const SALT_ROUNDS = 10;

// Simulate fetching data with a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Removed the local logDetailedError definition as it's now imported.

export const getTools = async (): Promise<Tool[]> => {
  try {
    const rows = await query(`
      SELECT 
        t.*, 
        c.name as categoryName,
        u.name as createdByUserName
      FROM tools t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by_user_id = u.id
    `, []) as any[];
    return rows.map(row => ({
      ...row, 
      category: row.categoryName, 
      id: Number(row.id), 
      created_by_user_id: Number(row.created_by_user_id),
      createdByUser: row.createdByUserName
    }));
  } catch (error: unknown) {
    logDetailedError("Failed to fetch tools", error);
    return [];
  }
};

export const addTool = async (tool: Omit<Tool, 'id' | 'category' | 'createdByUser'> & { category_id: number }, user: User): Promise<Tool> => {
    if (!(await hasPermission(user, 'add_tools'))) {
        throw new Error('You do not have permission to add tools.');
    }
  await sleep(200);
  // La lógica de búsqueda de categoría se ha movido al componente cliente.
  // const categoryResult = await query('SELECT id FROM categories WHERE name = ?', [tool.category]) as any[];
  //   if (categoryResult.length === 0) {
  //       throw new Error(`Category not found: ${tool.category}`);
  //   }
  // const category_id = categoryResult[0].id;

  const result = await query(
    'INSERT INTO tools (name, description, url, icon, iconUrl, enabled, category_id, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [tool.name, tool.description, tool.url, tool.icon, tool.iconUrl ?? null, tool.enabled, tool.category_id, user.id]
  ) as any;
  const newToolId = result.insertId;
  // logAction uses the imported logDetailedError indirectly now
  logAction(user, `Created tool: ${tool.name}`, `ID: ${newToolId}`);
  const newToolResult = await query(`
    SELECT t.*, c.name as categoryName, u.name as createdByUserName 
    FROM tools t 
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.created_by_user_id = u.id
    WHERE t.id = ?`, [newToolId]) as any[];
  const newTool = newToolResult[0];
  return {
    ...newTool, 
    category: newTool.categoryName, 
    id: Number(newTool.id), 
    created_by_user_id: Number(newTool.created_by_user_id),
    createdByUser: newTool.createdByUserName
  };
};

export const updateTool = async (updatedTool: Tool, user: User) => {
  await sleep(200);
  const oldToolResult = await query('SELECT * FROM tools WHERE id = ?', [updatedTool.id]) as any[];
  if (oldToolResult.length > 0) {
    const oldTool = oldToolResult[0];

    // Ownership check
    if (oldTool.created_by_user_id !== user.id && !(await hasPermission(user, 'edit_any_tool'))) {
        if (!(await hasPermission(user, 'edit_own_tool'))) {
            throw new Error("Permission Denied. You cannot edit this tool.");
        }
    }

    const categoryResult = await query('SELECT id FROM categories WHERE name = ?', [updatedTool.category]) as any[];
    const category_id = categoryResult[0]?.id;

    if (!category_id) throw new Error(`Category ${updatedTool.category} not found`);

    await query(
        'UPDATE tools SET name = ?, description = ?, url = ?, icon = ?, iconUrl = ?, enabled = ?, category_id = ? WHERE id = ?',
        [updatedTool.name, updatedTool.description, updatedTool.url, updatedTool.icon, updatedTool.iconUrl, updatedTool.enabled, category_id, updatedTool.id]
    );
    logAction(user, `Updated tool: ${updatedTool.name}`, `Changes: ${JSON.stringify(diff(oldTool, updatedTool))}`);
    const newToolResult = await query(`
        SELECT t.*, c.name as categoryName, u.name as createdByUserName
        FROM tools t 
        LEFT JOIN categories c ON t.category_id = c.id 
        LEFT JOIN users u ON t.created_by_user_id = u.id
        WHERE t.id = ?`, [updatedTool.id]) as any[];
    const newTool = newToolResult[0];
    return {
        ...newTool, 
    category: newTool.categoryName, 
    id: Number(newTool.id), 
    created_by_user_id: Number(newTool.created_by_user_id),
    createdByUser: newTool.createdByUserName
    };
  }
  return null;
};

export const deleteTool = async (toolId: number, user: User) => {
  await sleep(200);
  const toolToDeleteResult = await query('SELECT name, created_by_user_id FROM tools WHERE id = ?', [toolId]) as any[];
  if(toolToDeleteResult.length > 0) {
    const toolToDelete = toolToDeleteResult[0];
    
    if (toolToDelete.created_by_user_id !== user.id && !(await hasPermission(user, 'delete_any_tool'))) {
        if (!(await hasPermission(user, 'delete_own_tool'))) {
             throw new Error("Permission Denied. You cannot delete this tool.");
        }
    }

    await query('DELETE FROM user_tools WHERE tool_id = ?', [toolId]);
    await query('DELETE FROM tools WHERE id = ?', [toolId]);
    logAction(user, `Deleted tool: ${toolToDelete.name}`, `ID: ${toolId}`);
  }
};

export const getLogs = async (): Promise<LogEntry[]> => {
    try {
        const rows = await query(`
            SELECT l.id, l.timestamp, u.name as adminName, l.action, l.details 
            FROM audit_log l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.timestamp DESC
        `, []) as any[];
        return rows.map(r => ({ ...r, id: Number(r.id) }));
    } catch (error: unknown) {
        logDetailedError("Failed to fetch logs", error);
        return [];
    }
};

const logAction = async (user: User, action: string, details: string) => {
    try {
        await query(
            'INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)',
            [user.id, action, details]
        );
    } catch (error: unknown) {
        logDetailedError("Failed to log action", error, { userId: user.id });
    }
};

export const logUserAccess = async (user: User, action: string, details: string = "") => {
    await logAction(user, action, details);
}

// Helper to find differences between two objects for logging
const diff = (obj1: any, obj2: any) => {
  return Object.keys(obj2).reduce((result, key) => {
    if (obj1.hasOwnProperty(key) && obj1[key] !== obj2[key] && key !== 'password') {
      result[key] = { from: obj1[key], to: obj2[key] };
    }
    return result;
  }, {} as any);
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
    try {
      const rows = await query('SELECT * FROM categories', []) as any[];
      return rows.map(r => ({ ...r, id: Number(r.id), enabled: Boolean(r.enabled) }));
    } catch(error: unknown) {
      logDetailedError("Failed to fetch categories", error);
      return [];
    }
}

export const addCategory = async (category: Omit<Category, 'id'>, user: User): Promise<Category> => {
    if (!(await hasPermission(user, 'add_categories'))) {
        throw new Error('You do not have permission to add categories.');
    }
    await sleep(100);
    const result = await query(
        'INSERT INTO categories (name, description, enabled, icon, iconUrl) VALUES (?, ?, ?, ?, ?)',
        [category.name, category.description, category.enabled, category.icon, category.iconUrl]
    ) as any;
    const newCategoryId = result.insertId;
    logAction(user, `Created category: ${category.name}`, `ID: ${newCategoryId}`);
    const newCategory = await query('SELECT * FROM categories WHERE id = ?', [newCategoryId]) as any[];
    return { ...newCategory[0], id: Number(newCategory[0].id), enabled: Boolean(newCategory[0].enabled) };
}

export const updateUserRole = async (userId: number, role: Role, admin: User): Promise<User | null> => {
    if (!(await hasPermission(admin, 'change_user_roles'))) {
        throw new Error('You do not have permission to change user roles.');
    }
    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        logAction(admin, `Updated role for user ID ${userId} to ${role}`, `Admin: ${admin.name}`);
        return await getUserById(userId);
    } catch (error: unknown) {
        logDetailedError("Failed to update user role", error, { userId });
        throw new Error('Database error while updating user role.');
    }
}

export const updateUser = async (userId: number, data: Partial<User>, admin: User): Promise<User | null> => {
    const isSelfUpdate = userId === admin.id;
    if (!isSelfUpdate && !(await hasPermission(admin, 'edit_any_user'))) {
        throw new Error("You are not authorized to update this user.");
    }

    const oldUserResult = await query('SELECT * FROM users WHERE id = ?', [userId]) as any[];
    if (oldUserResult.length === 0) throw new Error("User not found");
    const oldUser = oldUserResult[0];

    const fieldsToUpdate: Partial<User> = {};
    if (data.name) fieldsToUpdate.name = data.name;
    if (data.email && (await hasPermission(admin, 'edit_any_user'))) fieldsToUpdate.email = data.email;
    if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
        fieldsToUpdate.password = hashedPassword;
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return getUserById(userId); // Nothing to update
    }

    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);

    await query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, userId]);
    
    logAction(admin, `Updated user profile for ${oldUser.name}`, `Changes: ${JSON.stringify(diff(oldUser, data))}`);

    return await getUserById(userId);
};


export const updateCategory = async (updatedCategory: Category, user: User) => {
    if (!(await hasPermission(user, 'edit_categories'))) {
        throw new Error('You do not have permission to edit categories.');
    }
    await sleep(100);
    const oldCategoryResult = await query('SELECT * FROM categories WHERE id = ?', [updatedCategory.id]) as any[];
    if(oldCategoryResult.length > 0) {
        const oldCategory = oldCategoryResult[0];
        await query(
            'UPDATE categories SET name = ?, description = ?, enabled = ?, icon = ?, iconUrl = ? WHERE id = ?',
            [updatedCategory.name, updatedCategory.description, updatedCategory.enabled, updatedCategory.icon, updatedCategory.iconUrl, updatedCategory.id]
        );
        logAction(user, `Updated category: ${updatedCategory.name}`, `Changes: ${JSON.stringify(diff(oldCategory, updatedCategory))}`);
        const newCategory = (await query('SELECT * FROM categories WHERE id = ?', [updatedCategory.id]) as any[])[0];
        return { ...newCategory, id: Number(newCategory.id), enabled: Boolean(newCategory.enabled) };
    }
    return null;
}

export const deleteCategory = async (categoryId: number, user: User) => {
    if (!(await hasPermission(user, 'delete_categories'))) {
        throw new Error('You do not have permission to delete categories.');
    }
    await sleep(100);
    const categoryToDeleteResult = await query('SELECT name FROM categories WHERE id = ?', [categoryId]) as any[];
    if (categoryToDeleteResult.length > 0) {
        const categoryToDelete = categoryToDeleteResult[0];
        // Before deleting, update tools in this category to the 'General' category.
        const generalCategoryResult = await query('SELECT id FROM categories WHERE name = ?', ['General']) as any[];
        if (generalCategoryResult.length === 0) {
            throw new Error("The 'General' category does not exist.");
        }
        const generalCategoryId = generalCategoryResult[0].id;
        await query(`UPDATE tools SET category_id = ? WHERE category_id = ?`, [generalCategoryId, categoryId]);

        await query('DELETE FROM categories WHERE id = ?', [categoryId]);
        logAction(user, `Deleted category: ${categoryToDelete.name}`, `ID: ${categoryId}`);
    }
}

export const getUserById = async (userId: number): Promise<User | null> => {
    try {
        const userQuery = `SELECT id, name, email, avatar, role FROM users WHERE id = ?`;
        const usersRows = await query(userQuery, [userId]) as any[];

        if (usersRows.length === 0) return null;

        const user = usersRows[0];
        
        const userToolsQuery = `SELECT tool_id FROM user_tools WHERE user_id = ?`;
        const userToolsRows = await query(userToolsQuery, [userId]) as any[];
        const assignedTools = userToolsRows.map((row: any) => Number(row.tool_id));

        return {
            ...user,
            id: Number(user.id),
            assignedTools,
        } as User;
    } catch (error: unknown) {
        logDetailedError("Failed to fetch user", error, { userId });
        return null;
    }
}


export const getUsers = async (): Promise<User[]> => {
  try {
    const usersQuery = `
      SELECT id, name, email, avatar, role
      FROM users
    `;
    const usersRows = await query(usersQuery, []) as any[];

    const userToolsQuery = `SELECT user_id, tool_id FROM user_tools`;
    const userToolsRows = await query(userToolsQuery, []) as any[];

    const userToolsMap = userToolsRows.reduce((acc, row) => {
      if (!acc[row.user_id]) {
        acc[row.user_id] = [];
      }
      acc[row.user_id].push(Number(row.tool_id));
      return acc;
    }, {} as Record<number, number[]>);


    return usersRows.map(user => ({
      ...user,
      id: Number(user.id),
      assignedTools: userToolsMap[user.id] || []
    })) as User[];
  } catch (error: unknown) {
    logDetailedError("Failed to fetch users", error);
    return []; // Return an empty array on error to prevent crashes.
  }
}

export const assignToolsToUser = async (userId: number, toolIds: number[], admin: User): Promise<User | null> => {
    if (!(await hasPermission(admin, 'assign_tools'))) {
        throw new Error('You do not have permission to assign tools.');
    }
    
    try {
        await query('START TRANSACTION', []);
        await query('DELETE FROM user_tools WHERE user_id = ?', [userId]);

        if (toolIds.length > 0) {
            const values = toolIds.map(toolId => [userId, toolId]);
            await query('INSERT INTO user_tools (user_id, tool_id) VALUES ?', [values]);
        }
        await query('COMMIT', []);
        
        const updatedUser = await getUserById(userId);

        if (updatedUser) {
            logAction(admin, `Assigned tools to ${updatedUser.name}`, `Tool IDs: ${toolIds.join(', ')}`);
        }
        return updatedUser;
    } catch (error: unknown) {
        await query('ROLLBACK', []);
        logDetailedError("Failed to assign tools to user", error, { userId });
        throw new Error('Database error while assigning tools.');
    }
}

// --- Permissions Management ---

export const getAllPermissions = async (): Promise<Permission[]> => {
    try {
      const rows = await query('SELECT * FROM permissions ORDER BY name', []) as any[];
      return rows.map(r => ({ ...r, id: Number(r.id) }));
    } catch (error: unknown) {
      logDetailedError("Failed to fetch permissions", error);
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
          if (rolePermissions[row.role as Role]) {
              rolePermissions[row.role as Role].push(row.permissionName);
          }
      }
    } catch(error: unknown) {
       logDetailedError("Failed to fetch role permissions", error);
    }
    return rolePermissions;
}

export const updateRolePermission = async (role: Role, permissionId: number, hasPermission: boolean, admin: User): Promise<void> => {
    if (admin.role !== 'Superadmin') {
        throw new Error('Only Superadmins can modify permissions.');
    }

    try {
        const permissionNameResult = await query('SELECT name FROM permissions WHERE id = ?', [permissionId]) as any[];
        const permissionName = permissionNameResult[0]?.name; // Define permissionName here
        
        if (hasPermission) {
            await query('INSERT IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)', [role, permissionId]);
            logAction(admin, `Granted permission '${permissionName}' to role ${role}`, `Permission ID: ${permissionId}`);
        } else {
            await query('DELETE FROM role_permissions WHERE role = ? AND permission_id = ?', [role, permissionId]);
            logAction(admin, `Revoked permission '${permissionName}' from role ${role}`, `Permission ID: ${permissionId}`);
        }
    } catch (error: unknown) {
        logDetailedError("Failed to update role permission", error, { adminId: admin.id, role, permissionId, permissionName: permissionName });
        throw new Error('Database error while updating permission.');
    }
}

export async function registerUser(prevState: { error?: string, success?: boolean } | undefined, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'All fields are required.' };
    }

    try {
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]) as any[];
        if (existingUsers.length > 0) {
            return { error: 'A user with this email already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // All new users are registered as 'User'
        const result = await query(
            'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'User', '']
        ) as any;
        
        console.log(`User registered with ID: ${result.insertId}`);
        return { success: true };

    } catch (error: unknown) {
        logDetailedError("Registration error", error, { email });
        return { error: 'An internal error occurred. Please try again.' };
    }
}
