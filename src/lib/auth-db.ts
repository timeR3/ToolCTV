
'use server';

import type { User } from '@/types';
import { query } from './db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt, getSession } from './auth-session';

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.userId) {
    return null;
  }
  
  try {
    const rows = await query("SELECT id, name, email, avatar, role FROM users WHERE id = ?", [session.userId]) as any[];
    if (rows.length === 0) {
        return null;
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
    return null;
  }
}

export async function hasPermission(user: User | null, permissionName: string): Promise<boolean> {
  if (!user || !user.role) {
    return false;
  }
  
  if (user.role === 'Superadmin' || user.role === 'Admin') {
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


export async function login(prevState: { error: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    try {
        const userRows = await query('SELECT * FROM users WHERE email = ?', [email]) as any[];
        if (userRows.length === 0) {
            return { error: 'Invalid email or password.' };
        }
        const user = userRows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return { error: 'Invalid email or password.' };
        }

        // Create session
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({ userId: user.id, expires });

        // Save session in a cookie
        cookies().set('session', session, { expires, httpOnly: true });

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'An internal error occurred. Please try again.' };
    }

    redirect('/');
}

export async function logout() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/login');
}
