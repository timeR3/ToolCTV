'use server';

import type { User } from '@/types';
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
    const userRow = rows[0];
    
    const assignedToolsResult = await query('SELECT tool_id FROM user_tools WHERE user_id = ?', [userRow.id]) as any[];
    const assignedTools = assignedToolsResult.map((row: any) => Number(row.tool_id));
    
    return {
      ...userRow,
      id: Number(userRow.id),
      assignedTools,
    };

  } catch (error) {
    console.error("Failed to fetch current user:", error);
    // Provide a mock user to prevent crashing the app if DB connection fails
    return {
        id: 0,
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
  
  // All permissions are now checked against the database.
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
