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
    // The mysql2 driver can parse JSON columns automatically.
    // If assignedTools is a TEXT column storing a JSON string, you might need to parse it:
    // if (typeof user.assignedTools === 'string') {
    //   user.assignedTools = JSON.parse(user.assignedTools || '[]');
    // }
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
