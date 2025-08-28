
'use server';

import type { User } from "@/types";
import { query } from './db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt, getSession } from './auth-session';
import { logDetailedError } from './error-logger'; // Import the new logger

export async function getCurrentUser(): Promise<User | null> {
  console.log('[auth-db] getCurrentUser - Attempting to get session.');
  const session = await getSession();
  if (!session?.userId) {
    console.log('[auth-db] getCurrentUser - No session or userId found.');
    return null;
  }
  console.log(`[auth-db] getCurrentUser - Session found for userId: ${session.userId}`);
  
  try {
    const rows = await query("SELECT id, name, email, avatar, role FROM users WHERE id = ?", [session.userId]) as any[];
    if (rows.length === 0) {
        console.log(`[auth-db] getCurrentUser - User with ID ${session.userId} not found in DB.`);
        // This case might happen if the user was deleted but the session still exists.
        // The middleware should ideally handle redirecting to login.
        return null;
    }
    const userRow = rows[0];
    console.log(`[auth-db] getCurrentUser - User found: ${userRow.email}, Role: ${userRow.role}`);
    
    const assignedToolsResult = await query('SELECT tool_id FROM user_tools WHERE user_id = ?', [userRow.id]) as any[];
    const assignedTools = assignedToolsResult.map((row: any) => Number(row.tool_id));
    console.log(`[auth-db] getCurrentUser - Assigned tools for user ${userRow.id}:`, assignedTools);
    
    return {
      ...userRow,
      id: Number(userRow.id),
      assignedTools,
    };

  } catch (error: unknown) {
    logDetailedError("Fetching Current User", error, { userId: session.userId });
    console.error('[auth-db] getCurrentUser - Error fetching user:', error);
    return null;
  }
}

export async function hasPermission(user: User | null, permissionName: string): Promise<boolean> {
  if (!user || !user.role) {
    return false;
  }
  
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
  } catch (error: unknown) {
    logDetailedError("Checking User Permission", error, { userId: user?.id, permissionName });
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
        (await cookies()).set('session', session, {
          expires,
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production', // Usar `secure` solo en producción
          sameSite: 'lax', // Previene ataques CSRF
        });

        console.log(`Login successful for user: ${user.email}. Session cookie set.`);
        console.log(`Session expires: ${expires.toISOString()}`);

        // Redirect to the home page after a successful login
        return redirect('/');

    } catch (error: unknown) {
        logDetailedError("User Login", error, { email });
        return { error: 'An internal error occurred. Please try again.' };
    }
}

export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0), path: '/' });
    redirect('/login');
}
