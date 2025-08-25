'use server';

import type { User, Role } from '@/types';
import { getUsers } from './data';

export async function getCurrentUser(): Promise<User> {
  const users = await getUsers();
  const user = users.find(u => u.role === 'Superadmin');

  if (!user) {
    // Fallback to the first user if Superadmin not found, though this shouldn't happen with mock data.
    const firstUser = users[0];
    if (!firstUser) throw new Error("No users found in the database.");
    return firstUser;
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(user);
    }, 50);
  });
}
