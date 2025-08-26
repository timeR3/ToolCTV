'use server';

import type { User } from '@/types';
import { query } from './db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

// This function now automatically "logs in" the first user with the 'User' role.
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Find the first user with the 'User' role.
    const rows = await query("SELECT * FROM users WHERE role = 'User' LIMIT 1", []) as any[];
    if (rows.length === 0) {
      console.warn("Auto-login failed: No user with the 'User' role found in the database.");
      // As a fallback, try to get the very first user, regardless of role.
      const anyUserRows = await query("SELECT * FROM users LIMIT 1", []) as any[];
      if (anyUserRows.length === 0) {
        console.error("Auto-login failed: No users found in the database at all.");
        return null;
      }
      rows.push(anyUserRows[0]);
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
    console.error("Failed to fetch auto-login user:", error);
    return null;
  }
}


export async function hasPermission(user: User | null, permissionName: string): Promise<boolean> {
  if (!user || !user.role) {
    return false;
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

// Note: The login and logout functions are no longer used by the application flow,
// but are kept here in case you want to re-enable manual login later.

export async function login(prevState: { error: string } | undefined, formData: FormData) {
    return { error: 'Manual login is currently disabled.' };
}

export async function logout() {
    // Logout is disabled as login is automatic.
    // To re-enable, this should clear the session cookie and redirect.
    console.log("Logout function called, but it's disabled.");
}
