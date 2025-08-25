'use server';

import type { User, Role } from '@/types';
import { getUsers } from './data';
import { cookies } from 'next/headers';

// In a real application, this would involve session management, JWTs, etc.
// For this demo, we'll use a cookie to simulate the current user role.
const MOCK_USER_ID_COOKIE = 'mock_user_id';

const userRoleMap: Record<Role, string> = {
  Superadmin: 'user-1',
  Admin: 'user-2',
  User: 'user-3',
}

export async function getCurrentUser(): Promise<User> {
  const cookieStore = cookies();
  const mockUserId = cookieStore.get(MOCK_USER_ID_COOKIE)?.value || userRoleMap.Superadmin;

  const users = await getUsers();
  const user = users.find(u => u.id === mockUserId);

  if (!user) {
    throw new Error("Current user not found");
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(user);
    }, 50);
  });
}

export async function switchUserRole(role: Role) {
  const userId = userRoleMap[role];
  if(userId) {
    cookies().set(MOCK_USER_ID_COOKIE, userId);
  }
}
