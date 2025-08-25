'use server';

import type { User } from '@/types';
import { getUsers } from './data';
import { query } from './db';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'default-secret-key-that-is-long-enough');
const alg = 'HS256';

async function encrypt(payload: any) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jose.jwtVerify(input, secret, {
            algorithms: [alg],
        });
        return payload;
    } catch (e) {
        return null;
    }
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    return await decrypt(sessionCookie);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.userId) {
    return null;
  }

  try {
    const rows = await query("SELECT * FROM users WHERE id = ?", [session.userId]) as any[];
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
        const users = await query('SELECT * FROM users WHERE email = ?', [email]) as any[];
        if (users.length === 0) {
            return { error: 'Invalid email or password.' };
        }
        const user = users[0];

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { error: 'Invalid email or password.' };
        }

        const session = { userId: user.id, email: user.email, role: user.role };
        const sessionCookie = await encrypt(session);

        cookies().set('session', sessionCookie, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 });

        return redirect('/');

    } catch (error) {
        console.error('Login error:', error);
        return { error: 'An internal error occurred. Please try again.' };
    }
}

export async function logout() {
    cookies().set('session', '', { expires: new Date(0) });
    redirect('/login');
}
