'use server';

import type { User, Role } from '@/types';
import { getUsers } from './data';
import { query } from './db';


export async function getCurrentUser(): Promise<User> {
  // For the purpose of this app, we'll "log in" as the Superadmin.
  try {
    const rows = await query("SELECT * FROM users WHERE role = 'Superadmin' LIMIT 1", []) as any[];
    if (rows.length === 0) {
      // Fallback to the first user if Superadmin not found
      const allUsers = await getUsers();
      if (allUsers.length === 0) {
        throw new Error("No users found in the database.");
      }
      return allUsers[0];
    }
    const user = rows[0] as User;
    user.assignedTools = []; // Initialize as empty array
    
    const assignedToolsResult = await query('SELECT tool_id FROM user_tools WHERE user_id = ?', [user.id]) as any[];
    if (assignedToolsResult.length > 0) {
        user.assignedTools = assignedToolsResult.map((row: any) => row.tool_id);
    }
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    // Provide a mock user to prevent crashing the app if DB connection fails
    return {
        id: 'error-user',
        name: 'Error User',
        email: 'error@example.com',
        avatar: '',
        role: 'User',
        assignedTools: [],
    };
  }
}

export async function hasPermission(user: User, permissionName: string): Promise<boolean> {
  if (!user || !user.role) {
    return false;
  }
  
  // Superadmin always has all permissions
  if (user.role === 'Superadmin') {
    return true;
  }
  
  try {
    const permissionQuery = `
      SELECT COUNT(*) as count
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role = ? AND p.name = ?
    `;
    const rows = await query(permissionQuery, [user.role, permissionName]) as any[];
    return rows[0].count > 0;
  } catch (error) {
    console.error(`Failed to check permission '${permissionName}' for user '${user.id}':`, error);
    return false;
  }
}
